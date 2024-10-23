<template lang="pug">
#entire-sim

  .nav
    p.big.xtitle {{ vizDetails.title }}
    p.big.time(v-if="myState.statusMessage") {{ myState.statusMessage }}

  agent-viz.anim(:simulationTime="simulationTime"
                :paths="$options.paths"
                :colors="COLOR_OCCUPANCY"
                :settingsShowLayers="SETTINGS"
                :center="vizDetails.center"
                :searchEnabled="searchEnabled"
                :vehicleLookup = "vehicleLookup"
                :onClick = "handleClick")

  .right-side(v-if="isLoaded")
    collapsible-panel(:darkMode="false" width="150" direction="right")
      .big.clock
        p Day&nbsp;{{ myState.day }}
        p {{ myState.clock }}

      .panel-items
        //- legend-colors.legend-block(title="Anfragen:" :items="legendRequests")
        .panel-item
          p: b Legend:

        //- legend-colors.legend-block(v-if="legendItems.length"
        //-   title="Passagiere:" :items="legendItems")

        //- .search-panel
        //-   p.speed-label(:style="{margin: '1rem 0 0 0', color: textColor.text}") Suche:
        //-   form(autocomplete="off")
        //-   .field
        //-     p.control.has-icons-left
        //-       input.input.is-small(type="email" placeholder="Search..." v-model="searchTerm")
        //-       span.icon.is-small.is-left
        //-         i.fas.fa-search

        //- settings-panel.settings-area(:items="SETTINGS" @click="handleSettingChange")

        .speed-block
          p.speed-label Speed:
            br
            | {{ speed }}x

          vue-slider.speed-slider(v-model="speed"
            :data="speedStops"
            :duration="0"
            :dotSize="20"
            tooltip="active"
            tooltip-placement="bottom"
            :tooltip-formatter="val => val + 'x'"
          )

  .bottom-area
    playback-controls.playback-stuff(
      @click='toggleSimulation'
      @time='setTime'
      :timeStart = "timeStart"
      :timeEnd = "timeEnd"
      :isRunning = "myState.isRunning"
      :currentTime = "simulationTime"
      :currentDay = "myState.day")

</template>

<script lang="ts">
import Papaparse from '@simwrapper/papaparse'
import VueSlider from 'vue-slider-component'
import { ToggleButton } from 'vue-js-toggle-button'
import crossfilter from 'crossfilter2'
import * as coroutines from 'js-coroutines'

import globalStore from '@/store'
import CollapsiblePanel from '@/components/CollapsiblePanel.vue'
import PlaybackControls from './PlaybackControls.vue'
import SettingsPanel from './SettingsPanel.vue'

import { ColorScheme, LegendItem, LegendItemType, LIGHT_MODE, DARK_MODE } from '@/Globals'

// import { VuePlugin } from 'vuera'
// Vue.use(VuePlugin)

