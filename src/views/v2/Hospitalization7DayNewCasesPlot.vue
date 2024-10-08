<template lang="pug">
vue-plotly(v-if="!isResizing" :data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'
import Papaparse from 'papaparse'

import { PUBLIC_SVN } from '@/Globals'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private city!: string
  @Prop({ required: true }) private metadata!: any

  private color = '#04f'

  private lagDays = 7

  private dataLines: any[] = []
  private unselectedLines: string[] = []
  private unselectedLinesOnLoad: string[] = []

  private originalDataUrl = PUBLIC_SVN + 'original-data/Fallzahlen/'
  private diviIncidenceNRWUrl =
    PUBLIC_SVN + 'original-data/hospital-cases/cologne/DiviIncidenceNRW.csv'

  private observedData: any[] = []

  private cityObservedHospitalizationFiles: any = {
    cologne: this.originalDataUrl + 'Cologne/cologne-hospital.csv',
  }

  private bundeslandCSV = require('@/assets/rki-deutschland-hospitalization.csv').default
  private bundeslandIncidenceRateLookup: { [id: string]: any } = {
    berlin: { name: 'Berlin' },
    cologne: { name: 'Nordrhein-Westfalen' },
  }

  private mounted() {
    this.updateScale()
    //this.fetchRealHospitalizationRates()
    this.calculate()
    //this.fetchBundeslandIncidenceRates()
    this.unselectLines()
    //this.fetchDiviIncidenceNRW()
  }

  private handleRelayout(event: any) {
    if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
      this.calculate()
      //this.fetchBundeslandIncidenceRates()
      this.unselectLines()
    }
  }

  @Watch('data') private updateModelData() {
    this.calculate()
    //this.fetchBundeslandIncidenceRates()
    this.unselectLines()
    //this.fetchDiviIncidenceNRW()
  }

  @Watch('city') private async fetchRealHospitalizationRates() {
    this.observedData = []

    // Moved to new hosp plot
    // try {
    //   if (this.cityObservedHospitalizationFiles[this.city]) {
    //     const response = await fetch(this.cityObservedHospitalizationFiles[this.city])
    //     const text = await response.text()
    //     const hospitalData = Papaparse.parse(text, {
    //       header: true,
    //       dynamicTyping: true,
    //       skipEmptyLines: true,
    //       comments: '#',
    //     }).data

    //     if (hospitalData.length) {
    //       this.observedData = hospitalData

    //       if (this.dataLines.length)
    //         this.dataLines.push({
    //           name: 'Observed Hospitalization Case Rate',
    //           x: this.observedData.map(row => row.date),
    //           y: this.observedData.map(row => row.realHospitalizationRate),
    //           type: 'scatter',
    //           mode: 'markers',
    //           marker: { size: 4, color: '#f08' },
    //         })
    //     }
    //   }
    // } catch (e) {
    //   console.error(e)
    // }

    return
  }

  @Watch('logScale') updateScale() {
    if (this.logScale) {
      this.layout.yaxis.type = 'log'
      this.layout.yaxis.autorange = false
      this.layout.yaxis.range = [Math.log10(0.1), 2]
    } else {
      this.layout.yaxis.type = 'linear'
      delete this.layout.yaxis.range // [0, 1.5]
      this.layout.yaxis.autorange = true
    }
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('dataLines', { deep: true }) async updateUrl() {
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
  }

  private unselectLines() {
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
  }

  private async fetchDiviIncidenceNRW() {
    // Moved to new hosp plot
    // try {
    //   const response = await fetch(this.diviIncidenceNRWUrl)
    //   const text = await response.text()
    //   const incidenceNRW = Papaparse.parse(text, {
    //     header: true,
    //     dynamicTyping: true,
    //     skipEmptyLines: true,
    //     comments: '#',
    //   }).data
    //   // Workaround for doubled data; Not a good bugfix but it works
    //   // The 'Observed : Nordrhein-Westfalen (DIVI)' was present three
    //   // times on the Cologne Hospitalization New Cases Plot
    //   let diviExsists = false
    //   this.dataLines.forEach(e => {
    //     if (e.name == 'Observed : Nordrhein-Westfalen (DIVI)') {
    //       diviExsists = true
    //     }
    //   })
    //   if (incidenceNRW.length) {
    //     if (this.dataLines.length && !diviExsists)
    //       this.dataLines.push({
    //         name: 'Observed : Nordrhein-Westfalen (DIVI)',
    //         x: incidenceNRW.map(row => row.Date),
    //         y: incidenceNRW.map(row => row.DIVIIncidence),
    //         type: 'scatter',
    //         marker: { size: 4, color: 'brown' },
    //         line: { width: 2, dash: 'dot' },
    //       })
    //   }
    // } catch (e) {
    //   console.error(e)
    // }
  }

  private calculate() {
    this.$emit('method', this.lagDays + '-day Hospitalizations / 100k Pop.')

    this.dataLines = []
    const x: any[] = []
    const hospitalized: any[] = []

    try {
      const susceptible = this.data.filter(v => v.name === 'Susceptible')[0]
      const totalInfected = this.data.filter(item => item.name === 'Total Infected')[0]
      const recovered = this.data.filter(item => item.name === 'Recovered')[0]

      if (!susceptible || !totalInfected || !recovered) return

      const totalPopulation = susceptible.y[0] + totalInfected.y[0] + recovered.y[0]
      const factor100k = totalPopulation / 100000.0

      const seriouslySickCumul = this.data.filter(v => v.name === 'Seriously Sick Cumulative')[0]

      for (let day = this.lagDays; day < seriouslySickCumul.x.length; day++) {
        x.push(seriouslySickCumul.x[day])
        const rawHospitalizations =
          seriouslySickCumul.y[day] - seriouslySickCumul.y[day - this.lagDays]
        const scaledHospitalizations = rawHospitalizations / factor100k
        hospitalized.push(scaledHospitalizations)
      }

      // set end date
      this.layout.xaxis.range[0] = this.$store.state.graphStartDate
      this.layout.xaxis.range[1] = this.endDate

      // log/linear
      this.updateScale()

      // cull out and only show one point per week
      const cullRate = 7
      const cullX: any[] = []
      const cullY: any[] = []

      for (let i = 0; i < x.length; i = i + cullRate) {
        cullX.push(x[i])
        cullY.push(hospitalized[i])
      }

      this.dataLines.push({
        name: 'Model: New Hospitalizations / 100k',
        visible: true,
        x: cullX,
        y: cullY,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 4, color: '#32c' },
        line: {
          width: 0.5,
          color: '#329',
          // shape: 'hvh',
        },
      })

      // Moved to new hosp plot
      // if (this.observedData) {
      //   this.dataLines.push({
      //     name: 'Observed Hospitalization Case Rate',
      //     x: this.observedData.map(row => row.date),
      //     y: this.observedData.map(row => row.realHospitalizationRate),
      //     type: 'scatter',
      //     mode: 'markers',
      //     marker: { size: 4, color: '#f08' },
      //   })
      // }
    } catch (e) {
      console.error(e)
      return
    }
  }

  private async fetchBundeslandIncidenceRates() {
    // only add Bundesland data if we are looking at data for a city with a Bundesland
    if (!this.bundeslandIncidenceRateLookup[this.city]) return

    // Moved to new hosp plot
    // const region = this.bundeslandIncidenceRateLookup[this.city]
    // console.log(region)

    // const csvData = Papaparse.parse(this.bundeslandCSV, {
    //   header: true,
    //   dynamicTyping: true,
    //   skipEmptyLines: true,
    //   comments: '#',
    // }).data

    // const allAges = csvData.filter(row => row['Altersgruppe'] === '00+')
    // const regionData = allAges.filter(row => row['Bundesland'] === region.name)

    // this.dataLines.push({
    //   name: 'Observed: ' + region.name + ' (RKI)',
    //   x: regionData.map(row => row['Datum']),
    //   y: regionData.map(
    //     row =>
    //       row['aktualisierte_7T_Hospitalisierung_Inzidenz'] || row['7T_Hospitalisierung_Inzidenz']
    //   ),
    //   type: 'scatter',
    //   marker: { size: 4, color: '#4c6' },
    //   line: { width: 2, dash: 'dot' },
    // })
    // this.dataLines.push({
    //   name: 'Adjusted: ' + region.name + ' (RKI)',
    //   x: regionData.map(row => row['Datum']),
    //   y: regionData.map(row => row['PS_adjustierte_7T_Hospitalisierung_Inzidenz']),
    //   type: 'scatter',
    //   marker: { color: '#4c6' },
    //   line: { width: 1.5 },
    // })

    this.fetchDiviIncidenceNRW()
  }

  private layout: any = {
    // barmode: 'stack',
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
      autorange: true,
      // fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: 'linear',
      // range: [Math.log10(0.01), Math.log10(2)],
      title: 'Multiplier',
      hoverformat: '.3f',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
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
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
