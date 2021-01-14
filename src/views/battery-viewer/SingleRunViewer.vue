<template lang="pug">
#single-run-viewer
  .page-section.content
    .readme(v-html="topNotes")

  .page-section.preamble(:style="{backgroundColor: 'white'}")
    h3.select-scenario Select Scenario:

  .page-section.base-choice(v-if="city && hasBaseRun")
    .button-choices.buttons.has-addons
      button.button.is-small(
        :style="{marginRight: '0.5rem'}"
        :class="{'is-link': !isBase, 'is-selected': !isBase}"
        :key="'do-something'" @click='setBase(false)') Alternatives
      button.button.is-small(
        :class="{'is-link': isBase, 'is-selected': isBase}"
        :key="'base'" @click='setBase(true)') What would have happened without restrictions

  .page-section.selections-and-charts
    .left-side
      .option-groups(
        v-if="this.city"
        :style="{gridTemplateColumns: runYaml.optionGroups.length > 1 ?  'repeat(3, 1fr)' : ''}")

        .option-group(:class="{'totally-disabled': isBase}"
                      v-for="group in runYaml.optionGroups" :key="group.heading + group.day")
          .g1
            h6.title {{ calendarForSimDay(group.day) }}:
              br
              | {{ group.heading }}

            p.subhead(v-if="group.subheading") {{ group.subheading }}

            .measure(v-for="m in group.measures" :key="m.measure")
              .measure-buttons
                p {{ m.title }}
                button-group(:measure="m" :options="measureOptions[m.measure]" @changed="sliderChanged")

        h5.cumulative Cumulative Infected by
          br
          | {{ this.endDate }}:
        p.infected {{ prettyInfected }}

    .right-side
      .linear-plot.activity(v-if="showActivityLevels")
        h5 Activity Levels by Type
        p 0-100% of normal
        .plotarea.compact
          activity-levels-plot.plotsize(:city="city" :battery="runId"
            :currentRun="currentRun" :startDate="startDate" :endDate="endDate" :plusminus="plusminus"
            :zipContent="zipLoader")
            //- @missing="showActivityLevels = false")

      //- Vega charts with top=true
      .top-vega-plots(v-for="chartKey in Object.keys(vegaChartData)" :key="chartKey")
        .linear-plot.top-vega-plot(v-if="vegaChartData[chartKey].yaml.showAbove === true")
          vega-lite-chart.plotsize(
            :baseUrl="BATTERY_URL"
            :runId="runId"
            :configFile="chartKey"
            :logScale="logScale"
            :yamlDef="vegaChartData[chartKey].yaml"
            :data="vegaChartData[chartKey].data"
          )

      .plot-options
        .scale-options
          b Scale
          .variation-choices.buttons.has-addons
            button.button.is-small(
              :class="{'is-link': !logScale, 'is-selected': !logScale}"
              @click="logScale = false") Linear
            button.button.is-small(
              :class="{'is-link': logScale, 'is-selected': logScale}"
              @click="logScale = true") Log

        .variation(v-if="offset.length > 1")
          b Shift Start Date
          .variation-choices.buttons.has-addons( style="margin-left: auto;")
            button.button.is-small(v-for="offset in offset" :key="offset"
              :class="{'is-link': plusminus === offset, 'is-selected': plusminus === offset}"
              @click="setPlusMinus(offset)") {{ strOffset(offset)}}

      .all-plots

        .linear-plot
          h5 {{ cityCap }} Cases Comparison
            button.button.is-small.hider(@click="toggleShowPlot(0)") ..

          .hideIt(v-show="showPlot[0]")
            p New persons showing symptoms (model) vs. new cases (reality)
            .plotarea.tall
              p.plotsize(v-if="!isZipLoaded") Loading data...
              p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
              weekly-infections-plot.plotsize(v-else :data="data"  :endDate="endDate"
              :observed="observedCases"
              :rkiDetectionData="rkiDetectionRateData"
              :logScale="logScale")

        .linear-plot(v-if="city === 'berlin' || city === 'munich'")
          h5 {{ cityCap }} Hospitalization Rate Comparison
            button.button.is-small.hider(@click="toggleShowPlot(1)") ..

          .hideIt(v-show="showPlot[1]")
            p {{ this.logScale ? 'Log scale' : 'Linear scale' }}
            .plotarea.compact
              p.plotsize(v-if="!isZipLoaded") Loading data...
              p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
              hospitalization-plot.plotsize(v-else
                :data="hospitalData" :logScale="logScale" :city="city"
                :diviData="diviData" :endDate="endDate" )

        .linear-plot(v-if="mutationValues.length > 0")
          h5 {{ cityCap }} Virus Strains
            button.button.is-small.hider(@click="toggleShowPlot(6)") ..

          .hideIt(v-show="showPlot[6]")
            p Simulated number of infections and percentage, by strain
            .plotarea(:style="{height: '25rem'}")
              p.plotsize(v-if="!isZipLoaded") Loading data...
              p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
              mutations-plot(v-else
                :endDate="endDate"
                :logScale="logScale"
                :strainValues="mutationValues"
              )

        .linear-plot
          h5 {{ cityCap }} Simulated R-Values
            button.button.is-small.hider(@click="toggleShowPlot(2)") ..

          .hideIt(v-show="showPlot[2]")
            p {{ rValueMethodDescription }}
            .plotarea.compact
              p.plotsize(v-if="!isZipLoaded") Loading data...
              p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
              r-value-plot.plotsize(v-else
                :data="data"
                :endDate="endDate"
                :logScale="logScale"
                :rValues="rValues"
                @method="switchRMethod")

        .linear-plot
          h5 {{ cityCap }} Simulated R-Values by Purpose
            button.button.is-small.hider(@click="toggleShowPlot(5)") ..

          .hideIt(v-show="showPlot[5]")
            p {{ rValueMethodDescription }}
            .plotarea.compact
              p.plotsize(v-if="!isZipLoaded") Loading data...
              p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
              r-value-two.plotsize(v-else
                :data="data"
                :endDate="endDate"
                :logScale="logScale"
                :rValues="rValues"
                @method="switchRMethod")

        .linear-plot(v-if="infectionsByActivityType.length > 0")
          h5 {{ cityCap }} Infections by Activity Type
            button.button.is-small.hider(@click="toggleShowPlot(7)") ..
          .hideIt(v-show="showPlot[7]")
            p 7 day average
            .plotarea(:style="{height: '28rem'}")
              p.plotsize(v-if="!isZipLoaded") Loading data...
              p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
              infections-by-activity-type(v-else
                :endDate="endDate"
                :logScale="logScale"
                :values="infectionsByActivityType"
              )

        .linear-plot
          h5 {{ cityCap }} Simulated Health Outcomes Over Time
            button.button.is-small.hider(@click="toggleShowPlot(3)") ..

          .hideIt(v-show="showPlot[3]")
            p {{ this.logScale ? 'Log scale' : 'Linear scale' }}
            .plotarea
              p.plotsize(v-if="!isZipLoaded") Loading data...
              p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
              vue-plotly.plotsize(v-else
                :data="data" :layout="layout" :options="options")

        .linear-plot(v-if="incidenceHeatMapData")
          h5 {{ cityCap }} 7-Day Incidence by Age Group Over Time
            button.button.is-small.hider(@click="toggleShowPlot(4)") ..

          .hideIt(v-show="showPlot[4]")
            .plotarea(style="grid-template-rows: 18rem")
              p.plotsize(v-if="!isZipLoaded") Loading data...
              p.plotsize(v-if="isZipLoaded && isDataMissing") Results not found
              heat-map.plotsize(v-else
                :endDate="endDate"
                :data="incidenceHeatMapData"
              )

        //- Vega charts without top=true
        .vega-plots(v-for="chartKey in Object.keys(vegaChartData)" :key="chartKey")
          .linear-plot(v-if="vegaChartData[chartKey].yaml.showAbove != true")
            vega-lite-chart.plotsize(
              :baseUrl="BATTERY_URL"
              :runId="runId"
              :configFile="chartKey"
              :logScale="logScale"
              :yamlDef="vegaChartData[chartKey].yaml"
              :data="vegaChartData[chartKey].data"
            )

  .page-section.content(v-if="bottomNotes")
    .bottom
      h3 Further Notes
      .readme(v-html="bottomNotes")

