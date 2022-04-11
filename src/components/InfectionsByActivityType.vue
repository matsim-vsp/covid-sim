<template lang="pug">
.mutations-plots(v-if="!isResizing")
  vue-plotly(:data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")
  vue-plotly(:data="dataLines2" :layout="layout2" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private values!: any[]

  private color = '#04f'

  private dataLines: any[] = []
  private dataLines2: any[] = []

  private mounted() {
    this.calculateValues()
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.layout2 = Object.assign({}, this.layout2)
    this.isResizing = false
  }

  private handleRelayout(event: any) {
    if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
      this.calculateValues()
    }
  }

  @Watch('values') private updateValues() {
    this.calculateValues()
  }

  @Watch('logScale') updateScale() {
    if (this.logScale) {
      this.layout.yaxis.type = 'log'
      // this.layout.yaxis.range = [Math.log10(0.05), Math.log10(1.5)]
    } else {
      this.layout.yaxis.type = 'linear'
      // this.layout.yaxis.range = [0, 1.5]
    }
  }

  private calculateValues() {
    this.dataLines = []
    this.dataLines2 = []
    if (!this.values.length) return

    // generate list of mutation names
    const infections: { [activity: string]: number[] } = {}
    const shares: { [activity: string]: number[] } = {}
    const date: number[] = []

    // process the data
    for (const row of this.values) {
      const act = row.activity
      if (!infections[act]) {
        infections[act] = []
        shares[act] = []
      }

      // update date row
      if (date.length === 0 || row.date !== date[date.length - 1]) date.push(row.date)

      // update infections and shares
      infections[act].push(row.infections)
      shares[act].push(100.0 * row.infectionsShare)
    }

    // console.log({ date, infections, shares })

    // set up the plots
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate
    this.layout2.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout2.xaxis.range[1] = this.endDate

    for (const actType of Object.keys(infections).sort()) {
      this.dataLines.push({
        name: actType,
        x: date,
        y: infections[actType],
        // mode: 'markers',
        // marker: { size: 4 },
      })

      this.dataLines2.push({
        name: actType + ' %',
        x: date,
        y: shares[actType],
        // mode: 'markers',
        // marker: { size: 4 },
      })
    }
  }

  private layout = {
    // barmode: 'stack',
    height: 250,
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
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: this.logScale ? 'log' : 'linear',
      title: 'Number of Infections',
      hoverformat: '.1f',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private layout2 = {
    height: 200,
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
    margin: { t: 5, r: 10, b: 5, l: 60 },
    xaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: 'linear',
      title: '% Share',
      hoverformat: '.1f',
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

.mutations-plots {
  display: flex;
  flex-direction: column;
}

@media only screen and (max-width: 640px) {
}
</style>
