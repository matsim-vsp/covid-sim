<template lang="pug">
#vue-component
  vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import moment from 'moment'
import Papa from 'papaparse'
import SVNFileSystem from '@/util/SVNFileSystem'
import VuePlotly from '@statnett/vue-plotly'
import ZipLoader from 'zip-loader'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private city!: string
  @Prop({ required: true }) private battery!: string
  @Prop({ required: true }) private currentRun!: any
  @Prop({ required: true }) private startDate!: string
  @Prop({ required: true }) private plusminus!: number

  private dataLines: any[] = []

  private zipCache: any = {}
  private zipLoader: any
  private isZipLoaded = false

  private PUBLIC_SVN =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'
  private BATTERY_URL = this.PUBLIC_SVN + 'battery/'

  private MAX_DAYS = 200

  private zipFileName = 'summaries_restrictions.zip'
  private mounted() {
    this.buildActivityLevels()
  }

  @Watch('battery') private updateModelData() {
    this.buildActivityLevels()
  }

  @Watch('currentRun') private runWasSwitched() {
    this.runChanged()
  }

  private async loadZipData() {
    this.isZipLoaded = false

    const filepath = this.BATTERY_URL + this.battery + '/' + this.zipFileName
    console.log(filepath)

    if (this.zipCache[this.city]) {
      // check cache first!
      console.log('using cached zip for!', this.city)
      this.zipLoader = this.zipCache[this.city]
    } else {
      this.zipLoader = new ZipLoader(filepath)
      await this.zipLoader.load()
      console.log('zip loaded!', filepath)
    }

    this.isZipLoaded = true
    this.zipCache[this.city] = this.zipLoader
  }

  private async loadCSV(currentRun: any) {
    if (!currentRun.RunId) return []
    if (!this.zipLoader) return []

    const filename = currentRun.RunId + '.restrictions.txt.csv'
    console.log('Extracting', filename)

    let text = this.zipLoader.extractAsText(filename)
    const z = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })

    return z.data
  }

  private async runChanged() {
    // load run dataset
    const csv: any[] = await this.loadCSV(this.currentRun)

    // zip might not yet be loaded
    if (csv.length === 0) return

    const timeSerieses = this.generateSeriesFromCSVData(csv)

    // cache the result
    // this.loadedSeriesData[this.currentRun.RunId] = timeSerieses

    console.log({ timeSerieses })

    // populate the data where we need it
    this.dataLines = timeSerieses

    this.layout.grid.rows = this.dataLines.length

    for (let i = 2; i <= this.dataLines.length; i++) {
      const key = 'yaxis' + i
      this.layout[key] = {
        zeroline: false,
        showgrid: false,
        showline: false,
        type: 'linear',
        autorange: true,
        autotick: true,
        showticklabels: false,
        ticks: '',
        title: i == 1 + Math.floor(this.dataLines.length / 2) ? 'Activity Level,  0-100%' : '',
      }
    }
  }

  private fields: any[] = [
    { col: 'work', title: 'Work' },
    { col: 'leisure', title: 'Leisure' },
    { col: 'shopping', title: 'Other Activities' },
    { col: 'educ_kiga', title: 'Educ: Kindergarten' },
    { col: 'educ_primary', title: 'Educ: Primary' },
    { col: 'educ_secondary', title: 'Educ: Secondary/Univ' },
  ]

  private generateSeriesFromCSVData(data: any[]) {
    const serieses = []

    const days: number[] = this.unpack(data, 'day')
    const x = days.map(d => this.calculateDatefromSimulationDay(d))

    let yaxis = 0
    for (const field of this.fields) {
      const name = field.title
      const y: number[] = this.unpack(data, field.col)
      yaxis++
      const trace: any = { x, y, name, type: 'scatter', fill: 'tozeroy' }
      if (yaxis > 1) trace.yaxis = 'y' + yaxis
      serieses.push(trace)
    }

    return serieses
  }

  private calculateDatefromSimulationDay(day: number) {
    const date = moment(this.startDate)
      .add(this.plusminus, 'days')
      .add(day - 1, 'days') // Day ONE is first day, so add days BEYOND day one
      .format('YYYY-MM-DD')
    return date
  }

  private unpack(rows: any[], key: any) {
    let v = rows.map(function(row) {
      if (key === 'day') return row[key]

      const v = 100.0 * parseFloat(row[key].split('_')[0])
      return v
    })

    v = v.slice(0, this.MAX_DAYS)

    // maybe the sim ended early - go out to 150 anyway
    if (v.length < this.MAX_DAYS) {
      v.push(key === 'day' ? this.MAX_DAYS : v[v.length - 1])
    }
    return v
  }

  private async buildActivityLevels() {
    // first see if zip exists
    const svnRoot = new SVNFileSystem(this.BATTERY_URL)
    const folderContents = await svnRoot.getDirectory(this.battery)
    if (folderContents.files.indexOf(this.zipFileName) == -1) {
      console.log('ACTIVITY LEVELS:  NO ZIP FILE!')
      return
    }

    // load zip
    await this.loadZipData()

    // build
    this.runChanged()
  }

  private reformatDate(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout: any = {
    grid: {
      rows: this.dataLines.length,
      columns: 1,
      pattern: 'coupled',
      roworder: 'top to bottom',
    },
    height: 225,
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
      zeroline: true,
      range: ['2020-02-09', '2020-08-31'],
      type: 'date',
      showgrid: false,
      showline: false,
    },
    yaxis: {
      type: 'linear',
      zeroline: false,
      showgrid: false,
      showline: false,
      autorange: true,
      autotick: true,
      showticklabels: false,
      title: '',
      ticks: '',
    },
    plot_bgcolor: '#f8f8f800',
    paper_bgcolor: '#f8f8f800',
  }

  private options = {
    displayModeBar: false,
    responsive: true,
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