</template>

<script lang="ts">
// ###########################################################################
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import MarkdownIt from 'markdown-it'
import Papa from 'papaparse'
import VuePlotly from '@statnett/vue-plotly'
import ZipLoader from 'zip-loader'
import yaml from 'yaml'
import moment from 'moment'

import ActivityLevelsPlot from '@/components/ActivityLevelsPlot.vue'
import ButtonGroup from './ButtonGroup.vue'
import HeatMap from '@/components/HeatMap.vue'
import HospitalizationPlot from '@/components/HospitalizationPlot.vue'
import InfectionsByActivityType from '@/components/InfectionsByActivityType.vue'
import MutationsPlot from '@/components/MutationsPlot.vue'
import RValuePlot from '@/components/RValuePlot.vue'
import RValueTwo from '@/components/RValueTwo.vue'
import SVNFileSystem from '@/util/SVNFileSystem'
import VegaLiteChart from '@/components/VegaLiteChart.vue'
import WeeklyInfectionsPlot from '@/components/WeeklyInfectionsPlot.vue'
import { RunYaml } from '@/Globals'

interface Measure {
  measure: string
  title: string
}

interface VegaChartDefinition {
  yaml: any
  zip?: string
  url?: string
  data?: any[]
}

@Component({
  components: {
    ActivityLevelsPlot,
    ButtonGroup,
    HeatMap,
    HospitalizationPlot,
    InfectionsByActivityType,
    MutationsPlot,
    RValuePlot,
    RValueTwo,
    VegaLiteChart,
    VuePlotly,
    WeeklyInfectionsPlot,
  },
})
export default class VueComponent extends Vue {
  @Prop({ required: true }) private runYaml!: RunYaml
  @Prop({ required: true }) private runId!: string
  @Prop({ required: true }) private chartYamlFiles!: string[]

