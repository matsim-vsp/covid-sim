<template lang="pug">
vue-plotly(v-if="!isResizing" :data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private rValues!: any[]
  @Prop({ required: true }) private metadata!: any

  private color = '#04f'

  private lagDays = 7

  private dataLines: any[] = []
  private unselectedLines: string[] = []

  private mounted() {
    this.calculateRvalues()
    this.unselectLines()
  }

  private handleRelayout(event: any) {
    if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
      this.calculateRvalues()
    }
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('data') private updateModelData() {
    this.calculateRvalues()
    this.unselectLines()
  }

  @Watch('rValues') private updateRValues() {
    this.calculateRvalues()
    this.unselectLines()
  }

  @Watch('logScale') updateScale() {
    if (this.logScale) {
      this.layout.yaxis.type = 'log'
      this.layout.yaxis.autorange = false
      this.layout.yaxis.range = [Math.log10(0.01), Math.log10(2)]
    } else {
      this.layout.yaxis.type = 'linear'
      delete this.layout.yaxis.range // [0, 1.5]
      this.layout.yaxis.autorange = true
    }
  }

  @Watch('dataLines', { deep: true }) updateUrl() {
    for (let i = 0; i < this.dataLines.length; i++) {
      if (
        this.dataLines[i].visible == 'legendonly' &&
        !this.unselectedLines.includes(this.dataLines[i].name)
      ) {
        this.unselectedLines.push(this.dataLines[i].name)
      } else if (
        this.dataLines[i].visible != 'legendonly' &&
        this.unselectedLines.includes(this.dataLines[i].name)
      ) {
        this.unselectedLines.splice(this.unselectedLines.indexOf(this.dataLines[i].name))
      }
    }

    const params = Object.assign({}, this.$route.query)

    params['plot-' + this.metadata.abbreviation] = this.unselectedLines

    this.$router.replace({ query: params })
  }

  private unselectLines() {
    const query = this.$route.query as any
    const name = 'plot-' + this.metadata.abbreviation

    if (Object.keys(query).includes(name)) {
      let nameArray = query[name]
      if (!Array.isArray(nameArray)) {
        nameArray = [nameArray]
      }
      for (let i = 0; i < nameArray.length; i++) {
        for (let j = 0; j < this.dataLines.length; j++) {
          if (this.dataLines[j].name == nameArray[i]) {
            this.dataLines[j].visible = 'legendonly'
          }
        }
      }
    }
  }

  private calculateRvalues() {
    // calculate r-values if pre-calculated versions don't exist
    if (!this.rValues.length) {
      this.$emit('method', 'Based on seven-day new infections')
      this.manuallyCalculateRvalues()
      return
    }

    this.$emit('method', this.lagDays + '-day moving average')

    // generate list of purpose names (leisure, home, etc)
    const allPurposes: string[] = Object.keys(this.rValues[0])
    const purposes: string[] = []
    const skip = ['day', 'date', 'rValue', 'newContagious', 'scenario']

    for (const purpose of allPurposes) {
      if (skip.indexOf(purpose) === -1) purposes.push(purpose)
    }

    this.dataLines = []

    for (const purpose of purposes.sort()) {
      this.calculateRValueForPurpose(purpose)
    }
  }

  private calculateRValueForPurpose(purpose: string) {
    const x: any[] = []
    const r: any[] = []
    const avgR = []

    for (const value of this.rValues) {
      x.push(value.date)
      r.push(value[purpose])
    }

    // 0,1,2 *3* 4,5,6
    const center = Math.floor(this.lagDays / 2)

    for (let index = center; index < x.length - center; index++) {
      const average =
        r.slice(index - center, index + center).reduce((a, b) => a + b, 0) / 2 / center

      avgR.push(average)
    }

    // set end date
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate
    this.layout.yaxis.range = [Math.log10(0.05), Math.log10(1.5)] // otherwise starts with different values. kai, jan'21

    this.dataLines.push({
      name: purpose,
      visible: true,
      x: x.slice(center),
      y: avgR,
      // type: 'bar',
      line: {
        width: 2,
        // color: this.color,
        shape: 'linear',
      },
    })
  }

  /**
   * We are calculating a four day running R-value as our best guess.
   * Starting on day 4,
   * - numerator:  past four days of "newly infected", which is the difference in Susceptible;
   * - denominator: divide by the "newly infected" number from four days ago
   */
  private manuallyCalculateRvalues() {
    // these are not really R values; rather, they are multipliers.  Maybe they are estimates of R as long as lagDays was 4, and we also assume that
    // that is the serial interval.  kai, oct'20

    if (this.data.length === 0) return

    // set end date
    this.layout.xaxis.range = [this.$store.state.graphStartDate, this.endDate]

    const susceptible = this.data.filter(item => item.name === 'Susceptible')[0]

    const newlyInfected = []
    const rValues = []

    for (let i = this.lagDays; i < susceptible.y.length; i++) {
      // for each day, we compute the difference to lagDays ago.  lagDays is a const.  We start at lagDays, because the difference does not exist for
      // earlier days.
      const diffSusceptible = susceptible.y[i - this.lagDays] - susceptible.y[i]

      // we memorize this:
      newlyInfected.push(diffSusceptible)

      if (i >= this.lagDays * 2) {
        // take as index the last index of newlyInfected:
        const index = newlyInfected.length - 1

        // this method computes the, say, 7-day multiplier as dividing the newly infected of the last 7 days by those of 7 days before that (i.e. 8 to 14
        // earlier).  For that reason, we cannot start before lagDays*2
        let newR = newlyInfected[index] / newlyInfected[index - this.lagDays]
        newR = ((newR - 1) * 4) / this.lagDays + 1
        // (4/lagDays since the serial interval for covid is assumed to be 4 days)

        if (newlyInfected[index] < 100) {
          // yyyyyy I really do not know why this needs to be "100".
          newR = 1
        }

        // we memorize this:
        if (newR) rValues.push(newR)
      }
    }

    this.dataLines = [
      {
        name: 'Target: 50 per 100,000 per 7 days',
        visible: true,
        x: [0, susceptible.x[susceptible.x.length - 1]],
        y: [1, 1],
        fill: 'tozeroy',
        line: {
          width: 1.0,
          // color: '#ddbbbb',
          color: '#bbddbb',
        },
      },
      {
        name: 'Estimated Multiplier',
        visible: true,
        x: susceptible.x.slice(this.lagDays * 2),
        y: rValues,
        line: {
          width: 2,
          color: this.color,
          shape: 'linear',
        },
      },
    ]
  }

  private reformatDate(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout: any = {
    // barmode: 'stack',
    autosize: true,
    showlegend: true,
    legend: {
      orientation: 'h',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 10, b: 0, l: 60 },
    xaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: [this.$store.state.graphStartDate, '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      autorange: true,
      // fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: 'linear',
      // range: [Math.log10(0.01), Math.log10(2)],
      title: 'Multiplier',
      hoverformat: '.3f',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
    // displayModeBar: true,
    displaylogo: false,
    responsive: true,
    modeBarButtonsToRemove: [
      'pan2d',
      'zoom2d',
      'select2d',
      'lasso2d',
      'zoomIn2d',
      'zoomOut2d',
      'autoScale2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'resetScale2d',
      'toggleSpikelines',
      'resetViewMapbox',
    ],
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'r-values',
      width: 1200,
      height: 600,
      scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
    },
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
