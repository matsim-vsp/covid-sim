<i18n>
en:
  badpage: 'That page not found, sorry!'
  mobility-trends: 'Mobility trends'
  remarks: 'Remarks'
de:
  badpage: 'Seite wurde nicht gefunden.'
  mobility-trends: 'Mobility trends'
  remarks: 'Bemerkungen'
</i18n>

<template lang="pug">
#home
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .page-area
    colophon.colophon

    .left-area
      h2 {{ $t('mobility-trends') }}
      h3(:style="{marginBottom: '1rem', color: '#596'}") maybe today's date here?

      h3.badpage(v-if="badPage") {{ $t('badpage') }}

      .goodpage(v-else)
        p(v-if="yaml.description" v-html="topDescription")

        br

        h3(v-if="yaml.notes"): b {{ $t('remarks') }}:

        ul(v-if="yaml.notes")
          li.notes-item(v-for="line in yaml.notes" v-html="parseMarkdown(line)")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { Route } from 'vue-router'
import MarkdownIt from 'markdown-it'
import Papaparse from 'papaparse'
import VueSlider from 'vue-slider-component'
import YAML from 'yaml'

import Colophon from '@/components/Colophon.vue'
import 'vue-slider-component/theme/default.css'

type MobilityYaml = {
  description?: string
  notes: string[]
}

@Component({ components: { VueSlider, Colophon }, props: {} })
export default class VueComponent extends Vue {
  private badPage = false
  private public_svn =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'

  private yaml: MobilityYaml = { description: '', notes: [] }

  private markdownParser = new MarkdownIt()

  private data: any[] = []

  @Watch('$route') routeChanged(to: Route, from: Route) {
    this.buildPageForURL()
  }

  private mounted() {
    this.buildPageForURL()
  }

  private async buildUI() {
    // 1. load .csv file from public_svn/mobilityData/bundeslaender/mobilityData_OverviewBL.csv"
    // 2. Plotly line charts (?) from data, with dropdown to select which Land (default Berlin)
    // 3. Heatmap like the by-age-group plot? Lands on the y-axis and day on the x-axis
    // 4. Shapefile viewer
    //    - with today's data?
    //    - Maybe a popup with a little chart maybe? I dunno
    //    - Or maybe a slider to pick the date?

    this.data = await this.loadMobilityData()
  }

  private async loadMobilityData() {
    const url = this.public_svn + 'mobilityData/bundeslaender/mobilityData_OverviewBL.csv'

    try {
      // load from subversion
      const rawData = await fetch(url).then(response => response.text())
      const parsed = Papaparse.parse(rawData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      // convert dates to ISO format
      const withDates = parsed.map(row => {
        const d = row.date.toString()
        row.date = `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`
        return row
      })

      return withDates
    } catch (e) {
      console.error(e)
    }
    return []
  }

  private parseMarkdown(text: string) {
    return this.markdownParser.render(text)
  }

  private get topDescription() {
    if (!this.yaml.description) return ''
    return this.markdownParser.render(this.yaml.description)
  }

  private async buildPageForURL() {
    this.badPage = false

    const lang = this.$i18n.locale //  === 'de' ? '.de' : ''
    const url = this.public_svn + `mobilityData/bundeslaender/config.${lang}.yaml`

    let responseText = ''

    try {
      const response = await fetch(url)
      responseText = await response.text()
    } catch (e) {
      console.error(e)
    }

    // maybe .de. doesn't exist, fallback .en.:
    if (!responseText && url.indexOf('.de.') > -1) {
      console.warn('no', url, 'falling back to .en.')
      const en_url = url.replace('.de.', '.en.')
      console.log(en_url)
      try {
        const response = await fetch(en_url)
        responseText = await response.text()
      } catch (e) {
        console.error(e)
      }
    }

    if (!responseText) {
      this.badPage = true
      return
    }

    this.yaml = YAML.parse(responseText)

    this.buildUI()
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

#home {
  background-color: $paleBackground;
}

.page-area {
  display: flex;
  flex-direction: row-reverse;
}

.colophon {
  padding: 2rem 2rem 1rem 5rem;
  text-align: right;
  font-size: 0.85rem;
  background-color: white;
}

.left-area {
  max-width: 70rem;
  margin: 0 auto;
  padding: 2rem 3rem 5rem 3rem;
}

h2 {
  font-size: 2rem;
}

h3 {
  font-weight: normal;
  font-size: 1.3rem;
  margin-bottom: -0.5rem;
}

h4 {
  color: #596;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0 0;
  padding: 0 0;
}

.button {
  padding: 0 0.5rem;
  margin: 0 0.15rem 0.15rem 0;
}

p {
  margin-bottom: 1rem;
}

.banner {
  display: flex;
  flex-direction: column;
  padding: 4rem 3rem 1rem 3rem;
  background-color: #1e1f2c;
  color: white;
  background: url(../assets/images/banner.jpg);
  background-repeat: no-repeat;
  background-size: cover;
}

.banner h2 {
  margin-bottom: 0rem;
  font-size: 1.6rem;
  background-color: #1e1f2c;
  line-height: 1.6rem;
  margin-right: auto;
}

.banner h3 {
  font-size: 1.3rem;
  font-weight: normal;
  margin-bottom: 0;
  line-height: 1.4rem;
  padding-bottom: 0.25rem;
  background-color: #1e1f2c;
  width: max-content;
}

.base-buttons {
  margin-bottom: 1rem;
}

.greenbig {
  color: #596;
  font-weight: bold;
  font-size: 2.5rem;
}

.notes-item {
  list-style-type: square;
  margin-left: 1rem;
  margin-top: 0.5rem;
  color: #222;
}

li.notes-item {
  line-height: 1.3rem;
}

.slider {
  margin: 0 0;
  // 0.5rem 0.5rem 0.5rem 0.5rem;
}

.slider-label {
  font-size: 0.9rem;
  line-height: 1.1rem;
  font-weight: bold;
  color: #383ab1;
  margin: 1.5rem 0 0 -1.35rem;
}

.columns {
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
}

.column {
  min-width: fit-content;
  flex: 0;
}

.stretch {
  margin-left: 1rem;
  min-width: unset;
  flex: 1;
}

ul {
  margin-bottom: 1rem;
}

@media only screen and (max-width: 950px) {
  .colophon {
    display: none;
  }

  .option-groups {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media only screen and (max-width: 640px) {
  .columns {
    flex-direction: column;
  }

  .banner {
    padding: 2rem 1rem;
  }

  .left-area {
    padding: 2rem 1rem;
  }

  .option-groups {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
