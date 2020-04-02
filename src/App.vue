<template lang="pug">
#app
  #nav
    router-link.space(to="/") Home
    | |
    router-link.space(to="/v1") V1
    | |
    router-link.space(to="/v2") V2
    | |
    a.space(href="/covid-sim/v3") V3
    | |
    router-link.space(to="/v4") V4

  router-view()

  .footer
    img(alt="TU-Berlin logo" src="@/assets/logo.png" width=225)
    img(alt="MATSim logo" src="@/assets/matsim-logo-white.png" width=250)
    p COVID-19 Scenario Viewer, &copy; 2020 VSP TU-Berlin
    p For more info about VSP, see
      a(href="https://www.vsp.tu-berlin.de") &nbsp;https://vsp.tu-berlin.de

</template>

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
  background-color: #aab;
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
  color: #334;
}

.footer img {
  margin: 1rem auto;
  padding: 0 1rem;
}
</style>
