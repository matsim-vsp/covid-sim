<template lang="pug">
.vue-component(v-if="!isResizing" )
  vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options")
  
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'
import { PUBLIC_SVN } from '@/Globals'
import Papaparse from 'papaparse'
import { constant } from 'vega'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private startDate!: any
  @Prop({ required: true }) private endDate!: any
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private data2!: any[]
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private intakesHosp!: boolean
  @Prop({ required: true }) private city!: string

  private dataLines: any[] = []
  private observedData: any[] = []
  private factor100k = 1

  private observedHospitalizationConfig: {
    [id: string]: { svnPath: string; legendText: string; csvCasesColumn: string }
  } = {
    cologne: {
      svnPath: 'original-data/hospital-cases/cologne/KoelnAllgemeinpatienten.csv',
      csvCasesColumn: 'allgemeinpatienten',
      legendText: 'Reported: Hospitalizations (City)',
    },
  }

  private diviIncidenceNRWUrl =
    PUBLIC_SVN + 'original-data/hospital-cases/cologne/DiviIncidenceNRW.csv'

  private originalDataUrl = PUBLIC_SVN + 'original-data/Fallzahlen/'

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
    this.calculateValues()
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('data') updateData() {
    this.calculateValues()
  }

  @Watch('data2') updateData2() {
    this.calculateValues()
  }

  @Watch('logScale') updateScale() {
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
  }

  private async calculateValues() {
    if (!this.data.length) return

    this.dataLines = []

    // intakesHosp
    // intakesICU
    // occupancyHosp
    // occupancyICU
    //
    // Omicron
    // Delta

    let date = [] as any[]
    let intakesHospOmicron = []
    let intakesICUOmicron = []
    let occupancyHospOmicron = []
    let occupancyICUOmicron = []
    let intakesHospDelta = []
    let intakesICUDelta = []
    let occupancyHospDelta = []
    let occupancyICUDelta = []

    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].measurement != null) {
        let measurement = this.data[i].measurement.trim()
        let severity = this.data[i].severity.trim()
        let dateTemp = this.data[i].date.trim()
        let n = this.data[i].n


        const dateTemp2 = new Date(dateTemp)
        // We only want values for entire week, thus we filter to only sundays (which has  value of 0)
        if(dateTemp2.getDay() == 0){ 
          // the sunday value is an average of the previous week (previous saturday to this sunday)
          // thus, if we want to represent the week by the day in the middle (Thursday), we must subtract 3 days
          dateTemp2.setDate(dateTemp2.getDate() - 3)
          dateTemp = dateTemp2.toISOString().substring(0, 10)
        } else {
          continue
        }

        if (severity == 'Omicron') {
          if (measurement == 'intakesHosp') {
            date.push(dateTemp)
            intakesHospOmicron.push(n)
          }
          if (measurement == 'intakesICU') {
            intakesICUOmicron.push(n)
          }
          if (measurement == 'occupancyHosp') {
            occupancyHospOmicron.push(n)
          }
          if (measurement == 'occupancyICU') {
            occupancyICUOmicron.push(n)
          }
        } else {
          if (measurement == 'intakesHosp') {
            intakesHospDelta.push(n)
          }
          if (measurement == 'intakesICU') {
            intakesICUDelta.push(n)
          }
          if (measurement == 'occupancyHosp') {
            occupancyHospDelta.push(n)
          }
          if (measurement == 'occupancyICU') {
            occupancyICUDelta.push(n)
          }
        }
      }
    }

    if (!this.intakesHosp) {
      this.dataLines.push(
        {
          name: 'occupancyHosp-Delta',
          x: date,
          y: occupancyHospDelta,
          line: { width: 1 },
        },
        {
          name: 'occupancyHosp-Omicron',
          x: date,
          y: occupancyHospOmicron,
          line: { width: 1 },
        },
        {
          name: 'occupancyICU-Delta',
          x: date,
          y: occupancyICUDelta,
          line: { width: 1 },
        },
        {
          name: 'occupancyICU-Omicron',
          x: date,
          y: occupancyICUOmicron,
          line: { width: 1 },
        }
      )
    } else {
      this.dataLines.push(
        {
          name: 'intakesHosp-Delta',
          x: date,
          y: intakesHospDelta,
          line: { width: 1 },
        },
        {
          name: 'intakesHosp-Omicron',
          x: date,
          y: intakesHospOmicron,
          line: { width: 1 },
        },
        {
          name: 'intakesICU-Delta',
          x: date,
          y: intakesICUDelta,
          line: { width: 1 },
        },
        {
          name: 'intakesICU-Omicron',
          x: date,
          y: intakesICUOmicron,
          line: { width: 1 },
        }
      )
    }

    // Rate
    if (!this.intakesHosp) {
      await this.addReportedDataRate()
    } else {
      // New Cases
      await this.addReportedDataNewCases()
    }
  }

  private async addReportedDataRate() {
    if (this.data2.length == 0) return

    const susceptible = this.data2.filter(item => item.name === 'Susceptible')

    // maybe data is not loaded yet
    if (!susceptible.length) return

    const totalPopulation = susceptible[0].y[0]
    this.factor100k = totalPopulation / 100000.0

    if (this.observedHospitalizationConfig[this.city]) {
      const config = this.observedHospitalizationConfig[this.city]
      const url = PUBLIC_SVN + config.svnPath
      console.log(url)

      const rawData = await fetch(url).then(async data2 => await data2.text())
      const csvData = Papaparse.parse(rawData, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
      }).data

      this.dataLines.push({
        name: config.legendText,
        x: csvData.map(row => row.date.split('T')[0]),
        y: csvData.map(row => parseFloat(row[config.csvCasesColumn]) / this.factor100k),
        line: { width: 1 },
      })
    }
  }

  private async addReportedDataNewCases() {
    // Observed Hospitalization Case Rate
    this.observedData = []

    try {
      if (this.cityObservedHospitalizationFiles[this.city]) {
        const response = await fetch(this.cityObservedHospitalizationFiles[this.city])
        const text = await response.text()
        const hospitalData = Papaparse.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          comments: '#',
        }).data

        if (hospitalData.length) {
          this.observedData = hospitalData

          for (let i = 0; i < this.dataLines.length; i++) {
            if (this.dataLines[i].name == 'Observed Hospitalization Case Rate') {
              this.dataLines.splice(i, 1)
            }
          }

          if (this.dataLines.length)
            this.dataLines.push({
              name: 'Observed Hospitalization Case Rate',
              x: this.observedData.map(row => row.date),
              y: this.observedData.map(row => row.realHospitalizationRate),
              //type: 'scatter',
              //mode: 'markers',
              line: { width: 1 },
            })
        }
      }
    } catch (e) {
      console.error(e)
    }

    // only add Bundesland data if we are looking at data for a city with a Bundesland
    if (!this.bundeslandIncidenceRateLookup[this.city]) return
    const region = this.bundeslandIncidenceRateLookup[this.city]
    console.log(region)

    const csvData = Papaparse.parse(this.bundeslandCSV, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      comments: '#',
    }).data

    const allAges = csvData.filter(row => row['Altersgruppe'] === '00+')
    const regionData = allAges.filter(row => row['Bundesland'] === region.name)

    for (let i = 0; i < this.dataLines.length; i++) {
      if (this.dataLines[i].name == 'Observed: ' + region.name + ' (RKI)') {
        this.dataLines.splice(i, 1)
      }
      if (this.dataLines[i].name == 'Adjusted: ' + region.name + ' (RKI)') {
        this.dataLines.splice(i, 1)
      }
    }

    this.dataLines.push({
      name: 'Observed: ' + region.name + ' (RKI)',
      x: regionData.map(row => row['Datum']),
      y: regionData.map(
        row =>
          row['aktualisierte_7T_Hospitalisierung_Inzidenz'] || row['7T_Hospitalisierung_Inzidenz']
      ),
      //type: 'scatter',
      //marker: { size: 4, color: '#4c6' },
      //line: { width: 2, dash: 'dot' },
      line: { width: 1 },
    })
    this.dataLines.push({
      name: 'Adjusted: ' + region.name + ' (RKI)',
      x: regionData.map(row => row['Datum']),
      y: regionData.map(row => row['PS_adjustierte_7T_Hospitalisierung_Inzidenz']),
      //type: 'scatter',
      //marker: { color: '#4c6' },
      line: { width: 1 },
    })

    // DIVI
    try {
      const response = await fetch(this.diviIncidenceNRWUrl)
      const text = await response.text()
      const incidenceNRW = Papaparse.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        comments: '#',
      }).data

      // Workaround for doubled data; Not a good bugfix but it works
      // The 'Observed : Nordrhein-Westfalen (DIVI)' was present three
      // times on the Cologne Hospitalization New Cases Plot
      let diviExsists = false
      this.dataLines.forEach(e => {
        if (e.name == 'Observed : Nordrhein-Westfalen (DIVI)') {
          diviExsists = true
        }
      })

      if (incidenceNRW.length) {
        if (this.dataLines.length && !diviExsists)
          this.dataLines.push({
            name: 'Observed : Nordrhein-Westfalen (DIVI)',
            x: incidenceNRW.map(row => row.Date),
            y: incidenceNRW.map(row => row.DIVIIncidence),
            //type: 'scatter',
            //marker: { size: 4, color: 'brown' },
            //line: { width: 2, dash: 'dot' },
            line: { width: 1 },
          })
      }
    } catch (e) {
      console.error(e)
    }
  }

  private layout = {
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
      filename: 'daily-cases',
      width: 1200,
      height: 600,
      scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
    },
  }
}
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
