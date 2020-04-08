<template lang="pug">
#app
  my-nav-bar#nav
  router-view

  .footer(v-if="!state.isFullScreen")
    a(href="https://vsp.tu-berlin.de")
      img(alt="TU-Berlin logo" src="@/assets/images/vsp-logo.png" width=225)
    a(href="https://matsim.org")
      img(alt="MATSim logo" src="@/assets/images/matsim-logo-white.png" width=250)

    p COVID-19 Scenario Viewer, &copy; 2020 VSP TU-Berlin
    p For more info about VSP, see
      a(href="https://www.vsp.tu-berlin.de") &nbsp;https://vsp.tu-berlin.de

</template>

<script lang="ts">
import MyNavBar from '@/components/TopNavBar.vue'
import store from '@/store/index.ts'

export default {
  name: 'App',
  components: { MyNavBar },
  data: function() {
    return {
      state: store.state,
    }
  },
}
</script>

<style>
@import '~bulma/css/bulma.css';

html {
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

body,
html {
  margin: 0px 0px;
  padding: 0px 0px;
}

html {
  background-color: #333;
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
  color: #222;
  background-color: #eee;
  display: flex;
  flex-direction: column;
  margin: 0rem 0rem;
  padding: 0px 0px;
  font-family: Roboto, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#nav {
  padding: 0.5rem 1rem;
  background-color: #648cb4;
}

#nav a {
  font-weight: bold;
  color: #043b26;
}

#nav a.router-link-exact-active {
  color: #ffffff;
}

.space {
  margin: 0 1rem;
}

#app .footer {
  text-align: center;
  padding: 2rem 0.5rem 3rem 0.5rem;
  background-color: #648cb4;
}

.footer p {
  color: white;
}

.footer a {
  color: #043b26;
}

.footer img {
  margin: 1rem auto;
  padding: 0 1rem;
}
</style>
