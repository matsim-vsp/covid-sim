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
      :class="{'is-active': isBurgerActive}")
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


  //- router-link.space(to="/v1") V1
  //- | |
  //- router-link.space(to="/v2") V2
  //- | |
  //- router-link.space(to="/v3") V3
  //- | |
  //- router-link.space(to="/v4") V4
  //- | |
  //- router-link.space(to="/v5") V5
  //- | |
  //- router-link.space(to="/v7") V7
  //- | |
  //- | |
  // | |
  // router-link.space(to="/multiday") Multiday
  // | |
  // router-link.space(to="/v6") V6



      .navbar-end
        .navbar-item
          //- .buttons
          //-   a.button.is-primary
          //-     strong Sign up
          //-   a.button.is-light Log in

</template>

<script lang="ts" scoped>
export default {
  name: 'TopNavBar',
  components: {},
  data: function() {
    return {
      isBurgerActive: false,
    }
  },
  methods: {
    clickedBurger: function() {
      console.log('clicked!')
      this.isBurgerActive = !this.isBurgerActive
    },
  },
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

#nav {
  background-color: $matsimBlue;
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
