<template lang="pug">
#vue-component(v-if="!isResizing")
  vue-plotly(:data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")

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
  @Prop({ required: true }) private unreportedIncidence!: any[]
  @Prop({ required: true }) private unreportedIncidenceNRW!: any[]
  @Prop({ required: true }) private metadata!: any

  private color = ['#094', '#0c4']

  private lagDays = 1

  private dataLines: any[] = []
  private unselectedLines: string[] = []

  private mounted() {
    this.calculateValues()
    this.unselectLines()
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

  @Watch('logScale') updateScale() {
    this.layout.yaxis = this.logScale
      ? {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'log',
          range: [Math.log10(2), Math.log10(30000)],
          title: '7-Day Infections / 100k Pop.',
        }
      : {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          autorange: true,
          title: '7-Day Infections / 100k Pop.',
        }
  }

  @Watch('unreportedIncidence') gotUnreportedIncidence() {
    this.calculateValues()
  }

  @Watch('unreportedIncidenceNRW') gotUnreportedIncidenceNRW() {
    this.calculateValues()
  }

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

  private async calculateUnreportedNRW() {
    if (this.unreportedIncidenceNRW.length > 1) {
      const unreportedIncidence: any = {
        type: 'scatter',
        mode: 'markers',
        marker: { size: 4 },
      }

      const unreportedIncidenceX2: any = {
        type: 'scatter',
        mode: 'markers',
        marker: { size: 4 },
      }

      unreportedIncidence.name = 'MAGS NRW Incidence'
      unreportedIncidence.visible = true
      unreportedIncidence.x = []
      unreportedIncidence.y = []

      unreportedIncidenceX2.name = 'Assumed Reported and Unreported Cases (NRW)'
      unreportedIncidenceX2.visible = true
      unreportedIncidenceX2.x = []
      unreportedIncidenceX2.y = []

      for (var i = 0; i < this.unreportedIncidenceNRW.length; i++) {
        unreportedIncidence.x.push(this.unreportedIncidenceNRW[i]['Date'])
        unreportedIncidence.y.push(this.unreportedIncidenceNRW[i]['Incidence(NRW)'])
        unreportedIncidenceX2.x.push(this.unreportedIncidenceNRW[i]['Date'])
        unreportedIncidenceX2.y.push(this.unreportedIncidenceNRW[i]['ScaledTimes2'])
      }
      this.dataLines.push(unreportedIncidence)
      this.dataLines.push(unreportedIncidenceX2)
    }
  }

  private async calculateUnreported() {
    if (this.unreportedIncidence.length > 1) {
      const unreportedDataLine: any = {
        type: 'scatter',
        mode: 'markers',
        marker: { size: 4 },
      }

      unreportedDataLine.name = 'Assumed Reported and Unreported Cases'
      unreportedDataLine.visible = true
      unreportedDataLine.x = []
      unreportedDataLine.y = []

      for (var i = 0; i < this.unreportedIncidence.length; i++) {
        unreportedDataLine.x.push(this.unreportedIncidence[i]['Datum'])
        unreportedDataLine.y.push(this.unreportedIncidence[i]['DunkelzifferInzidenz'])
      }
      this.dataLines.push(unreportedDataLine)
    }
    this.calculateUnreportedNRW()
  }

  private calculateObserved(factor100k: number) {
    if (this.observed.length === 0) return

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
      observedLine.visible = true
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
    this.calculateUnreported()
  }

  /**
   * We are calculating a seven day running infection rate.
   */
  private calculateValues() {
    if (this.data.length === 0) return

    // set end date
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate

    // If the simulation begins in the middle of a pandemic, then we need to add together susceptible, infected, and
    // recovered agents to get the total population. --jr nov'22
    const susceptible = this.data.filter(item => item.name === 'Susceptible')[0]
    const totalInfected = this.data.filter(item => item.name === 'Total Infected')[0]
    const recovered = this.data.filter(item => item.name === 'Recovered')[0]

    const totalPopulation = susceptible.y[0] + totalInfected.y[0] + recovered.y[0]

    const factor100k = totalPopulation / 100000.0
    const sevenDays = 7

    const infectionRate = []
    const midWeekDates = []

    let nShowSymptomsCum: any = this.data.filter(item => item.name === 'Showing Symptoms Cum.')[0]

    // Newer (Oct 2020) versions of the model have a "Showing Symptoms" column
    // Use it if it exists.
    if (nShowSymptomsCum.y[0] !== undefined) {
      for (let i = sevenDays + 5; i < nShowSymptomsCum.y.length; i += sevenDays) {
        // difference in cumulative num of people showing symptoms is new infections
        const diff = nShowSymptomsCum.y[i] - nShowSymptomsCum.y[i - sevenDays]
        // rate: infections per 100,000 per seven days
        const rate = 0.1 * Math.round((10.0 * diff) / factor100k)
        infectionRate.push(rate)
        midWeekDates.push(nShowSymptomsCum.x[i - 3])
      }
    } else {
      for (let i = this.lagDays; i < susceptible.y.length; i++) {
        // difference in people susceptible is new infections
        const diffSusceptible = susceptible.y[i - this.lagDays] - susceptible.y[i]
        // rate: infections per 100,000 per seven days
        const rate = 0.1 * Math.round((10.0 * diffSusceptible) / factor100k)
        infectionRate.push(rate)
        midWeekDates.push(susceptible.x[i - 3])
      }
    }

    this.dataLines = [
      {
        name: 'Target: 50 per 100K',
        visible: true,
        x: [0, susceptible.x[susceptible.x.length - 1]],
        y: [50, 50],
        fill: 'tozeroy',
        line: {
          width: 1.0,
          // color: '#ddbbbb',
          color: '#cdc',
        },
      },
      // {
      //   name: 'Target: 35 per 100K',
      //   x: [0, susceptible.x[susceptible.x.length - 1]],
      //   y: [35, 35],
      //   fill: 'tozeroy',
      //   line: {
      //     width: 1.0,
      //     // color: '#ddbbbb',
      //     color: '#cdc',
      //   },
      // },
      {
        name: 'Model',
        visible: true,
        x: midWeekDates, // susceptible.x.slice(averagingPeriod),
        y: infectionRate,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 4, color: '#32c' },
        line: {
          width: 0.5,
          color: '#329',
          // shape: 'hvh',
        },
      },
    ]

    // add RKI detection data if it exists
    if (this.rkiDetectionData.x) this.dataLines.push(this.rkiDetectionData)

    this.calculateObserved(factor100k)
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
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      // note this gets overwritten when the scale changes - see updateScale()
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: 'log',
      autorange: false,
      range: [Math.log10(2), Math.log10(30000)],
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
