<template lang="pug">

vue-plotly(:data="data", :layout="layout", :options="config" @click="handleClick")

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import VuePlotly from '@/components/VuePlotly.vue'

const MAPBOX_TOKEN =
  'pk.eyJ1IjoidnNwLXR1LWJlcmxpbiIsImEiOiJjamNpemh1bmEzNmF0MndudHI5aGFmeXpoIn0.u9f04rjFo7ZbWiSceTTXyA'

export default defineComponent({
  name: 'CollapsiblePanel',
  components: { VuePlotly },
  props: {
    landkreisData: { type: Array as PropType<any[]>, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    time: { type: String, required: true },
    activity: { type: String, required: true },
    mapping: { type: Object },
  },

  data() {
    const logColorScale = [
      [0.0, 'rgb(20,137,73)'],
      [0.5, 'rgb(243,240,159)'],
      [1.0, 'rgb(200,32,38)'],
    ]

    return {
      jsonData: {},
      test: '',
      landkreiseUrl: '/landkreise-in-germany.geojson',
      bundeslandUrl: '/Bundesländer_2016_ew.json',
      svnUrl:
        'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/landkreise-in-germany',

      logColorScale,

      data: [
        {
          type: 'choroplethmapbox',
          locations: ['a', 'b'],
          featureidkey: '',
          z: [1, 2],
          geojson: [],
          text: ['a', 'b'],
          zmin: -40,
          zmax: 40,
          colorscale: logColorScale,
          hoverinfo: 'z' + 'text',
          colorbar: {
            title: { text: 'Percentage change', side: 'right', font: { size: 15 } },
          },
        },
      ],

      layout: {
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
      },

      config: {
        mapboxAccessToken: MAPBOX_TOKEN,
        toImageButtonOptions: {
          format: 'svg', // one of png, svg, jpeg, webp
          filename: 'germany_mobility',
          width: 800,
          height: 900,
          scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
        },
      },
    }
  },

  mounted() {
    this.loadData(this.svnUrl + this.landkreiseUrl)
    //this.loadBundesland(this.svnUrl + this.bundeslandUrl)
    this.updateMap()
  },

  watch: {
    mapping() {
      this.updateMap()
    },

    activity() {
      this.updateMap()
    },

    startDate() {
      this.updateMap()
    },

    endDate() {
      this.updateMap()
    },

    time() {
      this.updateMap()
    },

    landkreisData() {
      this.updateMap()
    },
  },

  methods: {
    handleClick(event: any) {
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
    },

    async loadData(url: string) {
      const response = await fetch(
        'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/landkreise-in-germany/landkreise-in-germany.geojson'
      )
      const jsonData = await response.json()

      this.data[0].geojson = jsonData
    },

    async loadBundesland(url: string) {
      const response = await fetch(
        'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/landkreise-in-germany/Bundesländer_2016_ew.json'
      )
      const jsonData = await response.json()

      this.data[1].geojson = jsonData
    },

    updateMap() {
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
    },
  },
})
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
