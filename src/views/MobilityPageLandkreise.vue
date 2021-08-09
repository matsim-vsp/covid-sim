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
  duration-heading-percent: 'Percent Change in Mobility Levels Compared to Pre-COVID-19 (Week)'
  nightly-activity: 'Nighttime activities (10 p.m. - 5 a.m.)'
  week: 'Week'
  weekday: 'Weekday'
  weekend: 'Weekend'
  y-axis-one: 'Zeit pro Tag [h]'
  y-axis-two: 'Distanz pro Person [km/h]'
  y-axis-percent: 'Prozent [%]'
  start-date: 'Start Date'
  end-date: 'End Date'
  germany-map: 'Difference Map'
  county: 'County Comparison'
  tart-end-date: 'Start- and End-Date'
  time: 'Time period'
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
  duration-heading-percent: 'Prozentuale Veränderung der Dauer außhäusiger Aktivitäten im Vergleich zu vor COVID-19 (Woche)'
  nightly-activity: 'Nächtliche Aktivitäten (22.00 - 5.00 Uhr)'
  week: 'Woche'
  weekday: 'Wochentag'
  weekend: 'Wochenende'
  y-axis-one: 'Time per Day [h]'
  y-axis-two: 'Distance per Person [km/h]'
  y-axis-percent: 'Percent [%]'
  start-date: 'Start-Datum'
  end-date: 'End-Datum'
  germany-map: 'Differenzkarte'
  county: 'Landkreis Vergleich'
  start-end-date: 'Start- und Enddatum'
  time: 'Zeitraum'
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
           button.button(:class="{'is-link' : status == 4}" @click='clickButton(4)') {{ $t('nightly-activity') }}
         h3 {{ $t('time') }}
         .buttons.button-choices
           button.button(:class="{'is-link' : statusTime == 5}" @click='clickButton(5)') {{ $t('week') }}
           button.button(:class="{'is-link' : statusTime == 6}" @click='clickButton(6)') {{ $t('weekday') }}
           button.button(:class="{'is-link' : statusTime == 7}" @click='clickButton(7)') {{ $t('weekend') }}
         h3 {{ $t('start-end-date') }}
         .button-row
          .dateselect.date-choices(v-if="statusTime == 5 || statusTime == 7")
            
            select.select-menue(v-model='startdate')
              option(v-for="date in allWeekDates") {{ date }}
          .dateselect.date-choices(v-if="statusTime == 6")
            
            select.select-menue(v-model='startdate')
              option(v-for="date in allWeekdayDates") {{ date }}
          .dateselect.date-choices(v-if="statusTime == 5 || statusTime == 7")
            
            select.select-menue(v-model='enddate')
              option(v-for="date in allWeekDates") {{ date }}
          .dateselect.date-choices(v-if="statusTime == 6")
            
            select.select-menue(v-model='enddate')
              option(v-for="date in allWeekdayDates") {{ date }}

         h3(v-if="yaml.info"): b {{ $t('remarks') }}:

         ul(v-if="yaml.info")
          li.notes-item(v-for="line in yaml.info" v-html="parseMarkdown(line)")
         
          
          

      .plot-area
        h2 {{ $t('mobility-trends') }}

        h3.badpage(v-if="badPage") {{ $t('badpage') }}

        .goodpage(v-else)
          p(v-if="yaml.description" v-html="topDescription")

          .all-plots

            .linear-plot

              h5 {{ $t('germany-map') }}
                .plotarea.map
                  mobility-map.plotsize(
                    :landkreisData="allData", :activity="activity", :startDate="startdate", :endDate="enddate" :time="weekInterval"
                    :mapping="mappingData" @landkreisClicked="handleLandkreisClicked"
                  )

              br

              .button-area
                h3 {{ $t('county') }}
                .button-row
                    .dateselect.date-choices
                      select.select-menue(v-model='selectedLandkreisOne')
                        option(v-for="element in allLandkreise") {{ element }}
                    .dateselect.date-choices
                      select.select-menue(v-model='selectedLandkreisTwo')
                        option(v-for="element in allLandkreise") {{ element }}

              h5(v-if="status == 1") {{ $t('duration-heading') }} ({{ $t('week') }})
              h5(v-else-if="status == 2") {{ $t('distance-heading') }} ({{ $t('week') }})
              h5(v-else-if="status == 3") {{ $t('proportion-heading') }} ({{ $t('week') }})
              h5(v-else-if="status == 4") {{ $t('nightly-activity') }} ({{ $t('week') }})
              .plotarea.tall
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot-landkreise.plotsize(v-else
                    :landkreis="selectedLandkreisOne" :data="allData"
                    :kind="activity" :week="'week'"
                    :yAxisName="yAxisNAme" :landkreisTwo="selectedLandkreisTwo")

              br

              h5(v-if="status == 1") {{ $t('duration-heading') }} ({{ $t('weekday') }})
              h5(v-else-if="status == 2") {{ $t('distance-heading') }} ({{ $t('weekday') }})
              h5(v-else-if="status == 3") {{ $t('proportion-heading') }} ({{ $t('weekday') }})
              h5(v-else-if="status == 4") {{ $t('nightly-activity') }} ({{ $t('weekday') }})
              .plotarea.tall
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot-landkreise.plotsize(v-else
                    :landkreis="selectedLandkreisOne" :data="allData"
                    :kind="activity" :week="'weekday'"
                    :yAxisName="yAxisNAme" :landkreisTwo="selectedLandkreisTwo")

              br

              h5(v-if="status == 1") {{ $t('duration-heading') }} ({{ $t('weekend') }})
              h5(v-else-if="status == 2") {{ $t('distance-heading') }} ({{ $t('weekend') }})
              h5(v-else-if="status == 3") {{ $t('proportion-heading') }} ({{ $t('weekend') }})
              h5(v-else-if="status == 4") {{ $t('nightly-activity') }} ({{ $t('weekend') }})
              .plotarea.tall
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot-landkreise.plotsize(v-else
                    :landkreis="selectedLandkreisOne" :data="allData"
                    :kind="activity" :week="'weekend'"
                    :yAxisName="yAxisNAme" :landkreisTwo="selectedLandkreisTwo")

              br

              h5(v-if="status == 1") {{ $t('duration-heading-percent') }}
              .plotarea.tall(v-if="status == 1")
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot-landkreise.plotsize(v-else
                    :landkreis="selectedLandkreisOne" :data="allData"
                    :kind="activity" :week="'week'" :yAxisName="'Percent [%]'" 
                    :landkreisTwo="selectedLandkreisTwo" :percent="true")

              

              

          h3(v-if="yaml.notes"): b {{ $t('remarks') }}:

          ul(v-if="yaml.notes")
            li.notes-item(v-for="line in yaml.notes" v-html="parseMarkdown(line)")


