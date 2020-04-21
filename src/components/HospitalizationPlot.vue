<template lang="pug">
#vue-component
  vue-plotly.plotsize(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import Papa from 'papaparse'
import VuePlotly from '@statnett/vue-plotly'
import moment from 'moment'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean

  private berlinHospitalCSV = require('@/assets/LaGeSo.csv').default

  private relevantStats = new Set(['Seriously Sick', 'Critical'])

  private colors = {
    'Seriously Sick': '#44f',
    Critical: '#707',
  }

  private dataLines: any[] = []

  private hospitalSeries: any[] = []

  private mounted() {
    this.prepareHospitalData()
    this.updateModelData()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  private prepareHospitalData() {
    const hospData = Papa.parse(this.berlinHospitalCSV, { header: true, dynamicTyping: true }).data

    this.hospitalSeries = [
      {
        name: 'Hospitalized: Berlin Reported (Senate)',
        x: hospData.map(day => this.reformatDate(day.Datum)),
        y: hospData.map(day => day['Stationäre Behandlung']),
        line: {
          dash: 'dot',
          width: 2,
          color: this.colors['Seriously Sick'],
        },
      },
      {
        name: 'Intensive Care: Berlin Reported (Senate)',
        x: hospData.map(day => this.reformatDate(day.Datum)),
        y: hospData.map(day => day['Intensivmedizin']),
        line: {
          dash: 'dot',
          width: 2,
          color: this.colors['Critical'],
        },
      },
    ]

    this.dataLines.push(...this.hospitalSeries)
  }

  private reformatDate(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout = {
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
      range: ['2020-02-16', '2020-08-31'],
      type: 'date',
    },
    yaxis: {
      type: this.logScale ? 'log' : 'linear',
      autorange: true,
      title: 'Number of Hospitalizations',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
    displayModeBar: false,
    responsive: true,
  }

  @Watch('data') private updateModelData() {
    let modelData = this.data.filter(item => this.relevantStats.has(item.name))
    modelData = modelData.map(item => {
      item.line = {
        dash: 'solid',
        width: 2,
        color:
          item.name === 'Seriously Sick' ? this.colors['Seriously Sick'] : this.colors['Critical'],
      }
      return item
    })

    this.dataLines = modelData
    this.dataLines.push(...this.hospitalSeries)
    console.log({ dataLines: this.dataLines })
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
