<template lang="pug">
#charts
  .preamble
    h3.select-scenario Select Scenario:

  #main-section
    .pieces(v-if="this.city")
      .option-groups
        .button-choices.buttons.has-addons
          button.button.is-small(
            :class="{'is-link': !isBase, 'is-selected': !isBase}"
            :key="'do-something'" @click='setBase(false)') Alternatives
          button.button.is-small(
            :class="{'is-link': isBase, 'is-selected': isBase}"
            :key="'base'" @click='setBase(true)') What would have happened w/o restrictions

        .option-group(:class="{'totally-disabled': isBase}"
                      v-for="group in yaml.optionGroups" :key="group.heading + group.day")
          .g1
            h6.title {{ calendarForSimDay(group.day) }}:
              br
              | {{ group.heading }}

            p.subhead(v-if="group.subheading") {{ group.subheading }}

            .myslider(v-for="m in group.measures" :key="m.measure")
              option-buttons(:measure="m" :options="measureOptions[m.measure]" @changed="sliderChanged")

        h5.cumulative Cumulative Infected by September 2020
        p.infected {{ prettyInfected }}

      .all-plots

        .plot-options
          .scale-options
            b Scale
            .variation-choices.buttons.has-addons
              button.button.is-small(
                :class="{'is-link': !logScale, 'is-selected': !logScale}"
                @click="logScale = !logScale") Linear
              button.button.is-small(
                :class="{'is-link': logScale, 'is-selected': logScale}"
                @click="logScale = !logScale") Log

          .variation(v-if="yaml.offset")
            b Shift Start Date
            .variation-choices.buttons.has-addons
              button.button.is-small(v-for="offset in yaml.offset" :key="offset"
                :class="{'is-link': plusminus === offset, 'is-selected': plusminus === offset}"
                @click="setPlusMinus(offset)") {{ strOffset(offset)}}

        .linear-plot
          h5 {{ cityCap }} Simulated Health Outcomes Over Time
          p {{ this.logScale ? 'Log scale' : 'Linear scale' }}
          .plotarea
            p.plotsize(v-if="!isZipLoaded") Loading data...
            vue-plotly.plotsize(:data="data" :layout="layout" :options="options")

        .linear-plot(v-if="city === 'berlin'")
          h5 {{ cityCap }} Hospitalization Rate Comparison
          p {{ this.logScale ? 'Log scale' : 'Linear scale' }}
          .plotarea
            p.plotsize(v-if="!isZipLoaded") Loading data...
            hospitalization-plot.plotsize(:data="data" :logScale="logScale" :city="city")

        .linear-plot
          h5 {{ cityCap }} Estimated R-Values
          p Based on four-day new infections
          .plotarea
            p.plotsize(v-if="!isZipLoaded") Loading data...
            r-value-plot.plotsize(:data="data" :logScale="false")

</template>

<script lang="ts">
// ###########################################################################
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Papa from 'papaparse'
import VuePlotly from '@statnett/vue-plotly'
import ZipLoader from 'zip-loader'
import moment from 'moment'

import OptionButtons from './OptionButtons.vue'
import HospitalizationPlot from '@/components/HospitalizationPlot.vue'
import RValuePlot from '@/components/RValuePlot.vue'
import { RunYaml } from '@/Globals'

interface Measure {
  measure: string
  title: string
}

@Component({
  components: {
    HospitalizationPlot,
    OptionButtons,
    RValuePlot,
    VuePlotly,
  },
})
export default class VueComponent extends Vue {
  @Prop({ required: true }) private yaml!: RunYaml
  @Prop({ required: true }) private runId!: string

  // convenience from yaml
  private dayZero: string = ''
  private city: string = ''

  private MAX_DAYS = 200
  private cumulativeInfected = 0

  private isZipLoaded = false
  private plusminus = 0

  private logScale = true

  private publicPath = process.env.NODE_ENV === 'production' ? '/covid-sim/' : '/'

  private public_svn =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/battery/'

  private cityCSV: any = {
    berlin: require('@/assets/berlin-cases.csv').default,
    munich: require('@/assets/munich-cases.csv').default,
    heinsberg: require('@/assets/heinsberg-cases.csv').default,
  }

