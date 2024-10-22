<template lang="pug">
.vue-component(v-if="!isResizing" )
  vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'DiseaseImport',
  components: { VuePlotly },
  props: {
    startDate: { type: Object, required: true },
    endDate: { type: Object, required: true },
    data: { type: Array as PropType<any[]>, required: true },
    logScale: { type: Boolean, required: true },
    metadata: { type: Object, required: true },
  },

  data() {
    return {
      dataLines: [] as any[],
      unselectedLines: [] as string[],
      isResizing: false,

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
          //fixedrange: true,
          //autorange: true,
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
    this.unselectLines()

    console.log(this.data)
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
      this.unselectLines()
    },

    logScale() {
      this.updateScale()
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
      this.layout.yaxis = this.logScale
        ? {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'log',
            autorange: true,
            title: 'nInfected',
          }
        : {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'linear',
            autorange: true,
            title: 'nInfected',
          }
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

    calculateValues() {
      this.dataLines = []
      if (this.data.length == 0) return
      // old plots without strain type
      if (Object.keys(this.data[0]).includes('nInfected')) {
        let x = []
        let y = []
        for (let i = 0; i < this.data.length; i++) {
          x.push(this.data[i].date)
          y.push(this.data[i].nInfected)
        }
        this.dataLines.push({
          name: 'nInfected',
          visible: true,
          x: x,
          y: y,
          line: { width: 1 },
        })
        // new plots with strain type
      } else {
        let strainTypes = [] as any
        let strainObjects = []
        // 100 is the number of max different diseases
        for (let i = 0; i < 100; i++) {
          if (!strainTypes.includes(this.data[i].strain)) {
            strainTypes.push(this.data[i].strain)
            strainObjects.push({
              name: this.data[i].strain,
              visible: true,
              x: [] as any,
              y: [] as any,
              line: { width: 1 },
            })
          } else {
            break
          }
        }
        for (let i = 0; i < this.data.length; i++) {
          const index = strainTypes.indexOf(this.data[i].strain)
          strainObjects[index].x.push(this.data[i].date)
          strainObjects[index].y.push(this.data[i].n)
        }
        this.dataLines = strainObjects
      }
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

@media only screen and (max-width: 640px) {
}
</style>
