<template lang="pug">
.activity-levels-plot(v-if="!isResizing")
  vue-plotly.activity-plot(:data="dataLines" :layout="layout" :options="options")

  .row-labels(:class="{jakarta: city==='jakarta'}")
    .activity(v-for="row in dataLines" :key="row.name")
      p {{ row.name}}

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import moment from 'moment'
import VuePlotly from '@statnett/vue-plotly'
import { debounce } from 'debounce'
import { indexOf } from 'js-coroutines'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private city!: string
  @Prop({ required: true }) private battery!: string
  @Prop({ required: true }) private currentRun!: any
  @Prop({ required: true }) private startDate!: string
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private plusminus!: number
  @Prop({ required: true }) private zipWorker!: any
  @Prop({ required: true }) private colorMatch!: any

  private dataLines: any[] = []

  private plotNamesColor = [
    'Work',
    'Public Leisure',
    'Private Leisure',
    'Daycare',
    'Primary Ed.',
    'Secondary Ed.',
    'Higher Ed.',
    'Other Ed.',
    'Other NonHome',
  ]
  private mainNamesColor = [
    'workBusiness',
    'leisurePublic',
    'leisurePrivate',
    'dayCare',
    'schools',
    'schools',
    'university',
    'schools',
    'other',
  ]

  private isResizing = false

  private MAX_DAYS = 4000

  private mounted() {
    this.runChanged()
    window.addEventListener('resize', this.handleResize)
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  }

  private handleResize = debounce(this.realHandleResize, 250)
  private async realHandleResize(c: Event) {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('city')
  @Watch('currentRun')
  @Watch('zipWorker')
  private runWasSwitched() {
    this.runChanged()
  }

  private async loadCSV() {
    if (!this.currentRun.RunId) return []
    if (!this.zipWorker) return []

    const filename = this.currentRun.RunId + '.restrictions.txt.csv'
    try {
      const z = await this.zipWorker.extractFile(filename)
      return z.data
    } catch (e) {
      this.$emit('missing', true)
    }
    return []
  }

  private async runChanged() {
    // load run dataset
    const csv: any[] = await this.loadCSV()

    // zip might not yet be loaded
    if (csv.length === 0) return

    const timeSerieses = this.generateSeriesFromCSVData(csv)

    // console.log({ timeSerieses })

    // populate the data where we need it
    this.dataLines = timeSerieses

    this.layout.grid.rows = this.dataLines.length

    // set x-range
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate

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
        title: '', // i == 1 + Math.floor(this.dataLines.length / 2) ? 'Activity Level,  0-100%' : '',
      }
    }
    for (let i = 0; i <= this.dataLines.length; i++) {
      if (this.dataLines[i] != undefined) {
        if (this.plotNamesColor.includes(this.dataLines[i].name)) {
          const index = this.plotNamesColor.indexOf(this.dataLines[i].name)
          let name = this.mainNamesColor[index]
          this.dataLines[i]['line'] = { color: this.colorMatch[name] }
        }
      }
    }
  }

  private activityTypes: any[] = [
    { col: 'work', title: 'Work' },
    { col: 'leisure', title: 'Leisure' },
    { col: 'leisPublic', title: 'Public Leisure' },
    { col: 'leisPrivate', title: 'Private Leisure' },
    { col: 'educ_kiga', title: 'Daycare' },
    { col: 'educ_primary', title: 'Primary Ed.' },
    { col: 'educ_secondary', title: 'Secondary Ed.' },
    { col: 'educ_higher', title: 'Higher Ed.' },
    { col: 'educ_other', title: 'Other Ed.' },
    { col: 'shop_daily', title: 'Other NonHome' },
    { col: 'restaurant', title: 'Restaurant' },

    // JAKARTA
    { col: 'education', title: 'Education' },
    { col: 'shop', title: 'Shop' },
    { col: 'other', title: 'Other' },

    // OLD BERLIN, UNUSED NOW
    // { col: 'educ_tertiary', title: 'Educ: Tertiary' },
    // { col: 'shop_other', title: 'Shopping: Other' },
    // { col: 'visit', title: 'Visits' },
    // { col: 'errands', title: 'Errands' },
    // { col: 'business', title: 'Pers. Business' },
    // { col: 'shopping', title: 'Other Activities' },
  ]

  private skipLeisure = false

  private generateSeriesFromCSVData(data: any[]) {
    const serieses = []

    const days: number[] = this.unpack(data, 'day')
    const x = days.map(d => this.calculateDatefromSimulationDay(d))

    if (Object.keys(data[0]).includes('leisPrivate')) this.skipLeisure = true

    let yaxis = 0
    for (const field of this.activityTypes) {
      const name = field.title
      if (this.skipLeisure && field.col == 'leisure') continue
      try {
        const y: number[] = this.unpack(data, field.col)
        yaxis++
        const trace: any = { x, y, name, type: 'scatter', fill: 'tozeroy' }
        if (yaxis > 1) trace.yaxis = 'y' + yaxis
        serieses.push(trace)
      } catch {
        // skip columns that don't exist
      }
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

  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  private unpack(rows: any[], key: any) {
    let v = rows.map(function(row) {
      if (key === 'day') return row[key]

      const v = 100.0 * parseFloat(row[key].split('_')[0])
      return v
    })

    if (v.length > this.MAX_DAYS) {
      v = v.slice(0, this.MAX_DAYS)
    }

    // maybe the sim ended early - go out to 150 anyway
    if (v.length < this.MAX_DAYS) {
      v.push(key === 'day' ? this.MAX_DAYS : v[v.length - 1])
    }
    return v
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
    autosize: true,
    showlegend: false,
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
      automargin: true,
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      zeroline: true,
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
      showgrid: false,
      showline: false,
    },
    yaxis: {
      automargin: true,
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
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
    // displayModeBar: true,
    displaylogo: false,
    // responsive: true,
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
      filename: 'activity_levels',
      width: 1200,
      height: 600,
      scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
    },
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.activity-levels-plot {
  margin-left: 0rem;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
}

.activity-plot {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}

.row-labels {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  text-align: right;
  display: flex;
  flex-direction: column;
  margin-left: -0.5rem;
  margin-top: 0rem;
  margin-bottom: 0;
}

.row-labels p {
  font-size: 0.8rem;
  text-align: right;
  margin: 0.7rem 0 0 auto;
  line-height: 0.8rem;
  width: min-content;
  height: 1.52rem;
}

.row-labels.jakarta p {
  margin-top: 2rem;
}

@media only screen and (max-width: 640px) {
}
</style>