</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Route } from 'vue-router'
import MarkdownIt from 'markdown-it'
import Papaparse from 'papaparse'
import VueSlider from 'vue-slider-component'
import YAML from 'yaml'

import Colophon from '@/components/Colophon.vue'
import MobilityPlot from '@/components/MobilityPlot.vue'
import MobilityPlotLandkreise from '@/components/MobilityPlotLandkreise.vue'
import MobilityMap from '@/components/MobilityMap.vue'
import 'vue-slider-component/theme/default.css'
import { string } from 'mathjs'

type MobilityYaml = {
  description?: string
  notes: string[]
  info: string[]
}

@Component({
  components: { VueSlider, Colophon, MobilityPlot, MobilityMap, MobilityPlotLandkreise },
  props: {},
})
export default class VueComponent extends Vue {
  private badPage = false
  private public_svn =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'

  private landkreise = this.public_svn + 'mobilityData/landkreise'
  private mobility = '/LK_mobilityData_'
  private range = '/LK_Range_'
  private timeline = '/LK_nightHoursSum_'
  private weekdays = 'weekdays.csv'
  private weekdaysTimeline = 'weekdays.csv'
  private weekends = 'weekends.csv'
  private weekly = 'weekly.csv'
  private selectedLandkreisOne = 'Berlin'
  private selectedLandkreisTwo = 'Deutschland'

  private minWeekMobility = 10000
  private maxWeekMobility = 0
  private absolutDiff = 0

  private startdate = '2020-03-08'
  private enddate = '2020-03-08'

  private startDateWeek = ''
  private endDateWeek = ''
  private startDateWeekday = ''
  private endDateWeekday = ''

  private yaml: MobilityYaml = { description: '', notes: [], info: [] }

