<template lang="pug">
vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import VuePlotly from '@/components/VuePlotly.vue'

export default defineComponent({
  name: 'MobilityPlot',
  components: { VuePlotly },
  props: {
    data: { type: Array as PropType<any[]>, required: true },
    outOfHomeDurationPlot: { type: Boolean, required: true },
    yAxisName: { type: String, required: true },
    plotInterval: { type: Array as PropType<any[]>, required: true },
    activity: { type: String, required: true },
    time: { type: String, required: true },
    loadPage: { type: String, required: true },
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
    this.updateMobilityData()
  },

  watch: {
    activity() {
      this.layout.yaxis.title = this.yAxisName
      this.updateMobilityData()
    },

    data() {
      this.updateMobilityData()
    },

    loadPage() {
      this.updateMobilityData()
    },
  },

  methods: {
    updateMobilityData() {
      var mobilityData: any[] = []
      var kind = this.activity

      if (!this.outOfHomeDurationPlot) {
        kind = 'percentageChangeComparedToBeforeCorona'
      }

      for (const [key, value] of Object.entries(this.data)) {
        var xData: any[] = []
        var ydata: any[] = []
        const name = key

        for (const [key2, value2] of Object.entries(value as Object)) {
          if (key2 == this.time) {
            xData = Object.keys(value2)
            xData.forEach(element => {
              ydata.push(value2[element][kind])
            })
          }
        }
        if (name == 'Deutschland') {
          mobilityData.push({
            name: name,
            x: xData,
            y: ydata,
            fill: 'none',
            marker: { size: 4 },
            line: {
              dash: 'line',
              width: 2,
              color: 'black',
            },
          })
        } else {
          mobilityData.push({
            name: name,
            x: xData,
            y: ydata,
            fill: 'none',
            marker: { size: 2 },
            opacity: '0.5',
            line: {
              dash: 'dot',
              width: 1.5,
              color: name,
            },
          })
        }
      }
      this.dataLines = mobilityData
    },
  },
})
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
