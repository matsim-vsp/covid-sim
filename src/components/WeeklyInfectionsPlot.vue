<template lang="pug">
#vue-component
  vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private observed!: any

  private color = ['#094', '#0c4']

  private lagDays = 1

  private dataLines: any[] = []

  private mounted() {
    this.calculateValues()
  }

  @Watch('data') private updateModelData() {
    this.calculateValues()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  private dunkelZifferFactor = 1.0

  private calculateObserved(factor100k: number) {
    console.log({ observed: this.observed })
    if (!this.observed) return

    const observedLine: any = {}
    observedLine.name = 'Detected Infections per 100,000 (RKI)'
    observedLine.line = this.observed.line
    observedLine.x = []
    observedLine.y = []

    // option a: derivative
    // for (let i = 1; i < this.observed.x.length - 2; i++) {
    //   const before = this.observed.y[i - 1]
    //   const after = this.observed.y[i + 1]

    //   const infectionsPerDay = (after - before) / 2
    //   const sevenDays = 7 * infectionsPerDay
    //   const infectionsWithDunkelZiffer = sevenDays * this.dunkelZifferFactor
    //   const observedRatePer100k =
    //     Math.floor((10.0 * infectionsWithDunkelZiffer) / factor100k) / 10.0

    //   observedLine.x.push(this.observed.x[i])
    //   observedLine.y.push(observedRatePer100k)
    // }

    // option b: 7-day running total
    for (let i = 0; i < this.observed.x.length; i++) {
      const sevenDays =
        this.observed.y[i] - (i < this.lagDays ? 0 : this.observed.y[i - this.lagDays])
      const infectionsWithDunkelZiffer = sevenDays * this.dunkelZifferFactor
      const observedRatePer100k =
        (7.0 * Math.floor((10.0 * infectionsWithDunkelZiffer) / factor100k)) / 10.0

      observedLine.x.push(this.observed.x[i])
      observedLine.y.push(observedRatePer100k)
    }

    // done
    this.dataLines.push(observedLine)
    console.log({ observedLine })
  }

  /**
   * We are calculating a seven day running infection rate.
   */
  private calculateValues() {
    if (this.data.length === 0) return

    const susceptible = this.data.filter(item => item.name === 'Susceptible')[0]

    const totalPopulation = susceptible.y[0]
    const factor100k = totalPopulation / 100000.0

    const newlyInfected = []
    const infectionRate = []

    for (let i = this.lagDays; i < susceptible.y.length; i++) {
      const diffSusceptible = susceptible.y[i - this.lagDays] - susceptible.y[i]
      newlyInfected.push(diffSusceptible)
      // infections per 100,000
      const rate = (7.0 * Math.round((10.0 * diffSusceptible) / factor100k)) / 10.0
      infectionRate.push(rate)
    }

    this.dataLines = [
      {
        name: 'Simulated Infections per 100,000',
        x: susceptible.x.slice(this.lagDays),
        y: infectionRate,
        fill: 'tozeroy',
        line: {
          width: 1.5,
          color: '#329',
          shape: 'hvh',
        },
      },
      {
        name: 'Target: 50 per 100,000',
        x: [0, susceptible.x[susceptible.x.length - 1]],
        y: [50.0, 50.0],
        fill: 'tozeroy',
        line: {
          width: 1.0,
          color: '#886666',
        },
      },
    ]

    this.calculateObserved(factor100k)
  }

  private reformatDate(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout = {
    height: 225,
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
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      type: this.logScale ? 'log' : 'linear',
      autorange: true, // this.logScale ? false : true,
      // range: [0, 5],
      title: 'Infections / 100,000',
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
      filename: 'custom_image',
      width: 800,
      height: 600,
      scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
    },
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
