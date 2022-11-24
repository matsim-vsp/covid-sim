<template lang="pug">
.my-vue-component(v-if="!isResizing")
  vue-plotly(:data="dataLines" :layout="layout" :options="options"  @relayout="handleRelayout")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private observed!: any[]
  @Prop({ required: true }) private endDate!: any
  @Prop({ required: true }) private vaccinationDetailed!: any[]
  @Prop({ required: true }) private rkiDetectionData!: {
    x?: any[]
    y?: any[]
    line?: any
    name?: string
  }
  @Prop({ required: true }) private metadata!: any

  private color = ['#094', '#0c4']

  private lagDays = 1

  private dataLines: any[] = []
  private unselectedLines: string[] = []

  private mounted() {
    try {
      this.calculateValues()
      this.unselectLines()
    } catch (e) {
      console.warn('VACCINATION/BOOSTER data not found')
      // maybe this run doesn't have vaccinations or boosters
    }
  }

  private handleRelayout(event: any) {
    if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
      this.calculateValues()
      this.unselectLines()
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
    this.calculateValues()
    this.unselectLines()
  }

  // @Watch('logScale') updateScale() {
  //   this.layout.yaxis = this.logScale
  //     ? {
  //         fixedrange: window.innerWidth < 700,
  //         type: 'log',
  //         range: [Math.log10(2), Math.log10(5000)],
  //         title: '7-Day Infections / 100k Pop.',
  //       }
  //     : {
  //         fixedrange: window.innerWidth < 700,
  //         type: 'linear',
  //         autorange: true,
  //         title: '7-Day Infections / 100k Pop.',
  //       }
  // }

  @Watch('dataLines', { deep: true }) async updateUrl() {
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

    try {
      await this.$router.replace({ query: params })
    } catch (e) {
      /** this is OK */
    }
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

  /**
   * We are calculating a seven day running infection rate.
   */
  @Watch('vaccinationDetailed')
  private calculateValues() {
    let vaccinationDetailedMap = new Map<number, Object>()
    let names = ['First', 'Second', 'Third', 'Fourth', 'Fifth']

    if (this.data.length === 0) return
    if (this.vaccinationDetailed.length > 0) {
      for (let i = 0; i < this.vaccinationDetailed.length; i++) {
        const number = this.vaccinationDetailed[i].number
        const amount = this.vaccinationDetailed[i].amount
        if (!vaccinationDetailedMap.has(number)) {
          vaccinationDetailedMap.set(number, { x: [] as any, y: [] as any, amount: [] as any })
        }

        const date = this.vaccinationDetailed[i].date

        let object = vaccinationDetailedMap.get(number) as any

        if (object.x.includes(date)) {
          const index = object.x.indexOf(date)
          object.y[index] += amount
          object.amount[index] += 1
        } else {
          object.x.push(date)
          object.y.push(amount)
          object.amount.push(1)
        }

        vaccinationDetailedMap.set(number, object)
      }

      for (let [key, value] of vaccinationDetailedMap) {
        const data = value as any
        for (let i = 0; i < data.x.length; i++) {
          if (data.amount > 1) {
            data.y = data.y / data.amount
            data.amount = 1
          }
        }
        this.dataLines.push({
          name: names[key - 1],
          visible: true,
          x: data.x,
          y: data.y,
          line: {
            width: 3,
          },
        })
      }
    } else {
      // set end date
      this.layout.xaxis.range[0] = this.$store.state.graphStartDate
      this.layout.xaxis.range[1] = this.endDate

      // Vaccinations
      let nVaccinated: any = this.data.filter(item => item.name === 'Vaccinated')[0]
      let nBooster: any = this.data.filter(item => item.name === 'Boosted')[0]

      let nSusceptible: any = this.data.filter(item => item.name === 'Susceptible')[0]
      let nTotalInfected: any = this.data.filter(item => item.name === 'Total Infected')[0]
      let nRecovered: any = this.data.filter(item => item.name === 'Recovered')[0]

      const nTotal = []
      const vaccinated = []
      const boosted = []

      for (let i = 0; i < nSusceptible.y.length; i++) {
        nTotal.push(nSusceptible.y[i] + nTotalInfected.y[i] + nRecovered.y[i])
        vaccinated.push((100 * nVaccinated.y[i]) / nTotal[i])
        boosted.push((100 * nBooster.y[i]) / nTotal[i])
      }

      this.dataLines = [
        {
          name: '% Vaccinated',
          visible: true,
          x: nSusceptible.x,
          y: vaccinated,
          line: {
            width: 3,
          },
        },
        {
          name: '% Vaccination Boosted',
          visible: true,
          x: nSusceptible.x,
          y: boosted,
          line: {
            width: 3,
          },
        },
      ]
    }
  }

  private checkIfVaccinationDetailedDataIsCorrect() {
    if (!this.vaccinationDetailed.length) return false

    /*
    for (let i = 0; i < this.vaccinationDetailed.length; i++) {
      console.log(this.vaccinationDetailed[i].number)
    }
    */
  }

  private reformatDate(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout = {
    height: 240,
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
      //range: [this.$store.state.graphStartDate, '2020-12-31'],
      range: [this.$store.state.graphStartDate, '2022-12-31'],
      type: 'date',
    },
    yaxis: {
      // note this gets overwritten when the scale changes - see updateScale()
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: 'linear',
      //autorange: false,
      autorange: true,
      //range: [0, 100],
      title: '% vaccinated/boosted',
    } as any,
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
      filename: 'daily-cases',
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