  private berlin_population = 3574568

  private scaleRKISurveillanceAnteil = 150.0

  // convenience from yaml
  private startDate: string = ''
  private city: string = ''
  private offset: number[] = []

  private showPlot: any = {
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
  }

  private MAX_DAYS = 500
  private cumulativeInfected = 0

  private isZipLoaded = false
  private isDataMissing = false
  private plusminus = 0

  private logScale = true
  private cityMarkdownNotes: string = ''
  private plotTag = '{{PLOTS}}'

  private rValueMethodDescription = 'Based on four-day new infections'
  private showActivityLevels = false
  private zipActivityLevelFileName = 'XX.zip'

  private publicPath = '/'

  private PUBLIC_SVN =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'

  private BATTERY_URL = this.PUBLIC_SVN + 'battery/'
  private RKI_URL = this.PUBLIC_SVN + 'original-data/Fallzahlen/RKI/'
  private DIVI_URL = this.PUBLIC_SVN + 'original-data/Fallzahlen/DIVI/'

  private isUsingRealDates = false
  private endDate = '2020-08-31'

  private cityCSV: any = {
    berlin: this.RKI_URL + 'berlin-cases.csv',
    munich: this.RKI_URL + 'munich-cases.csv',
    heinsberg: this.RKI_URL + 'heinsberg-cases.csv',
  }

  private cityCSVMeldedatum: any = {
    berlin: this.RKI_URL + 'berlin-cases-meldedatum.csv',
  }

  private cityRKISurveillance: any = {
    berlin: this.RKI_URL + 'SARS-CoV2_surveillance.csv',
  }

  private cityCSVTests: any = {
    berlin: this.RKI_URL + 'berlin-cases-tests.csv',
  }

  private cityDIVI: any = {
    berlin: this.DIVI_URL + 'berlin-divi-processed.csv',
    munich: this.DIVI_URL + 'munich-divi-processed.csv',
  }

  private vegaChartData: { [chart: string]: VegaChartDefinition } = {}

  // read the yaml files for each vega chart
  // if a zip file is specified, note that so we can fetch its content later
  private async loadVegaYamlFiles() {
    for (const yamlFile of this.chartYamlFiles) {
      try {
        const url = `${this.BATTERY_URL}/${this.runId}/${yamlFile}`
        const response = await fetch(url).then()
        const text = await response.text()
        const definition = yaml.parse(text)

        const chart: VegaChartDefinition = { yaml: definition, data: [] }

        // is there a zip file?
        if (definition.data && definition.data.zip) {
          chart.zip = definition.data.zip
          chart.url = definition.data.url
        }

        this.vegaChartData[yamlFile] = chart
      } catch (e) {
        console.error({ e })
      }
    }
  }

  @Watch('chartYamlFiles') private async handleChartListChanged() {
    this.vegaChartData = {}
    this.loadVegaYamlFiles()
  }

  private clearZipLoaderLookups() {
    for (const zipfile of Object.values(this.zipLoaderLookup)) {
      zipfile.clear()
    }
    this.zipLoaderLookup = {}
  }

