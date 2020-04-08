<template lang="pug">
#v3-app
  animation-view(@loaded="toggleLoaded")

  #nav
    p: router-link(to=".") Activity Traces
    p &bullet;
    p.my-center {{ state.message }}
    button.button.is-white.is-outlined.is-small(
      v-if="isLoaded"
      @click='toggleSimulation') {{ state.isRunning ? 'Pause' : 'Start'}}

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import store from '@/store/index.ts'
import AnimationView from '@/runs/v3/AnimationView.vue'

@Component({
  components: {
    AnimationView,
  },
})
export default class App extends Vue {
  private state = store.state
  private isLoaded = false

  private toggleSimulation() {
    console.log('halt!')
    this.$store.commit('setSimulation', !store.state.isRunning)
  }

  private mounted() {
    this.$store.commit('setFullScreen', true)
  }
  private beforeDestroy() {
    this.$store.commit('setFullScreen', false)
  }

  private toggleLoaded(loaded: boolean) {
    this.isLoaded = loaded
  }
}
</script>

<style scoped lang="scss">
$navHeight: 2.5rem;

#v3-app {
  position: absolute;
  top: $navHeight;
  bottom: 0.2rem;
  width: 100%;
  display: grid;
  grid-template-rows: $navHeight 1fr;
  grid-template-columns: 1fr;
}

#nav {
  display: flex;
  flex-direction: row;
  background-color: rgb(30, 85, 56); /* #648cb4; */
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  margin: 0 0;
  padding: 0 0.5rem 0 2rem;

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

#nav button {
  margin: auto 0;
}

.my-center {
  flex: 1;
  margin: 0 auto;
}

#rview {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}
</style>
