<template lang="pug">
vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'
import { weekdays } from 'moment'
import { X, Y } from 'vega-lite/build/src/channel'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private landkreis!: string
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private week!: string
  @Prop({ required: true }) private kind!: string
  @Prop({ required: true }) private yAxisName!: string

  private dataLines: any[] = []

  private mounted() {
    this.updateMobilityLandkreis()
  }

  @Watch('dataLines') private checkData() {
    //console.log(this.dataLines)
  }

  @Watch('kind') private changeActivity() {
    this.layout.yaxis.title = this.yAxisName
    this.updateMobilityData()
  }

  @Watch('data') private updateMobilityData() {
    this.layout.yaxis.title = this.yAxisName
    this.updateMobilityLandkreis()
  }

  @Watch('landkreis') private updateMobilityLandkreis() {
    var mobilityData: any[] = []
    var tempData
    var xData: any[] = []
    var ydata: any[] = []
    for (const [key, value] of Object.entries(this.data)) {
      if (key == this.landkreis) {
        tempData = value
      }
    }

    console.log(this.kind)

    if (this.week != 'weekk') {
      if (tempData !== undefined) {
        for (const [key, value] of Object.entries(tempData)) {
          if (key == this.week) {
            for (const [key2, value2] of Object.entries(value as object)) {
              xData.push(key2)
              ydata.push(value2[this.kind])
            }
          }
        }
      }
    }

    mobilityData[0] = {
      name: this.landkreis,
      x: xData,
      y: ydata,
      fill: 'none',
      marker: { size: 4 },
      line: {
        dash: 'line',
        width: 2,
      },
    }

    this.dataLines = mobilityData
  }

  private layout = {
    showlegend: true,
    autosize: true,
    legend: {
      orientation: 'h',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 60, b: 0, l: 60 },
    xaxis: {
      fixedrange: window.innerWidth < 700,
      //range: ['2020-03-02', '2021-04-26'],
      type: 'date',
    },
    yaxis: {
      fixedrange: window.innerWidth < 700,
      type: 'linear',
      autorange: true,
      title: this.yAxisName,
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
    responsive: true,
    // displayModeBar: true,
    displaylogo: false,
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
      filename: 'custom_image',
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