  @Watch('runYaml') private async switchYaml() {
    if (!this.runYaml.city) return

    this.clearZipLoaderLookups()
    this.isUsingRealDates = false

    this.$nextTick()

    this.city = this.runYaml.city
    this.offset = []
    this.vegaChartData = {}

    await this.loadVegaYamlFiles()

    // set start date
    if (this.runYaml.startDate) this.startDate = this.runYaml.startDate
    else if (this.runYaml.defaultStartDate) this.startDate = this.runYaml.defaultStartDate
    else {
      alert('Uh-oh, YAML file has no startDate AND no defaultStartDate!')
      return
    }

    // set end date
    this.endDate = this.runYaml.endDate ? this.runYaml.endDate : '2020-08-31'
    // console.log({ endDate: this.endDate })
    this.layout.xaxis.range = ['2020-02-09', this.endDate]

    // build offsets
    if (!this.runYaml.offset && !this.runYaml.startDates) {
      alert('Uh-oh, YAML file has no offsets AND no startDates!')
      return
    }

    if (!this.runYaml.offset) {
      if (!this.runYaml.startDates) {
        alert("Need startDates in YAML if we don't have offsets")
        return
      }
      this.isUsingRealDates = true
      const defaultDate = moment(this.runYaml.defaultStartDate)
      for (const d of this.runYaml.startDates) {
        const date = moment(d)
        const diff = date.diff(defaultDate, 'days')
        this.offset.push(diff)
        if (date.isSame(d)) this.plusminus = diff
      }
    } else {
      this.offset = this.runYaml.offset
      this.plusminus = this.runYaml.offset[0]
    }

    this.updateNotes()

    this.observedCases = await this.prepareObservedData(this.city)
    this.diviData = await this.prepareDiviData(this.city)

    await this.loadInfoTxt()
    this.runChanged()
    this.showActivityLevelPlot()

    this.hasBaseRun = this.isThereABaseRun()

    this.showPlotForCurrentSituation()
  }

