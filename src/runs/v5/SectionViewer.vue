<template lang="pug">
#main-section
  .pieces
    .sliders
      h5 Select Scenario
      .button-choices.buttons.has-addons
        button.button.is-small(
          :class="{'is-link': isBase, 'is-selected': isBase}"
          :key="'base'" @click='setBase(true)') Base Case
        button.button.is-small(
          :class="{'is-link': !isBase, 'is-selected': !isBase}"
          :key="'do-something'" @click='setBase(false)') Alternatives

      .selection-widgets(:class="{'totally-disabled': isBase}")
        .g1
          h5.title Percentage of out-of-home activities still occuring after day 35
          p.subhead By type (%)

          .myslider(v-for="measure in Object.keys(state.measures).slice(4)" :key="measure")
            my-slider(:measure="measure" :state="state" @changed="sliderChanged")

        .g1
          h5.title Reopening of educational facilities at day 63
          p.subhead Students Returning (%):

          .myslider(v-for="measure in Object.keys(state.measures).slice(0,4)" :key="measure")
            my-slider(:measure="measure" :state="state" @changed="sliderChanged")

      h5 Cumulative Infected
      p.infected {{ prettyInfected }}

    vue-plotly.plot1(:data="data" :layout="layout" :options="options")
    vue-plotly.plot2(:data="data" :layout="loglayout" :options="options")

</template>

<script lang="ts">
// ###########################################################################
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Papa from 'papaparse'
import VuePlotly from '@statnett/vue-plotly'
import ZipLoader from 'zip-loader'

import MySlider from './MySlider.vue'

@Component({
  components: {
    MySlider,
    VuePlotly,
  },
})
export default class SectionViewer extends Vue {
  @Prop() private state!: any

  private currentRun: any = {}

  private isBase = true

  private data: any[] = []
  private layout = {
    title: {
      text: 'Status of simulated residents vs. days',
    },
    legend: {
      orientation: 'h',
    },
    autosize: true,
    height: 500,
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    yaxis: {
      // type: 'log',
      autorange: true,
    },
    xaxis: {
      /*
      title: {
        text: 'Days after outbreak begins',
      },
      /* font: {
        family: 'Courier New, monospace',
        size: 18,
        color: '#7f7f7f'
      } */
    },
  }

  private setBase(value: boolean) {
    this.isBase = value
    this.showPlotForCurrentSituation()
    // this.runChanged()
  }

  private loglayout = {
    title: 'Log scale:',
    autosize: true,
    legend: {
      orientation: 'h',
    },
    height: 500,
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    yaxis: {
      type: 'log',
      autorange: true,
    },
    xaxis: {
      /*
      title: {
        text: 'Days after outbreak begins',
      },
      /* font: {
        family: 'Courier New, monospace',
        size: 18,
        color: '#7f7f7f'
      } */
    },
  }

  private options = {
    displayModeBar: false,
  }

  private currentSituation: any = {}
  private loadedSeriesData: any = {}
  private zipLoader: any

  private labels: any = {
    nSusceptible: 'Susceptible',
    nInfectedButNotContagious: 'Infected, not contagious',
    nContagious: 'Contagious',
    nSeriouslySick: 'Seriously Sick',
    nCritical: 'Critical',
    nTotalInfected: 'Total Infected',
    nInfectedCumulative: 'Infected Cumulative',
    nRecovered: 'Recovered',
    nInQuarantine: 'In Quarantine',
  }

  private mounted() {
    this.loadZipData()
  }

  private get prettyInfected() {
    if (!this.state.cumulativeInfected) return ''

    const rounded = 100 * Math.round(this.state.cumulativeInfected * 0.01)
    return Number(rounded).toLocaleString()
  }

  private async loadZipData() {
    this.zipLoader = new ZipLoader(this.state.publicPath + 'v5-data.zip')

    await this.zipLoader.load()

    console.log('zip loaded!')
    this.runChanged()
  }

  private async runChanged() {
    console.log({ run: this.currentRun })

    if (this.loadedSeriesData[this.currentRun.RunId]) {
      this.data = this.loadedSeriesData[this.currentRun.RunId]
      this.updateTotalInfected()
      return
    }

    const csv: any[] = await this.loadCSV(this.currentRun)
    const timeSerieses = this.generateSeriesFromCSVData(csv)

    // cache the result
    this.loadedSeriesData[this.currentRun.RunId] = timeSerieses

    this.data = timeSerieses
    this.updateTotalInfected()
  }

  private updateTotalInfected() {
    const infectedCumulative = this.data.filter(a => a.name === 'Infected Cumulative')[0]
    this.state.cumulativeInfected = infectedCumulative.y[infectedCumulative.y.length - 1]
  }

  private sliderChanged(measure: any, value: any) {
    console.log(measure, value)
    this.currentSituation[measure] = value
    this.showPlotForCurrentSituation()
  }

  private showPlotForCurrentSituation() {
    if (this.isBase) {
      this.currentRun = { RunId: 'sz0' }
      this.runChanged()
      return
    }

    let lookupKey = ''
    for (const measure of Object.keys(this.state.measures)) lookupKey += this.currentSituation[measure] + '-'

    console.log(lookupKey)
    this.currentRun = this.state.runLookup[lookupKey]
    if (!this.currentRun) return

    this.runChanged()
  }

  private unpack(rows: any[], key: any) {
    let v = rows.map(function(row) {
      if (key === 'day') return row[key]
      return row[key] // * 4
    })

    v = v.slice(0, 150)

    // maybe the sim ended early - go out to 150 anyway
    if (v.length < 150) {
      v.push(key === 'day' ? 150 : v[v.length - 1])
    }

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
      const y: number[] = this.unpack(data, column)
      serieses.push({ x, y, name })
    }

    return serieses
  }
}

// ###########################################################################
</script>

<style scoped>
#main-section {
  background-color: white;
  display: flex;
  flex-direction: row;
}

.categories {
  display: flex;
  flex-direction: column;
}

h5 {
  margin-top: 2rem;
}

.sliders h5 {
  font-weight: bold;
  font-size: 18px;
}

.plot h5 {
  color: #667883;
  text-align: center;
  margin-top: 5rem;
}

.pieces {
  padding: 1rem 0rem;
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: 16.5rem auto;
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
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
}

.plot1 {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}

.plot2 {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
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

img {
  height: 18rem;
  object-fit: contain;
}

.nav-icons {
  margin: 0.5rem 1rem;
  font-size: 2rem;
  color: #b9c6d1;
}

.nav-icons :hover {
  transition: all 0.3s ease;
  color: #667883;
}

.nav-icons.is-active {
  color: #667883;
}

.medium-zoom {
  padding: 0rem 1rem 1rem 0.5rem;
}

a {
  font-size: 1.2rem;
  font-weight: bold;
}

.section-label {
  font-size: 0.8rem;
  font-weight: normal;
  color: #0cf;
}

p.section-label :hover {
  color: #667883;
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

@media only screen and (max-width: 768px) {
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

  .sliders {
    width: 15rem;
  }
}
</style>
