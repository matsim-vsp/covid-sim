<template lang="pug">
#v3-app
  animation-view.anim(@loaded="toggleLoaded" :speed="speed" :day="newDay" :showSusceptible="showSusceptible")

  modal-markdown-dialog#help-dialog(
    title='COVID-19 virus spreading'
    md='@/assets/animation-helptext.md'
    :buttons="[`Let's go!`]"
    :class="{'is-active': showHelp}"
    @click="clickedCloseHelp()"
  )

  .nav
    p.big.time(v-if="!state.statusMessage") Berlin: Outbreak Day {{ newDay+1 }}
    p.big.day {{ state.statusMessage }}
    p.big.time {{ state.clock }}

  .side-section
    .day-switchers
      .day-button.switchers(:class="{dark: isDarkMode}"
                   @click="dayStep(-1)" title="Previous day")
                   i.fa.fa-1x.fa-arrow-left
      .day-button.switchers(:class="{dark: isDarkMode}"
                   @click="dayStep(1)" title="Next day")
                   i.fa.fa-1x.fa-arrow-right

    .day-button-grid
      .day-button(v-for="day of Array.from(Array(numDays+1).keys()).slice(1)"
                  :style="{borderBottom: newDay == day-1 ? 'none' : '2px solid ' + colorLookup(day-1)}"
                  :class="{currentday: newDay == day-1, dark: isDarkMode}"
                  :key="day" @click="switchDay(day-1)" :title="'Day ' + day") {{ day }}

  .right-side
    .morestuff(v-if="isLoaded")
      b-slider.speed-slider(v-model="speedSlider"
        :min="0" :max="speedStops.length-1"
        :dotSize="20"
        :tooltip="true"
        tooltip-placement="bottom"
        :custom-formatter="val => speedStops[val] + 'x'"
        @input="speed = speedStops[speedSlider]"
      )
        b-slider-tick(v-for="tick in speedStops" :key="tick" :value="tick")

      p.speed-label(
        :style="{'color': textColor.text}") {{ speed }}x speed

      toggle-button(@change="toggleSusceptible"
                    :value="showSusceptible"
                    :sync="true"
                    :labels="true"
                    color="#4b7cc4"
                    :speed="150")

      p.speed-label(
        :style="{color: textColor.text}") Show susceptible


  playback-controls.playback-stuff(v-if="isLoaded" @click='toggleSimulation')

  .extra-buttons(v-if="isLoaded")
    .help-button(@click='clickedHelp' title="info")
      i.help-button-text.fa.fa-1x.fa-question
    img.theme-button(src="@/assets/images/darkmode.jpg" @click='rotateColors' title="dark/light theme")

  .legend(:class="{dark: isDarkMode}")
    p(:style="{color: isDarkMode ? '#fff' : '#000'}") Legend:
    .legend-items
      p.legend-item(v-for="status in legendBits" :key="status.label" :style="{color: status.color}") {{ status.label }}

</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Papaparse from '@simwrapper/papaparse'
import { ToggleButton } from 'vue-js-toggle-button'

import store from '@/store'
import AnimationView from './AnimationView.vue'
import ModalMarkdownDialog from '@/components/ModalMarkdownDialog.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import { ColorScheme, LIGHT_MODE, DARK_MODE } from '@/Globals'

import totalInfections from './totalInfections.csv?raw'

