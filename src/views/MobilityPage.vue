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
  duration-heading-percent: 'Percent Change in Mobility Levels Compared to Pre-COVID-19'
  week: 'Week'
  weekday: 'Weekday'
  weekend: 'Weekend'
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
  duration-heading-percent: 'Prozentuale Veränderung des Mobilitätsniveaus im Vergleich zu vor COVID-19'
  week: 'Woche'
  weekday: 'Wochentag'
  weekend: 'Wochenende'
</i18n>

<template lang="pug">
#home
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .page-area
    colophon.colophon

    .left-area
      .button-area
         h3 {{ $t('type') }}
         .buttons.button-choices
           button.button(:class="{'is-link' : status == 1}" @click='clickButton(1)') {{ $t('duration') }}
           button.button(:class="{'is-link' : status == 2}" @click='clickButton(2)') {{ $t('distance') }}
           button.button(:class="{'is-link' : status == 3}" @click='clickButton(3)') {{ $t('proportion') }}
      .plot-area
        h2 {{ $t('mobility-trends') }}

        h3.badpage(v-if="badPage") {{ $t('badpage') }}

        .goodpage(v-else)
          p(v-if="yaml.description" v-html="topDescription")

          .all-plots

            .linear-plot

              h5(v-if="status == 1") {{ $t('duration-heading') }} ({{ $t('week') }})
              h5(v-else-if="status == 2") {{ $t('distance-heading') }} ({{ $t('week') }})
              h5(v-else-if="status == 3") {{ $t('proportion-heading') }} ({{ $t('week') }})
              .plotarea.tall
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot.plotsize(v-else
                    :data="formattedData" :outOfHomeDurationPlot="true"
                    :yAxisName="yAxisNAme" :plotInterval="[-1, 3, 3]"
                    :activity="activity")

              br

              h5(v-if="status == 1") {{ $t('duration-heading') }} ({{ $t('weekday') }})
              h5(v-else-if="status == 2") {{ $t('distance-heading') }} ({{ $t('weekday') }})
              h5(v-else-if="status == 3") {{ $t('proportion-heading') }} ({{ $t('weekday') }})
              .plotarea.tall
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot.plotsize(v-else
                    :data="formattedData" :outOfHomeDurationPlot="true"
                    :yAxisName="yAxisNAme" :plotInterval="[-2,2,2]"
                    :activity="activity")

              br

              h5(v-if="status == 1") {{ $t('duration-heading') }} ({{ $t('weekend') }})
              h5(v-else-if="status == 2") {{ $t('distance-heading') }} ({{ $t('weekend') }})
              h5(v-else-if="status == 3") {{ $t('proportion-heading') }} ({{ $t('weekend') }})
              .plotarea.tall
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot.plotsize(v-else
                    :data="formattedData" :outOfHomeDurationPlot="true"
                    :yAxisName="yAxisNAme" :plotInterval="[2, 1, 0]"
                    :activity="activity")

              br

              h5(v-if="status == 1") {{ $t('duration-heading-percent') }}
              .plotarea.tall(v-if="status == 1")
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot.plotsize(v-else
                    :data="formattedData" :outOfHomeDurationPlot="false"
                    :yAxisName="'Percent [%]'" :plotInterval="[-1, 3, 3]"
                    :activity="activity")
                

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
import { getHolidays } from 'feiertagejs'

import Colophon from '@/components/Colophon.vue'
import MobilityPlot from '@/components/MobilityPlot.vue'
import 'vue-slider-component/theme/default.css'
import { concat } from 'js-coroutines'

type MobilityYaml = {
  description?: string
  notes: string[]
}

@Component({
  components: { VueSlider, Colophon, MobilityPlot },
  props: {},
})
export default class VueComponent extends Vue {
  private badPage = false
  private public_svn =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'

  private yaml: MobilityYaml = { description: '', notes: [] }

  private markdownParser = new MarkdownIt()

  private data: any[] = []
  private rangeData: any[] = []
  private dataLoadingFail = false
  private formattedData: any[] = []
  private allBundeslaender: any[] = []
  private status = 1
  private activity = 'outOfHomeDuration'
  private yAxisNAme = 'Time per Day [h]'
  private plotHeading = 'Amount of Time Spent Outside the Home'

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

    this.openPage(window.location.href)

