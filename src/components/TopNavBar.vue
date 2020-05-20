<template lang="pug">
  nav.navbar.is-link(role="navigation" aria-label="main navigation")
    .navbar-brand
      a.navbar-item.home-link(href="/") Episim Home
        //- img(src="https://bulma.io/images/bulma-logo.png" width="112" height="28")

      a.navbar-burger.burger(
        @click='clickedBurger'
        :class="{'is-active': isBurgerActive}"
        role="button"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample")
        span(aria-hidden="true")
        span(aria-hidden="true")
        span(aria-hidden="true")

    #navbarBasicExample.navbar-menu(
      :class="{'is-active': isBurgerActive}"
      @click='clickedBurger')
      .navbar-start
        router-link.navbar-item(to="/v9/masks/berlin") v9:Masks

        router-link.navbar-item(to="/v9/tracing2/berlin") v9:Tracing

        .navbar-item.has-dropdown.is-hoverable
          a.navbar-link  Older Versions
          .navbar-dropdown
            router-link(to="/v8/masks"): a.navbar-item v8 Masks
            hr.navbar-divider
            router-link(to="/v7"): a.navbar-item v7
            router-link(to="/v5"): a.navbar-item v5
            router-link(to="/v4"): a.navbar-item v4
            router-link(to="/v2"): a.navbar-item v2
            router-link(to="/v1"): a.navbar-item v1

        router-link.navbar-item(to="/v3") Visualizations

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class VueComponent extends Vue {
  private isBurgerActive = false
  private clickedBurger() {
    console.log('clicked!')
    this.isBurgerActive = !this.isBurgerActive
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

#nav {
  background-color: $matsimBlue;
}

#nav a.router-link-exact-active {
  font-weight: bold;
}

.home-link {
  padding-left: 3rem;
}

@media only screen and (max-width: 640px) {
  .home-link {
    padding-left: 1rem;
  }

  .space {
    margin: 0 0.6rem;
  }
}

/*


.navbar-dropdown.navbar-item a {
  color: $matsimBlue;
}

#nav a.router-link-active {
  color: #043b26;
}


#nav a.router-link-exact-active.home {
  color: #ffffff;
}

#nav a.router-link-active {
  color: #ffffff;
}

.space {
  margin: 0 1rem;
}

*/
</style>