  private markdownParser = new MarkdownIt()

  private mobilityWeekdays: any[] = []
  private mobilityWeekends: any[] = []
  private mobilityWeekly: any[] = []

  private rangeWeeends: any[] = []
  private rangeWeekly: any[] = []
  private rangeWeekdays: any[] = []

  private timelineyWeekdays: any[] = []
  private timelineWeekends: any[] = []
  private timelineWeekly: any[] = []

  private allLandkreise: any[] = []
  private allWeekDates: any[] = []
  private allWeekdayDates: any[] = []
  private mappingData = {} as any
  private mappingDataReverse = {} as any

  private allData: any[] = []
  private status = 1
  private statusTime = 5
  private weekInterval = 'week'
  private activity = 'outOfHomeDuration'
  private yAxisNAme = 'Time per Day [h]'
  private plotHeading = 'Amount of Time Spent Outside the Home'
  private dataLoadingFail = false

  private queryParameter = {
    county_one: '',
    county_two: '',
    date_one: '',
    date_two: '',
  }

  @Watch('$route') routeChanged(to: Route, from: Route) {
    this.buildPageForURL()
  }

  private async mounted() {
    await this.loadAllData()
    await this.buildPageForURL()
  }

  private handleLandkreisClicked(landkreis: number) {
    this.selectedLandkreisOne = this.mappingDataReverse[landkreis]
  }

  private async loadAllData() {
    this.mobilityWeekends = await this.loadLandkreisData(
      this.landkreise + this.mobility + this.weekends
    )

    this.mobilityWeekly = await this.loadLandkreisData(
      this.landkreise + this.mobility + this.weekly
    )

    this.mobilityWeekdays = await this.loadLandkreisData(
      this.landkreise + this.mobility + this.weekdays
    )

    this.timelineWeekends = await this.loadLandkreiseTimeline(
      this.landkreise + this.timeline + this.weekends
    )

    this.timelineyWeekdays = await this.loadLandkreiseTimeline(
      this.landkreise + this.timeline + this.weekdaysTimeline
    )

    console.log(this.timelineyWeekdays)

    this.timelineWeekly = await this.loadLandkreiseTimeline(
      this.landkreise + this.timeline + this.weekly
    )

    //this.mobilityWeekdays[i].date

    this.rangeWeeends = await this.loadRangeData(this.landkreise + this.range + this.weekends)
    this.rangeWeekly = await this.loadRangeData(this.landkreise + this.range + this.weekly)
    this.rangeWeekdays = await this.loadRangeData(this.landkreise + this.range + this.weekdays)

    this.loadAllLandkreise()

    this.mappingData = await this.mappingGeojsonToCsv(this.landkreise + '/mapping_shape_to_csv.csv')
    this.mappingDataReverse = await this.mappingGeojsonToCsvReversed(
      this.landkreise + '/mapping_shape_to_csv.csv'
    )

    this.combineData()

    console.log(this.allData)

    this.updateLandkreisNames()

    if (this.statusTime == 5 || this.statusTime == 7) {
      this.startdate = this.allWeekDates[0]
      this.enddate = this.allWeekDates[this.allWeekDates.length - 1]
    } else if (this.statusTime == 6) {
      this.startdate = this.allWeekdayDates[0]
      this.enddate = this.allWeekdayDates[this.allWeekdayDates.length - 1]
    }

    this.allData.sort()
    await this.openPage(window.location.href)
    console.log(window.location.href)
    console.log(this.allData)
  }

  private async buildUI() {
    this.openPage(window.location.href)
  }

