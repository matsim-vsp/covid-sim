<template lang="pug">
.vue-component(v-if="!isResizing" )
  vue-plotly.plot1(
    :data="dataLines"
    :layout="layout"
    :options="options"
    :class="{'processing': postHospUpdater !== updaterCount}"
  )

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'
import { spawn, Thread, Worker } from 'threads'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private startDate!: any
  @Prop({ required: true }) private endDate!: any
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private totalPopulation!: number
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private intakesHosp!: boolean
  @Prop({ required: true }) private city!: string
  @Prop({ required: true }) private postHospUpdater!: number
  @Prop({ required: true }) private metadata!: any

  private dataLines: any[] = []
  private unselectedLines: string[] = []

  private postProcessWorker: any = null

  private updaterCount = 0

  private mounted() {
    this.updateScale()
    this.calculateValues()
    //this.unselectLines()
  }

  private beforeDestroy() {
    if (this.postProcessWorker) Thread.terminate(this.postProcessWorker)
  }

  private isResizing = false

  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('data')
  @Watch('totalPopulation')
  updateData() {
    this.calculateValues()
    //this.unselectLines()
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

  @Watch('dataLines', { deep: true }) updateUrl() {
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

    params['plot-' + this.metadata.abbreviation] = this.unselectedLines

    this.$router.replace({ query: params })
  }

  private async unselectLines() {
    const query = this.$route.query as any
    const name = 'plot-' + this.metadata.abbreviation

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

  private async calculateValues() {
    if (!this.postProcessWorker) {
      this.postProcessWorker = await spawn(new Worker('./postHospital.worker'))
    }

    if (!this.data.length) {
      return
    }

    const lines = await this.postProcessWorker.buildDataLines({
      data: this.data,
      totalPopulation: this.totalPopulation,
      city: this.city,
      intakesHosp: this.intakesHosp,
    })

    this.dataLines = lines
    this.updaterCount = this.postHospUpdater

    await this.unselectLines()
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

.processing {
  opacity: 0.6;
}

@media only screen and (max-width: 640px) {
}
</style>
