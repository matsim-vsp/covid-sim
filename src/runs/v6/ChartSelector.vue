<template lang="pug">
#main-section
  .pieces
    .sliders
      h5 Select Scenario
      .button-choices.buttons.has-addons(v-if="city==='berlin'")
        button.button.is-small(
          :class="{'is-link': !isBase, 'is-selected': !isBase}"
          :key="'do-something'" @click='setBase(false)') Alternatives
        button.button.is-small(
          :class="{'is-link': isBase, 'is-selected': isBase}"
          :key="'base'" @click='setBase(true)') What would have happened w/o restrictions

      .selection-widgets(:class="{'totally-disabled': isBase}")
        .g1
          h5.title Percentage of out-of-home activities still occuring after day 35
          p.subhead By type (%)

          .myslider(v-for="measure in Object.keys(state.measures).slice(4)" :key="measure")
            my-slider(:measure="measure" :state="state" @changed="sliderChanged")

        .g1
          h5.title Reopening of educational facilities at day 63
          p.subhead Students Returning (%):

          .myslider(v-for="measure in Object.keys(state.measures).slice(1,4)" :key="measure")
            my-slider(:measure="measure" :state="state" @changed="sliderChanged")

      h5.cumulative Cumulative Infected
      p.infected {{ prettyInfected }}

    .log-plot
      h5 Simulated Population Health Outcomes Over Time
      p Log scale
      vue-plotly.plotsize(:data="data" :layout="loglayout" :options="options")

    .linear-plot
      h5 Simulated Population Health Outcomes Over Time
      p Linear scale
      vue-plotly.plotsize(:data="data" :layout="layout" :options="options")

</template>

<script lang="ts">
// ###########################################################################
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Papa from 'papaparse'
import VuePlotly from '@statnett/vue-plotly'
import ZipLoader from 'zip-loader'

import MySlider from './SelectWidget.vue'

@Component({
  components: {
    MySlider,
    VuePlotly,
  },
})
export default class SectionViewer extends Vue {
  @Prop() private state!: any

  @Prop({ required: true }) private city!: string

  @Watch('city') switchCity() {
    this.loadedSeriesData = {}
    this.loadZipData()
  }

  private isBase = false
  private data: any[] = []

  private currentRunLow: any = {}
  private currentRunHigh: any = {}

