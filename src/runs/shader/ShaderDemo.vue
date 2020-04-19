<template lang="pug">
#v3-app
  animation-view(@loaded="toggleLoaded" :speed="speed")

  #nav
    p: router-link(to=".") Infection Traces
    p &bullet;

    .controls(v-if="isLoaded")

      button.button.is-white.is-outlined.is-small(
        v-if="isLoaded"
        @click='toggleSimulation') {{ state.isRunning ? 'Pause' : 'Start'}}

  #hover-panel(v-if="isLoaded")
    .left-side
      img(src="@/assets/images/darkmode.jpg" width=40 @click='rotateColors')

    .right-side
      p.digital-clock {{ state.message }}
      vue-slider.speed-slider(v-model="speed"
        :data="speedStops"
        tooltip="active"
        tooltip-placement="left"
        :tooltip-formatter="val => val + 'x'"
      )
      p {{ speed }}x speed

</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import VueSlider from 'vue-slider-component'

import store from '@/store'
import AnimationView from './AnimationView.vue'

@Component({
  components: {
    AnimationView,
    VueSlider,
  },
})
export default class Shader extends Vue {
  private state = store.state
  private isLoaded = false

  private speedStops = [-10, -5, -2, -1, -0.5, 0, 0.5, 1, 2, 5, 10]
  private speed = 1

  private toggleSimulation() {
    console.log('halt!')
    this.$store.commit('setSimulation', !store.state.isRunning)
  }

  private mounted() {
    this.$store.commit('setFullScreen', true)
    this.$store.commit('setSimulation', true)
  }
  private beforeDestroy() {
    this.$store.commit('setFullScreen', false)
    this.$store.commit('setSimulation', true)
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
  grid-template-rows: $navHeight auto 1fr;
  grid-template-columns: 1fr;
}

#three-container {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}

#hover-panel {
  z-index: 5;
  display: flex;
  flex-direction: row;
  padding: 0.5rem 0.5rem 0.2rem 0;
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}

#hover-panel img {
  opacity: 1;
  padding: 0.1rem 0.1rem;
  background-color: black;
}

#hover-panel img:hover {
  cursor: pointer;
  background-color: white;
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

.controls button {
  margin: auto 0;
}

.speed-slider {
  width: 100%;
  margin: auto 0rem 0.25rem 0rem;
  flex: 1;
  background-color: #5361b380;
}

.digital-clock {
  font-size: 3rem;
  font-weight: bold;
  color: white;
}

.controls {
  display: flex;
  flex-direction: row;
}

.left-side {
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
}

#rview {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}
@media only screen and (max-width: 768px) {
  #nav {
    padding-left: 1rem;
  }
}
</style>