    this.data = await this.loadMobilityData()
    this.allBundeslaender = await this.loadBundeslaender()
    this.rangeData = await this.loadRange()
    this.formattedData = await this.formatData()
  }

  private async loadBundeslaender() {
    var returnData: any[] = []
    for (let i = 0; i < this.data.length; i++) {
      if (!returnData.includes(this.data[i].BundeslandID)) {
        returnData.push(this.data[i].BundeslandID)
      }
    }

    return returnData
  }

  private async openPage(url: string) {
    var urlSplit = url.split('/')
    var urlInfo = urlSplit[urlSplit.length - 1]
    if (urlInfo == 'duration') {
      this.clickButton(1)
    } else if (urlInfo == 'distance') {
      this.clickButton(2)
    } else if (urlInfo == 'proportion-mobile-persons') {
      this.clickButton(3)
    } else if (urlInfo == 'mobility') {
      this.clickButton(1)
    }
  }

  private async clickButton(statusNum: number) {
    this.status = statusNum
    if (statusNum == 1) {
      this.activity = 'outOfHomeDuration'
      this.yAxisNAme = 'Time per Day [h]'
      this.plotHeading = 'Amount of Time Spent Outside the Home'
      window.history.pushState('duration', 'Title', '/mobility/duration')
    } else if (statusNum == 2) {
      this.activity = 'dailyRangePerPerson'
      this.yAxisNAme = 'Distance per Person [km]'
      this.plotHeading = 'Average distance traveled '
      window.history.pushState('distance', 'Title', '/mobility/distance')
    } else if (statusNum == 3) {
      this.activity = 'sharePersonLeavingHome'
      this.yAxisNAme = 'Percent [%]'
      this.plotHeading = 'Proportion of mobile persons'
      window.history.pushState(
        'proportion-mobile-persons',
        'Title',
        '/mobility/proportion-mobile-persons'
      )
    }
  }

  private async loadRange() {
    const url = this.public_svn + 'mobilityData/bundeslaender/range_OverviewBL.csv'

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
      this.dataLoadingFail = true
      console.error(e)
    }
    return []
  }

  private async formatData() {
    var returnData: any[] = []

    for (let i = 0; i < this.allBundeslaender.length; i++) {
      var bundesland = {
        name: this.allBundeslaender[i],
        date: [],
        outOfHomeDuration: [],
        percentageChangeComparedToBeforeCorona: [],
        sharePersonLeavingHome: [],
        dailyRangePerPerson: [],
        holidays: [],
      }
      returnData.push(bundesland)
    }

    for (let i = 0; i < this.data.length; i++) {
      this.allBundeslaender.indexOf(this.data[i].BundeslandID)
      returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].date.push(
        this.data[i].date
      )
      returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].outOfHomeDuration.push(
        this.data[i].outOfHomeDuration
      )
      returnData[
        this.allBundeslaender.indexOf(this.data[i].BundeslandID)
      ].percentageChangeComparedToBeforeCorona.push(
        this.data[i].percentageChangeComparedToBeforeCorona
      )
    }

    for (let i = 0; i < this.allBundeslaender.length; i++) {
      if (this.allBundeslaender[i] == 'Baden-Württemberg') {
        var holidays = getHolidays('2020', 'BW')
        holidays = holidays.concat(getHolidays('2021', 'BW'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Hessen') {
        var holidays = getHolidays('2020', 'HE')
        holidays = holidays.concat(getHolidays('2021', 'HE'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Berlin') {
        var holidays = getHolidays('2020', 'BE')
        holidays = holidays.concat(getHolidays('2021', 'BE'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Brandenburg') {
        var holidays = getHolidays('2020', 'BB')
        holidays = holidays.concat(getHolidays('2021', 'BB'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Sachsen') {
        var holidays = getHolidays('2020', 'SN')
        holidays = holidays.concat(getHolidays('2021', 'SN'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Bayern') {
        var holidays = getHolidays('2020', 'BY')
        holidays = holidays.concat(getHolidays('2021', 'BY'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Nordrhein-Westfalen') {
        var holidays = getHolidays('2020', 'NW')
        holidays = holidays.concat(getHolidays('2021', 'NW'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Hamburg') {
        var holidays = getHolidays('2020', 'HH')
        holidays = holidays.concat(getHolidays('2021', 'HH'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Mecklenburg-Vorpommern') {
        var holidays = getHolidays('2020', 'MV')
        holidays = holidays.concat(getHolidays('2021', 'MV'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Niedersachsen') {
        var holidays = getHolidays('2020', 'NI')
        holidays = holidays.concat(getHolidays('2021', 'NI'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Deutschland') {
        var holidays = getHolidays('2020', 'BUND')
        holidays = holidays.concat(getHolidays('2021', 'BUND'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Bremen') {
        var holidays = getHolidays('2020', 'HB')
        holidays = holidays.concat(getHolidays('2021', 'HB'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Thüringen') {
        var holidays = getHolidays('2020', 'TH')
        holidays = holidays.concat(getHolidays('2021', 'TH'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Saarland') {
        var holidays = getHolidays('2020', 'SL')
        holidays = holidays.concat(getHolidays('2021', 'SL'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Sachsen-Anhalt') {
        var holidays = getHolidays('2020', 'ST')
        holidays = holidays.concat(getHolidays('2021', 'ST'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Rheinland-Pfalz') {
        var holidays = getHolidays('2020', 'RP')
        holidays = holidays.concat(getHolidays('2021', 'RP'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      } else if (this.allBundeslaender[i] == 'Schleswig-Holstein') {
        var holidays = getHolidays('2020', 'SH')
        holidays = holidays.concat(getHolidays('2021', 'SH'))
        for (let j = 0; j < holidays.length; j++) {
          returnData[this.allBundeslaender.indexOf(this.data[i].BundeslandID)].holidays.push(
            holidays[j].dateString
          )
        }
      }
    }

    for (let i = 0; i < this.rangeData.length; i++) {
      this.allBundeslaender.indexOf(this.rangeData[i].BundeslandID)
      returnData[
        this.allBundeslaender.indexOf(this.rangeData[i].BundeslandID)
      ].sharePersonLeavingHome.push(this.rangeData[i].sharePersonLeavingHome)
      returnData[
        this.allBundeslaender.indexOf(this.rangeData[i].BundeslandID)
      ].dailyRangePerPerson.push(this.rangeData[i].dailyRangePerPerson)
    }
    console.log(returnData)
    return returnData
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
      this.dataLoadingFail = true
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
