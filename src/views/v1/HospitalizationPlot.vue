<template lang="pug">
vue-plotly(v-if="!isResizing" :data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import Papaparse from '@simwrapper/papaparse'
import VuePlotly from '@/components/VuePlotly.vue'
import { PUBLIC_SVN } from '@/Globals'

interface City {
  fromModel: string[]
  fromCSV: string[]
  csvLineNames: string[]
  dateFormatter: Function
  dateColumn: string
}

import berlin from '@/assets/berlin-hospital.csv?raw'
import munich from '@/assets/munich-hospital.csv?raw'
import jakarta from '@/assets/jakarta-hospital.csv?raw'
import cologne from '@/assets/cologne-hospital.csv?raw'

const reformatDateBerlin = (day: string) => {
  const pieces = day.split('.')
  const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
  return date
}

const reformatDateMunich = (day: string) => {
  const pieces = day.split('-')
  const date = '20' + pieces[2] + '-' + pieces[1] + '-' + pieces[0]
  return date
}

const reformatDateCologne = (day: string) => {
  const pieces = day.split('-')
  const date = '20' + pieces[2] + '-' + pieces[1] + '-' + pieces[0]
  return date
}

const csvData = {
  berlin,
  munich,
  jakarta,
  cologne,
} as any

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'HospitalizationPlot',
  components: { VuePlotly },
  props: {
    data: { type: Array as PropType<any[]>, required: true },
    logScale: { type: Boolean, required: true },
    city: { type: String, required: true },
    endDate: { type: String, required: true },
    diviData: { type: Array as PropType<any[]>, required: true },
  },

  data() {
    const dataDetails = {
      berlin: {
        fromModel: ['Seriously Sick', 'Critical'],
        fromCSV: ['Stationäre Behandlung', 'Intensivmedizin'],
        csvLineNames: [
          'Reported: Berlin Hospitalized (Senate)',
          'Reported: Berlin Intensive Care (Senate)',
        ],
        dateFormatter: reformatDateBerlin,
        dateColumn: 'Datum',
      },
      munich: {
        fromModel: ['Seriously Sick', 'Critical'],
        fromCSV: ['Stationär'],
        csvLineNames: ['Reported: Munich Hospitalized'],
        dateFormatter: reformatDateMunich,
        dateColumn: 'Tag',
      },
      cologne: {
        fromModel: ['Seriously Sick', 'Critical'],
        fromCSV: ['Stationäre Behandlung', 'Intensivmedizin'],
        csvLineNames: ['Reported: Cologne Hospitalized', 'Reported: Cologne Intensive Care'],
        dateFormatter: reformatDateBerlin,
        dateColumn: 'Datum',
      },
      jakarta: {
        fromModel: ['Seriously Sick', 'Critical'],
        fromCSV: ['Intensivmedizin'],
        csvLineNames: ['Reported: Jakarta Intensive Care'],
        dateFormatter: reformatDateBerlin,
        dateColumn: 'Datum',
      },
    } as { [id: string]: City }

    return {
      csvData,
      hospitalCapacity: {
        berlin: [1252, 1694],
      } as any,

      observedHospitalizationConfig: {
        cologne: {
          svnPath: 'original-data/hospital-cases/cologne/KoelnAllgemeinpatienten.csv',
          csvCasesColumn: 'allgemeinpatienten',
          legendText: 'Reported: Hospitalizations (City)',
        },
      } as {
        [id: string]: { svnPath: string; legendText: string; csvCasesColumn: string }
      },

      extraHospitalData: null as any,

      dataDetails,

      colors: {
        'Seriously Sick': '#44f',
        'Cumulative Hospitalized': '#707',
        Critical: '#707',
      } as any,

      dataLines: [] as any,
      hospitalSeries: [] as any,
      cityDetails: dataDetails.berlin as City,

      factor100k: 1,
      isResizing: false,

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
        margin: { t: 5, r: 10, b: 0, l: 60 },
        xaxis: {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          range: ['2020-02-09', '2020-12-31'],
          type: 'date',
        },
        yaxis: {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: this.logScale ? 'log' : 'linear',
          autorange: true,
          title: 'Hospitalizations / 100k Pop.',
        },
        plot_bgcolor: '#f8f8f8',
        paper_bgcolor: '#f8f8f8',
      } as any,

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
    this.prepareAdditionalHospitalData()
    this.buildPlot()
    // set end date
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate
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
      this.updateModelData()
      this.prepareHospitalData()
    },

    city() {
      this.buildPlot()
    },

    diviData() {
      this.prepareHospitalData()
    },

    logScale() {
      this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
    },
  },

  methods: {
    prepareHospitalData() {
      this.hospitalSeries = []
      if (this.extraHospitalData) this.hospitalSeries.push(this.extraHospitalData)
    },

    async prepareAdditionalHospitalData() {
      if (this.observedHospitalizationConfig[this.city]) {
        const config = this.observedHospitalizationConfig[this.city]
        const url = PUBLIC_SVN + config.svnPath

        const rawData = await fetch(url).then(async data => await data.text())
        const csvData = Papaparse.parse(rawData, {
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true,
        }).data

        // Moved to new hosp plot
      }
    },

    updateModelData() {
      let modelData = this.data.filter(item => this.cityDetails.fromModel.indexOf(item.name) > -1)

      const sevenDays = 7
      const susceptible = this.data.filter(item => item.name === 'Susceptible')

      // maybe data is not loaded yet
      if (!susceptible.length) return

      const totalPopulation = susceptible[0].y[0]
      this.factor100k = totalPopulation / 100000.0

      if (!modelData.length) return

      // For Berlin we need to *combine* the seriouslySick and critical into one line.
      for (let i = 0; i < modelData[0].y.length; i++) {
        modelData[0].y[i] += modelData[1].y[i]
      }

      modelData = modelData.map(item => {
        // we are going to mutate the line color (!!!) to ensure all plots on the screen
        // have the same color for these metrics.

        const midWeekDates = []
        let infectionRate = []

        infectionRate.push(item.y)
        midWeekDates.push(item.x)

        for (let i = 0; i < infectionRate[0].length; i++) {
          infectionRate[0][i] = infectionRate[0][i] / this.factor100k
        }

        const color = this.colors[item.name]
        item.line = {
          dash: 'solid',
          width: 2,
          color: color,
        }

        const trace = {
          name: 'Model: ' + item.name,
          x: midWeekDates[0],
          y: infectionRate[0],
          line: item.line,
        }

        return trace
      })

      // Hospital capacity lines
      if (this.hospitalCapacity[this.city]) {
        modelData.push(
          {
            name: 'Hospital Capacity',
            x: [modelData[0].x[0], modelData[0].x[modelData[0].x.length - 1]],
            y: [
              this.hospitalCapacity[this.city][0] / this.factor100k,
              this.hospitalCapacity[this.city][0] / this.factor100k,
            ],
            fill: 'none',
            marker: { size: 2 },
            line: {
              width: 0.5,
              color: '#707',
            },
          },
          {
            name: 'Hospital Max Reserve Capacity',
            x: [modelData[0].x[0], modelData[0].x[modelData[0].x.length - 1]],
            y: [
              this.hospitalCapacity[this.city][1] / this.factor100k,
              this.hospitalCapacity[this.city][1] / this.factor100k,
            ],
            fill: 'none',
            marker: { size: 2 },
            line: {
              width: 0.5,
              color: '#707',
            },
          }
        )
      }

      modelData[0].name = 'Model: Should be Hospitalized'

      this.dataLines = modelData
      this.dataLines.push(...this.hospitalSeries)

      // console.log({ dataLines: this.dataLines })
    },

    buildPlot() {
      this.cityDetails = this.dataDetails[this.city]
      this.updateModelData()
      this.prepareHospitalData()
    },

    handleRelayout(event: any) {
      if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
        this.updateModelData()
      }
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

@media only screen and (max-width: 640px) {
}
</style>
