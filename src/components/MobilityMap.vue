<template lang="pug">

vue-plotly(:data="data", :layout="layout", :options="config")

</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  MAPBOX_TOKEN =
    'pk.eyJ1IjoidnNwLXR1LWJlcmxpbiIsImEiOiJjamNpemh1bmEzNmF0MndudHI5aGFmeXpoIn0.u9f04rjFo7ZbWiSceTTXyA'

  private jsonData = {}

  private mounted() {
    this.jsonData = this.loadData()
  }

  private async loadData() {
    //var names = []
    //var geometries = []

    var data = {
      type: 'feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [],
      },
    }

    const response = await fetch(
      'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/original-data/landkreise-in-germany/landkreise-in-germany.geojson'
    )
    const jsonData = await response.json()

    for (var i = 0; i < jsonData.features.length; i++) {
      //geometries.push(jsonData.features[i].geometry.coordinates[0][0])
      //names.push(jsonData.features[i].properties.name_2)
      data.geometry.coordinates = jsonData.features[i].geometry.coordinates
      this.layout.mapbox.layers[0].source.features.push(data)
    }

    console.log(this.layout.mapbox.layers[0].source.features)

    return jsonData
  }

  private data = [
    {
      type: 'choroplethmapbox',
      locations: [],
      z: [],
      //geojson: this.jsonData,
    },
  ]

  private layout = {
    mapbox: {
      center: { lon: 10.3, lat: 51.3 },
      zoom: 5.3,
      //center: { lon: -73.6, lat: 45.505 },
      //zoom: 13,
      style: 'basic',
      layers: [
        {
          source: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [-73.606352888, 45.507489991],
                        [-73.606133883, 45.506876],
                        [-73.605905904, 45.50677398],
                        [-73.603533905, 45.505698946],
                        [-73.60247587, 45.506856969],
                        [-73.600031904, 45.505696003],
                        [-73.599379992, 45.505389066],
                        [-73.599119902, 45.505632008],
                        [-73.598896977, 45.505514039],
                        [-73.598783894, 45.505617001],
                        [-73.591308727, 45.516246185],
                        [-73.591380782, 45.516280145],
                        [-73.596778656, 45.518690062],
                        [-73.60279677, 45.521348046],
                        [-73.612239983, 45.525564037],
                        [-73.612422919, 45.525642061],
                        [-73.617229085, 45.527751983],
                        [-73.617279234, 45.52777416],
                        [-73.617304713, 45.527741334],
                        [-73.617492052, 45.527498362],
                        [-73.617533258, 45.527512253],
                        [-73.618074188, 45.526759105],
                        [-73.618271651, 45.526500673],
                        [-73.61844632, 45.526287943],
                        [-73.618968507, 45.52569856],
                        [-73.619388002, 45.52521675],
                        [-73.619532966, 45.525064183],
                        [-73.619686662, 45.52488929],
                        [-73.619787038, 45.524770086],
                        [-73.619925742, 45.524584939],
                        [-73.619954486, 45.52455769],
                        [-73.620122362, 45.524377961],
                        [-73.620201713, 45.524298907],
                        [-73.620775593, 45.523650879],
                      ],
                    ],
                  ],
                },
              },
              {
                type: 'Feature',
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [-73.606352888, 45.607489991],
                        [-73.606133883, 45.606876],
                        [-73.605905904, 45.60677398],
                        [-73.603533905, 45.605698946],
                        [-73.60247587, 45.606856969],
                        [-73.600031904, 45.605696003],
                        [-73.599379992, 45.605389066],
                        [-73.599119902, 45.605632008],
                        [-73.598896977, 45.605514039],
                        [-73.598783894, 45.605617001],
                        [-73.591308727, 45.616246185],
                        [-73.591380782, 45.616280145],
                        [-73.596778656, 45.618690062],
                        [-73.60279677, 45.621348046],
                        [-73.612239983, 45.625564037],
                        [-73.612422919, 45.625642061],
                        [-73.617229085, 45.627751983],
                        [-73.617279234, 45.62777416],
                        [-73.617304713, 45.627741334],
                        [-73.617492052, 45.627498362],
                        [-73.617533258, 45.627512253],
                        [-73.618074188, 45.626759105],
                        [-73.618271651, 45.626500673],
                        [-73.61844632, 45.626287943],
                        [-73.618968507, 45.62569856],
                        [-73.619388002, 45.62521675],
                        [-73.619532966, 45.625064183],
                        [-73.619686662, 45.62488929],
                        [-73.619787038, 45.624770086],
                        [-73.619925742, 45.624584939],
                        [-73.619954486, 45.62455769],
                        [-73.620122362, 45.624377961],
                        [-73.620201713, 45.624298907],
                        [-73.620775593, 45.623650879],
                      ],
                    ],
                  ],
                },
              },
            ],
          },
          type: 'fill',
          below: 'water',
          color: 'teal',
        },
      ],
    },
    margin: { t: 10, r: 10, b: 10, l: 60 },
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
