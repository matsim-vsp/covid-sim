<template lang="pug">
vue-plotly(v-if="!isResizing" :data="dataMatrix" :layout="layout" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@/components/VuePlotly.vue'
import { log, transpose } from 'mathjs'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: string
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private metadata!: any

  private dataMatrix: any[] = []
  private unselectedLines: string[] = []

  private mounted() {
    this.buildHeatMap()
    this.unselectLines()
  }

  private handleRelayout(event: any) {
    if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
      this.buildHeatMap()
      this.unselectLines()
    }
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('data') private updateModelData() {
    this.buildHeatMap()
    this.unselectLines()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis = this.logScale
      ? {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'log',
          //range: [Math.log10(2), Math.log10(5000)],
          title: 'Incidence',
        }
      : {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          //autorange: true,
          title: 'Incidence',
        }
  }

  @Watch('dataMatrix', { deep: true }) async updateUrl() {
    for (let i = 0; i < this.dataMatrix.length; i++) {
      if (
        this.dataMatrix[i].visible == 'legendonly' &&
        !this.unselectedLines.includes(this.dataMatrix[i].name)
      ) {
        this.unselectedLines.push(this.dataMatrix[i].name)
      } else if (
        this.dataMatrix[i].visible != 'legendonly' &&
        this.unselectedLines.includes(this.dataMatrix[i].name)
      ) {
        this.unselectedLines.splice(this.unselectedLines.indexOf(this.dataMatrix[i].name))
      }
    }

    const params = Object.assign({}, this.$route.query)

    params['plot-' + this.metadata.abbreviation] = this.unselectedLines

    try {
      await this.$router.replace({ query: params })
    } catch (e) {
      /** this is OK */
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
        for (let j = 0; j < this.dataMatrix.length; j++) {
          if (this.dataMatrix[j].name == nameArray[i]) {
            this.dataMatrix[j].visible = 'legendonly'
          }
        }
      }
    }
  }

  private buildHeatMap() {
    this.dataMatrix = []

    if (!this.data) return

    const x: string[] = []
    let matrix: any[] = []

    const lines = this.data.split('\n')

    // get column names (not including date)
    const y: string[] = lines[0].split('\t').splice(1)

    // build matrix
    for (const line of lines.splice(1)) {
      const cells = line.split('\t')
      const date = cells[0]
      if (date) {
        x.push(date)
        const values = cells.splice(1)
        matrix.push(values)
      }
    }

    matrix = transpose(matrix)

    for (var i = matrix.length - 1; i >= 0; i--) {
      this.dataMatrix.push({
        x,
        visible: true,
        y: matrix[i],
        name: y[i],
      })
    }
  }

  private layout = {
    autosize: true,
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 10, r: 10, b: 30, l: 60 },
    xaxis: {
      type: 'date',
      range: [this.$store.state.graphStartDate, this.endDate],
      fixedrange: true,
    },
    legend: {
      orientation: 'h',
    },
    yaxis: {
      title: 'Incidence',
      type: 'log',
      fixedrange: true,
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
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
      filename: 'incidenceByAgeGroupOverTime',
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
