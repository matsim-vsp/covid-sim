<template lang="pug">
  vue-plotly(v-if="!isResizing" :data="dataLines" :layout="layout" :options="options")
  
  </template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private metadata!: any

  private dataLines: any[] = []
  private unselectedLines: string[] = []

  private ignoreRowHealth = [
    'SusceptibleVaccinated',
    'ContagiousVaccinated',
    'ShowingSymptomsVaccinated',
    'SeriouslySickVaccinated',
    'CriticalVaccinated',
    'TotalInfectedVaccinated',
    'InfectedCumulativeVaccinated',
    'ShowingSymptomsCumulativeVaccinated',
    'ContagiousCumulativeVaccinated',
    'SeriouslySickCumulativeVaccinated',
    'CriticalCumulativeVaccinated',
    'RecoveredVaccinated',
    'Cumulative Hospitalized',
  ]

  private mounted() {
    //this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
    this.setLayout()
    this.calculateValues()
    this.unselectLines()
  }

  @Watch('data') private updateModelData() {
    this.calculateValues()
    this.unselectLines()
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('logScale') updateScale() {
    if (this.logScale) {
      this.layout.yaxis.type = 'log'
      this.layout.yaxis.autorange = true
      //this.layout.yaxis.range = [Math.log10(0.01), Math.log10(2)]
    } else {
      this.layout.yaxis.type = 'linear'
      delete this.layout.yaxis.range // [0, 1.5]
      this.layout.yaxis.autorange = true
    }
  }

  // , { deep: true }
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

  private setLayout() {
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate
  }

  private calculateValues() {
    this.dataLines = this.data.filter(row => !this.ignoreRowHealth.includes(row.name))
    for (let i = 0; i < this.dataLines.length; i++) {
      if (!Object.keys(this.dataLines[i]).includes('visible')) {
        this.dataLines[i].visible = true
      }
    }
  }

  private unselectLines() {
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
            console.log('Unselect: ', this.dataLines[j].name)
          }
        }
      }
    }
  }

  private layout: any = {
    autosize: true,
    showlegend: true,
    legend: {
      orientation: 'h',
      y: '-0.15',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 10, b: 0, l: 60 },
    xaxis: {
      range: ['2020-02-09', '2020-12-31'],
      fixedrange: true,
      type: 'date',
    },
    yaxis: {
      type: this.logScale ? 'log' : 'linear',
      fixedrange: true,
      autorange: true,
      title: 'Population',
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
