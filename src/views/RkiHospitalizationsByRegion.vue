<i18n>
en:
  badpage: 'That page not found, sorry!'
  mobility-trends: 'Mobility Dashboard'
  remarks: 'Remarks'
  type: 'Select Type:'
  duration: 'Duration'
  distance: 'Travel Distances'
  proportion: 'Proportion of Mobile Persons'
  duration-heading: 'Amount of Time Spent Outside the Home'
  distance-heading: 'Average distance traveled'
  proportion-heading: 'Proportion of mobile persons'
  duration-heading-percent: 'Percent Change in Duration of out of home Activities Compared to Pre-COVID-19'
  week: 'Week'
  weekday: 'Weekday'
  weekend: 'Weekend'
  y-axis-one: 'Zeit pro Tag [h]'
  y-axis-two: 'Distanz pro Person [km/h]'
  y-axis-percent: 'Prozent [%]'
de:
  badpage: 'Seite wurde nicht gefunden.'
  mobility-trends: 'Mobility Dashboard'
  remarks: 'Bemerkungen'
  type: 'Art auswählen:'
  duration: 'Dauer'
  distance: 'Distanz'
  proportion: 'Anteil mobiler Personen'
  duration-heading: 'Zeit, die außerhalb des Hauses verbracht wurde'
  distance-heading: 'Durchschnittlich zurückgelegte Distanz'
  proportion-heading: 'Anteil mobiler Personen'
  duration-heading-percent: 'Prozentuale Veränderung der Dauer außhäusiger Aktivitäten im Vergleich zu vor COVID-19'
  week: 'Woche'
  weekday: 'Wochentag'
  weekend: 'Wochenende'
  y-axis-one: 'Time per Day [h]'
  y-axis-two: 'Distance per Person [km/h]'
  y-axis-percent: 'Percent [%]'
</i18n>

<template lang="pug">
#home
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .page-area
    colophon.colophon

    .left-area
      .plot-area
        h3.badpage(v-if="badPage") {{ $t('badpage') }}

        .goodpage(v-else)
          h2 RKI Hospitalization Data
          p Data from the Robert Koch Institute (RKI) in Germany. Double-click a region name to show data for that line only.

          h5 Scale:
          .buttons.button-choices
            button.button(:class="{'is-link' : status == 2}" @click='clickButton(2)') Linear
            button.button(:class="{'is-link' : status == 1}" @click='clickButton(1)') Log

          .all-plots

            .linear-plot

              h4 7-Day Hospitalization Cases
              .plotarea.tall
                vue-plotly.plotsize(
                  :data="linesCases"
                  :layout="layout"
                  :options="options"
                )

              h4 7-Day Hospitalization Incidence Rate
              .plotarea.tall
                vue-plotly.plotsize(
                  :data="linesRates"
                  :layout="layout"
                  :options="options"
                )

          h5: b {{ $t('remarks') }}:

          p RKI hospitalization data source:&nbsp;
            a(href="https://github.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland") github.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland


          ul(v-if="yaml.notes")
            li.notes-item(v-for="line in yaml.notes" v-html="parseMarkdown(line)")


</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { Route } from 'vue-router'
import MarkdownIt from 'markdown-it'
import Papaparse from 'papaparse'
import VueSlider from 'vue-slider-component'
import VuePlotly from '@statnett/vue-plotly'
import YAML from 'yaml'
import { getHolidays, Region } from 'feiertagejs'

import Colophon from '@/components/Colophon.vue'
import MobilityPlot from '@/components/MobilityPlot.vue'
import MobilityMap from '@/components/MobilityMap.vue'
import 'vue-slider-component/theme/default.css'
import { concat } from 'js-coroutines'
import { PUBLIC_SVN } from '@/Globals'
import { all } from 'mathjs'

type MobilityYaml = {
  description?: string
  notes: string[]
}

