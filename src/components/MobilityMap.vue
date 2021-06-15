<template lang="pug">

vue-plotly(:data="data", :layout="layout", :options="config")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'
import { string } from 'mathjs'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private landkreisData!: any[]
  @Prop({ required: true }) private startDate!: string
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private time!: string
  MAPBOX_TOKEN =
    'pk.eyJ1IjoidnNwLXR1LWJlcmxpbiIsImEiOiJjamNpemh1bmEzNmF0MndudHI5aGFmeXpoIn0.u9f04rjFo7ZbWiSceTTXyA'

  private jsonData = {}
  private test = ''

  private mounted() {
    this.jsonData = this.loadData()
    this.updateMap()
  }

  @Watch('startDate') private updateStartDate() {
    this.updateMap()
  }

  @Watch('endDate') private updateEndtDate() {
    this.updateMap()
  }

  @Watch('time') private updateTime() {
    this.updateMap()
  }
  @Watch('landkreisData') private updateMap() {
    var locations = []
    var data = []
    for (const [key, value] of Object.entries(this.landkreisData)) {
      var name
      if (key.startsWith('Kreis')) {
        name = key.substring(6)
      } else if (key.startsWith('Landkreis')) {
        name = key.substring(10)
      } else if (key == 'Nienburg/Weser') {
        name = 'Nienburg (Weser)'
      } else if (key == 'Lindau') {
        name = 'Lindau (Bodensee)'
      } else if (key == 'Rhein-Neuss') {
        name = 'Rhein-Kreis Neuss'
      } else if (key == 'Altenkirchen') {
        name = 'Altenkirchen (Westerwald)'
      } else if (key == 'St, Wendel') {
        name = 'St. Wendel'
      } else {
        name = key
      }
      locations.push(name)
      if (
        value[this.time][this.endDate] === undefined ||
        value[this.time][this.startDate] === undefined
      ) {
      } else {
        data.push(
          value[this.time][this.endDate].outOfHomeDuration -
            value[this.time][this.startDate].outOfHomeDuration
        )
        this.data[0].locations = locations
        this.data[0].z = data
        this.data[0].featureidkey = 'properties.name_2'
      }
    }
  }

  private async loadData() {
    //var names = []
    //var geometries = []

    const response = await fetch(
      'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/landkreise-in-germany/landkreise-in-germany.geojson'
    )
    const jsonData = await response.json()

    // for (var i = 0; i < jsonData.features.length; i++) {
    //   //geometries.push(jsonData.features[i].geometry.coordinates[0][0])
    //   //names.push(jsonData.features[i].properties.name_2)
    //   data.geometry.coordinates = jsonData.features[i].geometry.coordinates
    //   this.layout.mapbox.layers[0].source.features.push(data)
    // }

    //this.layout.mapbox.layers[0].source = jsonData
    this.data[0].geojson = jsonData

    return jsonData
  }

  private data = [
    {
      type: 'choroplethmapbox',
      locations: ['a', 'b'],
      featureidkey: '',
      z: [1, 2],
      geojson: [],
    },
  ]

  private layout = {
    mapbox: {
      center: { lon: 10.3, lat: 51.3 },
      zoom: 5.2,
      style: 'basic',
    },
    //margin: { t: 10, r: 10, b: 10, l: 60 },
    margin: { t: 0, r: 0, b: 0, l: 0 },
    paper_bgcolor: 'rgb(236,239,242)',
    showlegend: true,
    legend: {
      x: 0,
      xanchor: 'right',
      y: 0,
    },
    hoverinfo: 'featureidkey' + 'locations',
  }

  private config = {
    mapboxAccessToken: this.MAPBOX_TOKEN,
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
