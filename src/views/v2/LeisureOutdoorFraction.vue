<template lang="pug">
vue-plotly(v-if="!isResizing" :data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'LeisureOutdoorFraction',
  components: { VuePlotly },
  props: {
    data: { type: Array as PropType<any[]>, required: true },
    logScale: { type: Boolean, required: true },
    endDate: { type: String, required: true },
    metadata: { type: Object, required: true },
  },
  data() {
    return {
      isResizing: false,
      dataLines: [] as any[],
      unselectedLines: [] as string[],

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
          //range: ['2020-02-09', '2020-12-31'],
          type: 'date',
          range: [this.$store.state.graphStartDate, this.endDate],
        },
        yaxis: {
          // fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          //autorange: true,
          range: [-0.1, 1.1],
          title: 'Leisure outdoor fraction ',
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
    this.unselectLines()
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

    dataLines: {
      deep: true,
      handler: async function () {
        for (let i = 0; i < this.dataLines.length; i++) {
          if (
            this.dataLines[i].visible == 'legendonly' &&
            !this.unselectedLines.includes(this.dataLines[i].name)
          ) {
            this.unselectedLines.push(this.dataLines[i].name)
          } else if (
            this.dataLines[i].visible != 'legendonly' &&
            this.unselectedLines.includes(this.dataLines[i].name)
          ) {
            this.unselectedLines.splice(this.unselectedLines.indexOf(this.dataLines[i].name))
          }
        }

        const params = Object.assign({}, this.$route.query)

        params['plot-' + this.metadata.abbreviation] = this.unselectedLines

        try {
          await this.$router.replace({ query: params })
        } catch (e) {
          /** this is OK */
        }
      },
    },
  },

  methods: {
    handleRelayout(event: any) {
      if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
        this.updateModelData()
        this.unselectLines()
      }
    },

    updateModelData() {
      this.showData()
      this.unselectLines()
    },

    unselectLines() {
      const query = this.$route.query as any
      const name = 'plot-' + this.metadata.abbreviation

      if (Object.keys(query).includes(name)) {
        let nameArray = query[name]
        if (!Array.isArray(nameArray)) {
          nameArray = [nameArray]
        }
        for (let i = 0; i < nameArray.length; i++) {
          for (let j = 0; j < this.dataLines.length; j++) {
            if (this.dataLines[j].name == nameArray[i]) {
              this.dataLines[j].visible = 'legendonly'
            }
          }
        }
      }
    },

    showData() {
      const x: any[] = []
      const y: any[] = []
      const avgR = []

      for (const value of this.data) {
        x.push(value.date)
        y.push(value.outdoorFraction)
      }

      // 0,1,2 *3* 4,5,6
      const center = 3
      for (let index = center; index < x.length - center; index++) {
        const average =
          y.slice(index - center, index + center).reduce((a, b) => a + b, 0) / (1 + 2 * center)
        avgR.push(average)
      }

      this.dataLines = [
        {
          name: 'Daily value',
          visible: true,
          mode: 'markers',
          type: 'scatter',
          x: x,
          y: y,
        },
        {
          name: '7-day average',
          visible: true,
          mode: 'line',
          type: 'scatter',
          x: x.slice(center, x.length - center),
          y: avgR,
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