@Component({
  components: { VueSlider, Colophon, MobilityPlot, MobilityMap, VuePlotly },
  props: {},
})
export default class VueComponent extends Vue {
  private badPage = false

  private allData: any[] = []
  private loadPage = 'Start Loading'

  private markdownParser = new MarkdownIt()

  private linesCases: any[] = []
  private linesRates: any[] = []
  private hospitalData: any[] = []
  private yaml: any = {}

  private status = 1

  private csvText = require('@/assets/rki-deutschland-hospitalization.csv').default

  @Watch('$route') routeChanged(to: Route, from: Route) {
    this.buildPageForURL()
  }

  private mounted() {
    console.log('hospital. hello')
    console.log(this.csvText)

    this.buildPageForURL()
  }

  private async buildUI() {
    // this.openPage(window.location.href)
    function onlyUnique(value: any, index: number, self: any) {
      return self.indexOf(value) === index
    }

    const regions = this.hospitalData
      .map(row => row['Bundesland'])
      .filter(onlyUnique)
      .sort()

    const allAges = this.hospitalData.filter(row => row['Altersgruppe'] === '00+')

    for (const region of regions) {
      const regionData = allAges.filter(row => row['Bundesland'] === region)

      this.linesCases.push({
        name: region,
        x: regionData.map(row => row['Datum']),
        y: regionData.map(row => row['7T_Hospitalisierung_Faelle']),
        type: 'scatter',
        // mode: 'markers',
        // marker: { size: 4, color: '#f08' },
      })

      this.linesRates.push({
        name: region,
        x: regionData.map(row => row['Datum']),
        y: regionData.map(row => row['7T_Hospitalisierung_Inzidenz']),
        type: 'scatter',
        // mode: 'markers',
        // marker: { size: 4, color: '#f08' },
      })
    }

    this.loadPage = 'Loaded'
  }

  // private async openPage(url: string) {
  //   var urlSplit = url.split('/')
  //   var urlInfo = urlSplit[urlSplit.length - 1]
  //   if (urlInfo == 'duration') {
  //     this.clickButton(1)
  //   } else if (urlInfo == 'distance') {
  //     this.clickButton(2)
  //   } else if (urlInfo == 'proportion-mobile-persons') {
  //     this.clickButton(3)
  //   } else if (urlInfo == 'mobility') {
  //     this.clickButton(1)
  //   }
  // }

  private async clickButton(statusNum: number) {
    this.status = statusNum

    this.layout.yaxis.type = this.status === 1 ? 'log' : 'linear'

    // if (statusNum == 1) {
    //   this.activity = 'outOfHomeDuration'
    //   this.yAxisNAme = 'Time per Day [h]'
    //   this.plotHeading = 'Amount of Time Spent Outside the Home'
    //   window.history.pushState('duration', 'Title', '/mobility/duration')
    // } else if (statusNum == 2) {
    //   this.activity = 'dailyRangePerPerson'
    //   this.yAxisNAme = 'Distance per Person [km]'
    //   this.plotHeading = 'Average distance traveled '
    //   window.history.pushState('distance', 'Title', '/mobility/distance')
    // } else if (statusNum == 3) {
    //   this.activity = 'sharePersonLeavingHome'
    //   this.yAxisNAme = 'Percent [%]'
    //   this.plotHeading = 'Proportion of mobile persons'
    //   window.history.pushState(
    //     'proportion-mobile-persons',
    //     'Title',
    //     '/mobility/proportion-mobile-persons'
    //   )
    // }
  }

  private parseMarkdown(text: string) {
    return this.markdownParser.render(text)
  }

  private async buildPageForURL() {
    this.badPage = false

    this.hospitalData = Papaparse.parse(this.csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      comments: '#',
    }).data

