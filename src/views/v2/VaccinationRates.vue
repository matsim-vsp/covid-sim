<template lang="pug">
.my-vue-component(v-if="!isResizing")
  vue-plotly(:data="dataLines" :layout="layout" :options="options"  @relayout="handleRelayout")

</template>

<script lang="ts">
import VuePlotly from '@/components/VuePlotly.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'VaccinationRates',
  components: { VuePlotly },
  props: {
    data: { type: Array as PropType<any[]>, required: true },
    vaccinationDetailed: { type: Array as PropType<any[]>, required: true },
    logScale: { type: Boolean, required: true },
    endDate: { type: String, required: true },
    metadata: { type: Object, required: true },
  },

  data() {
    return {
      isResizing: false,
      color: ['#094', '#0c4'],
      lagDays: 1,
      dataLines: [] as any[],
      unselectedLines: [] as string[],
      useVaccinationDetailed: true,

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
          //range: [this.$store.state.graphStartDate, '2020-12-31'],
          range: [this.$store.state.graphStartDate, '2022-12-31'],
          type: 'date',
        },
        yaxis: {
          // note this gets overwritten when the scale changes - see updateScale()
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          //autorange: false,
          autorange: true,
          //range: [0, 100],
          title: '% vaccinated/boosted',
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
      console.warn('VACCINATION/BOOSTER data not found')
      // maybe this run doesn't have vaccinations or boosters
    }
  },

  computed: {},
  watch: {
    data() {
      this.calculateValues()
      this.unselectLines()
    },
    vaccinationDetailed() {
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
    checkIfVaccinationDetailedDataIsCorrect() {
      for (let i = 0; i < this.vaccinationDetailed.length; i++) {
        if (this.vaccinationDetailed[i].number % 1 != 0) {
          return false
        }
      }

      if (this.vaccinationDetailed.length == 0) return false

      return true
    },

    reformatDate(day: string) {
      const pieces = day.split('.')
      const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
      return date
    },

    /**
     * We are calculating a seven day running infection rate.
     */
    calculateValues() {
      this.updateScale()
      let vaccinationDetailedMap = new Map<number, Object>()
      let names = ['vaccinated', 'booster', '2nd booster', '3rd booster', '4th booster']

      if (this.data.length === 0) return
      if (this.checkIfVaccinationDetailedDataIsCorrect()) {
        this.dataLines = []

        this.layout.yaxis.title = `7-Day Vaccinations per Day`

        for (let i = 0; i < this.vaccinationDetailed.length; i++) {
          const number = this.vaccinationDetailed[i].number
          const amount = this.vaccinationDetailed[i].amount
          if (!vaccinationDetailedMap.has(number)) {
            vaccinationDetailedMap.set(number, {
              x: [] as any,
              y: [] as any,
              amount: [] as any,
              xEdited: [] as any,
              yEdited: [] as any,
            })
          }

          const date = this.vaccinationDetailed[i].date

          let object = vaccinationDetailedMap.get(number) as any

          if (object.x.includes(date)) {
            const index = object.x.indexOf(date)
            object.y[index] += amount
            object.amount[index] += 1
          } else {
            object.x.push(date)
            object.y.push(amount)
            object.amount.push(1)
          }

          vaccinationDetailedMap.set(number, object)
        }
        for (let [key, value] of vaccinationDetailedMap) {
          const data = value as any
          for (let i = 0; i < data.x.length; i++) {
            if (data.amount > 1) {
              data.y = data.y / data.amount
              data.amount = 1
            }
          }
          const firstDate = data.x[0]
          const lastDate = data.x[data.x.length - 1]

          for (var d = new Date(firstDate); d <= new Date(lastDate); d.setDate(d.getDate() + 1)) {
            const date = d.toISOString().split('T')[0]
            if (data.x.includes(date)) {
              const index = data.x.indexOf(date)
              data.xEdited.push(data.x[index])
              data.yEdited.push(data.y[index])
            } else {
              data.xEdited.push(date)
              data.yEdited.push(0)
            }
          }
          data.x = []
          data.y = []

          for (let i = 3; i < data.xEdited.length; i = i + 7) {
            data.x.push(data.xEdited[i])
            data.y.push(
              (data.yEdited[i - 3] +
                data.yEdited[i - 2] +
                data.yEdited[i - 1] +
                data.yEdited[i] +
                data.yEdited[i + 1] +
                data.yEdited[i + 2] +
                data.yEdited[i + 3]) /
                7
            )
          }
        }

        for (let [key, value] of vaccinationDetailedMap) {
          const data = value as any
          this.dataLines.push({
            name: names[key - 1],
            visible: true,
            x: data.x,
            y: data.y,
            line: {
              width: 3,
            },
          })
        }
      } else {
        this.dataLines = []

        this.layout.yaxis.title = `% vaccinated/boosted`

        // set end date
        this.layout.xaxis.range[0] = this.$store.state.graphStartDate
        this.layout.xaxis.range[1] = this.endDate

        this.layout.yaxis.autorange = false
        this.layout.yaxis.range = [0, 100]

        // Vaccinations
        let nVaccinated: any = this.data.filter(item => item.name === 'Vaccinated')[0]
        let nBooster: any = this.data.filter(item => item.name === 'Boosted')[0]

        let nSusceptible: any = this.data.filter(item => item.name === 'Susceptible')[0]
        let nTotalInfected: any = this.data.filter(item => item.name === 'Total Infected')[0]
        let nRecovered: any = this.data.filter(item => item.name === 'Recovered')[0]

        const nTotal = []
        const vaccinated = []
        const boosted = []

        for (let i = 0; i < nSusceptible.y.length; i++) {
          nTotal.push(nSusceptible.y[i] + nTotalInfected.y[i] + nRecovered.y[i])
          vaccinated.push((100 * nVaccinated.y[i]) / nTotal[i])
          boosted.push((100 * nBooster.y[i]) / nTotal[i])
        }

        let date = []
        let sevenDayAverageVaccinated = []
        let sevenDayAverageBoostered = []

        for (let i = 3; i < nSusceptible.x.length; i = i + 7) {
          date.push(nSusceptible.x[i])
          sevenDayAverageVaccinated.push(
            (vaccinated[i - 3] +
              vaccinated[i - 2] +
              vaccinated[i - 1] +
              vaccinated[i] +
              vaccinated[i + 1] +
              vaccinated[i + 2] +
              vaccinated[i + 3]) /
              7
          )
          sevenDayAverageBoostered.push(
            (boosted[i - 3] +
              boosted[i - 2] +
              boosted[i - 1] +
              boosted[i] +
              boosted[i + 1] +
              boosted[i + 2] +
              boosted[i + 3]) /
              7
          )
        }

        this.dataLines = [
          {
            name: '% Vaccinated',
            visible: true,
            x: date,
            y: sevenDayAverageVaccinated,
            line: {
              width: 3,
            },
          },
          {
            name: '% Vaccination Boosted',
            visible: true,
            x: date,
            y: sevenDayAverageBoostered,
            line: {
              width: 3,
            },
          },
        ]
      }
    },

    handleRelayout(event: any) {
      if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
        this.calculateValues()
        this.unselectLines()
      }
    },

    updateScale() {
      if (this.logScale) {
        //this.layout.yaxis.type = 'log'
        this.layout.yaxis.autorange = true
      } else {
        //this.layout.yaxis.type = 'linear'
        this.layout.yaxis.autorange = true
      }
      this.layout = { ...this.layout }
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
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

@media only screen and (max-width: 640px) {
}
</style>
