<template lang="pug">
.mutations-plots(v-if="!isResizing")
  vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options" @relayout="handleRelayout")
  vue-plotly.plot2(:data="dataLines2" :layout="layout2" :options="options" @relayout="handleRelayout")
  vue-plotly.plot3(:data="dataLines3" :layout="layout3" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'
import Papa from 'papaparse'
import { PUBLIC_SVN } from '@/Globals'
import { map } from 'js-coroutines'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private strainValues!: any[]
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private city!: string
  @Prop({ required: true }) private metadata!: any

  private color = '#04f'

  private dataLines: any[] = []
  private dataLines2: any[] = []
  private dataLines3: any[] = []
  private unselectedLines: string[] = []
  private unselectedLines2: string[] = []
  private unselectedLines3: string[] = []
  private startURL: string[] = []
  private startURL2: string[] = []
  private startURL3: string[] = []

  private factor100k = 1

  private originalDataUrl = PUBLIC_SVN + 'original-data/Fallzahlen/'
  private svnUrl = ''

  private mounted() {
    console.log(this.strainValues)
    this.loadStartURL()

    // If the simulation begins in the middle of a pandemic, then we need to add together susceptible, infected, and
    // recovered agents to get the total population. --jr nov'22
    const susceptible = this.data.filter(item => item.name === 'Susceptible')[0]
    const totalInfected = this.data.filter(item => item.name === 'Total Infected')[0]
    const recovered = this.data.filter(item => item.name === 'Recovered')[0]

    const totalPopulation = susceptible.y[0] + totalInfected.y[0] + recovered.y[0]
    this.factor100k = totalPopulation / 100000.0

    this.calculateValues()
    // this.unselectLines()
    // this.unselectLines2()
    // this.unselectLines3()
  }

  private handleRelayout(event: any) {
    if (
      event['xaxis.range[0]'] == this.$store.state.graphStartDate &&
      event['xaxis.range[1]'] == '2020-12-31'
    ) {
      this.calculateValues()
      this.unselectLines()
      this.unselectLines2()
      this.unselectLines3()
    }
  }

  @Watch('strainValues') private updateRValues() {
    this.calculateValues()
    this.unselectLines()
    this.unselectLines2()
    this.unselectLines3()
  }

  @Watch('logScale') updateScale() {
    if (this.logScale) {
      this.layout.yaxis.type = 'log'
      //this.layout2.yaxis.type = 'log'
      //this.layout2.yaxis.range = [0.01, 2]
      //this.layout2.yaxis.range = [Math.log10(0.01), Math.log10(100)]
    } else {
      this.layout.yaxis.type = 'linear'
      //this.layout2.yaxis.type = 'linear'
      //this.layout2.yaxis.range = [0.01, 100]
      //this.layout2.yaxis.range = [0, 100]
    }
  }

  @Watch('city') updateCity() {
    this.calculateValues()
    this.unselectLines()
    this.unselectLines2()
    this.unselectLines3()
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.layout2 = Object.assign({}, this.layout2)
    this.layout3 = Object.assign({}, this.layout3)
    this.isResizing = false
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

  @Watch('dataLines3', { deep: true }) async updateUrl3() {
    for (let i = 0; i < this.dataLines3.length; i++) {
      if (
        this.dataLines3[i].visible == 'legendonly' &&
        !this.unselectedLines3.includes(this.dataLines3[i].name)
      ) {
        this.unselectedLines3.push(this.dataLines3[i].name)
      } else if (
        this.dataLines3[i].visible != 'legendonly' &&
        this.unselectedLines3.includes(this.dataLines3[i].name)
      ) {
        this.unselectedLines3.splice(this.unselectedLines3.indexOf(this.dataLines3[i].name))
      }
    }

    const params = Object.assign({}, this.$route.query)

    params['plot-3-' + this.metadata.abbreviation] = this.unselectedLines3

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

  private unselectLines3() {
    const query = this.$route.query as any
    const name = 'plot-3-' + this.metadata.abbreviation

    if (Object.keys(query).includes(name)) {
      let nameArray = query[name]
      if (!Array.isArray(nameArray)) {
        nameArray = [nameArray]
      }
      for (let i = 0; i < nameArray.length; i++) {
        for (let j = 0; j < this.dataLines3.length; j++) {
          if (this.dataLines3[j].name == nameArray[i]) {
            this.dataLines3[j].visible = 'legendonly'
          }
        }
      }
    }
  }

  private loadStartURL() {
    const query = this.$route.query as any
    this.startURL = query['plot-1-' + this.metadata.abbreviation]
    this.startURL2 = query['plot-2-' + this.metadata.abbreviation]
    this.startURL3 = query['plot-3-' + this.metadata.abbreviation]

    if (typeof this.startURL == 'string') {
      const temp = this.startURL
      this.startURL = []
      this.startURL.push(temp)
    }

    if (typeof this.startURL2 == 'string') {
      const temp = this.startURL2
      this.startURL2 = []
      this.startURL2.push(temp)
    }

    if (typeof this.startURL3 == 'string') {
      const temp = this.startURL3
      this.startURL3 = []
      this.startURL3.push(temp)
    }
  }

  private cacheRawVOCData: { [city: string]: any[] } = {}

  private async prepareData() {
    // this.dataLines2 = []
    var foundHeader = false
    var header: any[] = []
    var color: any[] = []
    var date: any[] = []
    var alpha: any[] = []
    var beta: any[] = []
    var gamma: any[] = []
    var delta: any[] = []
    var wild: any[] = []
    var omicron: any[] = []
    var ba1: any[] = []
    var ba2: any[] = []
    var ba1Cologne: any[] = []
    var ba2Cologne: any[] = []
    //var ba29Cologne: any[] = []
    var ba4Cologne: any[] = []
    var ba5Cologne: any[] = []
    var bq11Germany: any[] = []
    var bq11NRW: any[] = []
    var xbb15: any[] = []

    //  XBB.1.5

    if (this.city == 'cologne') {
      this.svnUrl = this.originalDataUrl + 'Cologne/VOC_Cologne_RKI.csv'
    } else if (this.city == 'berlin') {
      this.svnUrl = this.originalDataUrl + 'Berlin/VOC_Berlin.csv'
    }

    if (this.city !== '') {
      if (!(this.city in this.cacheRawVOCData)) {
        const rawVOCData = await fetch(this.svnUrl).then(response => response.text())
        const VOCData = Papa.parse(rawVOCData, {
          //header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          delimiter: ',',
        }).data
        this.cacheRawVOCData[this.city] = VOCData
      }
      const VOCData = this.cacheRawVOCData[this.city]

      /*
      header = [
        'Date',
        '% B117 Reported',
        '% Delta Reported',
        '% Gamma Reported',
        '% MUTB Reported',
        '% SARS_CoV_2 Reported',
        '% Omicron Reported (NRW)',
        '% BA.1 Reported (Germany)',
        '% BA.2 Reported (Germany)',
        '% BA.1 Reported (Cologne)',
        '% BA.2 Reported (Cologne)',
        '% BA.2.9 Reported (Germany)',
        '% BA.5 Reported (Germany)',
        '% BA.4 Reported (Germany)',
        '% BQ.1.1 Reported (Germany)',
        '% BQ.1.1 Reported (NRW)',
        '% XBB.1.5 Reported (Germany)',
        '',
      ]
      */

      const headerNew = [
        '',
        '% SARS_CoV_2 Reported',
        '% MUTB Reported',
        '% Gamma Reported',
        '% Delta Reported',
        '% B117 Reported',
        '% Omicron Reported (NRW)',
        '% BA.1 Reported (Germany)',
        '% BA.2 Reported (Germany)',
        '% BA.1 Reported (Cologne)',
        '% BA.2 Reported (Cologne)',
        '% BA.2.9 Reported (Germany)',
        '% BA.5 Reported (Germany)',
        '% BA.4 Reported (Germany)',
        '% BQ.1.1 Reported (Germany)',
        '% BQ.1.1 Reported (NRW)',
        '% XBB.1.5 Reported (Germany)',
        '',
        '',
        '',
      ]

      const dataMap = new Map()

      for (let i = 0; i < VOCData[0].length; i++) {
        dataMap.set(i, { name: VOCData[0][i], data: [] })
      }

      for (let i = 4; i < VOCData.length; i = i + 7) {
        for (let j = 0; j < VOCData[i].length; j++) {
          if (j == 0) dataMap.get(0).data.push(VOCData[i][j])
          else {
            let temp = 0
            if (VOCData.length >= i + 4)
              for (let k = i - 3; k < i + 4; k++) {
                temp += VOCData[k][j]
              }
            dataMap.get(j).data.push((temp * 100) / 7)
          }
        }
      }

      for (let [key, value] of dataMap) {
        // Skip Date and BA.2.9
        if (key == 0 || key == 11) continue

        this.lineDataLookup[value.name] = {
          visible: true,
          x: dataMap.get(0).data,
          y: value.data,
          type: 'scatter',
          name: headerNew[key],
          mode: 'lines+markers',
          marker: { size: 5 },
          opacity: 0.5,
        }
      }

      /*
      var alphaTempDouble = 0
      var betaTempDouble = 0
      var gammaTempDouble = 0
      var deltaTempDouble = 0
      var omicronTempDouble = 0
      var ba1TempDouble = 0
      var ba2TempDouble = 0
      var ba1CologneTempDouble = 0
      var ba2CologneTempDouble = 0
      var wildTempDouble = 0
      //var ba29CologneTempDouble = 0
      var ba4CologneTempDouble = 0
      var ba5CologneTempDouble = 0
      var bq11GermanyTempDouble = 0 // 14
      var bq11NRWTempDouble = 0 // 15
      var xbb15TempDouble = 0 // 16
      var countDays = 0

      // console.log(VOCData)

      for (var i = 0; i < VOCData.length; i++) {
        if (
          !(
            VOCData[i][0] == null &&
            VOCData[i][1] == null &&
            VOCData[i][2] == null &&
            VOCData[i][3] == null &&
            VOCData[i][4] == null
          )
        ) {
          if (!foundHeader) {
            if (this.city == 'cologne') {
              header.push(VOCData[i][0])
              header.push(VOCData[i][5])
              header.push(VOCData[i][4])
              header.push(VOCData[i][3])
              header.push(VOCData[i][2])
              header.push(VOCData[i][1])
              header.push(VOCData[i][9])
              header.push(VOCData[i][10])
              header.push(VOCData[i][11].trim())
              header.push(VOCData[i][12].trim())
              header.push(VOCData[i][13].trim())
              header.push(VOCData[i][14].trim())
              header.push(VOCData[i][15].trim())
              header.push(VOCData[i][16].trim())
            } else {
              header.push(VOCData[i][0])
              header.push(VOCData[i][1])
              header.push(VOCData[i][2])
              header.push(VOCData[i][3])
              header.push(VOCData[i][4])
            }
            foundHeader = true
          } else {
            // Data has a gap and is continued at this date
            if (this.city == 'cologne' && VOCData[i][0] == '2021-12-06') {
              countDays = 1
              alphaTempDouble = 0
              betaTempDouble = 0
              gammaTempDouble = 0
              deltaTempDouble = 0
              omicronTempDouble = 0
              wildTempDouble = 0
              ba1TempDouble = 0
              ba2TempDouble = 0
              ba1CologneTempDouble = 0
              ba2CologneTempDouble = 0
              //ba29CologneTempDouble = 0
              ba4CologneTempDouble = 0
              ba5CologneTempDouble = 0
              bq11GermanyTempDouble = 0
              bq11NRWTempDouble = 0
              xbb15TempDouble = 0
            } else {
              countDays += 1
            }

            if (this.city == 'cologne') {
              var dateTemp = VOCData[i][0]
              var alphaTemp = VOCData[i][5]
              var betaTemp = VOCData[i][4]
              var gammaTemp = VOCData[i][3]
              var deltaTemp = VOCData[i][2]
              var wildTemp = VOCData[i][1]
              var omicronTemp = VOCData[i][6]
              var ba1Temp = VOCData[i][7]
              var ba2Temp = VOCData[i][8]
              var ba1CologneTemp = VOCData[i][9]
              var ba2CologneTemp = VOCData[i][10]
              //var ba29CologneTemp = VOCData[i][11]
              var ba5CologneTemp = VOCData[i][12]
              var ba4CologneTemp = VOCData[i][13]
              var bq11GermanyTemp = VOCData[i][14]
              var bq11NRWTemp = VOCData[i][15]
              var xbb15Temp = VOCData[i][16]
            } else {
              var dateTemp = VOCData[i][0]
              var alphaTemp = VOCData[i][1]
              var betaTemp = VOCData[i][2]
              var gammaTemp = VOCData[i][3]
              var deltaTemp = VOCData[i][4]
            }

            dateTemp = dateTemp.trim()

            if (alphaTemp == null) {
              alphaTemp = 0
            } else {
              if (typeof alphaTemp == 'string') {
                alphaTemp = alphaTemp.substring(0, alphaTemp.length - 1)
                alphaTemp = alphaTemp.replace(',', '.')
                alphaTemp = parseFloat(alphaTemp)
              }
            }

            if (betaTemp == null) {
              betaTemp = 0
            } else {
              if (typeof betaTemp == 'string') {
                betaTemp = betaTemp.substring(0, betaTemp.length - 1)
                betaTemp = betaTemp.replace(',', '.')
                betaTemp = parseFloat(betaTemp)
              }
            }

            if (gammaTemp == null) {
              gammaTemp = 0
            } else {
              if (typeof gammaTemp == 'string') {
                gammaTemp = gammaTemp.substring(0, gammaTemp.length - 1)
                gammaTemp = gammaTemp.replace(',', '.')
                gammaTemp = parseFloat(gammaTemp)
              }
            }

            if (deltaTemp == null) {
              deltaTemp = 0
            } else {
              if (typeof deltaTemp == 'string') {
                deltaTemp = deltaTemp.substring(0, deltaTemp.length - 1)
                deltaTemp = deltaTemp.replace(',', '.')
                deltaTemp = parseFloat(deltaTemp)
              }
            }

            if (this.city == 'cologne') {
              if (wildTemp == null) {
                wildTemp = 0
              } else {
                if (typeof wildTemp == 'string') {
                  wildTemp = wildTemp.substring(0, wildTemp.length - 1)
                  wildTemp = wildTemp.replace(',', '.')
                  wildTemp = parseFloat(wildTemp)
                }
              }

              if (omicronTemp == null) {
                omicronTemp = 0
              } else {
                if (typeof omicronTemp == 'string') {
                  omicronTemp = parseFloat(omicronTemp)
                }
              }

              if (ba1Temp == null) {
                ba1Temp = 0
              } else {
                if (typeof ba1Temp == 'string') {
                  ba1Temp = parseFloat(ba1Temp)
                }
              }

              if (ba2Temp == null) {
                ba2Temp = 0
              } else {
                if (typeof ba2Temp == 'string') {
                  ba2Temp = parseFloat(ba2Temp)
                }
              }

              if (ba1CologneTemp == null) {
                ba1CologneTemp = 0
              } else {
                if (typeof ba1CologneTemp == 'string') {
                  ba1CologneTemp = parseFloat(ba1CologneTemp)
                }
              }

              if (ba2CologneTemp == null) {
                ba2CologneTemp = 0
              } else {
                if (typeof ba2CologneTemp == 'string') {
                  ba2CologneTemp = parseFloat(ba2CologneTemp)
                }
              }

              if (ba4CologneTemp == null) {
                ba4CologneTemp = 0
              } else {
                if (typeof ba4CologneTemp == 'string') {
                  ba4CologneTemp = parseFloat(ba4CologneTemp)
                }
              }

              if (ba4CologneTemp == null) {
                ba4CologneTemp = 0
              } else {
                if (typeof ba4CologneTemp == 'string') {
                  ba4CologneTemp = parseFloat(ba4CologneTemp)
                }
              }

              if (ba5CologneTemp == null) {
                ba5CologneTemp = 0
              } else {
                if (typeof ba5CologneTemp == 'string') {
                  ba5CologneTemp = parseFloat(ba5CologneTemp)
                }
              }

              if (bq11GermanyTemp == null) {
                bq11GermanyTemp = 0
              } else {
                if (typeof bq11GermanyTemp == 'string') {
                  bq11GermanyTemp = parseFloat(bq11GermanyTemp)
                }
              }

              if (bq11NRWTemp == null) {
                bq11NRWTemp = 0
              } else {
                if (typeof bq11NRWTemp == 'string') {
                  bq11NRWTemp = parseFloat(bq11NRWTemp)
                }
              }

              if (xbb15Temp == null) {
                xbb15Temp = 0
              } else {
                if (typeof xbb15Temp == 'string') {
                  xbb15Temp = parseFloat(xbb15Temp)
                }
              }
            }

            alphaTempDouble += alphaTemp
            betaTempDouble += betaTemp
            gammaTempDouble += gammaTemp
            deltaTempDouble += deltaTemp
            if (this.city == 'cologne') {
              wildTempDouble += wildTemp
              omicronTempDouble += omicronTemp
              ba1TempDouble += ba1Temp
              ba2TempDouble += ba2Temp
              ba1CologneTempDouble += ba1CologneTemp
              ba2CologneTempDouble += ba2CologneTemp
              ba4CologneTempDouble += ba4CologneTemp
              ba5CologneTempDouble += ba5CologneTemp
              bq11GermanyTempDouble += bq11GermanyTemp
              bq11NRWTempDouble += bq11NRWTemp
              xbb15TempDouble += xbb15Temp
            }

            if (countDays == 7 && this.city == 'cologne') {
              date.push(dateTemp)
              alpha.push((alphaTempDouble * 100) / 7)
              beta.push((betaTempDouble * 100) / 7)
              gamma.push((gammaTempDouble * 100) / 7)
              delta.push((deltaTempDouble * 100) / 7)
              wild.push((wildTempDouble * 100) / 7)
              omicron.push((omicronTempDouble * 100) / 7)
              ba1.push((ba1TempDouble * 100) / 7)
              ba2.push((ba2TempDouble * 100) / 7)
              ba1Cologne.push((ba1CologneTempDouble * 100) / 7)
              ba2Cologne.push((ba2CologneTempDouble * 100) / 7)
              ba4Cologne.push((ba4CologneTempDouble * 100) / 7)
              ba5Cologne.push((ba5CologneTempDouble * 100) / 7)
              bq11Germany.push((bq11GermanyTempDouble * 100) / 7)
              bq11NRW.push((bq11NRWTempDouble * 100) / 7)
              xbb15.push((xbb15TempDouble * 100) / 7)

              countDays = 0
              alphaTempDouble = 0
              betaTempDouble = 0
              gammaTempDouble = 0
              deltaTempDouble = 0
              wildTempDouble = 0
              omicronTempDouble = 0
              ba1TempDouble = 0
              ba2TempDouble = 0
              ba1CologneTempDouble = 0
              ba2CologneTempDouble = 0
              ba4CologneTempDouble = 0
              ba5CologneTempDouble = 0
              bq11GermanyTempDouble = 0
              bq11NRWTempDouble = 0
              xbb15TempDouble = 0
            } else if (this.city == 'berlin') {
              date.push(dateTemp)
              alpha.push(alphaTempDouble)
              beta.push(betaTempDouble)
              gamma.push(gammaTempDouble)
              delta.push(deltaTempDouble)

              alphaTempDouble = 0
              betaTempDouble = 0
              gammaTempDouble = 0
              deltaTempDouble = 0
            }
          }
        }
      }

      // chnage names
      if (this.city == 'cologne') {
        header = [
          'Date',
          '% B117 Reported',
          '% Delta Reported',
          '% Gamma Reported',
          '% MUTB Reported',
          '% SARS_CoV_2 Reported',
          '% Omicron Reported (NRW)',
          '% BA.1 Reported (Germany)',
          '% BA.2 Reported (Germany)',
          '% BA.1 Reported (Cologne)',
          '% BA.2 Reported (Cologne)',
          '% BA.2.9 Reported (Germany)',
          '% BA.5 Reported (Germany)',
          '% BA.4 Reported (Germany)',
          '% BQ.1.1 Reported (Germany)',
          '% BQ.1.1 Reported (NRW)',
          '% XBB.1.5 Reported (Germany)',
        ]
        color = ['', 'blue', '', '', '', 'red', '']
      } else if (this.city == 'berlin') {
        header = ['Date', '% B117 Reported', 'Beta', 'Gamma', 'MUTB Reported']
        color = ['', '', '', '', '']
      }

      if (this.city == 'cologne') {
        this.lineDataLookup[header[5]] = {
          visible: true,
          x: date,
          y: wild,
          name: header[5],
          color: color[5],
          type: 'scatter',
          mode: 'lines+markers',
          marker: { size: 5 },
          opacity: 0.5,
        }
      }

      this.lineDataLookup[header[1]] = {
        visible: true,
        x: date,
        y: alpha,
        name: header[1],
        color: color[1],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }
      this.lineDataLookup[header[2]] = {
        visible: true,
        x: date,
        y: beta,
        name: header[2],
        color: color[2],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }
      this.lineDataLookup[header[3]] = {
        visible: true,
        x: date,
        y: gamma,
        name: header[3],
        color: color[3],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }
      this.lineDataLookup[header[4]] = {
        visible: true,
        x: date,
        y: delta,
        name: header[4],
        color: color[4],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }
      this.lineDataLookup[header[6]] = {
        visible: true,
        x: date,
        y: omicron,
        name: header[6],
        color: color[6],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }
      this.lineDataLookup[header[7]] = {
        visible: true,
        x: date,
        y: ba1,
        name: header[7],
        color: color[7],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }
      this.lineDataLookup[header[8]] = {
        visible: true,
        x: date,
        y: ba2,
        name: header[8],
        color: color[8],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }
      this.lineDataLookup[header[9]] = {
        visible: true,
        x: date,
        y: ba1Cologne,
        name: header[9],
        color: color[8],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }
      this.lineDataLookup[header[10]] = {
        visible: true,
        x: date,
        y: ba2Cologne,
        name: header[10],
        color: color[8],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }

      this.lineDataLookup[header[11]] = {
        visible: true,
        x: date,
        y: ba4Cologne,
        name: header[13],
        color: color[8],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }

      this.lineDataLookup[header[12]] = {
        visible: true,
        x: date,
        y: ba5Cologne,
        name: header[12],
        color: color[8],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }

      this.lineDataLookup[header[14]] = {
        visible: true,
        x: date,
        y: bq11Germany,
        name: header[14],
        color: color[8],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }

      this.lineDataLookup[header[15]] = {
        visible: true,
        x: date,
        y: bq11NRW,
        name: header[15],
        color: color[8],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }

      this.lineDataLookup[header[16]] = {
        visible: true,
        x: date,
        y: xbb15,
        name: header[16],
        //color: color[8],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }
      */

      this.dataLines2 = Object.values(this.lineDataLookup)
      this.dataLines3 = JSON.parse(JSON.stringify(this.dataLines2))

      console.log(this.dataLines2)

      if (this.startURL !== undefined) {
        for (let i = 0; i < this.dataLines.length; i++) {
          if (this.startURL.includes(this.dataLines[i].name)) {
            this.dataLines[i].visible = 'legendonly'
          }
        }
      }

      if (this.startURL2 !== undefined) {
        for (let i = 0; i < this.dataLines2.length; i++) {
          if (this.startURL2.includes(this.dataLines2[i].name)) {
            this.dataLines2[i].visible = 'legendonly'
          }
        }
      }

      if (this.startURL3 !== undefined) {
        for (let i = 0; i < this.dataLines3.length; i++) {
          if (this.startURL3.includes(this.dataLines3[i].name)) {
            this.dataLines3[i].visible = 'legendonly'
          }
        }
      }

      // const b = JSON.parse(JSON.stringify(myObject))

      // *** CAUSES INFINITE LAYOUT LOOP
      // this.layout.xaxis.range = [date[0], date[date.length - 1]]
    }
  }

  private lineDataLookup: any = {}

  private calculateValues() {
    if (!this.strainValues.length) return

    // generate list of mutation names
    const allStrains: string[] = Object.keys(this.strainValues[0])
    const strains: string[] = []
    const skip = ['day', 'date', 'total']

    for (const strain of allStrains) {
      if (skip.indexOf(strain) === -1) strains.push(strain)
    }

    this.dataLines = []
    this.dataLines2 = []
    this.dataLines3 = []
    this.lineDataLookup = {}

    // // build totals
    for (let i = 7; i < this.strainValues.length; i += 7) {
      const value = this.strainValues[i]

      let t = 0
      for (const strain of strains) {
        if (value[strain]) {
          const infections = this.strainValues
            .slice(i - 7, i)
            .reduce((total, v) => v[strain] + total, 0)
          t += infections
        }
      }
      value.total = t
    }

    for (const strain of strains) {
      this.calculateValueForStrain(strain)
    }
    this.prepareData()
  }

  private calculateValueForStrain(strain: string) {
    const x: any[] = []
    const r: any[] = []
    const t: any[] = []

    for (let i = 7; i < this.strainValues.length; i += 7) {
      const value = this.strainValues[i]
      if (!value) continue

      const thisWeek = this.strainValues.slice(i - 7, i)
      const infections = thisWeek.reduce((total, v) => v[strain] + total, 0)

      const infectionRate = infections / this.factor100k

      if (value[strain]) {
        x.push(value.date)
        r.push(infectionRate)
        t.push((100.0 * infections) / value.total)
      }
    }

    // set end date
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout2.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout3.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate
    this.layout2.xaxis.range[1] = this.endDate
    this.layout3.xaxis.range[1] = this.endDate

    this.dataLines.push({
      name: strain,
      visible: true,
      x: x,
      y: r,
      mode: 'markers',
      marker: { size: 4 },
    })

    this.lineDataLookup['% ' + strain] = {
      name: '% ' + strain,
      visible: true,
      x: x,
      y: t,
      // mode: 'markers',
      // marker: { size: 4 },
    }
    this.dataLines2 = Object.values(this.lineDataLookup)
  }

  private reformatDate(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout = {
    // height: 200, // this _should_ adjust automatically, but somehow it does not for me.  kai, feb'22
    showlegend: true,
    legend: {
      orientation: 'h',
      y: '-0.15',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 10, b: 0, l: 60, pad: 2 },
    xaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: [this.$store.state.graphStartDate, '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: this.logScale ? 'log' : 'linear',
      title: '7-Day Infections / 100k Pop.',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8', // f8f8f8',
  }

  private layout2 = {
    // height: 200,
    showlegend: true,
    legend: {
      orientation: 'h',
      y: '-0.2',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 10, b: 0, l: 60, pad: 2 },
    xaxis: {
      automargin: true,
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: [this.$store.state.graphStartDate, '2020-12-31'],
      type: 'date',
      animate: true,
    },
    yaxis: {
      type: 'linear',
      automargin: true,
      range: [0.01, 100],
      // range: this.logScale ? [Math.log10(0.01), Math.log10(100)] : [Math.log10(0), Math.log10(100)],
      // type: this.logScale ? 'log' : 'linear',
      //tickformat: '.01r',
      title: { text: '% of Cases', standoff: 0 },
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8', // f8f8f8',
  }

  private layout3 = {
    autosize: true,
    showlegend: true,
    legend: {
      orientation: 'h',
      // yanchor: 'top',
      y: '-0.2',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 10, b: 0, l: 60, pad: 2 },
    xaxis: {
      automargin: true,
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: [this.$store.state.graphStartDate, '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      automargin: true,
      //fixedrange: window.innerWidth < 700,
      //fixedrange: true,
      //type: 'linear',
      //range: [0.01, 100],
      // range: this.logScale ? [Math.log10(0.01), Math.log10(100)] : [Math.log10(0), Math.log10(100)],
      // type: this.logScale ? 'log' : 'linear',
      range: [Math.log10(0.01), Math.log10(100)],
      type: 'log',
      //tickformat: '.01r',
      title: '% of Cases',
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
  display: flex;
  flex-direction: column;
  height: 100%;
}

.plot1 {
  flex: 6;
  margin-bottom: 1rem;
}

.plot2 {
  flex: 5;
  margin-bottom: 1rem;
}

.plot3 {
  flex: 5;
}

@media only screen and (max-width: 640px) {
}
</style>
