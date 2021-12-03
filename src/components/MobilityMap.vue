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
  @Prop({ required: true }) private activity!: string
  @Prop({ required: false }) private mapping!: any

  MAPBOX_TOKEN =
    'pk.eyJ1IjoidnNwLXR1LWJlcmxpbiIsImEiOiJjamNpemh1bmEzNmF0MndudHI5aGFmeXpoIn0.u9f04rjFo7ZbWiSceTTXyA'

  private jsonData = {}
  private test = ''
  private landkreiseUrl = '/landkreise-in-germany.geojson'
  private bundeslandUrl = '/Bundesländer_2016_ew.json'
  private svnUrl =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/landkreise-in-germany'

  private logColorScale = [
    [0.0, 'rgb(20,137,73)'],
    [0.5, 'rgb(243,240,159)'],
    [1.0, 'rgb(200,32,38)'],
  ]

  private mounted() {
    this.loadData(this.svnUrl + this.landkreiseUrl)
    //this.loadBundesland(this.svnUrl + this.bundeslandUrl)
    this.updateMap()
  }

  private handleClick(event: any) {
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

  @Watch('mapping') newMapping() {
    this.updateMap()
  }

  @Watch('activity') private updateActivity() {
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
    if (this.mapping !== undefined) {
      var locations = []
      var data = []
      var names = []
      var localActivity = this.activity
      for (const [key, value] of Object.entries(this.landkreisData)) {
        var id
        id = this.mapping[key]
        locations.push(id)
        names.push(key)
        if (
          value[this.time][this.endDate] === undefined ||
          value[this.time][this.startDate] === undefined
        ) {
        } else {
          if (this.startDate == this.endDate) {
            data.push(value[this.time][this.endDate][this.activity])
            this.data[0].zmin = 0
            this.data[0].zmax = 0
            this.data[0].colorscale = [['ylorbr']]
            if (this.activity == 'endHomeActs') {
              this.data[0].colorbar.title.text =
                'Per day of out-of-home activity between 10 p.m. and 5 a.m. per 1,000 inhabitants'
            } else if (this.activity == 'sharePersonLeavingHome') {
              this.data[0].colorbar.title.text = 'Percent [%]'
            } else if (this.activity == 'dailyRangePerPerson') {
              this.data[0].colorbar.title.text = 'Distance per Person [km]'
            } else if (this.activity == 'outOfHomeDuration') {
              this.data[0].colorbar.title.text = 'Time per Day [h]'
            }
          } else {
            data.push(
              value[this.time][this.endDate][this.activity] *
                (100 / value[this.time][this.startDate][this.activity]) -
                100
            )
            this.data[0].colorscale = this.logColorScale
            this.data[0].zmin = -40
            this.data[0].zmax = 40
            this.data[0].colorbar.title.text = 'Percentage change [%]'
          }
          this.data[0].locations = locations
          this.data[0].z = data
          this.data[0].featureidkey = 'properties.id_2'
          this.data[0].text = names
        }
      }
    } else {
      console.log('Mapping not defined')
    }
  }

  private async loadData(url: string) {
    const response = await fetch(
      'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/landkreise-in-germany/landkreise-in-germany.geojson'
    )
    const jsonData = await response.json()

    this.data[0].geojson = jsonData
  }

  private async loadBundesland(url: string) {
    const response = await fetch(
      'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/landkreise-in-germany/Bundesländer_2016_ew.json'
    )
    const jsonData = await response.json()

    this.data[1].geojson = jsonData
  }

  private data = [
    {
      type: 'choroplethmapbox',
      locations: ['a', 'b'],
      featureidkey: '',
      z: [1, 2],
      geojson: [],
      text: ['a', 'b'],
      zmin: -40,
      zmax: 40,
      colorscale: this.logColorScale,
      hoverinfo: 'z' + 'text',
      colorbar: {
        title: { text: 'Percentage change', side: 'right', font: { size: 15 } },
      },
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
