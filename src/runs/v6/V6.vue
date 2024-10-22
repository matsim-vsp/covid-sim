<template lang="pug">
#app
  .city-picker
    router-link.which-city(v-for="zcity in cities"
      :key="zcity" :class="{'selected': zcity.toLowerCase()===city.toLowerCase()}"
      :to="'/v6/' + zcity.toLowerCase()")
      h1 {{ zcity }}

  .content
    .readme(v-html="topNotes")

    .view-section
      section-viewer.viewer(:state="state" :city="city")

    .bottom(v-if="bottomNotes")
      h3 Further Notes
      .readme(v-html="bottomNotes")

</template>

<script lang="ts">
// ###########################################################################
import Papa from '@simwrapper/papaparse'

import SectionViewer from '@/runs/v6/ChartSelector.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import Markdown from 'markdown-it'
import v6Notes from '@/assets/v6-notes.md?raw'
import berlinCSV from '@/assets/berlin-cases.csv?raw'

const html = new Markdown({
  html: true,
  linkify: true,
  typographer: true,
}).render(v6Notes)

export default defineComponent({
  name: 'V6',
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
      readme: {
        berlin: html,
        munich: html,
      } as any,
      plotTag: '{{PLOTS}}',
      city: '',
      plusminus: '-5',
    }
  },

  async mounted() {
    console.log({ route: this.$route })
    this.city = this.$route.params.city

    await this.loadDataInBackground()
  },

  computed: {
    cities() {
      return ['Berlin', 'Munich']
    },

    topNotes() {
      const notes = this.readme[this.city]
      if (!notes) return ''

      const i = notes.indexOf(this.plotTag)

      if (i < 0) return notes
      return notes.substring(0, i)
    },

    bottomNotes() {
      const notes = this.readme[this.city]
      if (!notes) return ''

      const i = notes.indexOf(this.plotTag)

      if (i < 0) return ''
      return notes.substring(i + this.plotTag.length)
    },
  },

  watch: {
    async $route(to: any, from: any) {
      console.log(to)
      await this.loadDataInBackground()
      this.city = to.params.city
    },
  },

  methods: {
    async loadDataInBackground() {
      this.state.berlinCases = this.prepareBerlinData()

      const filepath = this.state.publicPath + 'v6-info-' + this.city + '.txt'
      const parsed = await this.loadCSVData(filepath)
      const matrix = await this.generateScenarioMatrix(parsed)
    },

    prepareBerlinData() {
      // Our simulation start date is 2020.02.16 based on school closures 13.March
      // Two cases in RKI data before 2020.02.16 (as of 2020.04.16)
      // Thus we begin Berlin data with 2 cases.
      const data = Papa.parse(berlinCSV, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      console.log({ data })

      const dates: any = []
      const cases: any = []
      let cumulative = 0

      console.log('fetched berlin data:', data.length)

      // pull the cases field out of the CSV
      for (const datapoint of data) {
        const day = datapoint.year + '-' + datapoint.month + '-' + datapoint.day
        dates.push(day)

        cumulative += datapoint.cases
        cases.push(cumulative)
      }

      const series = {
        name: 'Berlin Infections (RKI)',
        x: dates,
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

<style scoped lang="scss">
@import '@/styles.scss';

.content {
  padding: 0rem 3rem;
  margin: 2rem 0 4rem 0;
  max-width: 70em;
  display: flex;
  flex-direction: column;
}

.content h3.select-scenario {
  margin-bottom: 0;
}

.view-section {
  width: 100%;
}

.viewer {
  padding: 0rem 0rem;
  margin: 0rem 0rem;
  max-width: 70em;
  display: flex;
  flex-direction: column;
}

.city-picker {
  display: flex;
  background-color: $bannerHighlight;
  padding: 0.3rem 3rem 0 3rem;
}

.which-city {
  padding: 0rem 2rem 0.2rem 2rem;
  margin-top: 0.1rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: capitalize;
}

a.which-city {
  color: #bbb;
}

.selected {
  padding-top: 0.1rem;
  background-color: $paleBackground;
}

a.selected {
  color: black;
}

.bottom {
  margin-top: 2rem;
}

@media only screen and (max-width: 640px) {
  .content {
    padding: 1rem 1rem;
    margin-top: 1rem;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    row-gap: 1rem;
  }

  .which-city {
    padding: 0.5rem 1rem;
  }
}
</style>