export default defineComponent({
  name: 'MultiDayViewer',
  components: { AnimationView, ModalMarkdownDialog, PlaybackControls, ToggleButton },
  data: () => {
    return {
      numDays: 90,
      newDay: 0,
      state: store.state,
      isDarkMode: store.state.colorScheme === ColorScheme.DarkMode,
      isLoaded: false,
      showHelp: false,
      showSusceptible: true,
      totalInfections,
      speedStops: [-10, -5, -2, -1, -0.5, -0.25, 0, 0.25, 0.5, 1, 2, 5, 10],
      speed: 1,
      speedSlider: 9, // 9th element of speedStops above = 1.0
      legendBits: [] as any[],
      dayColors: {} as { [day: number]: string },
    }
  },

  watch: {
    'state.colorScheme'() {
      this.isDarkMode = store.state.colorScheme === ColorScheme.DarkMode
      this.updateLegendColors()
      this.setCubeColors()
    },
  },

  mounted() {
    this.$store.commit('setFullScreen', true)

    this.showHelp = !this.state.sawAgentAnimationHelp
    this.$store.commit('setShowingHelp', this.showHelp)

    // start the sim right away if the dialog isn't showing
    this.$store.commit('setSimulation', !this.showHelp)

    this.setInitialDay()

    // make nice colors
    this.setCubeColors()
    this.updateLegendColors()
  },

  beforeDestroy() {
    this.$store.commit('setFullScreen', false)
    this.$store.commit('setSimulation', false)
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
      return this.state.colorScheme === ColorScheme.DarkMode ? darkmode : lightmode
    },
  },

  methods: {
    updateLegendColors() {
      const theme = this.state.colorScheme == ColorScheme.LightMode ? LIGHT_MODE : DARK_MODE

      this.legendBits = [
        { label: 'susceptible', color: theme.susceptible },
        { label: 'latently infected', color: theme.infectedButNotContagious },
        { label: 'contagious', color: theme.contagious },
        { label: 'symptomatic', color: theme.symptomatic },
        { label: 'seriously ill', color: theme.seriouslyIll },
        { label: 'critical', color: theme.critical },
        { label: 'recovered', color: theme.recovered },
      ]
    },

    setInitialDay() {
      // set specified day, if we got one
      const param = '' + this.$route.query.day
      if (param && Number.isFinite(param)) {
        const day = parseInt(param)
        if (day >= 1 || day < this.numDays) {
          this.newDay = day - 1 // stupid 0day
          this.$nextTick()
        }
      }
    },

    toggleSimulation() {
      this.$store.commit('setSimulation', !this.state.isRunning)

      // ok so, many times I mashed the play/pause wondering why things wouldn't
      // start moving. Turns out a 0x speed is not very helpful! Help the user
      // out and switch the speed up if they press play.
      if (this.state.isRunning && this.speed === 0.0) this.speed = 1.0
    },

    async setCubeColors() {
      const dailyTotals = Papaparse.parse(this.totalInfections, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      const careAbout = [
        'nInfectedButNotContagious',
        'nContagious',
        'nShowingSymptoms',
        'nSeriouslySick',
        'nCritical',
        'nRecovered',
      ]

      const theme = this.state.colorScheme == ColorScheme.LightMode ? LIGHT_MODE : DARK_MODE

      // loop for each row in infection summary data
      // -- which doesn't have for day 0! But obviously no one is infected yet
      this.dayColors[0] = theme.infectedButNotContagious

      for (const row of dailyTotals) {
        let count = 0
        let largestCol = 'nix'

        for (const col of careAbout) {
          if (row[col] > count) {
            count = row[col]
            largestCol = col
          }
        }

        const day = row.day

        switch (largestCol) {
          case 'nSusceptible':
            this.dayColors[day] = theme.susceptible
            break
          case 'nInfectedButNotContagious':
            this.dayColors[day] = theme.infectedButNotContagious
            break
          case 'nContagious':
            this.dayColors[day] = theme.contagious
            break
          case 'nShowingSymptoms':
            this.dayColors[day] = theme.symptomatic
            break
          case 'nSeriouslySick':
            this.dayColors[day] = theme.seriouslyIll
            break
          case 'nCritical':
            this.dayColors[day] = theme.critical
            break
          case 'nRecovered':
            this.dayColors[day] = theme.recovered
            break
          default:
            this.dayColors[day] = '#dddddd'
            break
        }
      }
    },

    colorLookup(day: number): string {
      return this.dayColors[day]
    },

    clickedHelp() {
      console.log('HEEELP!')
      this.$store.commit('setSimulation', false)
      this.showHelp = true
      this.$store.commit('setShowingHelp', this.showHelp)
    },

    clickedCloseHelp() {
      this.showHelp = false
      this.$store.commit('setShowingHelp', this.showHelp)
      // only show the help once
      this.$store.commit('setSawAgentAnimationHelp', true)
      this.$store.commit('setSimulation', true)
    },

    toggleSusceptible() {
      this.showSusceptible = !this.showSusceptible
    },

    switchDay(day: number) {
      const param = '' + (day + 1)
      this.$router.replace({ query: { day: param } })
      this.$nextTick()

      this.newDay = day
    },

    dayStep(step: number) {
      let day = this.newDay + step

      // don't be stupid
      if (day < 0) return
      if (day >= this.numDays) return

      this.switchDay(day)
    },

    toggleLoaded(loaded: boolean) {
      this.isLoaded = loaded
    },

    rotateColors() {
      this.$store.commit('rotateColors')
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

#v3-app {
  position: absolute;
  top: 0;
  bottom: 0;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  width: 100%;
  pointer-events: none;
  display: grid;
  margin-top: 3rem;
  grid-template-columns: 1fr 6rem;
  grid-template-rows: auto auto 1fr auto auto auto;
  grid-template-areas:
    'hd              hd'
    'days     rightside'
    'days             .'
    'days  extrabuttons'
    'playback  playback'
    'legend      legend';
}

#help-dialog {
  padding: 2rem 2rem;
  pointer-events: auto;
  z-index: 20;
}

img.theme-button {
  opacity: 1;
  margin: 1rem 0 0.5rem auto;
  background-color: black;
  border-radius: 50%;
  border: 2px solid #648cb4;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.25);
  width: 3rem;
  height: 3rem;
  cursor: pointer;
  pointer-events: auto;
}

img.theme-button:hover {
  border: 2px solid white;
}

#top-hover-panel img.theme-button:hover {
  cursor: pointer;
  background-color: white;
}

.nav {
  grid-area: hd;
  display: flex;
  flex-direction: row;
  margin: 0 0;
  padding: 0 0.5rem 0 1rem;
  background-color: #228855dd;

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

.legend {
  margin-left: 1rem;
  grid-area: legend;
  display: flex;
  flex-direction: row;
  font-weight: bold;
  font-size: 1rem;
  background-color: #ddc;
}

.legend-items {
  flex: 1;
  display: flex;
  flex-direction: row;
  margin-left: 2rem;
  justify-content: space-evenly;
}

.legend-item {
  margin-right: 0.25rem;
}

.legend.dark {
  background-color: #181518;
}

.speed-slider {
  flex: 1;
  width: 100%;
  margin: 0.5rem 0rem 0.25rem 0;
  pointer-events: auto;
  font-weight: bold;
  z-index: 100000;
}

.big {
  color: red;
  opacity: 0.85;
  padding: 0rem 0;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  line-height: 3.75rem;
  font-weight: bold;
}

.day {
  flex: 1;
}

.controls {
  display: flex;
  flex-direction: row;
}

.left-side {
  flex: 1;
  background-color: green;
  margin-left: 0.5rem;
  margin-right: auto;
}

.right-side {
  grid-area: rightside;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  margin-right: 1rem;
  text-align: right;
  padding: 0 0;
  color: white;
  pointer-events: auto;
}

.logo {
  flex: 1;
  margin-top: auto;
  margin-left: auto;
  margin-bottom: none;
}

.side-section {
  grid-area: days;
  margin: 0.6rem auto auto 0.5rem;
  padding: 0rem 1rem 0 0.5rem;
}

.day-button-grid {
  margin: 0.5rem auto 0 0;
  margin-right: auto;
  display: flex;
  flex-wrap: wrap;
  padding: 1px 1px;
  width: 10rem;
}

.day-button {
  margin: 1px 1px;
  background-color: #eeeeee;
  font-size: 0.7rem;
  width: 1.2rem;
  height: 1.2rem;
  text-align: center;
  cursor: pointer;
  pointer-events: auto;
}

.day-button:hover,
.day-button:active {
  background-color: white;
  font-weight: bold;
}

.day-button.dark {
  background-color: #222222;
  color: #bbb;
  border: 1px solid black;
}

.day-button.dark:hover,
.day-button.dark:active {
  background-color: black;
  border: 2px solid $themeColor;
  font-weight: bold;
}

.day-button.currentday {
  background-color: $themeColor;
  font-weight: bold;
  color: white;
}

.help-button {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  color: white;
  background-color: $themeColor;
  display: flex;
  text-align: center;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.25);
  margin: 0 0 0 auto;
  cursor: pointer;
  pointer-events: auto;
}

.help-button:hover {
  background-color: #39a8f1;
  border: 2px solid white;
}

.help-button-text {
  margin: auto auto;
}

.playback-stuff {
  grid-area: playback;
  padding: 0rem 1rem 1rem 2rem;
  pointer-events: auto;
}

.extra-buttons {
  margin-left: auto;
  margin-right: 1rem;
  grid-area: extrabuttons;
}

.anim {
  grid-column: 1 / 3;
  grid-row: 2 / 7;
  pointer-events: auto;
}

.label {
  margin-right: 1rem;
  color: white;
  text-align: left;
  line-height: 1.1rem;
  width: min-content;
}

.speed-label {
  font-weight: bold;
  margin-bottom: 1rem;
  margin-top: 0.25rem;
}

.day-switchers {
  display: flex;
  flex-direction: row;
}

.switchers {
  margin-right: 0.3rem;
  width: 1.8rem;
  height: 1.8rem;
  padding-top: 0.2rem;
  font-size: 1rem;
}

@media only screen and (max-width: 640px) {
  .nav {
    padding: 0rem 0.5rem;
  }

  .right-side {
    margin-right: 1rem;
  }

  .big {
    padding: 0 0rem;
    margin-top: 0.5rem;
    font-size: 1.3rem;
    line-height: 2rem;
  }

  .legend {
    margin-left: 0.5rem;
    display: flex;
    flex-direction: row;
    font-size: 0.7rem;
  }

  .legend-items {
    flex: 1;
    margin-left: 2rem;
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(4, auto);
    font-size: 0.7rem;
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

  .day-button-grid {
    width: 4.4rem;
  }

  .day-button {
    color: transparent;
    background-color: #eeeeeedd;
    font-size: 0.7rem;
    width: 1rem;
    height: 0.5rem;
    text-align: center;
    //padding-top: 2px;
    cursor: pointer;
    pointer-events: auto;
  }

  .day-button.dark {
    color: transparent;
    background-color: #222222cc;
    border: 1px solid black;
  }

  .day-button.currentday {
    color: transparent;
    background-color: white;
  }

  .switchers {
    width: 1.5rem;
    height: 1.5rem;
    color: black;
  }
  .switchers.dark {
    color: white;
    background-color: #223;
  }
}
</style>
