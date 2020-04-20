<template lang="pug">
#v3-app
  animation-view(@loaded="toggleLoaded" :speed="speed" :day="newDay")

  #nav
    p: router-link(to="#?day=4") Day 4
    p: router-link(to="#?day=5" :day="5") Day 5
    p: router-link(to="#?day=6" :day="6") Day 6
    p: router-link(to="#?day=7" :day="7") Day 7
    p: router-link(to="#?day=8" :day="8") Day 8

  #top-hover-panel(v-if="isLoaded")
    .left-side

    .right-side
      p.digital-clock(
        :style="{'color': textColor.text}") {{ state.message }}
        //:style="{'color': textColor.text, 'background-color': textColor.bg}") {{ state.message }}

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
          //:style="{'color': textColor.text, 'background-color': textColor.bg}") {{ speed }}x speed
        // img.logo(src="@/assets/images/tu-logo.png" width=120)

  #bottom-hover-panel(v-if="isLoaded")
    img.theme-button(src="@/assets/images/darkmode.jpg" @click='rotateColors' title="dark/light theme")
    playback-controls(@click='toggleSimulation')

</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import VueSlider from 'vue-slider-component'

import store from '@/store'
import AnimationView from './AnimationView.vue'
import PlaybackControls from '@/components/PlaybackControls.vue'
import { ColorScheme } from '../../Interfaces'
import { Route } from 'vue-router'

@Component({
  components: {
    AnimationView,
    PlaybackControls,
    VueSlider,
  },
})
export default class Shader extends Vue {
  private newDay: number = 0

  private state = store.state
  private isLoaded = false

  private speedStops = [-10, -5, -2, -1, -0.5, 0, 0.5, 1, 2, 5, 10]
  private speed = 1

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
  bottom: 0.2rem;
  width: 100%;
  display: grid;
  grid-template-rows: $navHeight auto 1fr auto;
  grid-template-columns: 1fr;
}

#three-container {
  grid-row: 2 / 3;
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
}

img.theme-button {
  opacity: 1;
  margin: 1rem 0 1rem auto;
  background-color: black;
  border-radius: 50%;
  border: 2px solid #648cb4;
  width: 3rem;
  height: 3rem;
  cursor: pointer;
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
  margin: 0 1rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  z-index: 5;
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
  width: 100%;
  margin: auto 0rem 0.25rem 0rem;
  flex: 1;
  /*background-color: #5361b380; */
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
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
  margin-right: auto;
}

.right-side {
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  margin-right: 1rem;
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

@media only screen and (max-width: 768px) {
  #nav {
    padding-left: 1rem;
  }

  #bottom-hover-panel {
    margin-left: 1.5rem;
  }

  .digital-clock {
    margin-top: 0.5rem;
    font-size: 2rem;
  }
}
</style>
