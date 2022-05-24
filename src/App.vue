<template lang="pug">
#app(:class="{'full-screen-app' : state.isFullScreen }")
  top-nav-bar#nav(:style="{paddingLeft: state.isFullScreen ? '0rem':''}" )

  .center-area
    router-view.main-view

  //- .footer(v-if="!state.isFullScreen")
  //-   //- a(href="https://vsp.tu-berlin.de")
  //-   //-   img(alt="TU-Berlin logo" src="@/assets/images/vsp-logo.png" width=225)
  //-   a(href="https://matsim.org")
  //-     img(alt="MATSim logo" src="@/assets/images/matsim-logo-white.png" width=250)

  //-   p COVID-19 Scenario Viewer <br/>&copy; 2020 VSP TU-Berlin
  //-   p GDPR: This site does not collect, store, or analyze any personal information.
  //-   p For more info about VSP at TU Berlin, see
  //-     a(href="https://www.vsp.tu-berlin.de") &nbsp;https://vsp.tu-berlin.de
    
  //-   p: router-link(to="/imprint") Imprint

</template>

<script lang="ts">
import TopNavBar from '@/components/TopNavBar.vue'
import store from '@/store'

export default {
  name: 'App',
  components: { TopNavBar },
  data: function() {
    return {
      state: store.state,
    }
  },
}
</script>

<style lang="scss">
@import '@/styles.scss';
@import '~bulma/css/bulma.css';

*,
*::before,
*::after {
  box-sizing: inherit;
}

body,
html {
  margin: 0px 0px;
  padding: 0px 0px;
  height: 100%;
  overscroll-behavior: contain;
}

canvas {
  display: block;
}

html {
  overflow-y: auto;
  background-color: #ccc;
  box-sizing: border-box;
}

.full-screen-app {
  height: 100%;
}

.bury-me {
  z-index: -5;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: 'Roboto', Avenir, Helvetica, Arial, sans-serif;
}

h2 {
  font-size: 2.5rem;
  font-weight: bold;
}

h3 {
  font-size: 1.5rem;
  font-weight: bold;
}

#app {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  background-color: $paleBackground;
  color: #222;
  margin: 0rem 0rem;
  padding: 0px 0px;
  font-family: Roboto, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
}

.modebar-group {
  top: -1.2rem;
  right: -1rem;
}

#nav {
  z-index: 5;
  position: sticky;
  top: 0;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  box-shadow: 0px 2px 10px #00000060;
}

.center-area {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.main-view {
  flex: 1;
}

#nav a.router-link-exact-active {
  color: #ffffff;
}

.space {
  margin: 0 1rem;
}

#app .footer {
  grid-column: 1 / 2;
  grid-row: 3 / 4;
  text-align: center;
  padding: 2rem 0.5rem 3rem 0.5rem;
  background-color: #648cb4;
}

.footer p {
  line-height: 1.2rem;
  margin-top: 0.5rem;
  color: white;
}

.footer a {
  color: #043b26;
}

.footer img {
  margin: 1rem auto;
  padding: 0 1rem;
}

.vue-slider-rail {
  background-color: green;
}
</style>