  @Watch('yaml') private async switchYaml() {
    console.log('GOT NEW YAML:', this.yaml.city)
    if (!this.yaml.city) return

    this.city = this.yaml.city
    this.dayZero = this.yaml.dayZero
    this.plusminus = this.yaml.offset[0]

    await this.loadInfoTxt()
    this.loadZipData()
  }

  @Watch('plusminus') private switchPlusMinus() {
    this.showPlotForCurrentSituation()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  private isBase = false
  private currentRun: any = {}

  private data: any[] = []

  private measureOptions: any = {}
  private runLookup: any = {}

  private observedCases: any

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
    margin: { t: 5, r: 10, b: 0, l: 60 },
    xaxis: {
      range: ['2020-02-09', '2020-08-31'],
      type: 'date',
    },
    yaxis: {
      type: this.logScale ? 'log' : 'linear',
      autorange: true,
      title: 'Population (' + (this.logScale ? 'log scale)' : 'Linear scale)'),
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private strOffset(offset: number) {
    return (offset > 0 ? '+' : '') + offset
  }

  private options = {
    displayModeBar: false,
    responsive: true,
  }

  private setBase(value: boolean) {
    this.isBase = value
    this.showPlotForCurrentSituation()
  }

  private setPlusMinus(value: string) {
    console.log('SET PLUS MINUS:', value)
    const shift = parseInt(value)
    console.log('SET PLUS MINUS:', shift)
    this.plusminus = shift
  }

  private get cityCap() {
    return this.city.slice(0, 1).toUpperCase() + this.city.slice(1)
  }

  private currentSituation: any = {}
  private loadedSeriesData: any = {}
  private zipLoader: any

  private labels: any = {
    nSusceptible: 'Susceptible',
    nInfectedButNotContagious: 'Infected, not contagious',
    nContagious: 'Contagious',
    nShowingSymptoms: 'Showing Symptoms',
    nSeriouslySick: 'Seriously Sick',
    nCritical: 'Critical',
    nTotalInfected: 'Total Infected',
    nInfectedCumulative: 'Infected Cumulative',
    nRecovered: 'Recovered',
    nInQuarantine: 'In Quarantine',
  }

  private async mounted() {
    this.switchYaml()
  }

  private zipCache: any = {}

  private get prettyInfected() {
    if (!this.cumulativeInfected) return ''

    const rounded = 100 * Math.round(this.cumulativeInfected * 0.01)
    return Number(rounded).toLocaleString()
  }

  private calendarForSimDay(day: number) {
    if (day >= 0) return 'Day ' + day

    return 'General Options'
  }

  private async loadZipData() {
    this.isZipLoaded = false

    console.log('loadZipData:', this.city)

    const filepath = this.public_svn + this.runId + '/summaries-filtered.zip'

    if (this.zipCache[this.city]) {
      // check cache first!
      console.log('using cached zip for!', this.city)
      this.zipLoader = this.zipCache[this.city]
    } else {
      // load the zip from file

      console.log('---loading zip:', filepath)

      this.zipLoader = new ZipLoader(filepath)
      await this.zipLoader.load()
      console.log('zip loaded!')
    }

    this.isZipLoaded = true

    this.zipCache[this.city] = this.zipLoader
    this.runChanged()
  }

  private fillcolors: any = {
    Susceptible: '#0000ff',
    'Seriously Sick': '#cc2211',
    'Showing Symptoms': '#00ffff',
    'Infected Cumulative': '#f791cf',
    'Infected, not contagious': '#ee8800',
    Critical: '#882299',
    Recovered: '#eedd44',
    Contagious: '#00aa00',
    'Total Infected': '#a65628',
  }

  private async runChanged() {
    // maybe we already did the calcs
    if (this.loadedSeriesData[this.currentRun.RunId]) {
      this.data = this.loadedSeriesData[this.currentRun.RunId]
      this.updateTotalInfected()
      return
    }

    // load run dataset
    const csvLow: any[] = await this.loadCSV(this.currentRun)

    // zip might not yet be loaded
    if (csvLow.length === 0) return

    const timeSeriesesLow = this.generateSeriesFromCSVData(csvLow)

    // cache the result
    this.loadedSeriesData[this.currentRun.RunId] = timeSeriesesLow

    this.data = timeSeriesesLow
    this.updateTotalInfected()
  }

  private updateTotalInfected() {
    const infectedCumulative = this.data.filter(a => a.name === 'Infected Cumulative')[0]
    this.cumulativeInfected = Math.max(...infectedCumulative.y)
  }

  private sliderChanged(measure: any, value: any) {
    console.log(measure, value)
    this.currentSituation[measure] = value
    this.showPlotForCurrentSituation()
  }

  private showPlotForCurrentSituation() {
    if (this.isBase) {
      this.currentRun = { RunId: 'sz0' }
      this.runChanged()
      return
    }

    let lookupKey = ''
    for (const measure of Object.keys(this.measureOptions))
      lookupKey += this.currentSituation[measure] + '-'

    const suffix = this.plusminus
    const lookup = lookupKey.replace('undefined', '' + suffix)

    console.log(lookup)

    this.currentRun = this.runLookup[lookup]

    if (!this.currentRun) return

    this.runChanged()
  }

  private unpack(rows: any[], key: any) {
    let v = rows.map(function(row) {
      if (key === 'day') return row[key]
      return row[key]
    })

    v = v.slice(0, this.MAX_DAYS)

    // maybe the sim ended early - go out to 150 anyway
    if (v.length < this.MAX_DAYS) {
      v.push(key === 'day' ? this.MAX_DAYS : v[v.length - 1])
    }
    return v
  }

  private async loadCSV(currentRun: any) {
    if (!currentRun.RunId) return []
    if (!this.zipLoader) return []

    const filename = currentRun.RunId + '.infections.txt.csv'
    console.log('Extracting', filename)

    let text = this.zipLoader.extractAsText(filename)
    const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

    return z.data
  }

  private calculateDatefromSimulationDay(day: number) {
    const date = moment(this.dayZero)
      .subtract(this.plusminus, 'days')
      .add(day, 'days')
      .format('YYYY-MM-DD')
    return date
  }

  private generateSeriesFromCSVData(data: any[]) {
    const serieses = []

    const days: number[] = this.unpack(data, 'day')
    const x = days.map(d => this.calculateDatefromSimulationDay(d))

    for (const column of Object.keys(this.labels)) {
      const name = this.labels[column]

      if (name === 'In Quarantine') continue

      const y: number[] = this.unpack(data, column)
      serieses.push({ x, y, name })
    }

    // Add Berlin "Reported Cases"
    // if (this.city === 'berlin') serieses.push(this.state.berlinCases)
    if (this.observedCases) serieses.push(this.observedCases)

    return serieses
  }

  private async parseInfoTxt(city: string) {
    // this.observedCases = this.prepareObservedData(this.city)

    const filepath = this.public_svn + this.runId + '/_info.txt'
    console.log(filepath)
    const parsed = await this.parseCSVFile(filepath)
    return parsed
  }

  private prepareObservedData(newCity: string) {
    const csvContents = this.cityCSV[newCity]

    const data = Papa.parse(csvContents, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    }).data

    console.log({ data })

    const dates: any = []
    const cases: any = []
    let cumulative = 0

    console.log('fetched city data:', data.length)

    // pull the cases field out of the CSV
    for (const datapoint of data) {
      const day = datapoint.year + '-' + datapoint.month + '-' + datapoint.day
      dates.push(day)

      cumulative += datapoint.cases
      cases.push(cumulative)
    }

    const series = {
      name: this.cityCap + ' Infections (RKI)',
      x: dates,
      y: cases,
      line: {
        dash: 'dot',
        width: 3,
        color: 'rgb(0,200,150)',
      },
    }

    console.log({ observedData: series })
    return series
  }

  private async parseCSVFile(filepath: string) {
    console.log('fetching data')
    const response = await fetch(filepath)
    const text = await response.text()
    const parsed: any = Papa.parse(text, { header: true, dynamicTyping: true })
    console.log({ parsed: parsed.data })

    return parsed.data
  }

  private async loadInfoTxt() {
    console.log('_info.txt: generating lookups')

    const infoTxt = await this.parseInfoTxt(this.city)

    const measures: any = {}
    const runLookup: any = {}

    // first get column names for the measures that have been tested
    const ignore = ['Config', 'Output', 'RunId', 'RunScript']

    for (const label of Object.keys(infoTxt[0])) {
      if (ignore.indexOf(label) > -1) continue
      measures[label] = new Set()
    }

    // get all possible values
    for (const row of infoTxt) {
      if (!row.RunId) continue

      // note this particular value, for every value
      for (const measure of Object.keys(measures)) {
        if (row[measure] === 0 || row[measure]) measures[measure].add(row[measure])
      }

      // store the run in a lookup using all values as the key
      let lookupKey = ''
      for (const measure of Object.keys(measures)) {
        lookupKey += row[measure] + '-'
      }
      runLookup[lookupKey] = row
    }

    let order = ''
    for (const measure of Object.keys(measures)) {
      order += measure + '-'
      measures[measure] = Array.from(measures[measure].keys()).sort((a: any, b: any) => a - b)
    }

    this.runLookup = runLookup
    this.measureOptions = measures
  }
}

// ###########################################################################
</script>

<style scoped lang="scss">
#main-section {
  display: flex;
  flex-direction: row;
}

