<template lang="pug">
  #vue-component(v-if="!isResizing")
    vue-plotly(:data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")

  </template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  // name: 'HospVaccinationComparison',
  components: { VuePlotly },
  props: {
    data: { type: Array as PropType<any[]>, required: true },
    observed: { type: Array as PropType<any[]>, required: true },
    logScale: { type: Boolean, required: true },
    endDate: { type: String, required: true },
  },
  data() {
    return {
      isResizing: false,
      color: ['#094', '#0c4'],
      lagDays: 1,
      dataLines: [] as any[],

      layout: {
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
          range: [this.$store.state.graphStartDate, '2020-12-31'],
          type: 'date',
        },
        yaxis: {
          // note this gets overwritten when the scale changes - see updateScale()
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'log',
          autorange: false,
          range: [0, Math.log10(10000)],
          title: 'Hospitalizations / 100k Pop.',
        } as any,
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
          filename: 'daily-cases',
          width: 1200,
          height: 600,
          scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
        },
      },
    }
  },

  mounted() {
    this.calculateValues()
  },

  computed: {},
  watch: {
    data() {
      this.calculateValues()
    },

    async '$store.state.isWideMode'() {
      this.isResizing = true
      await this.$nextTick()
      this.layout = Object.assign({}, this.layout)
      this.isResizing = false
    },

    logScale() {
      this.layout.yaxis = this.logScale
        ? {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'log',
            range: [Math.log10(2), Math.log10(10000)],
            title: 'Hospitalizations / 100k Pop.',
          }
        : {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'linear',
            autorange: true,
            title: 'Hospitalizations / 100k Pop.',
          }
      this.layout = { ...this.layout }
    },
  },

  methods: {
    handleRelayout(event: any) {
      if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
        this.calculateValues()
      }
    },

    calculateObserved(factor100k: number) {
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
          visible: true,
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
    },

    /**
     * We are calculating a seven day running infection rate.
     */
    calculateValues() {
      if (this.data.length === 0) return

      // set end date
      this.layout.xaxis.range[0] = this.$store.state.graphStartDate
      this.layout.xaxis.range[1] = this.endDate

      // Einwohner
      let totalInfected: any = this.data.filter(item => item.name === 'Total Infected')[0]
      let susceptible: any = this.data.filter(item => item.name === 'Susceptible')[0]
      let recovered: any = this.data.filter(item => item.name === 'Recovered')[0]

      // Geimpft
      let totalInfectedVac: any = this.data.filter(
        item => item.name === 'TotalInfectedVaccinated'
      )[0]
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

      // KH

      // Seriously Sick, Critical, SeriouslySickVaccinated, CriticalVaccinated
      let seriouslySick: any = this.data.filter(item => item.name === 'Seriously Sick')[0]
      let critical: any = this.data.filter(item => item.name === 'Critical')[0]
      let seriouslySickVaccinated: any = this.data.filter(
        item => item.name === 'SeriouslySickVaccinated'
      )[0]
      let criticalVaccinated: any = this.data.filter(item => item.name === 'CriticalVaccinated')[0]

      var kh = []
      var kh_geimpft = []
      var kh_ungeimpft = []

      const totalPopulation = susceptible.y[0]
      let factor100k = totalPopulation / 100000.0

      for (var i = 0; i < seriouslySick.x.length; i++) {
        kh.push((seriouslySick.y[i] + critical.y[i]) * factor100k)
        kh_geimpft.push(seriouslySickVaccinated.y[i] + criticalVaccinated.y[i])
      }

      for (var i = 0; i < kh.length; i++) {
        kh_ungeimpft.push(kh[i] - kh_geimpft[i])
      }

      var total = []
      var geimpft_v_1 = []
      var geimpft_v_2 = []
      var ungeimpft_v_1 = []
      var ungeimpft_v_2 = []

      for (var i = 0; i < kh.length; i++) {
        geimpft_v_1.push(kh_geimpft[i] / (einwohner[i] / 100000))
        geimpft_v_2.push(kh_geimpft[i] / (geimpft[i] / 100000))
        ungeimpft_v_1.push(kh_ungeimpft[i] / (einwohner[i] / 100000))
        ungeimpft_v_2.push(kh_ungeimpft[i] / (ungeimpft[i] / 100000))
        total.push(kh[i] / (einwohner[i] / 100000))
      }

      this.dataLines = [
        {
          name: 'KH / 100k vaccinated_v_1',
          x: date,
          y: geimpft_v_1,
          line: {
            dash: 'dash',
          },
        },
        {
          name: 'KH / 100k vaccinated_v_2',
          x: date,
          y: geimpft_v_2,
          line: {
            width: 3,
          },
        },
        {
          name: 'KH / 100k unvaccinated_v_1',
          x: date,
          y: ungeimpft_v_1,
          line: {
            dash: 'dash',
          },
        },
        {
          name: 'KH / 100k unvaccinated_v_2',
          x: date,
          y: ungeimpft_v_2,
          line: {
            width: 3,
          },
        },
        {
          name: 'KH / 100k',
          x: date,
          y: total,
          line: {
            // color: '#ddbbbb',
            color: 'black',
          },
        },
      ]
    },

    reformatDate(day: string) {
      const pieces = day.split('.')
      const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
      return date
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

@media only screen and (max-width: 640px) {
}
</style>
