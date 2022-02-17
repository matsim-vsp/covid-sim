<template lang="pug">
.my-vue-component
  vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private vaccinations!: any[]
  @Prop({ required: true }) private endDate!: any

  private dataLines: any[] = []

  private mounted() {
    try {
      this.calculateValues()
    } catch (e) {
      console.warn('VACCINATIONS PER TYPE data not found')
      // maybe this run doesn't have vaccinations or boosters
    }
  }

  @Watch('vaccinations') private updateModelData() {
    this.calculateValues()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  private calculateValues() {
    if (this.vaccinations.length === 0) return

    // set end date
    this.layout.xaxis.range = [this.vaccinations[0].date, this.endDate]

    const date = []
    const generic = []
    const mRNA = []
    const natural = []
    const omicronUpdate = []
    const vector = []

    for (let i = 0; i < this.vaccinations.length; i++) {
      date.push(this.vaccinations[i].date)
      generic.push(this.vaccinations[i].generic)
      mRNA.push(this.vaccinations[i].mRNA)
      natural.push(this.vaccinations[i].natural)
      omicronUpdate.push(this.vaccinations[i].omicronUpdate)
      vector.push(this.vaccinations[i].vector)
    }

    this.dataLines = [
      {
        name: 'generic',
        x: date,
        y: generic,
      },
      {
        name: 'mRNA',
        x: date,
        y: mRNA,
      },
      {
        name: 'natural',
        x: date,
        y: natural,
      },
      {
        name: 'omicronUpdate',
        x: date,
        y: omicronUpdate,
      },
      {
        name: 'vector',
        x: date,
        y: vector,
      },
    ]
  }

  private layout = {
    height: 240,
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
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      // note this gets overwritten when the scale changes - see updateScale()
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: this.logScale ? 'log' : 'linear',
      autorange: true,
      //range: [0, 100],
      title: 'vaccinations per day',
    } as any,
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
      filename: 'daily-cases',
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
