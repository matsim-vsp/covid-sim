<template lang="pug">
.my-vue-component(v-if="!isResizing")
  vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'VaccinationPerType',
  components: { VuePlotly },
  props: {
    vaccinations: { type: Array as PropType<any[]>, required: true },
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
        height: 240,
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
          range: ['2020-02-09', '2020-12-31'],
          type: 'date',
        },
        yaxis: {
          // note this gets overwritten when the scale changes - see updateScale()
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          //type: this.logScale ? 'log' : 'linear',
          type: 'linear',
          autorange: true,
          //range: [0, 100],
          title: '7-Day Vaccinations per Day',
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
    try {
      this.calculateValues()
      this.unselectLines()
    } catch (e) {
      console.warn('VACCINATIONS PER TYPE data not found')
      // maybe this run doesn't have vaccinations or boosters
    }
  },

  computed: {},
  watch: {
    async '$store.state.isWideMode'() {
      this.isResizing = true
      await this.$nextTick()
      this.layout = Object.assign({}, this.layout)
      this.isResizing = false
    },
    vaccinations() {
      this.calculateValues()
      this.unselectLines()
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
      if (this.vaccinations.length === 0) return

      this.dataLines = []

      // set end date
      this.layout.xaxis.range[0] = this.$store.state.graphStartDate
      this.layout.xaxis.range[1] = this.endDate

      let formattedData = {
        names: [],
        date: [],
        values: [],
      } as {
        [id: string]: any[]
      }

      const header = Object.keys(this.vaccinations[0])

      // Skip date and day column
      for (let i = 2; i < header.length; i++) {
        formattedData.names.push(header[i])
        formattedData.values.push([])
      }

      for (let i = 7; i < this.vaccinations.length; i = i += 7) {
        for (let j = 2; j < header.length; j++) {
          const value =
            this.vaccinations[i][header[j]] +
            this.vaccinations[i - 1][header[j]] +
            this.vaccinations[i - 2][header[j]] +
            this.vaccinations[i - 3][header[j]] +
            this.vaccinations[i - 4][header[j]] +
            this.vaccinations[i - 5][header[j]] +
            this.vaccinations[i - 6][header[j]]
          formattedData.values[j - 2].push(value / 7)
        }
        formattedData.date.push(this.vaccinations[i].date)
      }

      for (let i = 0; i < formattedData.names.length; i++) {
        this.dataLines.push({
          name: formattedData.names[i],
          visible: true,
          x: formattedData.date,
          y: formattedData.values[i],
        })
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