import AgentViz from './AgentViz'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  // name: '',
  components: {
    CollapsiblePanel,
    SettingsPanel,
    VueSlider,
    // LegendColors,
    PlaybackControls,
    ToggleButton,
    AgentViz,
  },
  props: {
    // state: { type: Object, required: true },
    // measure: { type: String, required: true },
  },
  data() {
    const MAX_DAYS = 250

    return {
      SETTINGS: {
        Fahrzeuge: true,
        Routen: false,
        'DRT Anfragen': false,
      } as any,
      COLOR_OCCUPANCY: {
        0: [255, 0, 0],
        1: [255, 0, 0],
        2: [255, 0, 0],
        3: [255, 0, 0],
        4: [255, 0, 0],
      } as any,
      legendItems: [] as LegendItem[],
      legendRequests: [] as any,

      vizDetails: {
        network: '',
        drtTrips: '',
        projection: '',
        title: '',
        description: '',
        center: [13.45, 52.5],
      },

      myState: {
        statusMessage: '',
        clock: '00:00',
        day: 1,
        colorScheme: ColorScheme.DarkMode,
        isRunning: false,
        isShowingHelp: false,
        fileApi: null as any,
        fileSystem: undefined as any,
        data: [] as any[],
      },

      maxDays: MAX_DAYS,
      timeStart: 0,
      timeEnd: MAX_DAYS * 86400,

      simulationTime: 6 * 3600, // 8 * 3600 + 10 * 60 + 10 ,
      timeElapsedSinceLastFrame: 0,

      paths: crossfilter([]) as crossfilter.Crossfilter<any>,
      pathStart: null as null | crossfilter.Dimension<any, any>,
      pathEnd: null as null | crossfilter.Dimension<any, any>,
      pathVehicle: null as null | crossfilter.Dimension<any, any>,

      searchTerm: '',
      searchEnabled: false,

      globalState: globalStore.state,
      isDarkMode: true,
      isLoaded: true,
      showHelp: false,

      speedStops: [-100, -10, -5, -2, -1, -0.5, -0.25, 0, 0.25, 0.5, 1, 2, 5, 10, 100],
      speed: 1,

      legendBits: [] as any[],

      vehicleLookup: [] as string[],
      vehicleLookupString: {} as { [id: string]: number },

      isPausedDueToHiding: false,
      dataArray: [] as any[],
      numPoints: 0,
    }
  },

  async mounted() {
    globalStore.commit('setFullScreen', true)

    this.showHelp = false
    this.updateLegendColors()

    this.setWallClock()

    this.myState.statusMessage = 'Loading files...'
    console.log('loading files')
    this.loadFiles()

    console.log('parsing vehicle motion')
    this.myState.statusMessage = 'Calculating motion...'

    console.log('GO!')
    this.myState.statusMessage = ''

    document.addEventListener('visibilitychange', this.handleVisibilityChange, false)

    this.myState.isRunning = true
    this.timeElapsedSinceLastFrame = Date.now()
    this.animate()
  },

  beforeDestroy() {
    document.removeEventListener('visibilityChange', this.handleVisibilityChange)
    globalStore.commit('setFullScreen', false)
    this.$store.commit('setFullScreen', false)
    this.myState.isRunning = false
  },

  computed: {
    textColor() {
      const lightmode = {
        text: '#3498db',
        bg: '#eeeef480',
      }

      const darkmode = {
        text: 'white',
        bg: '#181518aa',
      }

      return this.myState.colorScheme === ColorScheme.DarkMode ? darkmode : lightmode
    },
  },

  watch: {
    'state.colorScheme'() {
      this.isDarkMode = this.myState.colorScheme === ColorScheme.DarkMode
      this.updateLegendColors()
    },

    searchTerm() {
      const vehicleNumber = this.vehicleLookupString[this.searchTerm]
      if (vehicleNumber > -1) {
        console.log('vehicle', vehicleNumber)
        this.pathVehicle?.filterExact(vehicleNumber)
        this.searchEnabled = true
      } else {
        console.log('nope')
        this.pathVehicle?.filterAll()
        this.searchEnabled = false
      }
      this.updateDatasetFilters()
    },
  },

  methods: {
    async handleSettingChange(label: string) {
      console.log(label)
      // this.SETTINGS[label] = !this.SETTINGS[label]
      this.updateDatasetFilters()
      this.simulationTime += 1 // this will force a redraw
    },

    // this happens if viz is the full page, not a thumbnail on a project page
    buildRouteFromUrl() {
      const params = this.$route.params
      if (!params.project || !params.pathMatch) {
        console.log('I CANT EVEN: NO PROJECT/PARHMATCH')
        return
      }

      // project filesystem
      // const filesystem = this.getFileSystem(params.project)
      // this.myState.fileApi = new HTTPFileSystem(filesystem)
      // this.myState.fileSystem = filesystem

      // subfolder and config file
      const sep = 1 + params.pathMatch.lastIndexOf('/')
      const subfolder = params.pathMatch.substring(0, sep)
      const config = params.pathMatch.substring(sep)
    },

    handleClick(vehicleNumber: any) {
      // null means empty area clicked: clear map.
      if (vehicleNumber === null) {
        this.searchTerm = ''
        return
      }

      const vehId = this.vehicleLookup[vehicleNumber]
      console.log(vehId)

      // set -- or clear -- search box!
      if (this.searchTerm === vehId) this.searchTerm = ''
      else this.searchTerm = vehId
    },

    arrayBufferToBase64(buffer: any) {
      var binary = ''
      var bytes = new Uint8Array(buffer)
      var len = bytes.byteLength
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return window.btoa(binary)
    },

    updateLegendColors() {
      // const theme = this.myState.colorScheme == ColorScheme.LightMode ? LIGHT_MODE : DARK_MODE
      // this.legendBits = [
      //   { label: 'susceptible', color: theme.susceptible },
      //   { label: 'latently infected', color: theme.infectedButNotContagious },
      //   { label: 'contagious', color: theme.contagious },
      //   { label: 'symptomatic', color: theme.symptomatic },
      //   { label: 'seriously ill', color: theme.seriouslyIll },
      //   { label: 'critical', color: theme.critical },
      //   { label: 'recovered', color: theme.recovered },
      // ]
    },

    setWallClock() {
      const hour = Math.floor(this.simulationTime / 3600)
      const minute = Math.floor(this.simulationTime / 60) % 60
      this.myState.clock = `${hour < 10 ? '0' : ''}${hour}${minute < 10 ? ':0' : ':'}${minute}`
    },

    setTime(seconds: number) {
      this.myState.day = 1 + Math.floor(seconds / 86400)
      this.simulationTime = seconds % 86400

      this.setWallClock()

      // only filter if search is disabled and we have data loaded already
      if (this.pathStart && this.pathEnd) {
        this.pathStart.filter([0, this.simulationTime])
        this.pathEnd.filter([this.simulationTime, Infinity])
      }

      //@ts-ignore
      this.$options.paths = this.paths.allFiltered()
    },

    toggleSimulation() {
      this.myState.isRunning = !this.myState.isRunning
      this.timeElapsedSinceLastFrame = Date.now()

      // ok so, many times I mashed the play/pause wondering why things wouldn't
      // start moving. Turns out a 0x speed is not very helpful! Help the user
      // out and switch the speed up if they press play.
      if (this.myState.isRunning && this.speed === 0.0) this.speed = 1.0

      // and begin!
      if (this.myState.isRunning) this.animate()
    },

    handleVisibilityChange() {
      if (this.isPausedDueToHiding && !document.hidden) {
        console.log('unpausing')
        this.isPausedDueToHiding = false
        this.toggleSimulation()
      } else if (this.myState.isRunning && document.hidden) {
        console.log('pausing')
        this.isPausedDueToHiding = true
        this.toggleSimulation()
      }
    },

    // convert path/timestamp info into path traces we can use
    async parseRouteTraces(trips: any[]) {
      let countTraces = 0
      let vehNumber = -1

      const traces: any = []

      await coroutines.forEachAsync(trips, (vehicle: any) => {
        vehNumber++

        let time = vehicle.timestamps[0]
        let nextTime = vehicle.timestamps[0]

        let segments: any[] = []

        for (let i = 1; i < vehicle.path.length; i++) {
          nextTime = vehicle.timestamps[i]

          // same point? start of new path.
          if (
            vehicle.path[i][0] === vehicle.path[i - 1][0] &&
            vehicle.path[i][1] === vehicle.path[i - 1][1]
          ) {
            segments.forEach(segment => {
              segment.t1 = vehicle.timestamps[i - 1]
            })

            traces.push(...segments)

            segments = []
            time = nextTime
          } else {
            segments.push({
              t0: time,
              p0: vehicle.path[i - 1],
              p1: vehicle.path[i],
              v: vehNumber,
              occ: vehicle.passengers[i - 1],
            })
          }
        }

        // save final segments
        segments.forEach(segment => {
          segment.t1 = nextTime
        })
        traces.push(...segments)
      })

      return crossfilter(traces)
    },

    async parseDrtRequests(requests: any[]) {
      if (this.vehicleLookup.length) {
        for (const request of requests) {
          try {
            request[5] = this.vehicleLookupString[request[5]]
          } catch (e) {}
        }
      }

      return crossfilter(requests)
    },

    async parseVehicles(trips: any[]) {
      const allTrips: any[] = []
      let vehNumber = -1

      await coroutines.forEachAsync(trips, (trip: any) => {
        const path = trip.path
        const timestamps = trip.timestamps
        const passengers = trip.passengers

        // attach vehicle ID to each segment so we can click
        vehNumber++
        this.vehicleLookup[vehNumber] = trip.id
        this.vehicleLookupString[trip.id] = vehNumber

        for (let i = 0; i < trip.path.length - 1; i++) {
          allTrips.push({
            t0: timestamps[i],
            t1: timestamps[i + 1],
            p0: path[i],
            p1: path[i + 1],
            v: vehNumber,
            occ: passengers[i],
          })
        }
      })
      return crossfilter(allTrips)
    },

    updateDatasetFilters() {
      // dont' filter if we haven't loaded yet
      if (!this.pathStart) return

      if (this.SETTINGS.Fahrzeuge && this.pathEnd) {
        this.pathStart.filter([0, this.simulationTime])
        this.pathEnd.filter([this.simulationTime, Infinity])
        //@ts-ignore:
        this.$options.paths = this.paths.allFiltered()
      }
    },

    loadFiles() {
      let trips: any[] = []

      const filename = 'https://covid-sim.info/entire-animation/trips.csv'
      Papaparse.parse(filename, {
        preview: 200000,
        download: true,
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        worker: true,
        step: this.chunkCSVloaded,
        complete: this.finishedLoadingCSV,
      })
    },

    chunkCSVloaded(results: any) {
      this.numPoints++
      this.dataArray.push([
        results.data.timeStart,
        results.data.timeEnd,
        [results.data.locStartX, results.data.locStartY],
        [results.data.locEndX, results.data.locEndY],
      ])
      if (this.numPoints % 10000 === 0) this.myState.statusMessage = `${this.numPoints}`
    },

    finishedLoadingCSV(parsed: any) {
      console.log('all done', this.numPoints)
      this.myState.statusMessage = ''

      this.paths = crossfilter(this.dataArray)
      this.pathStart = this.paths.dimension(d => d[0])
      this.pathEnd = this.paths.dimension(d => d[1])
      // this.pathVehicle = this.paths.dimension(d => d.v)
      this.dataArray = []
    },

    toggleLoaded(loaded: boolean) {
      this.isLoaded = loaded
    },

    rotateColors() {
      this.myState.colorScheme =
        this.myState.colorScheme === ColorScheme.DarkMode
          ? ColorScheme.LightMode
          : ColorScheme.DarkMode
      localStorage.setItem('plugin/agent-animation/colorscheme', this.myState.colorScheme)
    },

    animate() {
      if (this.myState.isRunning) {
        const elapsed = Date.now() - this.timeElapsedSinceLastFrame
        this.timeElapsedSinceLastFrame += elapsed
        this.simulationTime += elapsed * this.speed * 0.06

        if (this.simulationTime > 86400) {
          this.myState.day += 1
          this.simulationTime -= 86400
        } else if (this.simulationTime < 0) {
          this.myState.day -= 1
          this.simulationTime += 86400
        }

        this.updateDatasetFilters()
        this.setWallClock()
        window.requestAnimationFrame(this.animate)
      }
    },
  },
})
</script>

