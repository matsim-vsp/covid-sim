<template lang="pug">
.mutations-plots(v-if="!isResizing")
  vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")
  vue-plotly.plot1(:data="dataLines2" :layout="layout2" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@/components/VuePlotly.vue'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private values!: any[]
  @Prop({ required: true }) private metadata!: any
  @Prop({ required: true }) private colorMatch!: any

  private plotNamesColor = [
    'work&business',
    'leisPublic',
    'leisPrivate',
    'day care',
    'schools',
    'schools',
    'university',
    'other',
    'pt',
    'home',
  ]
  private mainNamesColor = [
    'workBusiness',
    'leisurePublic',
    'leisurePrivate',
    'dayCare',
    'schools',
    'schools',
    'university',
    'other',
    'pt',
    'home',
  ]

  private color = '#04f'

  private dataLines: any[] = []
  private dataLines2: any[] = []
  private unselectedLines: string[] = []
  private unselectedLines2: string[] = []

  private mounted() {
    this.calculateValues()
    this.unselectLines()
    this.unselectLines2()
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.layout2 = Object.assign({}, this.layout2)
    this.isResizing = false
  }

  private handleRelayout(event: any) {
    if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
      this.calculateValues()
      this.unselectLines()
      this.unselectLines2()
    }
  }

  @Watch('values') private updateValues() {
    this.calculateValues()
    this.unselectLines()
    this.unselectLines2()
  }

  @Watch('logScale') updateScale() {
    if (this.logScale) {
      this.layout.yaxis.type = 'log'
      // this.layout.yaxis.range = [Math.log10(0.05), Math.log10(1.5)]
    } else {
      this.layout.yaxis.type = 'linear'
      // this.layout.yaxis.range = [0, 1.5]
    }
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

    params['plot-1-' + this.metadata.abbreviation] = this.unselectedLines

    try {
      await this.$router.replace({ query: params })
    } catch (e) {
      /** this is OK */
    }
  }

  @Watch('dataLines2', { deep: true }) async updateUrl2() {
    for (let i = 0; i < this.dataLines2.length; i++) {
      if (
        this.dataLines2[i].visible == 'legendonly' &&
        !this.unselectedLines2.includes(this.dataLines2[i].name)
      ) {
        this.unselectedLines2.push(this.dataLines2[i].name)
      } else if (
        this.dataLines2[i].visible != 'legendonly' &&
        this.unselectedLines2.includes(this.dataLines2[i].name)
      ) {
        this.unselectedLines2.splice(this.unselectedLines2.indexOf(this.dataLines2[i].name))
      }
    }

    const params = Object.assign({}, this.$route.query)

    params['plot-2-' + this.metadata.abbreviation] = this.unselectedLines2

    try {
      await this.$router.replace({ query: params })
    } catch (e) {
      /** this is OK */
    }
  }

  private unselectLines() {
    const query = this.$route.query as any
    const name = 'plot-1-' + this.metadata.abbreviation

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

  private unselectLines2() {
    const query = this.$route.query as any
    const name = 'plot-2-' + this.metadata.abbreviation

    if (Object.keys(query).includes(name)) {
      let nameArray = query[name]
      if (!Array.isArray(nameArray)) {
        nameArray = [nameArray]
      }
      for (let i = 0; i < nameArray.length; i++) {
        for (let j = 0; j < this.dataLines2.length; j++) {
          if (this.dataLines2[j].name == nameArray[i]) {
            this.dataLines2[j].visible = 'legendonly'
          }
        }
      }
    }
  }

  private calculateValues() {
    this.dataLines = []
    this.dataLines2 = []
    if (!this.values.length) return

    // generate list of mutation names
    const infections: { [activity: string]: number[] } = {}
    const shares: { [activity: string]: number[] } = {}
    const date: number[] = []

    // get a map (date -> homeInfections). This will be used to make Infections by activity type plot be in relation to home activities.
    // e.g. on xx/xx/2020 date, 1.8x as many infections occured in leisure context as in home.
    // share plot is not affected - jr July2022
    const mapHomeInfections = new Map()

    for (const row of this.values) {
      const act = row.activity
      if (act == 'home') {
        mapHomeInfections.set(row.date, row.infections)
      }
    }

    // process the data
    for (const row of this.values) {
      const act = row.activity
      if (!infections[act]) {
        infections[act] = []
        shares[act] = []
      }

      // update date row
      if (date.length === 0 || row.date !== date[date.length - 1]) date.push(row.date)

      // update infections and shares
      infections[act].push(row.infections / mapHomeInfections.get(row.date))
      shares[act].push(100.0 * row.infectionsShare)
    }

    // console.log({ date, infections, shares })

    // set up the plots
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate
    this.layout2.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout2.xaxis.range[1] = this.endDate

    for (const actType of Object.keys(infections).sort()) {
      let color = 'FFFFFF'

      if (this.plotNamesColor.includes(actType)) {
        const index = this.plotNamesColor.indexOf(actType)
        const name = this.mainNamesColor[index]
        color = this.colorMatch[name]
      }

      this.dataLines.push({
        name: actType,
        visible: true,
        x: date,
        y: infections[actType],
        line: {
          color: color,
        },
        // mode: 'markers',
        // marker: { size: 4 },
      })

      this.dataLines2.push({
        name: actType + ' %',
        visible: true,
        x: date,
        y: shares[actType],
        line: {
          color: color,
        },
        // mode: 'markers',
        // marker: { size: 4 },
      })
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
    margin: { t: 5, r: 10, b: 0, l: 60 },
    xaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: [this.$store.state.graphStartDate, '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: 'linear',
      title: 'Num of Infections (vs. Home)',
      hoverformat: '.1f',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private layout2 = {
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
    margin: { t: 5, r: 10, b: 5, l: 60 },
    xaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: 'linear',
      title: '% Share',
      hoverformat: '.1f',
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

.mutations-plots {
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
