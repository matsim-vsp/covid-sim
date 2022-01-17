<template lang="pug">
.mutations-plots
  vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options")
  vue-plotly.plot2(:data="dataLines2" :layout="layout2" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'
import Papa from 'papaparse'
import { PUBLIC_SVN } from '@/Globals'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private strainValues!: any[]
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private city!: string

  private color = '#04f'

  private dataLines: any[] = []
  private dataLines2: any[] = []

  private factor100k = 1

  private originalDataUrl = PUBLIC_SVN + 'original-data/Fallzahlen/'
  private svnUrl = ''

  private mounted() {
    const susceptible = this.data.filter(item => item.name === 'Susceptible')[0]
    const totalPopulation = susceptible.y[0]
    this.factor100k = totalPopulation / 100000.0

    this.calculateValues()
  }

  @Watch('strainValues') private updateRValues() {
    this.calculateValues()
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

  @Watch('city') updateCity() {
    this.calculateValues()
  }

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

    if (this.city == 'cologne') {
        this.svnUrl = this.originalDataUrl + 'Cologne/VOC_Cologne_RKI.csv'
    } else if (this.city == 'berlin') {
        this.svnUrl = this.originalDataUrl + 'Berlin/VOC_Berlin.csv'
    }

    if (this.city != '') {


      const rawVOCData = await fetch(this.svnUrl).then(response => response.text())
      const VOCData = Papa.parse(rawVOCData, {
        //header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimiter: ',',
      }).data

      var alphaTempDouble = 0
      var betaTempDouble = 0
      var gammaTempDouble = 0
      var deltaTempDouble = 0
      var omicronTempDouble = 0
      var wildTempDouble = 0
      var countDays = 0

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
              countDays = 1;
              alphaTempDouble = 0;
              betaTempDouble = 0;
              gammaTempDouble = 0;
              deltaTempDouble = 0;
              omicronTempDouble = 0;
              wildTempDouble = 0;
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

              }

              alphaTempDouble += alphaTemp
              betaTempDouble += betaTemp
              gammaTempDouble += gammaTemp
              deltaTempDouble += deltaTemp
              if (this.city == 'cologne') {
                wildTempDouble += wildTemp
                omicronTempDouble += omicronTemp
              }

              if (countDays == 7 && this.city == 'cologne') {
                date.push(dateTemp)
                alpha.push((alphaTempDouble * 100) / 7)
                beta.push((betaTempDouble * 100) / 7)
                gamma.push((gammaTempDouble * 100) / 7)
                delta.push((deltaTempDouble * 100) / 7)
                wild.push((wildTempDouble * 100) / 7)
                omicron.push((omicronTempDouble * 100) / 7)

                countDays = 0
                alphaTempDouble = 0
                betaTempDouble = 0
                gammaTempDouble = 0
                deltaTempDouble = 0
                wildTempDouble = 0
                omicronTempDouble = 0
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
          '% Omicron Reported'
        ]
        color = ['', 'blue', '', '', '', 'red', '']
      } else if (this.city == 'berlin') {
        header = ['Date', '% B117 Reported', 'Beta', 'Gamma', 'MUTB Reported']
        color = ['', '', '', '', '']
      }

      if (this.city == 'cologne') {
        this.lineDataLookup[header[5]] = {
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
        x: date,
        y: omicron,
        name: header[6],
        color: color[6],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 5 },
        opacity: 0.5,
      }

      this.dataLines2 = Object.values(this.lineDataLookup)

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
    this.layout.xaxis.range = ['2020-02-09', this.endDate]
    this.layout2.xaxis.range = ['2020-02-09', this.endDate]

    this.dataLines.push({
      name: strain,
      x: x,
      y: r,
      mode: 'markers',
      marker: { size: 4 },
    })

    this.lineDataLookup['% ' + strain] = {
      name: '% ' + strain,
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
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      fixedrange: window.innerWidth < 700,
      type: this.logScale ? 'log' : 'linear',
      title: '7-Day Infections / 100k Pop.',
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
      fixedrange: window.innerWidth < 700,
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      fixedrange: window.innerWidth < 700,
      type: 'linear',
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
  display: flex;
  flex-direction: column;
}

.plot1 {
  flex: 6;
}

.plot2 {
  flex: 5;
}

@media only screen and (max-width: 640px) {
}
</style>
