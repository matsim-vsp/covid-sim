<template lang="pug">
  .vue-component(v-if="!isResizing" )
    vue-plotly.plot1(
      :data="dataLines"
      :layout="layout"
      :options="options"
      :class="{'processing': postHospUpdater !== updaterCount}"
    )

  </template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'
import { spawn, Thread, Worker } from 'threads'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import HospitalWorker from './postHospital.worker?worker'

export default defineComponent({
  name: 'PostHospital',
  components: { VuePlotly },
  props: {
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    data: { type: Array as PropType<any[]>, required: true },
    totalPopulation: { type: Number, required: true },
    logScale: { type: Boolean, required: true },
    intakesHosp: { type: Boolean, required: true },
    city: { type: String, required: true },
    postHospUpdater: { type: Number, required: true },
  },

  data() {
    return {
      isResizing: false,
      dataLines: [] as any[],
      postProcessWorker: null as any,
      updaterCount: 0,

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
        margin: { t: 5, r: 10, b: 35, l: 60 },
        xaxis: {
          fixedrange: true,
          autorange: true,
        },
        yaxis: {
          // note this gets overwritten when the scale changes - see updateScale()
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          autorange: true,
          //range: [0, 100],
          title: 'nInfected',
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
    this.updateScale()
    this.calculateValues()
  },

  beforeDestroy() {
    if (this.postProcessWorker) Thread.terminate(this.postProcessWorker)
  },

  computed: {},
  watch: {
    data() {
      this.calculateValues()
    },
    totalPopulation() {
      this.calculateValues()
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
      if (this.intakesHosp) {
        this.layout.yaxis = this.logScale
          ? {
              //fixedrange: window.innerWidth < 700,
              fixedrange: true,
              type: 'log',
              autorange: true,
              title: 'Intake Incidence',
            }
          : {
              //fixedrange: window.innerWidth < 700,
              fixedrange: true,
              type: 'linear',
              autorange: true,
              title: 'Intake Incidence',
            }
      } else {
        this.layout.yaxis = this.logScale
          ? {
              //fixedrange: window.innerWidth < 700,
              fixedrange: true,
              type: 'log',
              autorange: true,
              title: 'Occupancy / 100k Pop.',
            }
          : {
              //fixedrange: window.innerWidth < 700,
              fixedrange: true,
              type: 'linear',
              autorange: true,
              title: 'Occupancy / 100k Pop.',
            }
      }
      this.layout = { ...this.layout }
    },

    async calculateValues() {
      if (!this.postProcessWorker) {
        this.postProcessWorker = await spawn(new HospitalWorker())
      }

      if (!this.data.length) {
        return
      }

      const lines = await this.postProcessWorker.buildDataLines({
        data: this.data,
        totalPopulation: this.totalPopulation,
        city: this.city,
        intakesHosp: this.intakesHosp,
      })

      this.dataLines = lines
      this.updaterCount = this.postHospUpdater
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.vue-component {
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

.processing {
  opacity: 0.6;
}

@media only screen and (max-width: 640px) {
}
</style>
