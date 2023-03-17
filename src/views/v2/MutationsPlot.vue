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

      const headerCologne = [
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

      // Change colors: index corresponds to the headerCologne
      const colors = [
        '',
        '#1f77b4',
        '#ff0000',
        '',
        '',
        '#ffa500',
        '',
        '',
        '',
        '',
        '',
        '',
        '#e377c2',
      ]

      const VOCMap = new Map()

      for (let i = 0; i < VOCData[0].length; i++) {
        VOCMap.set(i, { name: VOCData[0][i], data: [] })
      }

      for (let i = 4; i < VOCData.length; i = i + 7) {
        for (let j = 0; j < VOCData[i].length; j++) {
          if (j == 0) VOCMap.get(0).data.push(VOCData[i][j])
          else {
            let temp = 0
            if (VOCData.length >= i + 4)
              for (let k = i - 3; k < i + 4; k++) {
                temp += VOCData[k][j]
              }
            VOCMap.get(j).data.push((temp * 100) / 7)
          }
        }
      }

      // Remove null values at the end
      for (let [key, value] of VOCMap) {
        if (key != 0) {
          console.log(value.data)
          for (let i = value.data.length - 1; i >= 0; i--) {
            if (value.data[i] == 0) value.data.pop()
            else break
          }
        }
      }

      if (this.city == 'cologne') {
        for (let [key, value] of VOCMap) {
          // Skip Date (0) and BA.2.9 (11)
          if (key == 0 || key == 11) continue

          console.log(key, headerCologne[key])

          this.lineDataLookup[value.name] = {
            visible: true,
            line: { color: colors[key] },
            x: VOCMap.get(0).data,
            y: value.data,
            type: 'scatter',
            name: headerCologne[key],
            mode: 'lines+markers',
            marker: { size: 5 },
            opacity: 0.5,
          }
        }
      } else if (this.city == 'berlin') {
        // TODO: If someday the berlin scenario should work on v2
      }

      this.dataLines2 = Object.values(this.lineDataLookup)
      this.dataLines3 = JSON.parse(JSON.stringify(this.dataLines2))

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