    console.log({ hospitaldata: this.hospitalData })
    this.buildUI()
  }

  private layout: any = {
    // barmode: 'stack',
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
      fixedrange: window.innerWidth < 700,
      type: 'date',
    },
    yaxis: {
      autorange: true,
      // fixedrange: window.innerWidth < 700,
      type: this.status === 1 ? 'log' : 'linear',
      // range: [Math.log10(0.01), Math.log10(2)],
      title: 'Hospitalization',
      hoverformat: '.3f',
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

#home {
  background-color: $paleBackground;
}

.page-area {
  display: flex;
  flex-direction: row-reverse;
}

.colophon {
  padding: 2rem 2rem 1rem 2rem;
  text-align: right;
  font-size: 0.85rem;
  background-color: white;
}

.plot-area {
  max-width: 60rem; //prevc: 70
  width: 100%;
  //width: 1200px;
  margin: 0 auto;
  padding: 2rem 3rem 5rem 3rem; //prev: uncomment
  display: flex;
  flex: 1;
  flex-direction: column;
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
  color: rgb(57, 128, 75);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0 0;
  padding: 0 0;
  font-size: 1.2rem;
  margin-top: 2rem;
  margin-bottom: 0.25rem;
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

.linear-plot {
  margin-top: 0.5rem;
  margin-left: 0;
}

.linear-plot h5 {
  font-weight: bold;
  margin-bottom: 0.5rem;
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

.plotarea.map {
  grid-template-rows: 49rem;
}

.plotarea.compact {
  grid-template-rows: 15rem;
}

.plotarea.activities {
  grid-template-rows: 18rem;
}

.plotsize {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
}

p.plotsize {
  z-index: 10;
  margin: auto auto;
}

.all-plots {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.all-plots {
  display: flex;
  flex-direction: column;
}

.right-side {
  max-width: 60rem;
  margin: 0 auto;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.right-side {
  margin: 0 0.5rem;
  max-width: none;
}

.left-area {
  //background-color: white;
  display: flex;
  flex-direction: column;
  padding-left: 3rem;
  //padding-bottom: 2rem;
  width: 100%;
}

.button-area {
  display: flex;
  flex-direction: column;
  width: 864px;
  margin: 0 auto;
  margin-top: 2rem;
}

.button-area h3 {
  margin-bottom: 1rem;
  font-weight: bold;
  font-size: 1.5rem;
}

.buttons {
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
  padding-bottom: 1rem;
  padding: 0rem 0.5rem 1rem 0.5rem;
  border: 1px solid #aaa;
  border-radius: 4px;
  font-size: 0.75rem;
}

.button:focus {
  background-color: rgb(39, 112, 223);
  color: white;
}

.button-choices {
  background-color: white;
  width: 100%;
  display: flex;
  flex-direction: row;
  //margin-bottom: 0.25rem;
  padding: 0.5rem;
  border-radius: 2px;
  width: max-content;
}

.button-choices button {
  font-size: 0.75rem;
  border-radius: 2px;
  box-shadow: none;
  border: 1px, solid, transparent;
}

@media only screen and (max-width: 950px) {
  .colophon {
    display: none;
  }

  .option-groups {
    grid-template-columns: repeat(1, 1fr);
  }

  .button-area {
    padding: 1rem 3rem 1rem 3rem;
    width: auto;
    margin: 0;
  }

  .button-choices {
    width: max-content;
  }

  .left-area {
    padding: 2rem 1rem;
    flex-direction: column;
  }
}

@media only screen and (max-width: 640px) {
  .columns {
    flex-direction: column;
  }

  .banner {
    padding: 2rem 1rem;
  }

  .button-area {
    padding: 1rem 3rem 1rem 3rem;
    width: auto;
    margin: 0rem 0.5rem;
  }

  .button-choices {
    width: max-content;
  }

  .left-area {
    padding: 2rem 1rem;
    flex-direction: column;
  }

  .option-groups {
    grid-template-columns: repeat(1, 1fr);
  }

  .selections-and-charts {
    flex-direction: column;
  }

  .plot-area {
    margin: 0 0.5rem;
    max-width: none;
  }
}
</style>
