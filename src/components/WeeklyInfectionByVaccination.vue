<template lang="pug">
#vue-component
  vue-plotly(:data="dataLines" :layout="layout" :options="options")

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
  @Prop({ required: true }) private rkiDetectionData!: {
    x?: any[]
    y?: any[]
    line?: any
    name?: string
  }

  private color = ['#094', '#0c4']

  private lagDays = 1

  private dataLines: any[] = []

  private mounted() {
    this.calculateValues()
  }

  @Watch('data') private updateModelData() {
    this.calculateValues()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis = this.logScale
      ? {
          fixedrange: window.innerWidth < 700,
          type: 'log',
          range: [Math.log10(2), Math.log10(10000)],
          title: '7-Day Infections / 100k Pop.',
        }
      : {
          fixedrange: window.innerWidth < 700,
          type: 'linear',
          autorange: true,
          title: '7-Day Infections / 100k Pop.',
        }
  }

  private calculateObserved(factor100k: number) {
    if (this.observed.length === 0) return

    console.log(this.observed)

    // for each data source, let's draw some dots
    for (const source of this.observed) {
      // Don't scale the 150x pre-scaled line, it's already been scaled!
      if (source.name.indexOf('ALM e.V') > -1) {
        this.dataLines.push(source)
        continue
      }

      const observedLine: any = {
        type: 'scatter',
        mode: 'markers',
        marker: { size: 3 },
      }

      observedLine.name = source.name
      observedLine.line = source.line
      observedLine.x = []
      observedLine.y = []
      if (source.marker) observedLine.marker = source.marker

      // RKI meldedatum and infection data start on different days of the week.
      const offsetRKIDate: { [id: string]: number } = {
        'RKI Berlin Infections': 11,
        'RKI Cologne Infections': 11,
        'RKI-Meldedatum Berlin': 12,
        'Observed Infections': 12,
      }

      const lineName = observedLine.name as string
      if (lineName.startsWith('RKI') || lineName.startsWith('Observed')) {
        // Observed lines: weekly average
        const startWeek = offsetRKIDate[lineName]

        // generate weekly numbers
        for (let i = startWeek; i < source.x.length; i += 7) {
          const newInfections = source.y[i] - source.y[i - 7]
          const observedRate = 0.1 * Math.floor((10.0 * newInfections) / factor100k)

          observedLine.x.push(source.x[i - 3]) // midweek
          observedLine.y.push(observedRate)
        }
      } else {
        // non Observed lines: every day

        for (let i = 0; i < source.x.length; i++) {
          const newInfections = source.y[i] - (i < this.lagDays ? 0 : source.y[i - this.lagDays])
          const observedRatePer100k = 7.0 * 0.1 * Math.floor((10.0 * newInfections) / factor100k)
          observedLine.x.push(source.x[i])
          observedLine.y.push(observedRatePer100k)
        }
      }

      this.dataLines.push(observedLine)
    }
  }

  /**
   * We are calculating a seven day running infection rate.
   */
  private calculateValues() {
    if (this.data.length === 0) return

    // set end date
    this.layout.xaxis.range = ['2020-02-09', this.endDate]

    // Einwohner
    let totalInfected: any = this.data.filter(item => item.name === 'Total Infected')[0]
    let susceptible: any = this.data.filter(item => item.name === 'Susceptible')[0]
    let recovered: any = this.data.filter(item => item.name === 'Recovered')[0]

    // Geimpft
    let totalInfectedVac: any = this.data.filter(item => item.name === 'TotalInfectedVaccinated')[0]
    let susceptibleVac: any = this.data.filter(item => item.name === 'SusceptibleVaccinated')[0]
    let recoveredVac: any = this.data.filter(item => item.name === 'RecoveredVaccinated')[0]

    var einwohner = []
    var geimpft = []
    var date = []

    for (var i = 0; i < totalInfected.x.length; i++) {
      einwohner.push(totalInfected.y[i] + susceptible.y[i] + recovered.y[i])
      geimpft.push(totalInfectedVac.y[i] + susceptibleVac.y[i] + recoveredVac.y[i])
      date.push(totalInfected.x[i])
    }

    let ungeimpft = []

    for (var i = 0; i < einwohner.length; i++) {
      ungeimpft.push(einwohner[i] - geimpft[i])
    }

    let nShowingSymptomsCumulative: any = this.data.filter(
      item => item.name === 'Showing Symptoms Cum.'
    )[0]
    let nShowingSymptomsCumulativeVaccinated: any = this.data.filter(
      item => item.name === 'ShowingSymptomsCumulativeVaccinated'
    )[0]

    console.log(nShowingSymptomsCumulative)

    var newCases = []
    var newCasesVac = []
    var newCasesUnvac = []
    var dateNewCases = []

    for (var i = 7; i < nShowingSymptomsCumulative.x.length; i++) {
      dateNewCases.push(nShowingSymptomsCumulative.x[i])
      newCases.push(nShowingSymptomsCumulative.y[i] - nShowingSymptomsCumulative.y[i - 7])
      newCasesVac.push(
        nShowingSymptomsCumulativeVaccinated.y[i] - nShowingSymptomsCumulativeVaccinated.y[i - 7]
      )
    }

    for (var i = 0; i < newCases.length; i++) {
      newCasesUnvac.push(newCases[i] - newCasesVac[i])
    }

    var geimpft_v_1 = []
    var geimpft_v_2 = []
    var ungeimpft_v_1 = []
    var ungeimpft_v_2 = []
    var inzident = []

    for (var i = 0; i < newCases.length; i++) {
      newCasesUnvac.push(newCases[i] - newCasesVac[i])
    }

    for (var i = 0; i < newCases.length; i++) {
      geimpft_v_1.push(newCasesVac[i] / (einwohner[i + 7] / 100000))
      geimpft_v_2.push(newCasesVac[i] / (geimpft[i + 7] / 100000))
      ungeimpft_v_1.push(newCasesUnvac[i] / (einwohner[i + 7] / 100000))
      ungeimpft_v_2.push(newCasesUnvac[i] / (ungeimpft[i + 7] / 100000))
      inzident.push(newCases[i] / (einwohner[i + 7] / 100000))
    }

    this.dataLines = [
      {
        name: 'vaccinated_v_1',
        x: dateNewCases,
        y: geimpft_v_1,
        line: {
          dash: 'dash',
        },
      },
      {
        name: 'vaccinated_v_2',
        x: dateNewCases,
        y: geimpft_v_2,
        line: {
          width: 3,
        },
      },
      {
        name: 'unvaccinated_v_1',
        x: dateNewCases,
        y: ungeimpft_v_1,
        line: {
          dash: 'dash',
        },
      },
      {
        name: 'unvaccinated_v_2',
        x: dateNewCases,
        y: ungeimpft_v_2,
        line: {
          width: 3,
        },
      },
      {
        name: 'incidence (total)',
        x: dateNewCases,
        y: inzident,
        line: {
          // color: '#ddbbbb',
          color: 'black',
        },
      },
    ]
  }

  private reformatDate(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout = {
    height: 450,
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
      fixedrange: window.innerWidth < 700,
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      // note this gets overwritten when the scale changes - see updateScale()
      fixedrange: window.innerWidth < 700,
      type: 'log',
      autorange: false,
      range: [Math.log10(2), Math.log10(10000)],
      title: '7-Day Infections / 100k Pop.',
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
