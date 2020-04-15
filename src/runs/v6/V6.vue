<template lang="pug">
#app
  h1.which-city {{ cityCap }}
  .content
    .readme(v-html="topNotes")

  .view-section
    section-viewer.viewer(:state="state" :city="city")

  .content(v-if="bottomNotes")
    .readme(v-html="bottomNotes")

</template>

<script lang="ts">
// ###########################################################################
import YAML from 'yaml'
import Papa from 'papaparse'

import { Component, Vue } from 'vue-property-decorator'
import SectionViewer from '@/runs/v6/ChartSelector.vue'

@Component({
  components: {
    SectionViewer,
  },
})
export default class App extends Vue {
  private state: any = {
    measures: {},
    runLookup: {},
    cumulativeInfected: 0,
    berlinCases: [],
    publicPath: process.env.NODE_ENV === 'production' ? '/covid-sim/' : '/',
  }

  private readme: any = {
    berlin: require('@/assets/v6-notes.md'),
    munich: require('@/assets/v6-notes.md'),
  }

  private plotTag = '{{PLOTS}}'
  private get topNotes() {
    const notes = this.readme[this.city]
    const i = notes.indexOf(this.plotTag)

    if (i < 0) return notes
    return notes.substring(0, i)
  }

  private get bottomNotes() {
    const notes = this.readme[this.city]
    const i = notes.indexOf(this.plotTag)

    if (i < 0) return ''
    return notes.substring(i + this.plotTag.length)
  }

  private get cityCap() {
    return this.city.toUpperCase()
  }

  private berlinCSV = require('@/assets/berlin-cases.csv').default

  private city = ''

  public async mounted() {
    this.city = this.$route.params.city

    await this.loadDataInBackground()
  }

  private async loadDataInBackground() {
    this.state.berlinCases = this.prepareBerlinData()

    const filepath = this.state.publicPath + 'v6-info-' + this.city + '.txt'
    const parsed = await this.loadCSVData(filepath)
    const matrix = await this.generateScenarioMatrix(parsed)
  }

  private prepareBerlinData() {
    const data = Papa.parse(this.berlinCSV, { header: true, dynamicTyping: true }).data

    // 14 days of zero cases in Berlin before the RKI data begins
    const zeroDays = 14
    const cases = new Array(zeroDays).fill(0)

    // pull the cases field out of the CSV
    let cumulative = 0
    for (let i = 0; i < data.length; i++) {
      cumulative += data[i].cases
      cases.push(cumulative)
    }

    const series = {
      name: 'Berlin Reported (Cumul.)',
      x: [...Array(cases.length).keys()].slice(1), // range
      y: cases,
      line: {
        dash: 'dot',
        width: 3,
        color: 'rgb(0,200,150)',
      },
    }

    console.log({ berlinSeries: series })
    return series
  }

  private async loadCSVData(filepath: string) {
    console.log('fetching data')
    const response = await fetch(filepath)
    const text = await response.text()
    const parsed: any = Papa.parse(text, { header: true, dynamicTyping: true })
    console.log({ parsed: parsed.data })

    return parsed.data
  }

  private async generateScenarioMatrix(parsed: any[]) {
    console.log('generating lookups')
    const measures: any = {}
    const runLookup: any = {}

    // first get column names for the measures that have been tested
    const ignore = ['Config', 'Output', 'RunId', 'RunScript']

    for (const label of Object.keys(parsed[0])) {
      if (ignore.indexOf(label) > -1) continue
      measures[label] = new Set()
    }

    // get all possible values
    for (const run of parsed) {
      if (!run.RunId) continue

      // note this particular value, for every value
      for (const measure of Object.keys(measures)) {
        if (run[measure] === 0 || run[measure]) measures[measure].add(run[measure])
      }

      // store the run in a lookup using all values as the key
      let lookupKey = ''
      for (const measure of Object.keys(measures)) lookupKey += run[measure] + '-'
      runLookup[lookupKey] = run
    }

    for (const measure of Object.keys(measures)) {
      measures[measure] = Array.from(measures[measure].keys()).sort((a: any, b: any) => a - b)
    }

    console.log({ measures, runLookup })
    this.state.measures = measures
    this.state.runLookup = runLookup
  }
}

// ###########################################################################
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.address-header {
  margin-top: 4rem;
  background-color: #d3e1ee;
  padding: 3rem 10rem;
}

.address-header h2 {
  font-size: 2.5rem;
  font-weight: bold;
}

.address-header h3 {
  font-size: 1rem;
  font-weight: normal;
  margin-top: -0.5rem;
}

.content {
  padding: 0rem 3rem;
  margin: 2rem 0rem;
  padding-bottom: 1rem;
  max-width: 70em;
  display: flex;
  flex-direction: column;
}

.view-section {
  width: 100%;
}

.viewer {
  padding: 0rem 2rem;
  margin: 0rem 0rem;
  max-width: 70em;
  display: flex;
  flex-direction: column;
}

.which-city {
  background-color: $bannerHighlight;
  padding: 0.5rem 3rem;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

@media only screen and (max-width: 640px) {
  .content {
    padding: 1rem 1rem;
    margin-top: 1rem;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    row-gap: 1rem;
  }

  .address-header {
    padding-left: 2rem;
  }
}
</style>
