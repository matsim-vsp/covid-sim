<template lang="pug">
  nav.navbar.is-link(role="navigation" aria-label="main navigation")
    .navbar-brand
      router-link.home-link.navbar-item(to="/") Home
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

        .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}")
          a.navbar-link  2020.11.12

          .navbar-dropdown
            a.navbar-item(:href="'/2020-11-12/secondLockdown'") Second Lockdown
            a.navbar-item(:href="'/2020-11-12/secondLockdownCurfew'") Curfew

        .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}")
          a.navbar-link  Older Versions
          .navbar-dropdown
            a.navbar-item(:href="'/2020-11-09/tracing'") 2020.11.09
            a.navbar-item(:href="'/2020-11-03/sensitivity'") 2020.11.03
            a.navbar-item(:href="'/2020-10-23/interventions/'") 2020.10.23
            a.navbar-item(:href="'/2020-10-01/bmbf/'") 2020.10.01
            a.navbar-item(:href="'/2020-09-11/bmbf/'") 2020.09.11
            a.navbar-item(:href="'/2020-07-22/'") 2020.07.22
            a.navbar-item(:href="'/2020-07-21/'") 2020.07.21
            a.navbar-item(:href="'/2020-06-19/'") 2020.06.19
            a.navbar-item(:href="'/2020-06-05/'") 2020.06.05
            a.navbar-item(:href="'/v9/masks/berlin'") v9:Masks
            a.navbar-item(:href="'/v9/tracing2/berlin'") v9:Tracing
            a.navbar-item(:href="'/v8/masks'") v8 Masks
            a.navbar-item(:href="'/v7'") v7
            a.navbar-item(:href="'/norun'") v6
            a.navbar-item(:href="'/v5'") v5
            a.navbar-item(:href="'/v4'") v4
            a.navbar-item(:href="'/norun'") v3
            a.navbar-item(:href="'/v2'") v2
            a.navbar-item(:href="'/v1'") v1

        .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}")
          a.navbar-link  Visualizations
          .navbar-dropdown
            a.navbar-item(:href="'/v3?day=5'") Infection Traces
            a.navbar-item(:href="'/timelapse'") 90 Da:y Time Lapse

        .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}")
          a.navbar-link  Calculators
          .navbar-dropdown
            a.navbar-item(:href="'/r-calcs/2020-10-23'") R-Calculator (23.Oct)
            a.navbar-item(:href="'/r-calcs/2020-11-14-lockdown59'") R-Calculator (14.Nov, restrictive)
            a.navbar-item(:href="'/r-calcs/2020-11-14-lockdown84'") R-Calculator (14.Nov, permissive)
            hr
            a.navbar-item(:href="'/risk-calcs/2020-11-11'") Activity Risk Calculator

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'

@Component({})
export default class VueComponent extends Vue {
  private isBurgerActive = false
  private isDropdownActive = false

  private clickedBurger() {
    console.log('clicked!')
    this.isBurgerActive = !this.isBurgerActive
  }

  private mounted() {}

  @Watch('$route') private routeChanged(to: any, from: any) {
    console.log(this.$route)
    this.isBurgerActive = false
    this.isDropdownActive = false
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
  margin-left: 2.25rem;
}

.navbar-dropdown hr {
  margin: 0.25rem 0;
}

@media only screen and (max-width: 640px) {
  .home-link {
    margin-left: 0.25rem;
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
