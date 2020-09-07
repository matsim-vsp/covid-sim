<template lang="pug">
#vega-container(v-if="yamlConfig")
  .main-area
    .labels
      h4.center(v-if="this.title") {{ this.title }}
      h5.center(v-if="this.description") {{ this.description }}

    .vega-chart(:id="cleanConfigId"
                :style="{padding: '1rem 1rem'}"
    )
</template>

<script lang="ts">
'use strict'

import vegaEmbed from 'vega-embed'
import yaml from 'yaml'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({ components: {} })
class VegaLiteChart extends Vue {
  @Prop({ required: true })
  private baseUrl!: string

  @Prop({ required: true })
  private runId!: string

  @Prop({ required: true })
  private yamlConfig!: string

  private chartYaml: any = {}

  private title = ''
  private description = ''

  private loadingText: string = 'Chart'

  private get cleanConfigId() {
    return this.yamlConfig.replace(/[\W_]+/g, '')
  }

  public mounted() {
    this.getVizDetails()
  }

  @Watch('yamlConfig') changedYaml() {
    this.getVizDetails()
  }

  private async getVizDetails() {
    this.chartYaml = await this.loadFiles()
    this.processInputs()

    this.loadingText = ''
  }

  private async loadFiles() {
    let json: any = { data: {} }

    try {
      this.loadingText = 'Loading chart...'

      const url = `${this.baseUrl}/${this.runId}/${this.yamlConfig}`
      const response = await fetch(url).then()
      const text = await response.text()
      json = yaml.parse(text)
    } catch (e) {
      console.error({ e })
      this.loadingText = '' + e
      return
    }

    return json
  }

  private processInputs() {
    // schema
    if (!this.chartYaml.$schema)
      this.chartYaml.$schema = 'https://vega.github.io/schema/vega-lite/v4.json'

    // data url
    if (this.chartYaml.url) {
      this.chartYaml.data = { url: this.chartYaml.url }
      delete this.chartYaml.url
    }
    if (this.chartYaml.data.url && !this.chartYaml.data.url.startsWith('http')) {
      const localUrl = `${this.baseUrl}/${this.runId}/${this.chartYaml.data.url}`
      this.chartYaml.data = { url: localUrl }
    }

    // title and description
    if (this.chartYaml.title) this.title = this.chartYaml.title
    if (this.chartYaml.description) this.description = this.chartYaml.description
    this.chartYaml.title = null
    this.chartYaml.description = null

    // standard layout
    if (!this.chartYaml.autosize) this.chartYaml.autosize = { type: 'fit', resize: true }
    if (!this.chartYaml.background) this.chartYaml.background = '#f8f8f8'
    if (!this.chartYaml.width) this.chartYaml.width = 'container'
    if (!this.chartYaml.height) this.chartYaml.height = 350

    // save buttons
    const exportActions = { export: true, source: false, compiled: false, editor: false }
    const embedOptions = {
      actions: exportActions,
      hover: true,
      scaleFactor: 2.0, // make exported PNGs bigger
      padding: { top: 2, left: 8, right: 8, bottom: 8 },
    }

    console.log({ yaml: this.chartYaml })
    vegaEmbed(`#${this.cleanConfigId}`, this.chartYaml, embedOptions)
  }
}

export default VegaLiteChart
</script>

<style scoped>
#vega-container {
  width: 100%;
  display: grid;
  background-color: #f8f8f8;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
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

.main-area {
  padding-top: 1rem;
  grid-row: 1/3;
  grid-column: 1/3;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.labels {
  margin-bottom: 1rem;
}

.center-chart {
  margin: 0 auto;
}

.vega-chart {
  width: 100%;
  max-width: 60rem;
  height: auto;
  margin: 0px auto;
}

.center {
  text-align: center;
}
</style>
