<template lang="pug">
vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import VuePlotly from '@/components/VuePlotly.vue'

export default defineComponent({
  name: 'MobilityPlotLandkreise',
  components: { VuePlotly },
  props: {
    landkreis: { type: String, required: true },
    landkreisTwo: { type: String, required: true },
    week: { type: String, required: true },
    kind: { type: String, required: true },
    yAxisName: { type: String, required: true },
    data: { type: Array as PropType<any[]>, required: true },
    percent: { type: Boolean },
  },

  data() {
    return {
      dataLines: [] as any[],
      layout: {
        showlegend: true,
        autosize: true,
        legend: {
          orientation: 'h',
        },
        font: {
          family: 'Roboto,Arial,Helvetica,sans-serif',
          size: 12,
          color: '#000',
        },
        margin: { t: 5, r: 60, b: 0, l: 60 },
        xaxis: {
          fixedrange: window.innerWidth < 700,
          //range: ['2020-03-02', '2021-04-26'],
          type: 'date',
        },
        yaxis: {
          fixedrange: window.innerWidth < 700,
          type: 'linear',
          autorange: true,
          title: this.yAxisName,
        },
        plot_bgcolor: '#f8f8f8',
        paper_bgcolor: '#f8f8f8',
      },

      options: {
        responsive: true,
        // displayModeBar: true,
        displaylogo: false,
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
          filename: 'custom_image',
          width: 1200,
          height: 600,
          scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
        },
      },
    }
  },

  mounted() {
    this.loadPlots()
  },

  watch: {
    kind() {
      this.layout.yaxis.title = this.yAxisName
      this.loadPlots()
    },

    data() {
      this.layout.yaxis.title = this.yAxisName
      this.loadPlots()
    },

    landkreisTwo() {
      this.loadPlots()
    },

    landkreis() {
      this.loadPlots()
    },
  },

  methods: {
    loadPlots() {
      var mobilityData: any[] = []
      var tempData
      var xData: any[] = []
      var ydata: any[] = []
      for (const [key, value] of Object.entries(this.data)) {
        if (key == this.landkreis) {
          tempData = value
        }
      }

      if (this.percent) {
        if (this.week != 'weeek') {
          if (tempData !== undefined) {
            for (const [key, value] of Object.entries(tempData)) {
              if (key == this.week) {
                for (const [key2, value2] of Object.entries(value as object)) {
                  xData.push(key2)
                  ydata.push(value2['percentageChangeComparedToBeforeCorona'])
                }
              }
            }
          }
        }
      } else {
        if (this.week != 'weeek') {
          if (tempData !== undefined) {
            for (const [key, value] of Object.entries(tempData)) {
              if (key == this.week) {
                for (const [key2, value2] of Object.entries(value as object)) {
                  xData.push(key2)
                  ydata.push(value2[this.kind])
                }
              }
            }
          }
        }
      }

      mobilityData.push({
        name: this.landkreis,
        x: xData,
        y: ydata,
        fill: 'none',
        marker: { size: 4 },
        line: {
          dash: 'line',
          width: 2,
        },
      })

      var xDataTwo: any[] = []
      var ydataTwo: any[] = []
      for (const [key, value] of Object.entries(this.data)) {
        if (key == this.landkreisTwo) {
          tempData = value
        }
      }

      if (this.percent) {
        if (tempData !== undefined) {
          for (const [key, value] of Object.entries(tempData)) {
            if (key == this.week) {
              for (const [key2, value2] of Object.entries(value as object)) {
                xDataTwo.push(key2)
                ydataTwo.push(value2['percentageChangeComparedToBeforeCorona'])
              }
            }
          }
        }
      } else {
        if (tempData !== undefined) {
          for (const [key, value] of Object.entries(tempData)) {
            if (key == this.week) {
              for (const [key2, value2] of Object.entries(value as object)) {
                xDataTwo.push(key2)
                ydataTwo.push(value2[this.kind])
              }
            }
          }
        }
      }

      mobilityData.push({
        name: this.landkreisTwo,
        x: xDataTwo,
        y: ydataTwo,
        fill: 'none',
        marker: { size: 4 },
        line: {
          dash: 'line',
          width: 2,
        },
      })

      this.dataLines = mobilityData
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

@media only screen and (max-width: 640px) {
}
</style>
