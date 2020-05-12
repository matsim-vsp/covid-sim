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

  private color = ['#094', '#0c4']

  private lagDays = 7

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

  /**
   * We are calculating a seven day running infection rate.
   * Starting on day 7,
   * - numerator:  past four days of "newly infected", which is the difference in Susceptible;
   * - denominator: divide by the "newly infected" number from four days ago
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
      const rate = Math.round((10.0 * diffSusceptible) / factor100k) / 10.0
      infectionRate.push(rate)
    }

    this.dataLines = [
      // {
      //   name: 'Number of Infections',
      //   x: susceptible.x.slice(this.lagDays),
      //   y: newlyInfected,
      //   line: {
      //     width: 2,
      //     color: this.color[0],
      //     shape: 'spline',
      //   },
      // },
      {
        name: 'Infections per 100,000',
        x: susceptible.x.slice(this.lagDays),
        y: infectionRate,
        type: 'bar',
        marker: { color: '#096' },
        line: {
          width: 0.5,
          color: this.color[0],
          shape: 'spline',
        },
      },
      {
        name: 'Target: 50 per 100,000',
        x: [0, susceptible.x[susceptible.x.length - 1]],
        y: [50.0, 50.0],
        line: {
          width: 2.0,
          color: '#aa44ffcc',
        },
      },
    ]
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
      range: ['2020-02-09', '2020-08-31'],
      type: 'date',
    },
    yaxis: {
      type: this.logScale ? 'log' : 'linear',
      autorange: true,
      title: 'Weekly Infections / 100,000',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
    displayModeBar: false,
    responsive: true,
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
