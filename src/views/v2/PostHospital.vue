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
import Papa from '@simwrapper/papaparse'
import moment from 'moment'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import rkiCovidSariHospitalizationData from '@/assets/COVID-SARI-Hospitalisierungsinzidenz.tsv?raw'

import HospitalWorker from './postHospital.worker?worker'

export default defineComponent({
  name: 'PostHospital',
  components: { VuePlotly },
  props: {
    // state: { type: Object, required: true },
    // measure: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    data: { type: Array as PropType<any[]>, required: true },
    totalPopulation: { type: Number, required: true },
    logScale: { type: Boolean, required: true },
    intakesHosp: { type: Boolean, required: true },
    city: { type: String, required: true },
    postHospUpdater: { type: Number, required: true },
    metadata: { type: Object, required: true },
    showRKI: { type: Boolean, required: true },
  },

  data() {
    return {
      isResizing: false,
      dataLines: [] as any[],
      unselectedLines: [] as string[],
      postProcessWorker: null as any,
      updaterCount: 0,
      rkiCovidSariHospitalizationData,

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
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          //autorange: true,
          range: ['2020-02-09', '2020-12-31'],
          type: 'date',
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
    //this.unselectLines()
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
    updateScale() {
      this.layout.xaxis.range[0] = this.$store.state.graphStartDate
      this.layout.xaxis.range[1] = this.endDate
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

    async unselectLines() {
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

      if (this.showRKI) {
        const rkiLine = this.getRkiHospitalizationLines()
        lines.push(rkiLine)
      }

      this.dataLines = lines
      this.updaterCount = this.postHospUpdater

      await this.unselectLines()
    },

    getRkiHospitalizationLines() {
      let hospData = []
      try {
        const allHospitalData = Papa.parse(this.rkiCovidSariHospitalizationData, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        }).data

        const filterAllAges = allHospitalData.filter((row: any) => row.agegroup === '00+')

        hospData = filterAllAges
      } catch (e) {
        // just leave it blank
      }

      const line = {
        line: { width: 2, dash: 'dot', color: 'purple' },
        name: 'Observed: COVID-SARI (DE)',
        visible: true,
        y: hospData.map((row: any) => row.sari_covid19_incidence),
        x: hospData.map((row: any) => moment(row.date).add(3, 'days').toDate()),
      }
      return line
    },
  },
})
</script>

<style scoped lang="scss">
@import '@/styles.scss';

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
