<template lang="pug">
.vue-component(v-if="!isResizing" )
  vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@/components/VuePlotly.vue'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private startDate!: any
  @Prop({ required: true }) private endDate!: any
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean

  private dataLines: any[] = []

  private mounted() {
    this.updateScale()
    this.calculateValues()
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('data') updateData() {
    this.calculateValues()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis = this.logScale
      ? {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'log',
          autorange: true,
          title: 'nInfected',
        }
      : {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          autorange: true,
          title: 'nInfected',
        }
  }

  private calculateValues() {
    this.dataLines = []
    if (this.data.length == 0) return

    // old plots without strain type
    if (Object.keys(this.data[0]).includes('nInfected')) {
      let x = []
      let y = []
      for (let i = 0; i < this.data.length; i++) {
        x.push(this.data[i].date)
        y.push(this.data[i].nInfected)
      }
      this.dataLines.push({
        name: 'nInfected',
        x: x,
        y: y,
        line: { width: 1 },
      })
      // new plots with strain type
    } else {
      let strainTypes = [] as any

      let strainObjects = []

      for (let i = 0; i < 20; i++) {
        if (!strainTypes.includes(this.data[i].strain)) {
          strainTypes.push(this.data[i].strain)
          strainObjects.push({
            name: this.data[i].strain,
            x: [] as any,
            y: [] as any,
            line: { width: 1 },
          })
        }
      }

      for (let i = 0; i < this.data.length; i++) {
        const index = strainTypes.indexOf(this.data[i].strain)
        strainObjects[index].x.push(this.data[i].date)
        strainObjects[index].y.push(this.data[i].n)
      }

      this.dataLines = strainObjects
    }
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
    margin: { t: 5, r: 10, b: 35, l: 60 },
    xaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      autorange: true,
    },
    yaxis: {
      // note this gets overwritten when the scale changes - see updateScale()
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: 'linear',
      autorange: true,
      //range: [0, 100],
      title: 'nInfected',
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

.vue-component {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.plot1 {
  flex: 1;
}

@media only screen and (max-width: 640px) {
}
</style>
