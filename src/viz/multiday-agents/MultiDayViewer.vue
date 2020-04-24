<template lang="pug">
#v3-app
  animation-view.anim(@loaded="toggleLoaded" :speed="speed" :day="newDay")

  modal-markdown-dialog#help-dialog(
    title='Episim: COVID-19 virus spreading dynamics'
    md='@/assets/animation-helptext.md'
    :buttons="[`Let's go!`]"
    :class="{'is-active': showHelp}"
    @click="clickedCloseHelp()"
  )

  .nav
    p: b Berlin Simulation &bullet; COVID-19

  .side-section
    p.digital-clock(
      :style="{'color': textColor.text}")  Day {{ newDay+1 }}
    .day-button-grid
      .day-button(v-for="day of Array.from(Array(92).keys()).slice(1)"
                  :style="{borderBottom: '2px solid ' + colorLookup(day-1)}"
                  :class="{currentday: newDay == day-1, dark: isDarkMode}"
                  :key="day" @click="switchDay(day-1)" :title="'Day ' + day") {{ day }}

  .right-side
    p.digital-clock(
      :style="{'color': textColor.text}") {{ state.message }}

    .morestuff(v-if="isLoaded")
      vue-slider.speed-slider(v-model="speed"
        :data="speedStops"
        :duration="0"
        :dotSize="16"
        tooltip="active"
        tooltip-placement="left"
        :tooltip-formatter="val => val + 'x'"
      )
      p.speed-label(
        :style="{'color': textColor.text}") {{ speed }}x speed


  playback-controls.playback-stuff(v-if="isLoaded" @click='toggleSimulation')

  .extra-buttons(v-if="isLoaded")
    .help-button(@click='clickedHelp' title="info")
      i.help-button-text.fa.fa-1x.fa-question
    img.theme-button(src="@/assets/images/darkmode.jpg" @click='rotateColors' title="dark/light theme")

</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Papaparse from 'papaparse'
import VueSlider from 'vue-slider-component'

import store from '@/store'
import AnimationView from './AnimationView.vue'
import ModalMarkdownDialog from '@/components/ModalMarkdownDialog.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import { ColorScheme } from '@/Interfaces'
import { Route } from 'vue-router'

@Component({
  components: {
    AnimationView,
    ModalMarkdownDialog,
    PlaybackControls,
    VueSlider,
  },
})
export default class VueComponent extends Vue {
  private newDay: number = 0

  private numDays = 90
  private tenDaySets = Array.from(Array(Math.ceil(this.numDays / 10)).keys()) // [0,9]

  private state = store.state
  private isDarkMode = this.state.colorScheme === ColorScheme.DarkMode
  private isLoaded = false
  private showHelp = false

  private totalInfections = require('./totalInfections.csv').default

  private speedStops = [-10, -5, -2, -1, -0.5, -0.25, 0, 0.25, 0.5, 1, 2, 5, 10]
  private speed = 1

  @Watch('state.colorScheme') private swapTheme() {
    this.isDarkMode = this.state.colorScheme === ColorScheme.DarkMode
  }

  private get textColor() {
    const lightmode = {
      text: '#3498db',
      bg: '#eeeef480',
    }

    const darkmode = {
      text: 'white',
      bg: '#181518aa',
    }

    return this.state.colorScheme === ColorScheme.DarkMode ? darkmode : lightmode
  }

  private toggleSimulation() {
    this.$store.commit('setSimulation', !this.state.isRunning)

    // ok so, many times I mashed the play/pause wondering why things wouldn't
    // start moving. Turns out a 0x speed is not very helpful! Help the user
    // out and switch the speed up if they press play.
    if (this.state.isRunning && this.speed === 0.0) this.speed = 1.0
  }

  private mounted() {
    this.$store.commit('setFullScreen', true)

    this.showHelp = !this.state.sawAgentAnimationHelp
    this.$store.commit('setShowingHelp', this.showHelp)

    // start the sim right away if the dialog isn't showing
    this.$store.commit('setSimulation', !this.showHelp)

    // make cubes nice colors
    this.setCubeColors()
  }

  private beforeDestroy() {
    this.$store.commit('setFullScreen', false)
    this.$store.commit('setSimulation', false)
  }

  private dayColors: { [day: number]: string } = {}

  private async setCubeColors() {
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
    for (const row of dailyTotals) {
      let count = 0
      let largestCol = 'nix'

      for (const col of careAbout) {
        if (row[col] > count) {
          count = row[col]
          largestCol = col
        }
      }

      const zeroDay = row.day - 1

      switch (largestCol) {
        case 'nSusceptible':
          this.dayColors[zeroDay] = '#ffff00'
          break
        case 'nInfectedButNotContagious':
          this.dayColors[zeroDay] = '#00ffff'
          break
        case 'nContagious':
          this.dayColors[zeroDay] = '#cc0000'
          break
        case 'nShowingSymptoms':
          this.dayColors[zeroDay] = '#cc00cc'
          break
        case 'nSeriouslySick':
          this.dayColors[zeroDay] = '#4444ff'
          break
        case 'nCritical':
          this.dayColors[zeroDay] = '#550055'
          break
        case 'nRecovered':
          this.dayColors[zeroDay] = '#88ff88'
          break
        default:
          this.dayColors[zeroDay] = '#dddddd'
          break
      }
    }
  }