  @Watch('plusminus') private switchPlusMinus() {
    this.showPlotForCurrentSituation()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  private switchRMethod(method: string) {
    this.rValueMethodDescription = method
  }

  private isBase = false
  private currentRun: any = {}

  private data: any[] = []

  private measureOptions: any = {}
  private runLookup: any = {}

  private observedCases: any[] = []
  private diviData: any[] = []

  private toggleShowPlot(which: number) {
    this.showPlot[which] = !this.showPlot[which]
    console.log(this.showPlot)
  }

  private showThisPlot(which: number) {
    return this.showPlot[which]
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
    margin: { t: 5, r: 10, b: 0, l: 60 },
    xaxis: {
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      type: this.logScale ? 'log' : 'linear',
      autorange: true,
      title: 'Population',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private strOffset(offset: number) {
    return (offset > 0 ? '+' : '') + offset
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
      filename: 'covid-plot',
      width: 1200,
      height: 600,
      scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
    },
  }

  private setBase(value: boolean) {
    this.isBase = value
    this.showPlotForCurrentSituation()
  }

  private setPlusMinus(value: string) {
    const shift = parseInt(value)
    // console.log('SET PLUS MINUS:', shift)
    this.plusminus = shift
  }

  private get cityCap() {
    return this.city.slice(0, 1).toUpperCase() + this.city.slice(1)
  }

  private isThereABaseRun() {
    const files = this.zipLoader.files
    console.log({ ZIPLODER: this.zipLoader })
    const baseFilename = 'sz0' + '.infections.txt.csv'

    console.log('DOES SZ0 EXIST: ', files.hasOwnProperty(baseFilename))

    return files.hasOwnProperty(baseFilename)
  }

  private currentSituation: any = {}
  private loadedSeriesData: any = {}
  private zipLoader: any = {}

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
    nHospitalCumulative: 'Cumulative Hospitalized',
    nShowingSymptomsCumulative: 'Showing Symptoms Cum.',
    nVaccinated: 'Vaccinated',
  }

  private async mounted() {
    this.loadCoronaDetectionRateData()
    this.switchYaml()
  }

  private rkiDetectionRateData: { x?: any[]; y?: any[]; line?: any; name?: string } = {}

  private async loadCoronaDetectionRateData() {
    // Load CSV data of Corona-Datenspende from RKI -- Berlin+Brandenburg only

    const url =
      'https://raw.githubusercontent.com/corona-datenspende/data-updates/master/detections/detection.csv'

    try {
      const response = await fetch(url)
      const csvContents = await response.text()
      const rawdata = Papa.parse(csvContents, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      const region = rawdata.filter((a: any) => a.state_de === 'Berlin')

      const trimmedData = region
        .map(a => {
          return { date: a.date, rkiDetected: this.berlin_population * a.detection_rate_trend }
        })
        .sort((a, b) => (a.date < b.date ? -1 : 1))

      const x = trimmedData.map(a => a.date)
      const y = trimmedData.map(a => a.rkiDetected)

      const plotData = {
        name: 'NEW RKI Detection Rate Trend',
        visible: 'legendonly',
        x,
        y,
        line: {
          dash: 'dot',
          width: 2,
          color: 'rgb(200,0,0)',
        },
      }
      this.rkiDetectionRateData = plotData
    } catch (e) {
      console.warn(e)
    }
  }

  private get prettyInfected() {
    if (!this.cumulativeInfected) return ''

    const rounded = 100 * Math.round(this.cumulativeInfected * 0.01)
    return Number(rounded).toLocaleString()
  }

  private hasBaseRun = false

  private async loadZipFile(whichZip: string) {
    // this.isZipLoaded = false

    const filepath = `${this.BATTERY_URL}${this.runId}/${this.runYaml.zipFolder}/${whichZip}.zip`
    const zloader = new ZipLoader(filepath)
    await zloader.load()

    this.isZipLoaded = true

    return zloader
  }

  private async showActivityLevelPlot() {
    this.showActivityLevels = true
  }

  private hospitalData: any[] = []
  private rValues: any[] = []
  private incidenceHeatMapData: string = ''

  private async runChanged() {
    const ignoreRow = 'Cumulative Hospitalized'

    // load run dataset
    const csv: any[] = await this.loadCSVs(this.currentRun)
    // zip might not yet be loaded
    if (csv.length === 0) return

    this.loadIncidenceHeatMapData(this.currentRun)

    this.loadMutationValues(this.currentRun)

    this.loadRValues(this.currentRun)

    this.loadInfectionsByActivityType(this.currentRun)

    const timeSerieses = this.generateSeriesFromCSVData(csv)

    // cache the result
    this.loadedSeriesData[this.currentRun.RunId] = timeSerieses

    // populate the data where we need it
    this.hospitalData = timeSerieses
    this.data = timeSerieses.filter(row => row.name !== ignoreRow)

    this.updateTotalInfected()
    this.updateVegaCharts()
  }

  private updateVegaCharts() {
    for (const key of Object.keys(this.vegaChartData)) {
      const chart = this.vegaChartData[key]
      // nothing to do if no zip file was specified
      if (!chart.zip || !chart.url) continue

      try {
        const filename = chart.url.replace('$RUN$', this.currentRun.RunId)
        let text = this.zipLoader.extractAsText(filename)
        const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

        const dateBracket = z.data.filter(point => point.date <= this.endDate)

        // if data doesn't go out to end-date, straightline it
        const lastEntry = dateBracket[dateBracket.length - 1]
        if (lastEntry.date < this.endDate) {
          dateBracket.push(lastEntry)
          dateBracket[dateBracket.length - 1].date = this.endDate
        }

        chart.data = dateBracket
      } catch (e) {
        console.log('YEEEARGH')
        console.log(e)
      }
    }
  }

  private updateTotalInfected() {
    const infectedCumulative = this.data.filter(a => a.name === 'Infected Cumulative')[0]

    for (let i = 0; i < infectedCumulative.x.length; i++) {
      if (infectedCumulative.x[i] === this.endDate) {
        // console.log('got it:', infectedCumulative.x[i], infectedCumulative.y[i])
        this.cumulativeInfected = infectedCumulative.y[i]
        return
      }
    }

    // if we got here, date never matched. Just show max.
    this.cumulativeInfected = Math.max(...infectedCumulative.y)
  }

  private sliderChanged(measure: any, value: any) {
    // console.log(measure, value)
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

    // determine: use offset numeral, or offset date?
    if (this.isUsingRealDates) {
      const defaultDate = moment(this.runYaml.defaultStartDate)
      const diff = defaultDate.add(this.plusminus, 'days')
      // console.log(diff)
      lookupKey = lookupKey.replace('undefined', diff.format('YYYY-MM-DD'))
    } else {
      const offsetPrefix = '' + this.plusminus
      lookupKey = lookupKey.replace('undefined', offsetPrefix)
    }

    // console.log(lookupKey)

    this.currentRun = this.runLookup[lookupKey]

    if (!this.currentRun) {
      this.isDataMissing = true
      console.log('Could not find this run in the zip:' + lookupKey)
      return
    }

    this.isDataMissing = false
    this.runChanged()
  }

  private unpack(rows: any[], key: any) {
    let v = rows.map(row => {
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

  private async loadIncidenceHeatMapData(currentRun: any) {
    this.incidenceHeatMapData = ''

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.post.incidenceByAge.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      this.incidenceHeatMapData = text
    } catch (e) {
      // console.log('INCIDENCE HEAT MAP DATA: fail', filename)
    }
  }

  private infectionsByActivityType: any[] = []
  private async loadInfectionsByActivityType(currentRun: any) {
    this.infectionsByActivityType = []

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.infectionsPerActivity.txt.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimiter: '\t',
      })

      this.infectionsByActivityType = z.data
    } catch (e) {
      console.log('INFECTIONSPERACTIVITY: no', filename)
    }
  }

  private async loadRValues(currentRun: any) {
    this.rValues = []

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.rValues.txt.csv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      this.rValues = z.data
    } catch (e) {
      console.log('RVALUES: no', filename)
    }
  }