  private layout = {
    autosize: true,
    legend: {
      orientation: 'h',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { l: 50, t: 10, r: 10, b: 0 },
    yaxis: {
      autorange: true,
    },
    xaxis: {},
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private loglayout = {
    autosize: true,
    legend: {
      orientation: 'h',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { l: 50, t: 10, r: 10, b: 0 },
    yaxis: {
      type: 'log',
      autorange: true,
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
    displayModeBar: false,
    responsive: true,
  }

  private setBase(value: boolean) {
    this.isBase = value
    this.showPlotForCurrentSituation()
  }

  private currentSituation: any = {}
  private loadedSeriesData: any = {}
  private zipLoader: any

  private labels: any = {
    nSusceptible: 'Susceptible',
    nInfectedButNotContagious: 'Infected, not contagious',
    nContagious: 'Contagious',
    nShowingSymptoms: 'Showing Symptoms',
    nSeriouslySick: 'Seriously Sick',
    nCritical: 'Critical',
    nTotalInfected: 'Total Infected',
    nInfectedCumulative: 'Infected Cumulative',
    nRecovered: 'Recovered',
    nInQuarantine: 'In Quarantine',
  }

  private mounted() {
    this.testErrors()

    this.loadZipData()
  }

  private get prettyInfected() {
    if (!this.state.cumulativeInfected) return ''

    const rounded = 100 * Math.round(this.state.cumulativeInfected * 0.01)
    return Number(rounded).toLocaleString()
  }

  private async loadZipData() {
    const filepath = this.state.publicPath + 'v6-data-' + this.city + '.zip'
    console.log(filepath)
    this.zipLoader = new ZipLoader(filepath)

    await this.zipLoader.load()

    console.log('zip loaded!')
    this.runChanged()
  }

  private fillcolors: any = {
    Susceptible: '#0000ff',
    'Seriously Sick': '#cc2211',
    'Showing Symptoms': '#00ffff',
    'Infected Cumulative': '#f791cf',
    'Infected, not contagious': '#ee8800',
    Critical: '#882299',
    Recovered: '#eedd44',
    Contagious: '#00aa00',
    'Total Infected': '#a65628',
  }

  private testErrors() {
    const low: any = [
      {
        x: [1, 2, 3],
        y: [1, 1.1, 1.2],
        name: 'low',
      },
    ]

    const high = [
      {
        x: [1, 2, 3, 4],
        y: [3, 4, 5, 6],
        name: 'high',
      },
    ]

    const answer = this.generateErrorBars(low, high)
    console.log({ answer })
  }

  private generateErrorBars(low: any[], high: any[]): any[] {
    console.log({ low, high })

    for (let metric = 0; metric < low.length; metric++) {
      const lowLen = low[metric].x.length
      const highLen = high[metric].x.length

      console.log({ lowLen, highLen })

      let newX: any[] = []
      newX = newX.concat(low[metric]['x'])
      if (highLen > lowLen) newX.push(high[metric]['x'][highLen - 1])
      if (highLen < lowLen) newX.push(low[metric]['x'][lowLen - 1])

      newX = newX.concat(high[metric]['x'].slice().reverse()) // slice copies, then reverse reverses in-place.

      let newY: any[] = []
      newY = newY.concat(low[metric]['y'])
      if (highLen > lowLen) newY.push(low[metric]['y'][lowLen - 1])
      if (highLen < lowLen) newY.push(high[metric]['y'][highLen - 1])

      newY = newY.concat(high[metric]['y'].slice().reverse()) // slice copies, then reverse reverses in-place.

      low[metric].x = newX
      low[metric].y = newY

      const color = this.fillcolors[low[metric]['name']]
      // scatterplot fakes a look like error bands
      low[metric].fillcolor = color + '40'
      low[metric].showlegend = true
      low[metric].line = { color: color + 'a0' }
      low[metric].fill = 'tozerox'
      low[metric].type = 'scatter'
    }

    console.log({ errorBar: low })
    return low
  }

  private async runChanged() {
    // maybe we already did the calcs
    if (this.loadedSeriesData[this.currentRunLow.RunId]) {
      this.data = this.loadedSeriesData[this.currentRunLow.RunId]
      this.updateTotalInfected()
      return
    }

    // load both datasets
    const csvLow: any[] = await this.loadCSV(this.currentRunLow)
    const csvHigh: any[] = await this.loadCSV(this.currentRunHigh)
    const timeSeriesesLow = this.generateSeriesFromCSVData(csvLow)
    const timeSeriesesHigh = this.generateSeriesFromCSVData(csvHigh)

    const errorBars = this.generateErrorBars(timeSeriesesLow, timeSeriesesHigh)

    // cache the result
    this.loadedSeriesData[this.currentRunLow.RunId] = errorBars

    this.data = errorBars
    this.updateTotalInfected()
  }

  private updateTotalInfected() {
    const infectedCumulative = this.data.filter(a => a.name === 'Infected Cumulative')[0]
    this.state.cumulativeInfected = Math.max(...infectedCumulative.y)
  }

  private sliderChanged(measure: any, value: any) {
    console.log(measure, value)
    this.currentSituation[measure] = value
    this.showPlotForCurrentSituation()
  }

  private showPlotForCurrentSituation() {
    if (this.isBase) {
      this.currentRunLow = { RunId: 'sz0' }
      this.runChanged()
      return
    }

    let lookupKey = ''
    for (const measure of Object.keys(this.state.measures))
      lookupKey += this.currentSituation[measure] + '-'

    const lookup = lookupKey.replace('undefined', 'BAND')
    const lookupLow = lookupKey.replace('undefined', '-5')
    const lookupHigh = lookupKey.replace('undefined', '5')

    console.log(lookupLow, lookupHigh)

    this.currentRunLow = this.state.runLookup[lookupLow]
    this.currentRunHigh = this.state.runLookup[lookupHigh]

    if (!this.currentRunLow) return

    this.runChanged()
  }

  private unpack(rows: any[], key: any) {
    let v = rows.map(function(row) {
      if (key === 'day') return row[key]
      return row[key] // * 4
    })
    return v
  }

  private async loadCSV(currentRun: any) {
    if (!currentRun.RunId) return []

    const filename = currentRun.RunId + '.infections.txt'
    console.log('Extracting', filename)

    let text = this.zipLoader.extractAsText(filename)
    const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

    return z.data
  }

  private generateSeriesFromCSVData(data: any[]) {
    const serieses = []

    const x: number[] = this.unpack(data, 'day')

    for (const column of Object.keys(this.labels)) {
      const name = this.labels[column]

      if (name === 'In Quarantine') continue

      const y: number[] = this.unpack(data, column)
      serieses.push({ x, y, name })
    }

    // Add Berlin "Reported Cases"
    // if (this.city === 'berlin') serieses.push(this.state.berlinCases)

    return serieses
  }
}

// ###########################################################################
</script>

<style scoped>
#main-section {
  display: flex;
  flex-direction: row;
}

h5 {
  font-weight: bold;
  font-size: 18px;
}

.pieces {
  padding: 2rem 0rem;
  display: grid;
  width: 100%;
  grid-gap: 1rem;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
}

.pieces h3 {
  color: #667883;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
  margin: 1rem 1rem 2rem 0rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.sliders {
  grid-column: 1 / 2;
  grid-row: 1 / 4;
  margin-right: 1rem;
  width: 17rem;
  display: flex;
  flex-direction: column;
}

.log-plot {
  background-color: #f4f4f4;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  margin: 0 0 1rem 0;
  text-align: center;
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
}

.linear-plot {
  background-color: #f4f4f4;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  text-align: center;
  grid-column: 2 / 3;
  grid-row: 3 / 4;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
}

h5 {
  margin-top: 0.5rem;
}

.plotsize {
  height: 30rem;
}

p.subhead {
  margin-top: -0.25rem;
}

.myslider {
  width: 100%;
  margin-left: 0.5rem;
}

.plot {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  padding: 1rem 0rem;
}

.infected {
  padding-left: 0rem;
  font-weight: bold;
  font-size: 2rem;
  margin-top: -0.5rem;
  color: rgb(151, 71, 34);
}

.button-choices button {
  margin-right: 0.5rem;
}

.title {
  line-height: 1.4rem;
  margin: 1rem 0 0.5rem 0;
}

.totally-disabled {
  pointer-events: none;
  opacity: 0.4;
}

.g1 {
  padding: 0rem 1rem 1rem 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid #ccf;
  border-radius: 4px;
}

.cumulative {
  margin-top: 2rem;
}

@media only screen and (max-width: 640px) {
  #main-section {
    flex-direction: column;
    padding: 0 0;
    margin: 0 0rem;
  }

  .pieces {
    padding: 1rem 1rem;
    display: flex;
    flex-direction: column;
  }

  .linear-plot {
    margin-top: 2rem;
  }
  .sliders {
    width: 15rem;
  }
}
</style>
