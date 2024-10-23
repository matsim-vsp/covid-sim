<template lang="pug">
  vue-plotly(v-if="!isResizing" :data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")

  </template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { PUBLIC_SVN } from '@/Globals'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import bundeslandCSV from '@/assets/rki-deutschland-hospitalization.csv?raw'

const originalDataUrl = PUBLIC_SVN + 'original-data/Fallzahlen/'
const diviIncidenceNRWUrl = PUBLIC_SVN + 'original-data/hospital-cases/cologne/DiviIncidenceNRW.csv'

export default defineComponent({
  name: 'H7DdayNewCases',
  components: { VuePlotly },
  props: {
    data: { type: Array as PropType<any[]>, required: true },
    logScale: { type: Boolean, required: true },
    endDate: { type: String, required: true },
    city: { type: String, required: true },
  },

  data() {
    return {
      isResizing: false,
      color: '#04f',
      lagDays: 7,
      dataLines: [] as any[],
      observedData: [] as any[],

      cityObservedHospitalizationFiles: {
        cologne: originalDataUrl + 'Cologne/cologne-hospital.csv',
      } as any,

      bundeslandIncidenceRateLookup: {
        berlin: { name: 'Berlin' },
        cologne: { name: 'Nordrhein-Westfalen' },
      } as any,

      layout: {
        // barmode: 'stack',
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
          autorange: true,
          // fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          // range: [Math.log10(0.01), Math.log10(2)],
          title: 'Multiplier',
          hoverformat: '.3f',
        },
        plot_bgcolor: '#f8f8f8',
        paper_bgcolor: '#f8f8f8',
      } as any,

      options: {
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
          filename: 'r-values',
          width: 1200,
          height: 600,
          scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
        },
      },
    }
  },

  mounted() {
    this.updateScale()
    this.calculate()
  },

  computed: {},
  watch: {
    data() {
      this.calculate()
    },

    city() {
      this.observedData = []
    },

    logScale() {
      this.updateScale()
    },

    async '$store.state.isWideMode'() {
      this.isResizing = true
      await this.$nextTick()
      this.layout = Object.assign({}, this.layout)
      this.isResizing = false
    },
  },

  methods: {
    updateScale() {
      if (this.logScale) {
        this.layout.yaxis.type = 'log'
        this.layout.yaxis.autorange = false
        this.layout.yaxis.range = [Math.log10(0.1), 2]
      } else {
        this.layout.yaxis.type = 'linear'
        delete this.layout.yaxis.range // [0, 1.5]
        this.layout.yaxis.autorange = true
      }
      this.layout = { ...this.layout }
    },

    handleRelayout(event: any) {
      if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
        this.calculate()
      }
    },

    async fetchDiviIncidenceNRW() {
      // Moved to new hosp plot
    },

    calculate() {
      this.$emit('method', this.lagDays + '-day Hospitalizations / 100k Pop.')

      this.dataLines = []
      const x: any[] = []
      const hospitalized: any[] = []

      try {
        const susceptible = this.data.filter(v => v.name === 'Susceptible')[0]

        if (!susceptible) return

        const totalPopulation = susceptible.y[0]
        const factor100k = totalPopulation / 100000.0

        const seriouslySickCumul = this.data.filter(v => v.name === 'Seriously Sick Cumulative')[0]

        for (let day = this.lagDays; day < seriouslySickCumul.x.length; day++) {
          x.push(seriouslySickCumul.x[day])
          const rawHospitalizations =
            seriouslySickCumul.y[day] - seriouslySickCumul.y[day - this.lagDays]
          const scaledHospitalizations = rawHospitalizations / factor100k
          hospitalized.push(scaledHospitalizations)
        }

        // set end date
        this.layout.xaxis.range[0] = this.$store.state.graphStartDate
        this.layout.xaxis.range[1] = this.endDate

        // log/linear
        this.updateScale()

        // cull out and only show one point per week
        const cullRate = 7
        const cullX: any[] = []
        const cullY: any[] = []

        for (let i = 0; i < x.length; i = i + cullRate) {
          cullX.push(x[i])
          cullY.push(hospitalized[i])
        }

        this.dataLines.push({
          name: 'Model: New Hospitalizations / 100k',
          x: cullX,
          y: cullY,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { size: 4, color: '#32c' },
          line: {
            width: 0.5,
            color: '#329',
            // shape: 'hvh',
          },
        })

        // Moved to new hosp plot
      } catch (e) {
        console.error(e)
        return
      }
    },

    async fetchBundeslandIncidenceRates() {
      // only add Bundesland data if we are looking at data for a city with a Bundesland
      if (!this.bundeslandIncidenceRateLookup[this.city]) return

      // Moved to new hosp plot
      this.fetchDiviIncidenceNRW()
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

@media only screen and (max-width: 640px) {
}
</style>