  private colorLookup(day: number): string {
    return this.dayColors[day]
  }

  private clickedHelp() {
    console.log('HEEELP!')
    this.$store.commit('setSimulation', false)
    this.showHelp = true
    this.$store.commit('setShowingHelp', this.showHelp)
  }

  private clickedCloseHelp() {
    this.showHelp = false
    this.$store.commit('setShowingHelp', this.showHelp)
    // only show the help once
    this.$store.commit('setSawAgentAnimationHelp', true)
    this.$store.commit('setSimulation', true)
  }

  private switchDay(day: number) {
    this.newDay = day
  }

  @Watch('$route') routeChanged(to: Route, from: Route) {
    console.log({ to })
    if (to.hash) {
      const day = parseInt(to.hash.substring(to.hash.length - 1))
      console.log(day)
      this.newDay = day
    }
  }

  private toggleLoaded(loaded: boolean) {
    this.isLoaded = loaded
  }

  private rotateColors() {
    this.$store.commit('rotateColors')
  }
}
</script>

<style scoped lang="scss">
@import '~vue-slider-component/theme/default.css';
@import '@/styles.scss';

#v3-app {
  position: absolute;
  top: $navHeight;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: $navHeight auto 1fr auto auto;
  grid-template-areas:
    'hd              hd'
    'days     rightside'
    'days             .'
    'days  extrabuttons'
    'playback playback';
}

#help-dialog {
  padding: 5rem 0rem;
  grid-row: 3 / 4;
  grid-column: 1 / 2;
  pointer-events: auto;
  z-index: 20;
}

img.theme-button {
  opacity: 1;
  margin: 1rem 0 0rem auto;
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
  background-color: #1e5538; /* #648cb4; */
  margin: 0 0;
  padding: 0 1rem 0 3rem;

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
    color: #ccc;
  }
}

.speed-slider {
  flex: 1;
  width: 100%;
  margin: auto 0rem 0.25rem 0rem;
  pointer-events: auto;
}

.digital-clock {
  margin-top: 1rem;
  font-size: 3rem;
  line-height: 3rem;
  text-shadow: 0 0 0.5px white;
  font-weight: bold;
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
  pointer-events: auto;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  margin-right: 1rem;
  margin-left: auto;
  text-align: right;
  padding: 0 0;
  color: white;
}

.logo {
  flex: 1;
  margin-top: auto;
  margin-left: auto;
  margin-bottom: none;
}

.side-section {
  grid-area: days;
  margin: 0 auto auto 0;
  padding: 0rem 1rem 0 0.75rem;
}

.day-button-grid {
  margin: 1rem auto 0 0;
  margin-right: auto;
  display: flex;
  flex-wrap: wrap;
  padding: 1px 1px;
  width: 4.4rem;
}

.day-button {
  margin: 1px 1px;
  background-color: #eeeeeedd;
  // border: 1px solid white;
  font-size: 0.7rem;
  width: 1.2rem;
  height: 1.2rem;
  text-align: center;
  //padding-top: 2px;
  cursor: pointer;
  pointer-events: auto;
}

.day-button:hover,
.day-button:active {
  background-color: white;
  border: 2px solid white;
  font-weight: bold;
  margin-top: -2px;
}

.day-button.dark {
  background-color: #222222cc;
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
  margin-bottom: 0.25rem;
  margin-left: auto;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  color: white;
  background-color: #3498db;
  display: flex;
  text-align: center;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.25);
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
  padding-bottom: 0.5rem;
  grid-area: extrabuttons;
}

.anim {
  grid-column: 1 / 3;
  grid-row: 1 / 7;
  pointer-events: auto;
}

.label {
  margin-right: 1rem;
  color: white;
  text-align: left;
  line-height: 1.1rem;
  width: min-content;
}

@media only screen and (max-width: 640px) {
  .nav {
    padding-left: 1rem;
  }

  #help-dialog {
    padding: 0 0;
    margin: 3rem 1rem 5rem 1rem;
  }

  .right-side {
    margin-right: 1rem;
  }

  .digital-clock {
    margin-top: 0.5rem;
    font-size: 2rem;
    text-shadow: none;
  }

  .extra-buttons {
    margin-right: 1rem;
  }
  .playback-stuff {
    padding-right: 1rem;
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
}
</style>
