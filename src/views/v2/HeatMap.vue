<template lang="pug">
vue-plotly(v-if="!isResizing" :data="dataMatrix" :layout="layout" :options="options")

</template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'
import { transpose } from 'mathjs'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'HeatMap',
  components: { VuePlotly },
  props: {
    data: { type: String, required: true },
    endDate: { type: String, required: true },
    // heatMapMaxValue: { type: Number, required: false },
  },

  data() {
    return {
      maximumValue: 2000,
      isResizing: false,
      dataMatrix: [] as any[],
      logColorScale: [
        [0.0, 'rgb(255,255,255)'],
        [0.01, 'rgb(250,210,0)'],
        [0.1, 'rgb(240,120,0)'],
        [0.2, 'rgb(230,0,0)'],
        [0.99999999, 'rgb(0,0,0)'],
        [1.0, 'rgb(255,255,255)'],
        //[1.0, 'rgb(0,0,0)'], // comment this line out and add the two above will fix the "color bug"
      ],

      layout: {
        showlegend: false,
        autosize: true,
        font: {
          family: 'Roboto,Arial,Helvetica,sans-serif',
          size: 12,
          color: '#000',
        },
        margin: { t: 10, r: 10, b: 30, l: 60 },
        xaxis: {
          type: 'date',
          range: [this.$store.state.graphStartDate, this.endDate],
          fixedrange: true,
        },
        yaxis: {
          title: 'Age',
          fixedrange: true,
        },
        plot_bgcolor: '#f8f8f8',
        paper_bgcolor: '#f8f8f8',
        // legend: { orientation: 'h' },
      } as any,

      options: {
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
          filename: 'heatmap',
          width: 1200,
          height: 600,
          scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
        },
      },
    }
  },

  mounted() {
    this.buildHeatMap()
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
      this.buildHeatMap()
    },
  },

  methods: {
    buildHeatMap() {
      this.dataMatrix = []

      if (!this.data) return

      const x: string[] = []
      let matrix: any[] = []

      const lines = this.data.split('\n')

      // get column names (not including date)
      const y: string[] = lines[0].split('\t').splice(1)

      // build matrix
      for (const line of lines.splice(1)) {
        const cells = line.split('\t')
        const date = cells[0]
        if (date) {
          x.push(date)
          const values = cells.splice(1)
          matrix.push(values)
        }
      }

      matrix = transpose(matrix)
      matrix[0][0] = this.maximumValue

      this.dataMatrix = [
        {
          type: 'heatmap',
          x,
          y,
          z: matrix,
          colorscale: this.logColorScale, // 'Hot', // 'YlOrRed', // 'Hot',
          // reversescale: true,
          showscale: false,
          hoverongaps: false,
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