  private mutationValues: any[] = []

  private async loadMutationValues(currentRun: any) {
    this.mutationValues = []

    if (!currentRun.RunId) return
    if (this.zipLoader === {}) return

    const filename = currentRun.RunId + '.strains.tsv'

    try {
      let text = this.zipLoader.extractAsText(filename)
      const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

      this.mutationValues = z.data
    } catch (e) {
      console.log('MUTATIONS: no', filename)
    }
  }

  private zipLoaderLookup: { [run: string]: any } = {} // holds the ZipLoaders

  private async loadCSVs(currentRun: any) {
    if (!currentRun.RunId) return []

    // get the ZipLoader for this run
    if (this.zipLoaderLookup[currentRun.RunId]) {
      // already loaded! Use cached copy
      this.zipLoader = this.zipLoaderLookup[currentRun.RunId]
    } else {
      // need to load it from disk
      this.zipLoader = await this.loadZipFile(currentRun.RunId)
      this.zipLoaderLookup[currentRun.RunId] = this.zipLoader
    }

    if (this.zipLoader === {}) return []
    if (!this.zipLoader.extractAsText) return []

    const filename = currentRun.RunId + '.infections.txt.csv'
    console.log('Extracting', filename)

    let text = this.zipLoader.extractAsText(filename)
    const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

    return z.data
  }

  private calendarForSimDay(day: number) {
    if (day === -1) return 'General Options'

    const date = moment(this.startDate)
      .add(day - 1, 'days') // Day ONE is first day, so add days BEYOND day one
      .format('MMM DD')

    return date
  }

  private calculateDatefromSimulationDay(day: number) {
    const date = moment(this.startDate)
      .add(this.plusminus, 'days')
      .add(day - 1, 'days') // Day ONE is first day, so add days BEYOND day one
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

    // Add Observed Data
    if (this.observedCases.length > 0) {
      // only add RKI line, because DIVI cumulative doesn't start at the beginning
      // of the epidemic.
      serieses.push(this.observedCases[0])
    }

    // // Add RKI Detection-Rate-Trend Data
    if (this.city === 'berlin' && this.rkiDetectionRateData.x) {
      serieses.push(this.rkiDetectionRateData)
    }

    return serieses
  }

  private async prepareDiviData(newCity: string) {
    const serieses: any[] = []

    if (!this.cityDIVI[newCity]) return serieses

    const response = await fetch(this.cityDIVI[newCity])
    const csvContents = await response.text()
    const data = Papa.parse(csvContents, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    }).data

    const dates: any = []
    const cases: any = []
    let cumulative = 0

    // pull the cases field out of the CSV
    for (const datapoint of data) {
      try {
        const datenstand = datapoint.daten_stand
        const day = datenstand.substring(0, 10)
        // cumulative += datapoint.faelle_covid_aktuell
        // cases.push(cumulative)
        if (datapoint.faelle_covid_aktuell) {
          dates.push(day)
          cases.push(datapoint.faelle_covid_aktuell)
        }
      } catch (e) {
        // well, some lines are badly formatted. ignore them
      }
    }

    serieses.push({
      name: 'Reported: ' + this.cityCap + ' Intensive Care (DIVI)',
      x: dates,
      y: cases,
      line: {
        dash: 'dot',
        width: 2,
        color: 'rgb(0,200,50)',
      },
    })

