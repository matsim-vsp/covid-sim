<template lang="pug">
.my-vue-component(v-if="!isResizing")
  vue-plotly(:data="dataLines" :layout="layout" :options="options"  @relayout="handleRelayout")

</template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'VaccinationRates',
  components: { VuePlotly },
  props: {
    data: { type: Array as PropType<any[]>, required: true },
    logScale: { type: Boolean, required: true },
    endDate: { type: [Object, String], required: true },
    metadata: { type: Object, required: true },
    rkiDetectionData: {
      required: true,
      type: Object as PropType<{
        x?: any[]
        y?: any[]
        line?: any
        name?: string
      }>,
    },
  },

  data() {
    return {
      isResizing: false,
      color: ['#094', '#0c4'],
      lagDays: 1,
      dataLines: [] as any[],

      layout: {
        height: 240,
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
          type: 'linear',
          autorange: false,
          range: [0, 100],
          title: '% vaccinated/boosted',
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
    try {
      this.calculateValues()
    } catch (e) {
      console.warn('VACCINATION/BOOSTER data not found')
      // maybe this run doesn't have vaccinations or boosters
    }
  },

  computed: {},
  watch: {
    async '$store.state.isWideMode'() {
      this.isResizing = true
      await this.$nextTick()
      this.layout = Object.assign({}, this.layout)
      this.isResizing = false
    },

    data() {
      this.calculateValues()
    },
  },

  methods: {
    handleRelayout(event: any) {
      if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
        this.calculateValues()
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

      // Vaccinations
      let nVaccinated: any = this.data.filter(item => item.name === 'Vaccinated')[0]
      let nBooster: any = this.data.filter(item => item.name === 'Boosted')[0]

      let nSusceptible: any = this.data.filter(item => item.name === 'Susceptible')[0]
      let nTotalInfected: any = this.data.filter(item => item.name === 'Total Infected')[0]
      let nRecovered: any = this.data.filter(item => item.name === 'Recovered')[0]

      const nTotal = []
      const vaccinated = []
      const boosted = []

      for (let i = 0; i < nSusceptible.y.length; i++) {
        nTotal.push(nSusceptible.y[i] + nTotalInfected.y[i] + nRecovered.y[i])
        vaccinated.push((100 * nVaccinated.y[i]) / nTotal[i])
        boosted.push((100 * nBooster.y[i]) / nTotal[i])
      }

      this.dataLines = [
        {
          name: '% Vaccinated',
          x: nSusceptible.x,
          y: vaccinated,
          line: {
            width: 3,
          },
        },
        {
          name: '% Vaccination Boosted',
          x: nSusceptible.x,
          y: boosted,
          line: {
            width: 3,
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
