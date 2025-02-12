<template lang="pug">
.vue-component(v-if="!isResizing" )
  vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'
import Papaparse from '@simwrapper/papaparse'

import { PUBLIC_SVN } from '@/Globals'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'VaccEffectivenessVsStrain',
  components: { VuePlotly },
  props: {
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    vaccineEffectivenessData: { type: Array as PropType<any[]>, required: true },
    vaccineEffectivenessFields: { type: Array as PropType<string[]>, required: true },
    metadata: { type: Object, required: true },
  },
  data() {
    return {
      skipVariants: ['wildtypeVe', 'alphaVe'],
      isResizing: false,
      logScale: false,
      color: ['#094', '#0c4'],
      lagDays: 1,
      dataLines: [] as any[],
      unselectedLines: [] as string[],
      observedLine: {} as any,

      layout: {
        autosize: true,
        showlegend: true,
        legend: {
          orientation: 'v',
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
          autorange: true,
          title: 'Days since vaccination',
        },
        yaxis: {
          // note this gets overwritten when the scale changes - see updateScale()
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          // autorange: true,
          range: [0, 100],
          title: 'Vaccine Effectiveness',
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
    this.calculateValues()
    this.unselectLines()
  },

  computed: {},
  watch: {
    vaccineEffectivenessData() {
      this.calculateValues()
      this.unselectLines()
    },

    logScale() {
      this.layout.yaxis = this.logScale
        ? {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'log',
            range: [Math.log10(2), Math.log10(10000)],
            title: 'Hospitalizations / 100k Pop.',
          }
        : {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'linear',
            autorange: true,
            title: 'Hospitalizations / 100k Pop.',
          }
      this.layout = { ...this.layout }
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
    async addObservedData() {
      // already have it?
      if (this.observedLine) {
        this.dataLines.push(this.observedLine)
        return
      }

      try {
        const url = PUBLIC_SVN + 'original-data/vaccine-effectiveness/nordstroem-paper.tsv'
        const data = await (await fetch(url)).text()

        const rows = Papaparse.parse(data, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        }).data

        const columnName = '' // this.observedColumn[this.vaccineType]

        this.observedLine = {
          name: 'Nordström: ' + columnName,
          x: rows.map((row: any) => row.day),
          y: rows.map((row: any) => 100 * row[columnName]),
          line: {
            dash: 'dot',
            width: 2,
            color: '#f4c',
          },
        }
      } catch (e) {
        console.warn(e)
      }

      this.dataLines.push(this.observedLine)
    },

    reformatDate(day: string) {
      const pieces = day.split('.')
      const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
      return date
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
      if (this.vaccineEffectivenessData.length === 0) return

      const lines = { day: [] } as { [id: string]: any[] }

      const columns = this.vaccineEffectivenessFields.slice(1)
      // .filter(col => skipVariants.indexOf(col) === -1)

      columns.forEach(col => (lines[col] = [] as number[]))

      for (const row of this.vaccineEffectivenessData) {
        // if all we have is a day and a blank record, skip it
        if (Object.keys(row).length === 1) continue

        if (row.day > 400) continue

        lines.day.push(row.day)

        columns.forEach(col => {
          let v = row[col]
          if (v === undefined || v === -Infinity || v === '-inf') {
            lines[col].push(NaN)
          } else {
            lines[col].push(Math.round(10000 * row[col]) / 100)
          }
        })
      }

      this.dataLines = []

      columns.forEach(col => {
        this.dataLines.push({
          name: col,
          x: lines.day,
          y: lines[col],
          line: { width: 1 },
          visible: this.skipVariants.indexOf(col) > -1 ? 'legendonly' : 'true',
        })
      })

      // this.addObservedData()
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

@media only screen and (max-width: 640px) {
}
</style>
