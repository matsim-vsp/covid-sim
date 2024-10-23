<template lang="pug">
#main-section
  .pieces
    .sliders
      h5 Intervention Options
      p.subhead Days after outbreak begins:

      .myslider(v-for="measure in Object.keys(state.measures)" :key="measure")
        my-slider(:measure="measure" :state="state" @changed="sliderChanged")

    .linear-plot
      h5 Simulated Population Health Outcomes Over Time
      p Linear scale
      vue-plotly.plotsize(:data="data" :layout="layout" :options="options")

    .log-plot
      h5 Simulated Population Health Outcomes Over Time
      p Log scale
      vue-plotly.plotsize(:data="data" :layout="loglayout" :options="options")

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import ZipLoader from 'zip-loader'
import Papa from '@simwrapper/papaparse'

import MySlider from './SelectWidget.vue'
import VuePlotly from '@/components/VuePlotly.vue'

export default defineComponent({
  name: 'ChartSelector',
  components: { MySlider, VuePlotly },
  props: {
    state: { type: Object, required: true },
  },

  data() {
    return {
      zipFile: '/v1-data.zip',
      currentRun: {} as any,
      data: [] as any[],
      layout: {
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
      },
      loglayout: {
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
      },

      options: {
        displayModeBar: false,
        responsive: true,
      },

      currentSituation: {} as any,
      loadedSeriesData: {} as any,
      zipLoader: {} as any,

      labels: {
        nSusceptible: 'Susceptible',
        nInfectedButNotContagious: 'Infected, not contagious',
        nContagious: 'Contagious',
        nSeriouslySick: 'Seriously Sick',
        nCritical: 'Critical',
        nTotalInfected: 'Total Infected',
        nInfectedCumulative: 'Infected Cumulative',
        nRecovered: 'Recovered',
        nInQuarantine: 'In Quarantine',
      } as any,
    }
  },

  mounted() {
    this.loadZipData()
  },

  methods: {
    async loadZipData() {
      this.zipLoader = new ZipLoader(this.zipFile)

      await this.zipLoader.load()

      console.log('zip loaded!')
      this.runChanged()
    },

    async runChanged() {
      console.log({ run: this.currentRun })

      if (this.loadedSeriesData[this.currentRun.RunId]) {
        this.data = this.loadedSeriesData[this.currentRun.RunId]
        return
      }

      const csv: any[] = await this.loadCSV(this.currentRun)
      const timeSerieses = this.generateSeriesFromCSVData(csv)

      // cache the result
      this.loadedSeriesData[this.currentRun.RunId] = timeSerieses

      this.data = timeSerieses
    },

    sliderChanged(measure: any, value: any) {
      this.currentSituation[measure] = value
      this.showPlotForCurrentSituation()
    },

    showPlotForCurrentSituation() {
      let lookupKey = ''
      for (const measure of Object.keys(this.state.measures))
        lookupKey += this.currentSituation[measure] + '-'

      this.currentRun = this.state.runLookup[lookupKey]
      if (!this.currentRun) return

      this.runChanged()
    },

    unpack(rows: any[], key: any) {
      let v = rows.map(function (row) {
        if (key === 'day') return row[key]
        return row[key] * 4
      })

      v = v.slice(0, 150)
      return v
    },

    async loadCSV(currentRun: any) {
      if (!currentRun.RunId) return []

      const filename = currentRun.RunId + '.infections.txt'
      console.log('Extracting', filename)

      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true })

      return z.data
    },

    generateSeriesFromCSVData(data: any[]) {
      const serieses = []

      const x: number[] = this.unpack(data, 'day')

      for (const column of Object.keys(this.labels)) {
        const name = this.labels[column]
        const y: number[] = this.unpack(data, column)
        serieses.push({ x, y, name })
      }

      return serieses
    },
  },
})
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
  font-weight: bold;
  font-size: 18px;
}

.plot h5 {
  color: #667883;
  text-align: center;
  margin-top: 5rem;
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
  grid-row: 1 / 3;
  margin-right: 3rem;
  display: flex;
  flex-direction: column;
}

.linear-plot {
  text-align: center;
  height: 30rem;
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
}

.log-plot {
  margin-top: 2rem;
  text-align: center;
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  display: flex;
  flex-direction: column;
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
