<template lang="pug">
.vue-component(v-if="!isResizing" )
  vue-plotly.plot1(:data="dataLines" :layout="layout" :options="options")
  
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private startDate!: any
  @Prop({ required: true }) private endDate!: any
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private intakesHosp!: boolean

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
    if (this.intakesHosp) {
      this.layout.yaxis = this.logScale
        ? {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'log',
            autorange: true,
            title: 'Intake Incidence',
          }
        : {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'linear',
            autorange: true,
            title: 'Intake Incidence',
          }
    } else {
      this.layout.yaxis = this.logScale
        ? {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'log',
            autorange: true,
            title: 'Occupancy / 100k Pop.',
          }
        : {
            //fixedrange: window.innerWidth < 700,
            fixedrange: true,
            type: 'linear',
            autorange: true,
            title: 'Occupancy / 100k Pop.',
          }
    }
  }

  private calculateValues() {
    this.dataLines = []

    if (this.data.length == 0) return

    // intakesHosp
    // intakesICU
    // occupancyHosp
    // occupancyICU
    //
    // Omicron
    // Delta

    let date = [] as any[]
    let intakesHospOmicron = []
    let intakesICUOmicron = []
    let occupancyHospOmicron = []
    let occupancyICUOmicron = []
    let intakesHospDelta = []
    let intakesICUDelta = []
    let occupancyHospDelta = []
    let occupancyICUDelta = []

    for (let i = 0; i < this.data.length; i++) {
      let measurement = this.data[i].measurement.trim()
      let severity = this.data[i].severity.trim()
      let dateTemp = this.data[i].date.trim()
      let n = this.data[i].n

      if (severity == 'Omicron') {
        if (measurement == 'intakesHosp') {
          date.push(dateTemp)
          intakesHospOmicron.push(n)
        }
        if (measurement == 'intakesICU') {
          intakesICUOmicron.push(n)
        }
        if (measurement == 'occupancyHosp') {
          occupancyHospOmicron.push(n)
        }
        if (measurement == 'occupancyICU') {
          occupancyICUOmicron.push(n)
        }
      } else {
        if (measurement == 'intakesHosp') {
          intakesHospDelta.push(n)
        }
        if (measurement == 'intakesICU') {
          intakesICUDelta.push(n)
        }
        if (measurement == 'occupancyHosp') {
          occupancyHospDelta.push(n)
        }
        if (measurement == 'occupancyICU') {
          occupancyICUDelta.push(n)
        }
      }
    }

    if (!this.intakesHosp) {
      this.dataLines.push(
        {
          name: 'occupancyHosp-Delta',
          x: date,
          y: occupancyHospDelta,
          line: { width: 1 },
        },
        {
          name: 'occupancyHosp-Omicron',
          x: date,
          y: occupancyHospOmicron,
          line: { width: 1 },
        },
        {
          name: 'occupancyICU-Delta',
          x: date,
          y: occupancyICUDelta,
          line: { width: 1 },
        },
        {
          name: 'occupancyICU-Omicron',
          x: date,
          y: occupancyICUOmicron,
          line: { width: 1 },
        }
      )
    } else {
      this.dataLines.push(
        {
          name: 'intakesHosp-Delta',
          x: date,
          y: intakesHospDelta,
          line: { width: 1 },
        },
        {
          name: 'intakesHosp-Omicron',
          x: date,
          y: intakesHospOmicron,
          line: { width: 1 },
        },
        {
          name: 'intakesICU-Delta',
          x: date,
          y: intakesICUDelta,
          line: { width: 1 },
        },
        {
          name: 'intakesICU-Omicron',
          x: date,
          y: intakesICUOmicron,
          line: { width: 1 },
        }
      )
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
