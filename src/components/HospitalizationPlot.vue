<template lang="pug">
vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import Papa from 'papaparse'
import VuePlotly from '@statnett/vue-plotly'

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
  }

  private hospitalCapacity: any = {
    berlin: [1252, 1694],
  }

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
    this.buildPlot()
  }

  private buildPlot() {
    this.cityDetails = this.dataDetails[this.city]
    this.updateModelData()
    this.prepareHospitalData()
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

  @Watch('data') private updateModelData() {
    let modelData = this.data.filter(item => this.cityDetails.fromModel.indexOf(item.name) > -1)

    const sevenDays = 7
    const susceptible = this.data.filter(item => item.name === 'Susceptible')

    // maybe data is not loaded yet
    if (!susceptible.length) return

    const totalPopulation = susceptible[0].y[0]
    this.factor100k = totalPopulation / 100000.0

    if (!modelData.length) return

    // set end date
    this.layout.xaxis.range = ['2020-02-09', this.endDate]

    // For Berlin we need to *combine* the seriouslySick and critical into one line.
    for (let i = 0; i < modelData[0].y.length; i++) {
      modelData[0].y[i] += modelData[1].y[i]
    }

    modelData = modelData.map(item => {
      // we are going to mutate the line color (!!!) to ensure all plots on the screen
      // have the same color for these metrics.

      const midWeekDates = []
      const infectionRate = []

      for (let j = sevenDays + 5; j < item.x.length; j += sevenDays) {
        let avgSum = 0
        for (let k = j - sevenDays; k <= j; k += 1) {
          avgSum += item.y[k]
        }
        let avgerage = avgSum / 7
        const rate = 0.1 * Math.round((10.0 * avgerage) / this.factor100k)
        infectionRate.push(rate)
        midWeekDates.push(item.x[j - 3])
      }

      const color = this.colors[item.name]
      item.line = {
        dash: 'solid',
        width: 2,
        color: color,
      }

      const trace = {
        name: 'Model: ' + item.name,
        x: midWeekDates,
        y: infectionRate,
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

  private prepareHospitalData() {
    const hospData = Papa.parse(this.csvData[this.city], {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    }).data

    const sevenDays = 7

    this.hospitalSeries = []

    for (let i = 0; i < this.cityDetails.fromModel.length; i++) {
      const column = this.cityDetails.fromCSV[i]

      if (this.cityDetails.csvLineNames.length <= i) continue

      const midWeekDates = []
      const infectionRate = []

      for (let j = sevenDays + 5; j < hospData.length; j += sevenDays) {
        let avgSum = 0
        for (let k = j - sevenDays; k <= j; k += 1) {
          avgSum += hospData[k][column]
        }
        let avgerage = avgSum / 7
        const rate = 0.1 * Math.round((10.0 * avgerage) / this.factor100k)
        infectionRate.push(rate)
        midWeekDates.push(hospData[j - 3]['Datum'])
      }

      for (let j = 0; j < midWeekDates.length; j += 1) {
        midWeekDates[j] = this.reformatDateBerlin(midWeekDates[j])
      }

      this.hospitalSeries.push({
        name: this.cityDetails.csvLineNames[i],
        x: midWeekDates,
        y: infectionRate,
        line: {
          dash: 'dot',
          width: 2,
          color: this.colors[this.cityDetails.fromModel[i]],
        },
      })
    }

    const midWeekDates = []
    const infectionRate = []

    // add dividata, if we have some
    if (this.diviData.length) {
      for (let j = sevenDays + 5; j < this.diviData[0].y.length; j += sevenDays) {
        let avgSum = 0
        for (let k = j - sevenDays; k <= j; k += 1) {
          avgSum += this.diviData[0].y[k]
        }
        let avgerage = avgSum / 7
        const rate = 0.1 * Math.round((10.0 * avgerage) / this.factor100k)
        infectionRate.push(rate)
        midWeekDates.push(this.diviData[0].x[j - 3])
      }

      this.diviData[0].x = midWeekDates
      this.diviData[0].y = infectionRate

      this.hospitalSeries.push(this.diviData[0])
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
      fixedrange: window.innerWidth < 700,
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      fixedrange: window.innerWidth < 700,
      type: this.logScale ? 'log' : 'linear',
      autorange: true,
      title: 'Hospitalizations',
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
