<template lang="pug">
vue-plotly(v-if="!isResizing" :data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import Papaparse from '@simwrapper/papaparse'
import VuePlotly from '@/components/VuePlotly.vue'
import { PUBLIC_SVN } from '@/Globals'

interface City {
  fromModel: string[]
  fromCSV: string[]
  csvLineNames: string[]
  dateFormatter: Function
  dateColumn: string
}

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private city!: string
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private diviData!: any[]

  private csvData: any = {
    berlin: require('@/assets/berlin-hospital.csv').default,
    munich: require('@/assets/munich-hospital.csv').default,
    jakarta: require('@/assets/jakarta-hospital.csv').default,
    cologne: require('@/assets/cologne-hospital.csv').default,
  }

  private hospitalCapacity: any = {
    berlin: [1252, 1694],
  }

  private observedHospitalizationConfig: {
    [id: string]: { svnPath: string; legendText: string; csvCasesColumn: string }
  } = {
    cologne: {
      svnPath: 'original-data/hospital-cases/cologne/KoelnAllgemeinpatienten.csv',
      csvCasesColumn: 'allgemeinpatienten',
      legendText: 'Reported: Hospitalizations (City)',
    },
  }
  private extraHospitalData?: any

  private dataDetails: { [id: string]: City } = {
    berlin: {
      fromModel: ['Seriously Sick', 'Critical'],
      fromCSV: ['Stationäre Behandlung', 'Intensivmedizin'],
      csvLineNames: [
        'Reported: Berlin Hospitalized (Senate)',
        'Reported: Berlin Intensive Care (Senate)',
      ],
      dateFormatter: this.reformatDateBerlin,
      dateColumn: 'Datum',
    },
    munich: {
      fromModel: ['Seriously Sick', 'Critical'],
      fromCSV: ['Stationär'],
      csvLineNames: ['Reported: Munich Hospitalized'],
      dateFormatter: this.reformatDateMunich,
      dateColumn: 'Tag',
    },
    cologne: {
      fromModel: ['Seriously Sick', 'Critical'],
      fromCSV: ['Stationäre Behandlung', 'Intensivmedizin'],
      csvLineNames: ['Reported: Cologne Hospitalized', 'Reported: Cologne Intensive Care'],
      dateFormatter: this.reformatDateBerlin,
      dateColumn: 'Datum',
    },
    jakarta: {
      fromModel: ['Seriously Sick', 'Critical'],
      fromCSV: ['Intensivmedizin'],
      csvLineNames: ['Reported: Jakarta Intensive Care'],
      dateFormatter: this.reformatDateBerlin,
      dateColumn: 'Datum',
    },
  }

  private colors: any = {
    'Seriously Sick': '#44f',
    'Cumulative Hospitalized': '#707',
    Critical: '#707',
  }

  private dataLines: any[] = []
  private hospitalSeries: any[] = []
  private cityDetails: City = this.dataDetails.berlin

  private mounted() {
    this.prepareAdditionalHospitalData()
    this.buildPlot()
    // set end date
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate
  }

  private buildPlot() {
    this.cityDetails = this.dataDetails[this.city]
    this.updateModelData()
    this.prepareHospitalData()
  }

  private handleRelayout(event: any) {
    if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
      this.updateModelData()
    }
  }

  @Watch('city') private switchCity() {
    this.buildPlot()
  }

  @Watch('diviData') private switchDivi() {
    this.prepareHospitalData()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  private factor100k = 1

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('data') private updateModelData() {
    let modelData = this.data.filter(item => this.cityDetails.fromModel.indexOf(item.name) > -1)

    const sevenDays = 7
    const susceptible = this.data.filter(item => item.name === 'Susceptible')

    // maybe data is not loaded yet
    if (!susceptible.length) return

    const totalPopulation = susceptible[0].y[0]
    this.factor100k = totalPopulation / 100000.0

    if (!modelData.length) return

    // For Berlin we need to *combine* the seriouslySick and critical into one line.
    for (let i = 0; i < modelData[0].y.length; i++) {
      modelData[0].y[i] += modelData[1].y[i]
    }

    modelData = modelData.map(item => {
      // we are going to mutate the line color (!!!) to ensure all plots on the screen
      // have the same color for these metrics.

      const midWeekDates = []
      let infectionRate = []

      infectionRate.push(item.y)
      midWeekDates.push(item.x)

      for (let i = 0; i < infectionRate[0].length; i++) {
        infectionRate[0][i] = infectionRate[0][i] / this.factor100k
      }

      const color = this.colors[item.name]
      item.line = {
        dash: 'solid',
        width: 2,
        color: color,
      }

      const trace = {
        name: 'Model: ' + item.name,
        x: midWeekDates[0],
        y: infectionRate[0],
        line: item.line,
      }

      return trace
    })

    // Hospital capacity lines
    if (this.hospitalCapacity[this.city]) {
      modelData.push(
        {
          name: 'Hospital Capacity',
          x: [modelData[0].x[0], modelData[0].x[modelData[0].x.length - 1]],
          y: [
            this.hospitalCapacity[this.city][0] / this.factor100k,
            this.hospitalCapacity[this.city][0] / this.factor100k,
          ],
          fill: 'none',
          marker: { size: 2 },
          line: {
            width: 0.5,
            color: '#707',
          },
        },
        {
          name: 'Hospital Max Reserve Capacity',
          x: [modelData[0].x[0], modelData[0].x[modelData[0].x.length - 1]],
          y: [
            this.hospitalCapacity[this.city][1] / this.factor100k,
            this.hospitalCapacity[this.city][1] / this.factor100k,
          ],
          fill: 'none',
          marker: { size: 2 },
          line: {
            width: 0.5,
            color: '#707',
          },
        }
      )
    }

    modelData[0].name = 'Model: Should be Hospitalized'

    this.dataLines = modelData
    this.dataLines.push(...this.hospitalSeries)

    // console.log({ dataLines: this.dataLines })
  }

  @Watch('data') private prepareHospitalData() {
    // const hospData = Papaparse.parse(this.csvData[this.city], {
    //   header: true,
    //   dynamicTyping: true,
    //   skipEmptyLines: true,
    // }).data

    // const sevenDays = 7
    // const susceptible = this.data.filter(item => item.name === 'Susceptible')

    // // maybe data is not loaded yet
    // if (!susceptible.length) return

    // const totalPopulation = susceptible[0].y[0]
    // this.factor100k = totalPopulation / 100000.0

    this.hospitalSeries = []

    for (let i = 0; i < this.cityDetails.fromModel.length; i++) {
      // const column = this.cityDetails.fromCSV[i]
      // if (this.cityDetails.csvLineNames.length <= i) continue
      // const midWeekDates = []
      // const infectionRate = []
      // for (let i = 0; i < hospData.length; i++) {
      //   infectionRate.push(hospData[i][column])
      //   midWeekDates.push(hospData[i]['Datum'])
      // }
      // for (let j = 0; j < midWeekDates.length; j += 1) {
      //   midWeekDates[j] = this.reformatDateBerlin(midWeekDates[j])
      //   infectionRate[j] = infectionRate[j] / this.factor100k
      // }
      // Moved to new hosp plot
      // this.hospitalSeries.push({
      //   name: this.cityDetails.csvLineNames[i],
      //   x: midWeekDates,
      //   y: infectionRate,
      //   line: {
      //     dash: 'dot',
      //     width: 2,
      //     color: this.colors[this.cityDetails.fromModel[i]],
      //   },
      // })
    }

    const midWeekDates = []
    const infectionRate = []

    // add dividata, if we have some
    if (this.diviData.length) {
      // for (let j = sevenDays + 5; j < this.diviData[0].y.length; j += sevenDays) {
      //   let avgSum = 0
      //   for (let k = j - sevenDays; k <= j; k += 1) {
      //     avgSum += this.diviData[0].y[k]
      //   }
      //   let avgerage = avgSum / 7 / this.factor100k
      //   const rate = 0.1 * Math.round(10.0 * avgerage)
      //   infectionRate.push(rate)
      //   midWeekDates.push(this.diviData[0].x[j - 3])
      // }
      // Moved to new hosp plot
      // this.hospitalSeries.push({
      //   name: this.diviData[0].name,
      //   x: midWeekDates,
      //   y: infectionRate,
      //   line: this.diviData[0].line,
      // })
    }

    if (this.extraHospitalData) this.hospitalSeries.push(this.extraHospitalData)
  }

  private async prepareAdditionalHospitalData() {
    if (this.observedHospitalizationConfig[this.city]) {
      const config = this.observedHospitalizationConfig[this.city]
      const url = PUBLIC_SVN + config.svnPath

      const rawData = await fetch(url).then(async data => await data.text())
      const csvData = Papaparse.parse(rawData, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
      }).data

      // Moved to new hosp plot
      // const series = {
      //   name: config.legendText,
      //   x: csvData.map(row => row.date.split('T')[0]),
      //   y: csvData.map(row => parseFloat(row[config.csvCasesColumn]) / this.factor100k),
      //   line: {
      //     dash: 'dot',
      //     width: 2,
      //     color: 'rgb(255,100,100)',
      //   },
      // }
      // this.extraHospitalData = series
      // this.hospitalSeries.push(series)
      // this.dataLines.push(series)
    }
  }

  private reformatDateBerlin(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private reformatDateMunich(day: string) {
    const pieces = day.split('-')
    const date = '20' + pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private reformatDateCologne(day: string) {
    const pieces = day.split('-')
    const date = '20' + pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout = {
    showlegend: true,
    autosize: true,
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
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: this.logScale ? 'log' : 'linear',
      autorange: true,
      title: 'Hospitalizations / 100k Pop.',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
    responsive: true,
    // displayModeBar: true,
    displaylogo: false,
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
      filename: 'custom_image',
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