<style scoped lang="scss">
@use '~vue-slider-component/theme/default.css' as *;
@use '@/styles.scss' as *;

#entire-sim {
  position: absolute;
  top: 0;
  bottom: 0;
  display: grid;
  pointer-events: none;
  background-size: cover;
  grid-template-columns: 1fr min-content;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    'title              .'
    '.          rightside'
    '.                  .'
    'playback    playback';
}

#v3-app.hide-thumbnail {
  background: none;
}

.nav {
  grid-area: title;
  display: flex;
  flex-direction: row;
  margin: 0 0;
  padding: 0 0.5rem 0 1rem;

  a {
    font-weight: bold;
    color: white;
    text-decoration: none;

    &.router-link-exact-active {
      color: white;
    }
  }

  p {
    margin: auto 0.5rem auto 0;
    padding: 0 0;
    color: white;
  }
}

.speed-block {
  margin-top: 1rem;
}

.legend-block {
  margin-top: 2rem;
}

.speed-slider {
  flex: 1;
  width: 100%;
  margin: 0rem 0.25rem 0.25rem 0rem;
  font-weight: bold;
}

.big {
  padding: 0rem 0;
  // margin-top: 1rem;
  font-size: 2rem;
  line-height: 3.75rem;
  font-weight: bold;
}

