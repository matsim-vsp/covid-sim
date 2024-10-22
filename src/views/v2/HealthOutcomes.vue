<template lang="pug">
vue-plotly(v-if="!isResizing" :data="dataLines" :layout="layout" :options="options" @restyle="restylePlot")

</template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'HealthOutcomes',
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

      ignoreRowHealth: [
        'SusceptibleVaccinated',
        'ContagiousVaccinated',
        'ShowingSymptomsVaccinated',
        'SeriouslySickVaccinated',
        'CriticalVaccinated',
        'TotalInfectedVaccinated',
        'InfectedCumulativeVaccinated',
        'ShowingSymptomsCumulativeVaccinated',
        'ContagiousCumulativeVaccinated',
        'SeriouslySickCumulativeVaccinated',
        'CriticalCumulativeVaccinated',
        'RecoveredVaccinated',
        'Cumulative Hospitalized',
      ],

      layout: {
        // autosize: true,
        showlegend: true,
        legend: {
          orientation: 'h',
          y: '-0.15',
        },
        font: {
          family: 'Roboto,Arial,Helvetica,sans-serif',
          size: 12,
          color: '#000',
        },
        margin: { t: 5, r: 10, b: 0, l: 60 },
        xaxis: {
          range: ['2020-02-09', '2020-12-31'],
          fixedrange: true,
          type: 'date',
        },
        yaxis: {
          type: 'log', // this.logScale ? 'log' : 'linear',
          fixedrange: true,
          autorange: true,
          title: 'Population',
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
    this.setLayout()
    this.calculateValues()
    this.unselectLines()
  },

  computed: {},
  watch: {
    endDate() {
      if (this.$store.state.graphStartDate && this.endDate) {
        this.layout.xaxis.range[0] = this.$store.state.graphStartDate
        this.layout.xaxis.range[1] = this.endDate
      }
    },

    data() {
      this.calculateValues()
      this.unselectLines()
    },

    async '$store.state.isWideMode'() {
      this.isResizing = true
      await this.$nextTick()
      this.layout = Object.assign({}, this.layout)
      this.isResizing = false
    },

    logScale() {
      this.setLayout()
    },

    dataLines: {
      deep: true,
      handler: async function () {
        console.log(this.dataLines)
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
    setLayout() {
      if (this.logScale) {
        this.layout.yaxis.type = 'log'
        this.layout.yaxis.autorange = true
        //this.layout.yaxis.range = [Math.log10(0.01), Math.log10(2)]
      } else {
        this.layout.yaxis.type = 'linear'
        delete this.layout.yaxis.range // [0, 1.5]
        this.layout.yaxis.autorange = true
      }
    },

    restylePlot(event: any) {
      // TODO
      // console.log(event)
    },

    calculateValues() {
      //
      let data = this.data.filter(row => !this.ignoreRowHealth.includes(row.name))
      for (let i = 0; i < data.length; i++) {
        if (!Object.keys(data[i]).includes('visible')) {
          data[i].visible = 'true'
        }
      }

      this.dataLines = data
      console.log(this.dataLines)
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
              console.log('Unselect: ', this.dataLines[j].name)
            }
          }
        }
      }
    },
  },
})
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
