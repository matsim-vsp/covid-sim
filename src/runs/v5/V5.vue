<template lang="pug">
.blapp
  .content
    .readme(v-html="readme")

  section-viewer.viewer(:state="state")

</template>

<script lang="ts">
// ###########################################################################
import Papa from '@simwrapper/papaparse'

import SectionViewer from '@/runs/v5/ChartSelector.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import berlinCSV from '@/assets/berlin-cases.csv?raw'

import Markdown from 'markdown-it'
import mdText from '@/assets/v5-notes.md?raw'

const html = new Markdown({
  html: true,
  linkify: true,
  typographer: true,
}).render(mdText)

export default defineComponent({
  name: 'V5',
  components: { SectionViewer },
  props: {},
  data() {
    return {
      state: {
        measures: {},
        runLookup: {},
        cumulativeInfected: 0,
        berlinCases: {} as any,
        publicPath: '/',
      },
      readme: html,
    }
  },

  async mounted() {
    await this.loadDataInBackground()
  },

  computed: {},
  watch: {},

  methods: {
    async loadDataInBackground() {
      this.state.berlinCases = this.prepareBerlinData()

      const parsed = await this.loadCSVData(this.state.publicPath + 'v5-info.txt')
      await this.generateScenarioMatrix(parsed)
    },

    prepareBerlinData() {
      const data = Papa.parse(berlinCSV, { header: true, dynamicTyping: true }).data

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
    },

    async loadCSVData(filepath: string) {
      console.log('fetching data')
      const response = await fetch(filepath)
      const text = await response.text()
      const parsed: any = Papa.parse(text, { header: true, dynamicTyping: true })
      console.log({ parsed: parsed.data })

      return parsed.data
    },

    async generateScenarioMatrix(parsed: any[]) {
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
    },
  },
})

// ###########################################################################
</script>

<style scoped>
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
  width: 100%;
  display: flex;
  flex-direction: column;
}

.viewer {
  padding: 0rem 2rem;
  margin: 0rem 0rem;
  width: 100%;
  display: flex;
  flex-direction: column;
}

h2 {
  padding-top: 1rem;
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
