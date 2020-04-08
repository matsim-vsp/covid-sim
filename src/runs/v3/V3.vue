<template lang="pug">
#app
  animation-view.biggie
  #nav
    p: router-link(to="/") Traces
    p &bullet;
    p.my-center {{ state.message }}
    button.button.is-small(@click='toggleSimulation') {{ state.isRunning ? 'Pause' : 'Start'}}

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

  private toggleSimulation() {
    console.log('halt!')
    this.$store.commit('setSimulation', !store.state.isRunning)
  }
}
</script>

<style scoped lang="scss">
$navHeight: 3rem;

#app {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 500px;
  display: grid;
  grid-template-rows: $navHeight 1fr;
  grid-template-columns: 1fr;
}

#nav {
  background-color: #648cb4;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  margin: 0 0;
  padding-left: 1rem;
  display: flex;
  flex-direction: row;

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

.biggie {
  height: 100rem;
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