    // console.log({ DIVI_DATA: serieses })
    return serieses
  }

  private async prepareObservedData(newCity: string) {
    // 1 - RKI DATA

    const response = await fetch(this.cityCSV[newCity])
    const csvContents = await response.text()
    const data = Papa.parse(csvContents, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    }).data

    const xdates: any = []
    const xcases: any = []
    let cumulative = 0

    // pull the cases field out of the CSV
    for (const datapoint of data) {
      const day = datapoint.year + '-' + datapoint.month + '-' + datapoint.day
      xdates.push(day)
      cumulative += datapoint.cases
      xcases.push(cumulative)
    }

    //get the meldedatum
    const responseM = await fetch(this.cityCSVMeldedatum[newCity])
    const csvContentsM = await responseM.text()
    const dataM = Papa.parse(csvContentsM, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    }).data

    const mDates: any = []
    const mCases: any = []
    let mCumulative = 0
    const mOffset = 0

    // pull the cases field out of the CSV
    for (const datapoint of dataM) {
      let dayObject = moment({
        year: datapoint.year,
        month: datapoint.month - 1,
        day: datapoint.day,
      })
      dayObject.add(mOffset, 'days')

      const day = dayObject.format('YYYY-MM-DD')

      mDates.push(day)
      mCumulative += datapoint.cases
      mCases.push(mCumulative)
    }

    //get test data
    const responseT = await fetch(this.cityCSVTests[newCity])
    const csvContentsT = await responseT.text()
    const dataT = Papa.parse(csvContentsT, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    }).data

    const tDates: any = []
    const tCases: any = []
    let tCumulative = 0
    const tOffset = 0

    // pull the cases field out of the CSV
    for (const datapoint of dataT) {
      let dayObject = moment({
        year: datapoint.year,
        month: datapoint.month - 1,
        day: datapoint.day,
      })
      dayObject.add(tOffset, 'days')

      const day = dayObject.format('YYYY-MM-DD')

      tDates.push(day)
      tCumulative += datapoint.cases
      tCases.push(tCumulative)
    }

    // get case surveillance data
    const responseSurv = await fetch(this.cityRKISurveillance[newCity])
    const csvContentsSurv = await responseSurv.text()
    const survData = Papa.parse(csvContentsSurv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimiter: ';',
    }).data

    const sDates: any = []
    const sShare: any = []
    const text: any = []

    // pull the cases field out of the CSV
    for (const xdatapoint of survData) {
      const dateField = xdatapoint['Beginn Meldewoche']
      const year = parseInt(dateField.substring(6, 10))
      const month = parseInt(dateField.substring(3, 5)) - 1
      const zday = parseInt(dateField.substring(0, 2))
      let dayObject = moment({
        year,
        month,
        day: zday,
      })

      const day = dayObject.format('YYYY-MM-DD')
      const estimPositive = xdatapoint['Anteil positiver Tests Lagebericht ' + this.cityCap]

      if (day === 'Invalid date') continue

      sDates.push(day)
      sShare.push(this.scaleRKISurveillanceAnteil * estimPositive)
      text.push(estimPositive)
    }

    console.log({ sDates, sShare })

    const serieses = [
      {
        name: 'RKI ' + this.cityCap + ' Infections',
        x: xdates,
        y: xcases,
        line: {
          dash: 'dot',
          width: 3,
          color: '#080',
        },
      },
      {
        name: 'RKI-Meldedatum ' + this.cityCap,
        x: mDates,
        y: mCases,
        mode: 'markers',
        type: 'scatter',
        marker: { color: '#6d2', size: 3 },
      },
      {
        name: 'Positive Tests ' + this.cityCap,
        x: tDates,
        y: tCases,
        mode: 'markers',
        type: 'scatter',
        marker: { color: '#f42', size: 4 },
      },
      {
        name: 'Reported: Share Positive Tests (ALM e.V.)',
        x: sDates,
        y: sShare,
        text: text,
        mode: 'markers',
        type: 'scatter',
        hovertemplate: '%{text}%',
        marker: { symbol: 'cross', color: '#f80', size: 5 },
      },
    ]
    return serieses
  }

  private async parseInfoTxt(city: string) {
    const filepath = this.BATTERY_URL + this.runId + '/_info.txt'

    const response = await fetch(filepath)
    const text = await response.text()
    const parsed: any = Papa.parse(text, { header: true, dynamicTyping: false })

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
        if (row[measure] === 0 || row[measure]) measures[measure].add('' + row[measure])
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
      measures[measure] = Array.from(measures[measure].keys()).sort((a: any, b: any) =>
        a < b ? -1 : 1
      )
    }

    this.runLookup = runLookup
    this.measureOptions = measures
  }

  private mdParser = new MarkdownIt()

  private async updateNotes() {
    const url = this.BATTERY_URL + this.runId + '/' + this.runYaml.readme

    const response = await fetch(url)

    if (response.status !== 200) return

    const text = await response.text()

    // bad url
    if (text.startsWith('<!DOCTYPE')) return

    this.cityMarkdownNotes = this.mdParser.render(text)
  }

  private get topNotes() {
    if (!this.cityMarkdownNotes) return ''

    const i = this.cityMarkdownNotes.indexOf(this.plotTag)

    if (i < 0) return this.cityMarkdownNotes
    return this.cityMarkdownNotes.substring(0, i)
  }

  private get bottomNotes() {
    if (!this.cityMarkdownNotes) return ''

    const i = this.cityMarkdownNotes.indexOf(this.plotTag)

    if (i < 0) return ''
    return this.cityMarkdownNotes.substring(i + this.plotTag.length)
  }
}