  private async loadRangeData(url: string) {
    try {
      const rawData = await fetch(url).then(response => response.text())
      const parsed = Papaparse.parse(rawData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

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

  private async mappingGeojsonToCsvReversed(url: string) {
    var returnObj = {} as any
    try {
      const rawData = await fetch(url).then(response => response.text())
      const parsed = Papaparse.parse(rawData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      parsed.map(row => {
        const csvName = row.csv_name
        const jsonID = row.id_2
        returnObj[jsonID] = csvName
      })

      return returnObj
    } catch (e) {
      this.dataLoadingFail = true
      console.error(e)
    }
  }

  private async mappingGeojsonToCsv(url: string) {
    var returnObj = {} as any
    try {
      const rawData = await fetch(url).then(response => response.text())
      const parsed = Papaparse.parse(rawData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      parsed.map(row => {
        const csvName = row.csv_name
        const jsonID = row.id_2
        returnObj[csvName] = jsonID
      })

      return returnObj
    } catch (e) {
      this.dataLoadingFail = true
      console.error(e)
    }
  }

  private updateLandkreisNames() {}

  private combineData() {
    for (var i = 0; i < this.allLandkreise.length; i++) {
      this.allData[this.allLandkreise[i]] = []
      this.allData[this.allLandkreise[i]]['week'] = []
      this.allData[this.allLandkreise[i]]['weekend'] = []
      this.allData[this.allLandkreise[i]]['weekday'] = []
    }

    for (var i = 0; i < this.mobilityWeekends.length; i++) {
      var landkreis = this.mobilityWeekends[i].Landkreis
      var date = this.mobilityWeekends[i].date
      var duration = this.mobilityWeekends[i].outOfHomeDuration
      var dailyRange = this.rangeWeeends[i].dailyRangePerPerson
      var sharePerson = this.rangeWeeends[i].sharePersonLeavingHome

      if (!this.allWeekDates.includes(date)) {
        this.allWeekDates.push(date)
      }

      if (this.allData[landkreis] !== undefined) {
        this.allData[landkreis]['weekend'][date] = {
          outOfHomeDuration: duration,
          percentageChangeComparedToBeforeCorona: this.mobilityWeekends[i]
            .percentageChangeComparedToBeforeCorona,
          sharePersonLeavingHome: sharePerson,
          dailyRangePerPerson: dailyRange,
          endHomeActs: 0,
        }
      }
    }

    for (var i = 0; i < this.mobilityWeekdays.length; i++) {
      var landkreis = this.mobilityWeekdays[i].Landkreis
      var date = this.mobilityWeekdays[i].date
      var dailyRange = this.rangeWeekdays[i].dailyRangePerPerson
      var sharePerson = this.rangeWeekdays[i].sharePersonLeavingHome
      if (!this.allWeekdayDates.includes(date)) {
        this.allWeekdayDates.push(date)
      }
      var duration = this.mobilityWeekdays[i].outOfHomeDuration
      //console.log(duration)
      if (this.allData[landkreis] !== undefined) {
        this.allData[landkreis]['weekday'][date] = {
<<<<<<< HEAD
          outOfHomeDuration: this.mobilityWeekdays[i].outOfHomeDuration,
=======
          outOfHomeDuration: duration,
>>>>>>> mobility
          percentageChangeComparedToBeforeCorona: this.mobilityWeekdays[i]
            .percentageChangeComparedToBeforeCorona,
          sharePersonLeavingHome: sharePerson,
          dailyRangePerPerson: dailyRange,
          endHomeActs: 0,
        }
      }
    }

    for (var i = 0; i < this.mobilityWeekly.length; i++) {
      var landkreis = this.mobilityWeekly[i].Landkreis
      var date = this.rangeWeekly[i].date
      var dailyRange = this.rangeWeekly[i].dailyRangePerPerson
      var sharePerson = this.rangeWeekly[i].sharePersonLeavingHome
      if (landkreis == 'Landkreis St, Wendel') {
        landkreis = 'Landkreis St. Wendel'
      } else if (landkreis == 'Cottbus - Chó?ebuz') {
        landkreis = 'Cottbus - Chóśebuz'
      }
      var duration = this.mobilityWeekly[i].outOfHomeDuration
      if (typeof duration == 'string') {
        duration = parseFloat(duration.replace(',', '.'))
      }

      if (this.allData[landkreis] !== undefined) {
        this.allData[landkreis]['week'][date] = {
          outOfHomeDuration: duration,
          percentageChangeComparedToBeforeCorona: this.mobilityWeekly[i]
            .percentageChangeComparedToBeforeCorona,
          sharePersonLeavingHome: sharePerson,
          dailyRangePerPerson: dailyRange,
          endHomeActs: 0,
        }
      }
    }

    for (var i = 0; i < this.timelineWeekends.length; i++) {
      var date = this.timelineWeekends[i].date
      var area = this.timelineWeekends[i].area
      var sum = this.timelineWeekends[i]['22-5']

      if (this.allData[area] !== undefined) {
        if (sum < this.minWeekMobility) {
          this.minWeekMobility = sum
        }
        if (sum > this.maxWeekMobility) {
          this.maxWeekMobility = sum
        }
        this.allData[area]['weekend'][date].endHomeActs = sum
      }
    }

    for (var i = 0; i < this.timelineyWeekdays.length; i++) {
      var date = this.timelineyWeekdays[i].date
      var area = this.timelineyWeekdays[i].area
      var sum = this.timelineyWeekdays[i]['22-5']
      if (this.allData[area] !== undefined) {
        if (sum > this.maxWeekMobility) {
          this.maxWeekMobility = sum
        }
        if (sum < this.minWeekMobility) {
          this.minWeekMobility = sum
        }
        this.allData[area]['weekday'][date].endHomeActs = sum
        console.log(sum)
      }
    }

    for (var i = 0; i < this.timelineWeekly.length; i++) {
      var date = this.timelineWeekly[i].date
      var area = this.timelineWeekly[i].area
      var sum = this.timelineWeekly[i]['22-5']
      if (this.allData[area] !== undefined) {
        if (sum > this.maxWeekMobility) {
          this.maxWeekMobility = sum
        }
        if (sum < this.minWeekMobility) {
          this.minWeekMobility = sum
        }
        this.allData[area]['week'][date].endHomeActs = sum
      }
    }
  }

  private async loadAllLandkreise() {
    for (var i = 0; i < 402; i++) {
      var landkreis = this.mobilityWeekends[i].Landkreis
      if (landkreis != 'Landau in der Pfalz') {
        this.allLandkreise.push(landkreis)
      }
    }
    this.allLandkreise.sort()
  }

  private async loadLandkreiseTimeline(url: string) {
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
        row.date = `20${d.substring(6, 8)}-${d.substring(3, 5)}-${d.substring(0, 2)}`
        return row
      })

      return withDates
    } catch (e) {
      this.dataLoadingFail = true
      console.error(e)
    }
    return []
  }

  private async loadLandkreisData(url: string) {
    try {
      // load from subversion
      const rawData = await fetch(url).then(response => response.text())
      const parsed = Papaparse.parse(rawData, {
        delimiter: ';',
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

  // for (let thing of this.data[i])

  /*

  private async loadBundeslaender() {
    var returnData: any[] = []
    for (let i = 0; i < this.data.length; i++) {
      if (!returnData.includes(this.data[i].BundeslandID)) {
        returnData.push(this.data[i].BundeslandID)
      }
    }

    return returnData
  }
  */

  private async openPage(url: string) {
    var querySetting = this.$route.query
    if (querySetting.date_one !== undefined) {
      this.startdate = querySetting.date_one as string
      this.queryParameter.date_one = querySetting.date_one as string
    }
    if (querySetting.date_two !== undefined) {
      this.enddate = querySetting.date_two as string
      this.queryParameter.date_two = querySetting.date_two as string
    }
    if (querySetting.county_one !== undefined) {
      this.selectedLandkreisOne = querySetting.county_one as string
      this.queryParameter.county_one = querySetting.county_one as string
    } else {
      this.selectedLandkreisOne = 'Berlin'
      this.queryParameter.county_one = 'Berlin'
    }

    if (querySetting.county_two !== undefined) {
      this.selectedLandkreisTwo = querySetting.county_two as string
      this.queryParameter.county_two = querySetting.county_two as string
    } else {
      this.selectedLandkreisTwo = 'Deutschland'
      this.queryParameter.county_two = 'Deutschland'
    }

    var urlSplit = url.split('?')[0].split('/')
    console.log(urlSplit)
    var urlInfo = urlSplit[urlSplit.length - 3]
    if (urlSplit.includes('duration')) {
      this.clickButton(1)
    } else if (urlSplit.includes('distance')) {
      this.clickButton(2)
    } else if (urlSplit.includes('proportion-mobile-persons')) {
      this.clickButton(3)
    } else if (urlSplit.includes('nightly-activity')) {
      this.clickButton(4)
    } else {
      this.clickButton(1)
    }
    if (urlSplit.includes('week')) {
      this.clickButton(5)
    } else if (urlSplit.includes('weekday')) {
      this.clickButton(6)
    } else if (urlSplit.includes('weekend')) {
      this.clickButton(7)
    } else {
      this.clickButton(5)
    }
  }

  @Watch('startdate') updateStartDate() {
    this.queryParameter.date_one = this.startdate
    console.log((this.queryParameter.date_one = this.startdate))
    console.log(this.queryParameter)
    this.clickButton(this.statusTime)
  }

  @Watch('enddate') updateEndDate() {
    this.queryParameter.date_two = this.enddate
    this.clickButton(this.statusTime)
  }

  @Watch('selectedLandkreisOne') updateLandkreisOne() {
    this.queryParameter.county_one = this.selectedLandkreisOne
    this.clickButton(this.statusTime)
  }

  @Watch('selectedLandkreisTwo') updateLandkreisTwo() {
    this.queryParameter.county_two = this.selectedLandkreisTwo
    this.clickButton(this.statusTime)
  }

  private async clickButton(statusNum: number) {
    var queryStatement = '?'

    for (const [key, value] of Object.entries(this.queryParameter)) {
      if (value != '' && value !== undefined) {
        queryStatement += key + '=' + value + '&'
      }
    }

    if (queryStatement[queryStatement.length - 1] == '?') {
      queryStatement = ''
    } else if (queryStatement[queryStatement.length - 1] == '&') {
      queryStatement = queryStatement.substr(0, queryStatement.length - 1)
    }

    if (statusNum > 4) {
      var kind = ''
      if (this.status == 1) {
        kind = '/duration'
      } else if (this.status == 2) {
        kind = '/distance'
      } else if (this.status == 3) {
        kind = '/proportion-mobile-persons'
      } else if (this.status == 4) {
        kind = '/nightly-activity'
      }
      this.statusTime = statusNum
      if (statusNum == 5) {
        this.weekInterval = 'week'
        window.history.pushState(
          kind + 'week',
          'Title',
          '/mobility-counties' + kind + '/week' + queryStatement
        )
        if (!this.allWeekDates.includes(this.startdate)) {
          this.startdate = this.allWeekDates[0]
        }
        if (!this.allWeekDates.includes(this.enddate)) {
          this.enddate = this.allWeekDates[this.allWeekDates.length - 1]
        }
      } else if (statusNum == 6) {
        if (!this.allWeekdayDates.includes(this.startdate)) {
          this.startdate = this.allWeekdayDates[0]
        }
        if (!this.allWeekdayDates.includes(this.enddate)) {
          this.enddate = this.allWeekdayDates[this.allWeekdayDates.length - 1]
        }
        this.weekInterval = 'weekday'
        window.history.pushState(
          'weekday',
          'Title',
          '/mobility-counties' + kind + '/weekday' + queryStatement
        )
      } else if (statusNum == 7) {
        if (!this.allWeekDates.includes(this.startdate)) {
          this.startdate = this.allWeekDates[0]
        }
        if (!this.allWeekDates.includes(this.enddate)) {
          this.enddate = this.allWeekDates[this.allWeekDates.length - 1]
        }
        this.weekInterval = 'weekend'
        window.history.pushState(
          'weekend',
          'Title',
          '/mobility-counties' + kind + '/weekend' + queryStatement
        )
      }
    } else {
      var kind = ''
      if (this.statusTime == 5) {
        kind = '/week'
      } else if (this.statusTime == 6) {
        kind = '/weekday'
      } else if (this.statusTime == 7) {
        kind = '/weekend'
      }
      this.status = statusNum
      if (statusNum == 1) {
        this.activity = 'outOfHomeDuration'
        this.yAxisNAme = 'Time per Day [h]'
        this.plotHeading = 'Amount of Time Spent Outside the Home'
        window.history.pushState(
          'duration' + kind,
          'Title',
          '/mobility-counties/duration' + kind + queryStatement
        )
      } else if (statusNum == 2) {
        this.activity = 'dailyRangePerPerson'
        this.yAxisNAme = 'Distance per Person [km]'
        this.plotHeading = 'Average distance traveled '
        window.history.pushState(
          'distance' + kind,
          'Title',
          '/mobility-counties/distance' + kind + queryStatement
        )
      } else if (statusNum == 3) {
        this.activity = 'sharePersonLeavingHome'
        this.yAxisNAme = 'Percent [%]'
        this.plotHeading = 'Proportion of mobile persons'
        window.history.pushState(
          'proportion-mobile-persons' + kind,
          'Title',
          '/mobility-counties/proportion-mobile-persons' + kind + queryStatement
        )
      } else if (statusNum == 4) {
        this.activity = 'endHomeActs'
        this.yAxisNAme =
          'Per day of out-of-home activity between 10 p.m. and 5 a.m. <br> per 1,000 inhabitants'
        this.plotHeading = 'AENDERN'
        window.history.pushState(
          'nightly-activity' + kind,
          'Title',
          '/mobility-counties/nightly-activity' + kind + queryStatement
        )
      }
    }
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
    const url = this.public_svn + `mobilityData/landkreise/config.${lang}.yaml`

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
  position: sticky;
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
  //position: sticky;
  top: $navHeight;
  padding-bottom: 1rem;
  padding: 0rem 0.5rem 1rem 0.5rem;
  border: 1px solid #aaa;
  border-radius: 4px;
  font-size: 0.75rem;
}

.dateselect {
  width: 18rem;
  background-color: white;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  z-index: 10;
  //position: sticky;
  top: $navHeight;
  padding-bottom: 1rem;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  border: 1px solid #aaa;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-bottom: 1rem;
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

.date-choices {
  background-color: white;
  width: 100%;
  display: flex;
  flex-direction: row;
  //margin-bottom: 0.25rem;
  padding: 0.5rem;
  padding: 0.6rem 0rem 0.5rem 0.6rem;
  border-radius: 2px;
  width: max-content;
  margin-right: 2rem;
}

.date-choices .date {
  font-size: 0.75rem;
  font-size: 0.75rem;
  border-radius: 2px;
  box-shadow: none;
  border: 1px, solid, transparent;
  margin-right: 0.75rem;
}

.date-choices p {
  padding-top: 0.75rem;
  margin-right: 0.75rem;
  padding-left: 0.2rem;
}

.select-menue {
  margin-right: 0.75rem;
}

.select-menue option {
  width: min;
}

.button-row {
  display: flex;
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

/*
h5(v-if="status == 1") {{ $t('duration-heading') }} ({{ $t('week') }})
              h5(v-else-if="status == 2") {{ $t('distance-heading') }} ({{ $t('week') }})
              h5(v-else-if="status == 3") {{ $t('proportion-heading') }} ({{ $t('week') }})
              .plotarea.tall
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot-landkreise.plotsize(v-else
                    :landkreis="'Kreis Olpe'" :data="allData"
                    :kind="activity" :week="'week'"
                    :yAxisName="yAxisNAme")

              br

              h5(v-if="status == 1") {{ $t('duration-heading') }} ({{ $t('weekday') }})
              h5(v-else-if="status == 2") {{ $t('distance-heading') }} ({{ $t('weekday') }})
              h5(v-else-if="status == 3") {{ $t('proportion-heading') }} ({{ $t('weekday') }})
              .plotarea.tall
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot-landkreise.plotsize(v-else
                    :landkreis="'Kreis Olpe'" :data="allData"
                    :kind="activity" :week="'weekday'"
                    :yAxisName="yAxisNAme")

              br

              h5(v-if="status == 1") {{ $t('duration-heading') }} ({{ $t('weekend') }})
              h5(v-else-if="status == 2") {{ $t('distance-heading') }} ({{ $t('weekend') }})
              h5(v-else-if="status == 3") {{ $t('proportion-heading') }} ({{ $t('weekend') }})
              .plotarea.tall
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot-landkreise.plotsize(v-else
                    :landkreis="'Kreis Olpe'" :data="allData"
                    :kind="activity" :week="'weekend'"
                    :yAxisName="yAxisNAme")

              br

              h5(v-if="status == 1") {{ $t('duration-heading-percent') }}
              .plotarea.tall(v-if="status == 1")
                  p.plotsize(v-if="dataLoadingFail") Data not found...
                  mobility-plot-landkreise.plotsize(v-else
                    :landkreis="'Kreis Olpe'" :data="allData"
                    :kind="activity" :week="'week'"
                    :yAxisName="'Percent [%]'")

              br


*/

/*


h5 {{ $t('germany-map') }}
              .plotarea.map
                  mobility-map.plotsize(
                    :landkreisData="allData", :startDate="startdate", :endDate="enddate")

*/
</style>
