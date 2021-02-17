<template lang="pug">
.mutations-plots
  vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options")
  vue-plotly.plot2(:data="dataLines2" :layout="layout2" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private strainValues!: any[]

  private color = '#04f'

  private dataLines: any[] = []
  private dataLines2: any[] = []

  private mounted() {
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

    // build totals
    for (const value of this.strainValues) {
      let t = 0
      for (const strain of strains) {
        if (value[strain]) t += value[strain]
      }
      value.total = t
    }

    for (const strain of strains) {
      this.calculateValueForStrain(strain)
    }
  }

  private calculateValueForStrain(strain: string) {
    const x: any[] = []
    const r: any[] = []
    const t: any[] = []

    const avgR = []

    for (const value of this.strainValues) {
      if (value[strain]) {
        x.push(value.date)
        r.push(value[strain])
        t.push((100.0 * value[strain]) / value.total)
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

    this.dataLines2.push({
      name: '% ' + strain,
      x: x,
      y: t,
      // mode: 'markers',
      // marker: { size: 4 },
    })
  }

  private reformatDate(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout = {
    // barmode: 'stack',
    // height: 250,
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
      title: 'Number of Infections',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private layout2 = {
    // height: 210,
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
