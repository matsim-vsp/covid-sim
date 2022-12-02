<template lang="pug">
.vega-container(v-if="configFile && showChart")
  .main-area(:class="{'is-above': chartYaml.showAbove}")
    .labels
      h4.center(v-if="this.title") {{ this.title }}
      h5.center(v-if="this.description") {{ this.description }}

    .vega-chart(:id="cleanConfigId")
</template>

<script lang="ts">
'use strict'

import vegaEmbed from 'vega-embed'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import moment from 'moment'

@Component({ components: {} })
class VegaLiteChart extends Vue {
  @Prop({ required: true })
  private baseUrl!: string

  @Prop({ required: true })
  private currentRun!: any

  @Prop({ required: true })
  private configFile!: string

  @Prop({ required: true })
  private logScale!: boolean

  @Prop({ required: true })
  private vegaChartData!: {
    [config: string]: { yaml: any; data: { [runId: string]: any[] }; isVisible: boolean }
  }

  private chartYaml: any = {}

  private showChart = false

  private title = ''
  private description = ''

  private loadingText: string = 'Chart'

  private get cleanConfigId() {
    return this.configFile.replace(/[\W_]+/g, '')
  }

  public mounted() {
    this.getVizDetails()
  }

  @Watch('configFile') changedYaml() {
    this.getVizDetails()
  }

  @Watch('vegaChartData') handleDataChanged() {
    this.processInputs()
  }

  @Watch('logScale') handleScaleChanged() {
    this.processInputs()
  }

  private isResizing = false

  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.chartYaml = Object.assign({}, this.chartYaml)
    await this.embedIt()
    this.isResizing = false
  }

  private async getVizDetails() {
    await this.processInputs()
    this.loadingText = ''
  }

  private async processInputs() {
    // make a deep copy of passed-in definition object
    this.chartYaml = JSON.parse(JSON.stringify(this.vegaChartData[this.configFile].yaml))

    // schema
    if (!this.chartYaml.$schema)
      this.chartYaml.$schema = 'https://vega.github.io/schema/vega-lite/v4.json'

    // scale: if it is specified, leave it. Otherwise you log/linear button
    if (!this.chartYaml.encoding?.y?.scale) {
      try {
        this.chartYaml.encoding.y.scale = { type: this.logScale ? 'symlog' : 'linear' }
        if (!this.logScale) delete this.chartYaml.encoding.y.axis
      } catch (e) {}
    }

    // date range. If x-axis is "date"s, then filter them using startDate
    if (this.chartYaml.encoding?.x?.field === 'date') {
      const date = moment(this.$store.state.graphStartDate)
      this.chartYaml.transform = [
        {
          filter: {
            field: 'date',
            gte: { year: date.year(), month: 1 + date.month(), day: date.day() },
          },
        },
      ]
    }

    // fonts
    const size = 13
    const config = {
      axis: {
        titleFontSize: size,
        titleFontWeight: 'normal',
        titleColor: '#555',
        labelColor: '#555',
        labelFontSize: size,
      },
      legend: { labelFontSize: size, labelColor: '#555' },
    }
    if (!this.chartYaml.config) this.chartYaml.config = {}
    this.chartYaml.config = Object.assign(this.chartYaml.config, config)

    // data

    const runId = this.currentRun.RunId
    if (
      this.vegaChartData[this.configFile].data[runId] &&
      this.vegaChartData[this.configFile].data[runId].length
    ) {
      // data passed in is fully-formed
      this.chartYaml.data = { values: this.vegaChartData[this.configFile].data[runId] }
      this.showChart = true
    } else {
      // data url
      if (this.chartYaml.url) {
        this.chartYaml.data = { url: this.chartYaml.url }
        delete this.chartYaml.url
      }
      if (this.chartYaml.data.url && !this.chartYaml.data.url.startsWith('http')) {
        const localUrl = `${this.baseUrl}/${runId}/${this.chartYaml.data.url}`
        this.chartYaml.data = { url: localUrl }
      }
    }

    // title and description
    if (this.chartYaml.title) this.title = this.chartYaml.title
    if (this.chartYaml.description) this.description = this.chartYaml.description
    delete this.chartYaml.title
    delete this.chartYaml.description

    // standard layout
    if (!this.chartYaml.autosize) this.chartYaml.autosize = { type: 'fit', resize: true }
    if (!this.chartYaml.background && !this.chartYaml.showAbove)
      this.chartYaml.background = '#f8f8f8'
    if (!this.chartYaml.width) this.chartYaml.width = 'container'
    if (!this.chartYaml.height) this.chartYaml.height = this.chartYaml.showAbove ? 250 : 350

    await this.embedIt()
  }

  private async embedIt() {
    // await this.$nextTick()
    // save buttons
    const exportActions = { export: true, source: false, compiled: false, editor: false }

    const embedOptions = {
      actions: this.chartYaml.showAbove ? false : exportActions,
      hover: true,
      scaleFactor: 2.0, // make exported PNGs bigger
      padding: { top: 2, left: 8, right: 8, bottom: 8 },
    }

    // don't embed before we've fetched data from zipfile
    try {
      if (!this.chartYaml.data.url) {
        await vegaEmbed(`#${this.cleanConfigId}`, this.chartYaml, embedOptions)
      } else if (this.chartYaml.data.url.indexOf('$RUNS$') === -1) {
        await vegaEmbed(`#${this.cleanConfigId}`, this.chartYaml, embedOptions)
      }
    } catch (e) {
      console.error('VEGA NO BIG DEAL??! ' + e)
      // no chart? no big deal
    }
  }
}

export default VegaLiteChart
</script>

<style scoped>
.vega-container {
  width: 100%;
  display: grid;
  background-color: #f8f8f8;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
}

.main-area {
  padding-top: 1rem;
  grid-row: 1/3;
  grid-column: 1/3;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.is-above {
  padding: 1rem 0rem 0rem 0.5rem;
  background-color: white;
}

h1 {
  margin: 0px auto;
  font-size: 1.5rem;
}

h4 {
  margin: 0px auto;
  font-size: 1.1rem;
  font-weight: bold;
}

p {
  margin: 1rem 1rem;
}

.details {
  font-size: 12px;
}

.bigtitle {
  font-weight: bold;
  font-style: italic;
  font-size: 20px;
  margin: 20px 0px;
}

.info-header {
  background-color: #097c43;
  padding: 0.5rem 0rem;
  border-top: solid 1px #888;
  border-bottom: solid 1px #888;
}

.labels {
  margin-bottom: 1rem;
}

.center-chart {
  margin: 0 auto;
}

.vega-chart {
  width: 100%;
  height: auto;
  margin: 0px auto;
}

.center {
  text-align: center;
}
</style>
