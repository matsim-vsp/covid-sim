<template lang="pug">
#v3-app
  animation-view(@loaded="toggleLoaded" :speed="speed" :day="newDay")

  modal-markdown-dialog#help-dialog(
    title='What is this?'
    md='@/assets/animation-helptext.md'
    :buttons="['OK']"
    :class="{'is-active': showHelp}"
    @click="showHelp = false"
  )

  #nav
    p Berlin &bullet; Multiday Simulation

  #top-hover-panel(v-if="isLoaded")
    .day-button-grid
      .ten-day-set(v-for="dec of tenDaySets" :key="dec")
        .day-button(v-for="cube of Array.from(Array(10).keys())"
                    :class="{currentday: newDay == cubeLookup[cube] + dec*10, dark: isDarkMode}"
                    :key="cube+10*dec" @click="switchDay(cube,dec)") {{ cubeLookup[cube] + dec*10 }}

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


  #bottom-hover-panel(v-if="isLoaded")

    .help-button(@click='clickedHelp')
      i.help-button-text.fa.fa-1x.fa-question

    img.theme-button(src="@/assets/images/darkmode.jpg" @click='rotateColors' title="dark/light theme")

    playback-controls(@click='toggleSimulation')

</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
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
  private cubeLookup = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]

  private state = store.state
  private isLoaded = false

  private isDarkMode = this.state.colorScheme === ColorScheme.DarkMode

  private speedStops = [-10, -5, -2, -1, -0.5, 0, 0.5, 1, 2, 5, 10]
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
    this.$store.commit('setSimulation', true)
  }

  private beforeDestroy() {
    this.$store.commit('setFullScreen', false)
    this.$store.commit('setSimulation', true)
  }

  private switchDay(cube: number, dec: number) {
    console.log(cube, dec)
    this.newDay = dec * 10 + this.cubeLookup[cube]
    console.log(this.newDay)
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

  private showHelp = false

  private clickedHelp() {
    console.log('HEEELP!')
    this.showHelp = true
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
  bottom: 0.2rem;
  width: 100%;
  display: grid;
  grid-template-rows: $navHeight auto 1fr auto;
  grid-template-columns: 1fr;
}

#help-dialog {
  grid-row: 2 / 4;
  grid-column: 1 / 2;
}

#top-hover-panel {
  z-index: 5;
  display: flex;
  flex-direction: row;
  padding: 0rem 0rem 0.2rem 0;
  grid-row: 2 / 3;
  grid-column: 1 / 2;
  height: 100%;
  pointer-events: none;
}

img.theme-button {
  opacity: 1;
  margin: 1rem 0 1rem auto;
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

#bottom-hover-panel {
  grid-row: 4 / 5;
  grid-column: 1 / 2;
  margin: 0 2rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  z-index: 5;
  pointer-events: none;
}

#nav {
  display: flex;
  flex-direction: row;
  background-color: #1e5538; /* #648cb4; */
  grid-row: 1 / 2;
  grid-column: 1 / 2;
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
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  margin-right: 2rem;
  margin-left: auto;
  text-align: right;
  padding: 0 0;
  color: white;
  height: 100%;
}

.logo {
  flex: 1;
  margin-top: auto;
  margin-left: auto;
  margin-bottom: none;
}

#rview {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}

.day-button-grid {
  padding: 0.5rem 2rem 0 0.5rem;
  display: flex;
  flex-wrap: wrap;
  margin: 0 0;
  align-content: flex-start;
}

.ten-day-set {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 0;
  align-content: flex-start;
  width: 7.6rem;
  height: 3.15rem;
}

.day-button {
  margin: 1px 1px;
  background-color: #eeeeeedd;
  border: 1px solid white;
  font-size: 0.7rem;
  width: 1.3rem;
  height: 1.3rem;
  text-align: center;
  padding-top: 2px;
  cursor: pointer;
  pointer-events: auto;
}

.day-button:hover,
.day-button:active {
  background-color: white;
  border: 2px solid $themeColor;
  font-weight: bold;
  padding-top: 1px;
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
  padding-top: 2px;
  background-color: $themeColor;
  font-weight: bold;
  color: white;
}

.help-button {
  margin-bottom: 0.5rem;
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

@media only screen and (max-width: 640px) {
  #nav {
    padding-left: 1rem;
  }

  #bottom-hover-panel {
    margin-left: 1.5rem;
    margin-right: 1rem;
  }

  .right-side {
    margin-right: 1rem;
  }

  .digital-clock {
    margin-top: 0.5rem;
    font-size: 2rem;
  }
}
</style>
