<template lang="pug">
  nav.navbar.is-link(role="navigation" aria-label="main navigation")
    .navbar-brand
      router-link.home-link.navbar-item(to="/" :style="{color: 'white'}") Home
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
            a.navbar-link  2022.08.09
            .navbar-dropdown
              a.navbar-item(:href="'/cologne/2022-08-06/1-vax'") Strain A and B. Report August 09
              a.navbar-item(:href="'/cologne/2022-08-04/9b-leis-dec'") Measures in autumn and winter. Report August 09

        .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}")
          a.navbar-link  2022.06.28
          .navbar-dropdown
            a.navbar-item(:href="'/cologne/2022-06-23/2b?strAEsc=6.0&resDate=2022-12-01&vacCamp=off&edu=normal&leis=100%25&work=100%25'") Measures in autumn and winter. Report June 28
            a.navbar-item(:href="'/cologne/2022-06-23/1b?vacCamp=off&workTest=none&eduTest=none&leisTest=none'") Testing regimes in autumn and winter. Report June 28

        .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}")
          a.navbar-link  2022.04.26

          .navbar-dropdown
            a.navbar-item(:href="'/cologne/2022-04-13/?mutEscOm=6.0&timePeriodIgA=730.0&mutDate=2022-10-01'") Vaccination in autumn. Report April 26

        .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}")
          a.navbar-link  2022.02.23

          .navbar-dropdown
            a.navbar-item(:href="'/cologne/2022-02-22/1?ba2Inf=1.5&ba1ba2Long=True'") Omicron variant BA.2. Report Feb. 23

        .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}" )
          a.navbar-link  Other Versions
          .navbar-dropdown(style="margin-left: -20rem;")
            .panel(style="columns: 3")
              a.navbar-item(:href="'/cologne/2022-01-18/2?leis=1.0&leisUnv=0.75&daysImmuneQ=current'") 2022.01.20 Immune status and leisure measures. Report Jan. 20
              a.navbar-item(:href="'/cologne/2021-12-16/1?vacSp=100%25&leis=100%25&leisUnv=75%25'") 2021.12.17 Measures and Omicron variant. Report Dec. 17
              a.navbar-item(:href="'/cologne/2021-11-17/1?leisUnv=100%25&wTest=current&schools=protected'") 2021.11.19 Measures without activity reductions
              a.navbar-item(:href="'/cologne/2021-11-17/3?leisUnv=100%25&wTest=current&schools=protected'") 2021.11.19 Measures with activity reductions
              a.navbar-item(:href="'/cologne/2021-10-21/1?vacInf=50%25&leisureUnv=no'") 2021.10.22 Booster vaccinations
              a.navbar-item(:href="'/cologne/2021-09-22/1?leisureUnv=no'") 2021.09.22 Cologne measures for fall
              a.navbar-item(:href="'/2021-09-02/1?leisureUnv=no&workUnv=no&leisureTests=current&eduTests=current&workTests=current'") 2021.09.03 Fall measures (endog. activity reductions)
              a.navbar-item(:href="'/2021-09-02/2?leisureUnv=no&workUnv=no&leisureTests=current&eduTests=current&workTests=current'") 2021.09.03 Fall measures (no activity reductions)
              a.navbar-item(:href="'/2021-07-13/schools?vaccinationAgeGroup=6m&testingRatePCRTest=100%25&testingRateRapidTest=100%25'") 2021.07.16 Report runs for School measures after the holidays
              a.navbar-item(:href="'/2021-05-20/bmbf?b1351inf=1.8&b1351VaccinationEffectiveness=70%25&vaccinationCompliance=80%25&revaccinationDate=no'") 2021.05.21 Virus Mutations and Revaccination
              a.navbar-item(:href="'/2021-04-30/opening?testingRateEduWorkLeisure=20-5-5&sh_e_1=100%25&sc_2=100%25&l_w_2=90%25&u_2=50%25&l_w_3=100%25&u_3=100%25'") 2021.04.30 Opening Strategies
              a.navbar-item(:href="'/2021-04-09/bmbf-1.8?leisure=current&activityLevel=current&work=no&vaccinationRate=current&liftRestrictions=no&outdoorModel=yes'") 2021.04.09 Runs with 1.8 higher infectivity of B117
              a.navbar-item(:href="'/2021-04-09/bmbf-2.0?leisure=current&activityLevel=current&work=no&vaccinationRate=current&liftRestrictions=no&outdoorModel=yes'") 2021.04.09 Runs with 2.0 higher infectivity of B117
              a.navbar-item(:href="'/2021-03-19/testing?easterModel=yes&extrapolateRestrictions=76pct%20%28current%29'") 2021.03.19 Runs for report March 19
              a.navbar-item(:href="'/2021-02-20?leisureTrigger=35.0&workTrigger=35.0&eduTrigger=35.0&shopErrandsTrigger=35.0&dailyInitialVaccinations=3000'") 2021.02.26 Adaptive restrictions
              a.navbar-item(:href="'/2021-02-23/testing?testingFalseNegative=30%25&outdoorModel=yes'") 2021.02.26 Testing strategies
              a.navbar-item(:href="'/2021-02-02/?extrapolateRestrictions=no&work=no&dailyInitialVaccinations=3000&curfew=no&newVariantInfectiousness=2.0&newVariantDate=2020-12-15'") 2021.02.05: Runs for Feb. 5th
              a.navbar-item(:href="'/2021-01-17/curfew?newVariantDate=2020-12-15&extrapolateRestrictions=yesUntil80&curfew=no&seed=7564655870752979346'") 2021.01.15: Curfew options
              a.navbar-item(:href="'/2021-01-13/bmbf?newVariantDate=2020-12-15&schools=closed&seed=7564655870752979346'") 2021.01.15: Where we stand post-holidays
              a.navbar-item(:href="'/2020-12-10/secondLockdown'") 2020.12.18: 2nd Lockdown w/Curfew
              a.navbar-item(:href="'/2020-12-10/vaccinations'") 2020.12.18: Vaccination Strategies
              a.navbar-item(:href="'/2020-12-10/vaccinationsWinterEnd'") 2020.12.18 Vaccination vs. Winter End
              a.navbar-item(:href="'/2020-12-03/secondLockdown'") Second Lockdown
              a.navbar-item(:href="'/2020-11-12/secondLockdown'") 2020.11.12: Second Lockdown
              a.navbar-item(:href="'/2020-11-12/secondLockdownCurfew'") 2020.11.12: Curfew
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
            a.navbar-item(:href="'/timelapse'") 90 Day Time Lapse

        router-link.navbar-item(to="/r-calcs-v2/2021-01-24b" :style="{color: 'white'}") Calculator

        //- router-link.navbar-item(to="/mobility" :style="{color: 'white'}") Mobility

        .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}")
          a.navbar-link  Mobility
          .navbar-dropdown
            a.navbar-item(:href="'/mobility'") Mobility State
            a.navbar-item(:href="'/mobility-counties/'") Mobility County

        //- .navbar-item.has-dropdown.is-hoverable(:class="{'is-active': isDropdownActive}")
        //-   a.navbar-link(:href="'/calculators'")  Calculators
        //-   .navbar-dropdown
        //-     a.navbar-item(:href="'/r-calcs/2021-01-24'") R-Calculator (24.Jan)
        //-     a.navbar-item(:href="'/r-calcs/2020-11-14-lockdown59'") R-Calculator (14.Nov, restrictive)
        //-     a.navbar-item(:href="'/r-calcs/2020-11-14-lockdown84'") R-Calculator (14.Nov, permissive)
        //-     a.navbar-item(:href="'/r-calcs/2020-10-23'") R-Calculator (23.Oct)
        //-     hr
        //-     a.navbar-item(:href="'/risk-calcs/2020-11-11'") Activity Risk Calculator

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

  @Watch('$route') private async routeChanged(to: any, from: any) {
    //console.log(this.$route)
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
  color: green;
}

.home-link {
  margin-left: 2.25rem;
}

.navbar-dropdown hr {
  margin: 0.25rem 0;
}

.navbar-dropdown .navbar-item {
  font-size: 0.85rem;
}

@media only screen and (max-width: 640px) {
  .home-link {
    margin-left: 0.25rem;
  }

  .space {
    margin: 0 0.6rem;
  }
}
</style>