h5 {
  font-weight: bold;
  font-size: 18px;
}

h6 {
  font-size: 1.1rem;
}

.pieces {
  padding: 0rem 0rem;
  display: grid;
  width: 100%;
  grid-gap: 0rem;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
}

.pieces h3 {
  color: #667883;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
  margin: 1rem 1rem 2rem 0rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.option-groups {
  grid-column: 1 / 2;
  grid-row: 1 / 4;
  margin-right: 1rem;
  width: 17rem;
  display: flex;
  flex-direction: column;
}

.all-plots {
  margin-left: 1rem;
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
}

.log-plot {
  background-color: #f8f8f8;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  margin: 0 0 1rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
}

.linear-plot {
  background-color: #f8f8f8;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  margin: 0rem 0 2rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
}

h5 {
  margin-top: 0.5rem;
}

.plotarea {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 30rem;
}

.plotsize {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
}

p.plotsize {
  z-index: 10;
  margin: auto auto;
}

p.subhead {
  margin-top: -0.25rem;
}

.myslider {
  width: 100%;
}

.plot {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  padding: 1rem 0rem;
}

.plot-options {
  display: flex;
  flex-direction: row;
  margin-left: 1rem;
}

.infected {
  padding-left: 0rem;
  font-weight: bold;
  font-size: 2rem;
  margin-top: 0rem;
  margin-left: 1rem;
  color: rgb(151, 71, 34);
}

.button-choices {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 0.25rem;
}

.button-choices button {
  width: 100%;
}

.title {
  line-height: 1.4rem;
  margin: 1rem 0 0.5rem 0;
}

.totally-disabled {
  pointer-events: none;
  opacity: 0.4;
}

.g1 {
  padding: 0rem 0.5rem 1rem 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid #aaa;
  border-radius: 4px;
}

.cumulative {
  margin-top: 1rem;
  margin-left: 1rem;
}

.preamble {
  display: flex;
  flex-direction: row;
  margin-top: 2rem;
}

.variation {
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-bottom: 0.3rem;
  text-align: right;
}

.variation-choices {
  padding: 0 0;
}

@media only screen and (max-width: 640px) {
  #main-section {
    flex-direction: column;
    padding: 0 0;
    margin: 0 0rem;
  }

  p.infected {
    margin-bottom: 1rem;
  }

  .pieces {
    padding: 1rem 0rem;
    display: flex;
    flex-direction: column;
  }

  .log-plot {
    margin-left: 0;
  }

  .linear-plot {
    margin-top: 2rem;
    margin-left: 0;
  }

  .option-groups {
    width: 15rem;
  }
}
</style>
