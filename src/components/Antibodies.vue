<template lang="pug">
.my-vue-component(v-if="!isResizing")
  vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private antibodies!: any[]
  @Prop({ required: true }) private endDate!: any

  private dataLines: any[] = []

  private mounted() {
    try {
      this.calculateValues()
    } catch (e) {
      console.warn('ANTIBODIES data not found')
      // maybe this run doesn't have vaccinations or boosters
    }
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('antibodies') private updateModelData() {
    this.calculateValues()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  private calculateValues() {
    if (this.antibodies.length === 0) return

    // set end date
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate

    const date = []
    const ALPHA = []
    const B1351 = []
    const DELTA = []
    const OMICRON_BA1 = []
    const SARS_CoV_2 = []
    const STRAIN_A = []
    const STRAIN_B = []

    for (let i = 0; i < this.antibodies.length; i++) {
      date.push(this.antibodies[i].date)
      ALPHA.push(this.antibodies[i].ALPHA)
      B1351.push(this.antibodies[i].B1351)
      DELTA.push(this.antibodies[i].DELTA)
      OMICRON_BA1.push(this.antibodies[i].OMICRON_BA1)
      SARS_CoV_2.push(this.antibodies[i].SARS_CoV_2)
      STRAIN_A.push(this.antibodies[i].STRAIN_A)
      STRAIN_B.push(this.antibodies[i].STRAIN_B)
    }

    this.dataLines = [
      {
        name: 'ALPHA',
        x: date,
        y: ALPHA,
      },
      {
        name: 'B1351',
        x: date,
        y: B1351,
      },
      {
        name: 'DELTA',
        x: date,
        y: DELTA,
      },
      {
        name: 'OMICRON_BA1',
        x: date,
        y: OMICRON_BA1,
      },
      {
        name: 'SARS_CoV_2',
        x: date,
        y: SARS_CoV_2,
      },
      {
        name: 'STRAIN_A',
        x: date,
        y: STRAIN_A,
      },
      {
        name: 'STRAIN_B',
        x: date,
        y: STRAIN_B,
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
      range: [this.$store.state.graphStartDate, '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      // note this gets overwritten when the scale changes - see updateScale()
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: this.logScale ? 'log' : 'linear',
      autorange: true,
      //range: [0, 100],
      title: 'relative antibodies',
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

.my-view-component {
  background-color: yellow;
}
@media only screen and (max-width: 640px) {
}
</style>
