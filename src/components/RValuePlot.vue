<template lang="pug">
#vue-component
  vue-plotly.plotsize(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean

  private color = '#04f'

  private lagDays = 4

  private dataLines: any[] = []

  private mounted() {
    this.calculateRvalues()
  }

  @Watch('data') private updateModelData() {
    this.calculateRvalues()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  /**
   * We are calculating a four day running R-value as our best guess.
   * Starting on day 4,
   * - numerator:  past four days of "newly infected", which is the difference in Susceptible;
   * - denominator: divide by the "newly infected" number from four days ago
   */
  private calculateRvalues() {
    if (this.data.length === 0) return

    const susceptible = this.data.filter(item => item.name === 'Susceptible')[0]

    const newlyInfected = []
    const rValues = []

    for (let i = this.lagDays; i < susceptible.y.length; i++) {
      const diffSusceptible = susceptible.y[i - this.lagDays] - susceptible.y[i]

      newlyInfected.push(diffSusceptible)

      if (i >= this.lagDays * 2) {
        const index = newlyInfected.length - 1
        const newR = newlyInfected[index] / newlyInfected[index - this.lagDays]
        if (newR) rValues.push(newR)
      }
    }

    this.dataLines = [
      {
        name: 'Estimated R Value',
        x: susceptible.x.slice(this.lagDays * 2),
        y: rValues,
        line: {
          width: 2,
          color: this.color,
          shape: 'spline',
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
      title: 'R-value',
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