.right-side {
  margin-top: 2rem;
  grid-area: rightside;
  background-color: white;
  box-shadow: 0px 2px 10px #aaaaaaee;
  display: flex;
  color: black;
  flex-direction: column;
  font-size: 0.8rem;
  pointer-events: auto;
}

.playback-stuff {
  flex: 1;
}

.bottom-area {
  display: flex;
  flex-direction: row;
  grid-area: playback;
  padding: 0.5rem 1rem 0.5rem 2rem;
  pointer-events: auto;
  background-color: white;
}

.settings-area {
  z-index: 20;
  pointer-events: auto;
  background-color: $steelGray;
  color: black;
  font-size: 0.8rem;
  padding: 0.25rem 0;
  margin: 1.5rem 0rem 0 0;
}

.anim {
  background-color: var(--bgPale);
  z-index: -1;
  grid-column: 1 / 3;
  grid-row: 1 / 5;
  pointer-events: auto;
}

.speed-label {
  font-size: 0.8rem;
  font-weight: bold;
}

.clock {
  min-width: max-content;
  background-color: #000000cc;
  color: white;
  padding: 0.5rem 1rem 0.5rem 0rem;
  // border: 3px solid white;
}

.clock p {
  text-align: center;
  padding: 0rem 1rem;
  line-height: 2.5rem;
}

.tooltip {
  padding: 5rem 5rem;
  background-color: #ccc;
}

.panel-items {
  margin: 0 0.5rem;
}

input {
  border: none;
  background-color: #235;
  color: #ccc;
}

@media only screen and (max-width: 640px) {
  .nav {
    padding: 0.5rem 0.5rem;
  }

  .clock {
    text-align: center;
  }

  .right-side {
    font-size: 0.7rem;
    margin-right: 0.25rem;
  }

  .big {
    padding: 0 0rem;
    margin-top: 0.5rem;
    font-size: 1.3rem;
    line-height: 2rem;
  }

  .side-section {
    margin-left: 0;
  }

  .extra-buttons {
    margin-right: 1rem;
  }
  .playback-stuff {
    padding-right: 1rem;
  }
}
</style>