// ###########################################################################
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.hider {
  border-radius: 10rem;
  font-size: 0.6rem;
  margin-left: 1rem;
}

#single-run-viewer {
  display: flex;
  flex-direction: column;
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

.measure {
  margin-bottom: 1rem;
}

.measure-buttons p {
  color: #596;
  margin-right: 1rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.measure-buttons {
  padding-bottom: 0.5rem;
}

.pieces h3 {
  color: #667883;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
  margin: 1rem 1rem 2rem 0rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.content {
  margin-top: 2rem;
  background-color: #eee;
}

.option-groups {
  width: 18rem;
  background-color: white;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  z-index: 10;
  position: sticky;
  top: $navHeight;
}

.option-group {
  padding-bottom: 1rem;
}

.all-plots {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.top-vega-plots {
  margin-top: 1rem;
}

.linear-plot {
  background-color: #f8f8f8;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
}

.linear-plot.activity {
  background-color: white;
  padding: 0.5rem 0.75rem 0.5rem 0rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  border: none;
}

.top-vega-plot {
  background-color: #fff;
  border: none;
}

h5 {
  margin-top: 0.5rem;
}

.plotarea {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 25rem;
}

.plotarea.tall {
  grid-template-rows: 29rem;
}

.plotarea.compact {
  grid-template-rows: 15rem;
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

.plot {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  padding: 1rem 0rem;
}

.plot-options {
  display: flex;
  flex-direction: row;
  margin-top: 2rem;
  margin-bottom: 0.3rem;
}

.infected {
  padding-left: 0.5rem;
  font-weight: bold;
  font-size: 2rem;
  color: rgb(151, 71, 34);
}

.button-choices {
  background-color: white;
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-bottom: 0.25rem;
}

.button-choices button {
  margin-right: 2rem;
}

.title {
  line-height: 1.4rem;
  margin: 0.5rem 0 0.5rem 0;
}

.totally-disabled {
  pointer-events: none;
  opacity: 0.4;
}

.g1 {
  padding: 0rem 0.5rem 1rem 0.5rem;
  border: 1px solid #aaa;
  border-radius: 4px;
}

.cumulative {
  padding-left: 0.5rem;
}

.page-section {
  padding: 0rem 3rem;
}

.base-choice {
  background-color: white;
  padding-top: 0;
  padding-bottom: 0;
}

.preamble {
  display: flex;
  flex-direction: row;
  padding-top: 1rem;
  padding-bottom: 0;
}

.left-side {
  display: flex;
  flex-direction: column;
  margin-right: 3rem;
}

.right-side {
  max-width: 60rem;
  margin: 0 auto;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.results {
  display: flex;
  flex-direction: row;
  padding-top: 1rem;
  padding-bottom: 0;
}

.top-line-stats {
  display: flex;
  flex-direction: row;
  margin-left: auto;
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

.bottom {
  margin-bottom: 3rem;
}

.is-mobile-layout {
  display: none;
}

.is-desktop-layout {
  display: inherit;
}

.selections-and-charts {
  background-color: white;
  display: flex;
  flex-direction: row;
  padding-bottom: 2rem;
}

.readme {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

@media only screen and (max-width: 1024px) {
  .page-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .left-side {
    margin-right: 1rem;
  }

  .option-groups {
    width: 15rem;
  }
}

@media only screen and (max-width: 700px) {
  .linear-plot.activity {
    padding-right: 0.25rem;
  }

  .option-groups {
    width: 100%;
  }
  .left-side {
    margin-right: 0rem;
  }

  .right-side {
    margin: 0 0.5rem;
    max-width: none;
  }

  .selections-and-charts {
    flex-direction: column;
  }

  .option-group p {
    color: #596;
    padding-top: 0.5rem;
    margin-bottom: auto;
    margin-right: 1rem;
    font-size: 0.9rem;
    font-weight: bold;
  }

  .page-section {
    padding: 0 0.5rem;
  }

  td {
    margin-right: auto;
  }

  .preamble {
    padding-top: 1rem;
  }

  .content {
    padding: 0rem 1rem;
  }

  .all-plots {
    display: flex;
    flex-direction: column;
  }

  .plot-options {
    margin-left: 0;
  }

  p.infected {
    margin-bottom: 1rem;
  }

  .pieces {
    margin: 0 0;
    padding: 1rem 0rem;
    display: flex;
    flex-direction: column;
  }

  .linear-plot {
    margin-top: 0.5rem;
    margin-left: 0;
  }

  .results {
    padding-top: 2rem;
    flex-direction: column;
  }

  .top-line-stats {
    flex-direction: column;
  }
}
</style>
