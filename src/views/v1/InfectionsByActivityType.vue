<template lang="pug">
  .mutations-plots(v-if="!isResizing")
    vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")
    vue-plotly.plot1(:data="dataLines2" :layout="layout2" :options="options" @relayout="handleRelayout")

  </template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'InfectionsByActivityType',
  components: { VuePlotly },
  props: {
    logScale: { type: Boolean, required: true },
    endDate: { type: String, required: true },
    values: { type: Array as PropType<any[]>, required: true },
  },
  data() {
    return {
      isResizing: false,

      color: '#04f',

      dataLines: [] as any[],
      dataLines2: [] as any[],

      layout: {
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
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          title: 'Num of Infections (vs. Home)',
          hoverformat: '.1f',
        },
        plot_bgcolor: '#f8f8f8',
        paper_bgcolor: '#f8f8f8',
      } as any,

      layout2: {
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
        margin: { t: 5, r: 10, b: 5, l: 60 },
        xaxis: {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          range: ['2020-02-09', '2020-12-31'],
          type: 'date',
        },
        yaxis: {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          title: '% Share',
          hoverformat: '.1f',
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
    this.calculateValues()
  },

  computed: {},
  watch: {
    async '$store.state.isWideMode'() {
      this.isResizing = true
      await this.$nextTick()
      this.layout = Object.assign({}, this.layout)
      this.layout2 = Object.assign({}, this.layout2)
      this.isResizing = false
    },

    values() {
      this.calculateValues()
    },

    logScale() {
      if (this.logScale) {
        this.layout.yaxis.type = 'log'
        // this.layout.yaxis.range = [Math.log10(0.05), Math.log10(1.5)]
      } else {
        this.layout.yaxis.type = 'linear'
        // this.layout.yaxis.range = [0, 1.5]
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

    calculateValues() {
      this.dataLines = []
      this.dataLines2 = []
      if (!this.values.length) return

      // generate list of mutation names
      const infections: { [activity: string]: number[] } = {}
      const shares: { [activity: string]: number[] } = {}
      const date: number[] = []

      // get a map (date -> homeInfections). This will be used to make Infections by activity type plot be in relation to home activities.
      // e.g. on xx/xx/2020 date, 1.8x as many infections occured in leisure context as in home.
      // share plot is not affected - jr July2022
      const mapHomeInfections = new Map()

      for (const row of this.values) {
        const act = row.activity
        if (act == 'home') {
          mapHomeInfections.set(row.date, row.infections)
        }
      }

      // process the data
      for (const row of this.values) {
        const act = row.activity
        if (!infections[act]) {
          infections[act] = []
          shares[act] = []
        }

        // update date row
        if (date.length === 0 || row.date !== date[date.length - 1]) date.push(row.date)

        // update infections and shares
        infections[act].push(row.infections / mapHomeInfections.get(row.date))
        shares[act].push(100.0 * row.infectionsShare)
      }

      // console.log({ date, infections, shares })

      // set up the plots
      this.layout.xaxis.range[0] = this.$store.state.graphStartDate
      this.layout.xaxis.range[1] = this.endDate
      this.layout2.xaxis.range[0] = this.$store.state.graphStartDate
      this.layout2.xaxis.range[1] = this.endDate

      for (const actType of Object.keys(infections).sort()) {
        this.dataLines.push({
          name: actType,
          x: date,
          y: infections[actType],
        })

        this.dataLines2.push({
          name: actType + ' %',
          x: date,
          y: shares[actType],
        })
      }
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.mutations-plots {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.plot1 {
  flex: 1;
}

@media only screen and (max-width: 640px) {
}
</style>
