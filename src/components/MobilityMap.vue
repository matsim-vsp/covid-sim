<template lang="pug">

vue-plotly(:data="data", :layout="layout", :options="config" @click="handleClick")

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

  private handleClick(event: any) {
    console.log(event)
    try {
      // according to Plot.ly docs the points[] array should exist:
      // https://plotly.com/javascript/plotlyjs-events/
      const location = event.points[0].location
      console.log('User clicked on:', location)

      // send the event upstream!
      this.$emit('landkreisClicked', location)
    } catch (error) {
      console.error(error)
    }
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
      } else if (key == 'Landkreis Rostock') {
        name = 'Landkreis Rostock'
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
          value[this.time][this.endDate].endHomeActs *
            (100 / value[this.time][this.startDate].endHomeActs) -
            100
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

    // Change Data from GeoJSON

    /*

    if (
      jsonData.features[0].properties.name_2 == 'Rostock' &&
      jsonData.features[0].properties.type_2 == 'Landkreis Rostock'
    ) {
      jsonData.features[0].properties.name_2 = 'Landkreis Rostock'
    }
    */

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
      zmid: 0,
      zmin: -40,
      zmax: 40,
    },
  ]

  private layout = {
    mapbox: {
      center: { lon: 10.3, lat: 51.3 },
      zoom: 5.3,
      style: 'basic',
    },
    margin: { t: 5, r: 0, b: 0, l: 0 },
    paper_bgcolor: 'rgb(236,239,242)',
    coloraxis: {
      cauto: false,
      cmin: -5,
      cmax: 5,
    },
  }

  private config = {
    mapboxAccessToken: this.MAPBOX_TOKEN,
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'germany_mobility',
      width: 800,
      height: 900,
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
