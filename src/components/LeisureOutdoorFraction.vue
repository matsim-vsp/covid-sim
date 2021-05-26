<template lang="pug">
vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private endDate!: string

  private color = '#04f'

  private lagDays = 7

  private dataLines: any[] = []

  private mounted() {
    this.updateModelData()
  }

  @Watch('data') private updateModelData() {
    this.showData()
    console.log('UPDATE')
  }

  private showData() {
    const x: any[] = []
    const y: any[] = []

    for (const value of this.data) {
      x.push(value.date)
      y.push(value.outdoorFraction)
    }

    this.dataLines = [
      {
        name: 'leisurOutdoorFraction',
        mode: 'markers',
        type: 'scatter',
        x: x,
        y: y,
      },
    ]
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
      //range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      // fixedrange: window.innerWidth < 700,
      type: 'linear',
      //autorange: true,
      range: [-0.1, 1.1],
      title: 'nInfected',
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

@media only screen and (max-width: 640px) {
}
</style>
