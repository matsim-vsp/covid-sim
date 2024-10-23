<template lang="pug">
  vue-plotly(:data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")

  </template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'WeeklyTests',
  components: { VuePlotly },
  props: {
    data: { type: Array as PropType<any[]>, required: true },
    endDate: { type: String, required: true },
  },
  data() {
    return {
      isResizing: false,
      color: '#04f',
      lagDays: 7,
      dataLines: [] as any[],

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
          type: 'date',
          range: ['2020-02-09', this.endDate],
        },
        yaxis: {
          // fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          autorange: [0, 200000],
          title: 'nTested',
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
    this.updateModelData()
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate
  },

  computed: {},
  watch: {
    data() {
      this.updateModelData()
    },

    async '$store.state.isWideMode'() {
      this.isResizing = true
      await this.$nextTick()
      this.layout = Object.assign({}, this.layout)
      this.isResizing = false
    },
  },

  methods: {
    handleRelayout(event: any) {
      if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
        this.updateModelData()
      }
    },

    updateModelData() {
      this.showData()
    },

    showData() {
      const x: any[] = []
      const y: any[] = []

      var WeekSum = 0
      var countDays = 0

      for (const value of this.data) {
        var date = new Date(value.date)
        var dayNUmber = date.getDay()
        if (dayNUmber == 1) {
          WeekSum = 0
          countDays = 0
        }
        WeekSum += value.nTested
        countDays += 1
        if (countDays == 7) {
          var middleDay = new Date(value.date)
          middleDay.setDate(middleDay.getDate() - 3)
          x.push(middleDay)
          y.push(WeekSum)
        }
      }

      this.dataLines = [
        {
          name: 'weeklyTests',
          mode: 'markers',
          type: 'scatter',
          x: x,
          y: y,
        },
      ]
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

@media only screen and (max-width: 640px) {
}
</style>
