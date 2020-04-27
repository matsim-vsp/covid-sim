<template lang="pug">
.component
  .content
    .readme(v-html="topNotes")

  .view-section
    battery-viewer.viewer(v-if="yaml" :yaml="yaml")

  .content(v-if="bottomNotes")
    .bottom
      h3 Further Notes
      .readme(v-html="bottomNotes")

</template>

<script lang="ts">
// ###########################################################################
import YAML from 'yaml'
import Papa from 'papaparse'
import * as moment from 'moment'
import MarkdownIt from 'markdown-it'

import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import BatteryViewer from './BatteryViewer.vue'
import { RunYaml } from '@/Globals'
@Component({
  components: {
    BatteryViewer,
  },
})
export default class VueComponent extends Vue {
  private publicPath = process.env.NODE_ENV === 'production' ? '/covid-sim/' : '/'

  private runId: string = ''
  private city: string = ''
  private plusminus = '0'

  private markdown = new MarkdownIt()

  private cityMarkdownNotes: string = ''

  private yaml: any = {}

  private plotTag = '{{PLOTS}}'

  @Watch('$route') async routeChanged(to: any, from: any) {
    console.log(to)
    const newCity = to.params.city
    this.city = newCity // switch city AFTER new data is loaded. Things @watch the city
  }

  public async mounted() {
    console.log({ route: this.$route })

    this.runId = this.$route.params.runId

    console.log('got you: ', this.runId)
    this.yaml = await this.loadYaml()
    this.city = this.yaml.city
    this.updateNotes()
  }

  private async updateNotes() {
    const url = this.yaml.readme
    const response = await fetch(url)

    if (response.status !== 200) return

    const text = await response.text()

    // bad url
    if (text.startsWith('<!DOCTYPE')) return

    this.cityMarkdownNotes = this.markdown.render(text)
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

  private async loadYaml() {
    const url = this.publicPath + this.runId + '.yaml'
    console.log('yaml url:', url)
    const response = await fetch(url)
    const text = await response.text()
    const yml: RunYaml = YAML.parse(text)

    console.log(yml)
    return yml
  }
}

// ###########################################################################
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.content {
  padding: 0rem 3rem;
  margin: 2rem 0 2rem 0;
  max-width: 70em;
  display: flex;
  flex-direction: column;
}

.content h3.select-scenario {
  margin-bottom: 0;
}

.view-section {
  background: white;
  width: 100%;
  padding: 0 3rem;
}

.viewer {
  padding: 0rem 0rem;
  margin: 0rem 0rem;
  max-width: 70em;
  display: flex;
  flex-direction: column;
}

.city-picker {
  display: flex;
  background-color: $bannerHighlight;
  padding: 0.3rem 3rem 0 3rem;
}

.which-city {
  padding: 0rem 2rem 0.2rem 2rem;
  margin-top: 0.1rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: capitalize;
}

a.which-city {
  color: #bbb;
}

.selected {
  padding-top: 0.1rem;
  background-color: $paleBackground;
}

a.selected {
  color: black;
}

.bottom {
  margin-top: 1rem;
}

@media only screen and (max-width: 640px) {
  .content {
    padding: 1rem 1rem;
    margin-top: 1rem;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    row-gap: 1rem;
  }

  .view-section {
    padding: 0 1rem;
  }
  .which-city {
    padding: 0.5rem 1rem;
  }
}
</style>
