<template lang="pug">
#home
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .page-area
    colophon.colophon
    .content
      .main
        .top
          p.headline We build advanced human mobility models, and attach virus infection dynamics taken from recent literature and publications.
            br
            | This results in a virus spreading dynamics model.

          p This site is the central hub for COVID-19 virus spreading research from the Transport Systems Planning and Transport Telematics group (VSP), Institute for Land and Sea Transport at TU Berlin. This research uses the&nbsp;
            a(href="https://github.com/matsim-org/matsim-episim")
              b MATSim-Episim
            | &nbsp;virus spreading model.

          h2 Latest Updates
          .latest-updates
            .one-viz(v-for="run in modelruns.slice(0,1)" :key="run.url")
              router-link(:to="run.url")
                .box(style="height: 100%;")
                  h5 Model results
                  .date(:style="{color: '#555599', fontWeight: 'bold'}") {{ run.date }}
                  p {{run.title}}
                  p {{run.subtitle}}

            .one-viz
              a(:href="latestReport.url" target="_blank")
                .box(style="height: 100%;")
                  h5 Latest Published Report
                  p(:style="{color: '#555599', fontWeight: 'bold'}") Released: {{latestReport.title}}
                  p(style="flex: 1")  We deliver frequent updates to the German BMBF Ministry.
                  button.button.is-link(style="width: 100%") Get PDF (Deutsch)

            .one-viz(v-for="rcalc in rCalculators.slice(0,1)" :key="rcalc.url")
              router-link(:to="rcalc.url")
                .box(style="height: 100%;")
                  h5 {{rcalc.title}}
                  .date(:style="{flex: 1, color: '#555599', fontWeight: 'bold'}") Released: {{ rcalc.date}}
                  img(width=250 :style="{height: '100px', 'object-fit': 'fill'}" :src="rcalc.image")


          h2 Method: Mobility traces and the spreading of COVID-19
          p The MATSim-Episim virus spreading dynamics model is described in these papers:
            br
            a(href=" https://doi.org/10.1371/journal.pone.0259037") Predicting the effects of COVID-19 related interventions in urban settings by combining activity-based modelling, agent-based simulation, and mobile phone data
            br
            a(href=" https://arxiv.org/abs/2011.11453") A realistic agent-based simulation model for COVID-19 based on a traffic simulation and mobile phone data
            br
            a(href=" https://doi.org/10.1101/2020.07.22.20160093")  Using mobile phone data for epidemiological simulations of lockdowns: government interventions, behavioral changes, and resulting changes of reinfections
            br
            a(href=" https://doi.org/10.14279/depositonce-9835") Mobility traces and spreading of COVID-19

          p The code is freely available and open source:
            br
            a(href="https://github.com/matsim-org/matsim-episim") https://github.com/matsim-org/matsim-episim .

        h2 Interactive Visualizations
        p The following interactive visualizations help to illustrate the method and results which emerge from the model. These are produced directly from simulated model results. Note that due to the advanced nature of the visualizations, only modern versions of recent web browsers are supported.

        .viz-cards
          .one-viz(v-for="viz in visualizations" :key="viz.url")
            router-link(:to="viz.url")
              viz-card(:viz="viz")


        h2 R-Value and Risk Calculators
        p Measures such as contact tracing, mask-wearing and school closures could each impact the ability of the disease to spread. The following R-Value Calculators allow you to experiment with these and other measures to see how they contribute to the R-Value of the disease.

        .viz-cards
          .one-viz(v-for="rcalc in rCalculators" :key="rcalc.url")
            router-link(:to="rcalc.url")
              .box
                h5 {{rcalc.title}}
                .date {{ rcalc.date}}
                img(width=250 :style="{height: '100px', 'object-fit': 'fill'}" :src="rcalc.image")


        h2 Published reports
        p The following reports have been delivered to the German Ministry of Education and Research (Bundesministerium für Bildung und Forschung). These reports are written in German.

        report-viewer()


        h2 Simulations of COVID-19 spreading in Berlin

        .readme(v-html="readme")

        .viz-cards
          .one-viz(v-for="viz in modelruns" :key="viz.url")
            router-link(:to="viz.url")
              viz-card(:viz="viz")

        .readme(v-html="readmeBottom")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import Colophon from '@/components/Colophon.vue'
import ReportViewer from '@/components/ReportViewer.vue'
import VizCard from '@/components/VizCard.vue'

import reports from '@/assets/reports'
import allCalculators from '@/assets/calculators'

@Component({ components: { Colophon, ReportViewer, VizCard }, props: {} })
export default class VueComponent extends Vue {
  private readme = require('@/assets/index.md')
  private readmeBottom = require('@/assets/index-bottom.md')

  private latestReport = reports[0]

  private rCalculators = allCalculators

  private modelruns: any[] = [
    {
      url: '/cologne/2022-10-18/3-meas',
      date: 'Released: 24 October 2022',
      title: 'Report runs 24 October',
      subtitle: 'Emergency measures',
    },
    {
      url: '/cologne/2022-08-04/9b-leis-dec',
      date: 'Released: 09 August 2022',
      title: 'Report runs 09 August',
      subtitle: 'Measures in autumn and winter',
    },
    {
      url:
        '/cologne/2022-06-23/2b?strAEsc=6.0&resDate=2022-12-01&vacCamp=off&edu=normal&leis=100%25&work=100%25',
      date: 'Released: 28 June 2022',
      title: 'Report runs 28 June',
      subtitle: 'Measures in autumn and winter',
    },
    {
      url: '/cologne/2022-04-13/?mutEscOm=6.0&timePeriodIgA=730.0&mutDate=2022-10-01',
      date: 'Released: 26 April 2022',
      title: 'Report runs 26 April',
      subtitle: 'Vaccination strategies next autumn',
    },
    {
      url: '/cologne/2022-02-22/1?ba2Inf=1.5&ba1ba2Long=True',
      date: 'Released: 23 Feb 2022',
      title: 'Report runs 23 Feb.',
      subtitle: 'Omicron variant BA.2',
    },
    {
      url: '/cologne/2022-01-18/2?leis=1.0&leisUnv=0.75&daysImmuneQ=current',
      date: 'Released: 20 Jan 2022',
      title: 'Report runs 20 Jan.',
      subtitle: '',
    },
    {
      url: '/cologne/2021-12-16/1?vacSp=100%25&leis=100%25&leisUnv=75%25',
      date: 'Released: 17 Dec 2021',
      title: 'Report runs 17 Dec.',
      subtitle: '',
    },
    {
      url: '/cologne/2021-11-17/1?leisUnv=100%25&wTest=current&schools=protected',
      date: 'Released: 19 Nov 2021',
      title: 'Report runs 19 Nov.',
      subtitle: 'Measures without activity reductions',
    },
    {
      url: '/cologne/2021-11-17/3?leisUnv=100%25&wTest=current&schools=protected',
      date: 'Released: 19 Nov 2021',
      title: 'Report runs 19 Nov.',
      subtitle: 'Measures with activity reductions',
    },
    {
      url: '/cologne/2021-10-21/1?vacInf=50%25&leisureUnv=no',
      date: 'Released: 22 Oct 2021',
      title: 'Report runs 22 Oct.',
      subtitle: 'Booster vaccinations',
    },
    {
      url: '/cologne/2021-09-22/1?leisureUnv=no',
      date: 'Released: 24 Sep 2021',
      title: 'Cologne',
      subtitle: 'Cologne: Measures for fall',
    },
    {
      url:
        '/2021-09-02/1?leisureUnv=no&workUnv=no&leisureTests=current&eduTests=current&workTests=current',
      date: 'Released: 2 Sep 2021',
      title: 'Report runs Sep 3',
      subtitle: 'Measures for fall',
    },
    {
      url:
        '/2021-09-02/2?leisureUnv=no&workUnv=no&leisureTests=current&eduTests=current&workTests=current',
      date: 'Released: 2 Sep 2021',
      title: 'Report runs Sep 3',
      subtitle: 'Measures for fall',
    },
    {
      url:
        '/2021-09-02/3?leisureUnv=no&workUnv=no&leisureTests=current&eduTests=current&workTests=current',
      date: 'Released: 2 Sep 2021',
      title: 'Report runs Sep 3',
      subtitle: 'Measures for fall',
    },
    {
      url:
        '/2021-09-02/4?leisureUnv=no&workUnv=no&leisureTests=current&eduTests=current&workTests=current',
      date: 'Released: 2 Sep 2021',
      title: 'Report runs Sep 3',
      subtitle: 'Measures for fall',
    },
    {
      url:
        '/2021-07-13/schools?vaccinationAgeGroup=6m&testingRatePCRTest=100%25&testingRateRapidTest=100%25',
      date: 'Released: 16 July 2021',
      title: 'Report runs July 16',
      subtitle: 'School measures after the holidays',
    },
    {
      url:
        '/2021-06-17/mutations?mutBinf=2.2&mutBVaccinationEffectiveness=80%25&vaccinationAgeGroup=16y&masks=no&revaccinationDate=no',
      date: 'Released: 18 June 2021',
      title: 'Report runs June 18',
      subtitle: 'Virus mutations',
    },
    {
      url:
        '/2021-05-20/bmbf?b1351inf=1.8&b1351VaccinationEffectiveness=70%25&vaccinationCompliance=80%25&revaccinationDate=no',
      date: 'Released: 21 May 2021',
      title: 'Report runs May 21',
      subtitle: 'Virus mutations and revaccination',
    },
    {
      url:
        '/2021-04-30/opening?testingRateEduWorkLeisure=20-5-5&sh_e_1=100%25&sc_2=100%25&l_w_2=90%25&u_2=50%25&l_w_3=100%25&u_3=100%25',
      date: 'Released: 30 April 2021',
      title: 'Report runs April 30',
      subtitle: 'Opening strategies',
    },
    {
      url:
        '/2021-04-09/bmbf-1.8?leisure=current&activityLevel=current&work=no&vaccinationRate=current&liftRestrictions=no&outdoorModel=yes',
      date: 'Released: 09 April 2021',
      title: 'Report runs April 09',
      subtitle: '1.8 higher infectivity of B117',
    },
    {
      url:
        '/2021-04-09/bmbf-2.0?leisure=current&activityLevel=current&work=no&vaccinationRate=current&liftRestrictions=no&outdoorModel=yes',
      date: 'Released: 09 April 2021',
      title: 'Report runs April 09',
      subtitle: '2.0 higher infectivity of B117',
    },
    {
      url: '/2021-03-19/testing?easterModel=yes&extrapolateRestrictions=76pct%20%28current%29',
      date: 'Released: 19 March 2021',
      title: 'Report runs March 19',
      subtitle: 'Activity-based testing strategies',
    },
    {
      url:
        '/2021-02-20?leisureTrigger=35.0&workTrigger=35.0&eduTrigger=35.0&shopErrandsTrigger=35.0&dailyInitialVaccinations=3000',
      date: 'Released: 26 Feb 2021',
      title: 'Report runs Feb. 26',
      subtitle: 'Effect of adaptive restrictions',
    },
    {
      url: '/2021-02-23/testing?testingFalseNegative=30%25&outdoorModel=yes',
      date: 'Released: 26 Feb 2021',
      title: 'Report runs Feb. 26',
      subtitle: 'Testing strategies',
    },
    {
      url:
        '/2021-02-02/?extrapolateRestrictions=no&work=no&dailyInitialVaccinations=3000&curfew=no&newVariantInfectiousness=2.0&newVariantDate=2020-12-15',
      date: 'Released: 05 Feb 2021',
      title: 'Report runs Feb. 05',
      subtitle: 'Examination of new strains, curfews, and some reopening strategies',
    },
    {
      url:
        '/2021-01-17/curfew?newVariantDate=2020-12-15&extrapolateRestrictions=yesUntil80&curfew=no&seed=7564655870752979346',
      date: 'Released: 15 Jan 2021',
      title: 'Curfews & vaccinations',
      subtitle: 'Examination of new strains, curfews, and the start of vaccinations',
    },
    {
      url: '/2021-01-13/bmbf?newVariantDate=2020-12-15&schools=closed&seed=7564655870752979346',
      date: 'Released: 15 Jan 2021',
      title: 'Where do we stand after the holidays?',
      subtitle: 'Effect of the holidays, virus variants, and the start of vaccinations.',
    },
    {
      url: '/2020-12-03/secondLockdown',
      date: 'Released: 03 Dec 2020',
      title: 'Second Lockdown & Curfew',
      subtitle: 'Effect of second lockdown and curfew hours.',
    },
    {
      url: '/2020-11-12/secondLockdownCurfew',
      date: 'Released: 12 Nov 2020',
      title: 'Second Lockdown & Curfew',
      subtitle: 'Effect of second lockdown and curfew hours.',
    },
    {
      url: '/2020-11-12/secondLockdown',
      date: 'Released: 12 Nov 2020',
      title: 'Second Lockdown',
      subtitle: 'Different options for second lockdown.',
    },
    {
      url: '/2020-11-09/tracing',
      date: 'Released: 09 Nov 2020',
      title: 'Tracing',
      subtitle: 'Effects of different tracing capabilities.',
    },
    {
      url: '/2020-11-03/sensitivity',
      date: 'Released: 03 Nov 2020',
      title: 'Sensitivity',
      subtitle: 'Effects of switching off different parts of the model.',
    },
    {
      url: '/2020-10-23/interventions',
      date: 'Released: 23 Oct 2020',
      title: 'Run 2020.10.23',
      subtitle: 'Several interventions to control virus spreading.',
    },
    {
      url: '/2020-10-01/bmbf',
      date: 'Released: 01 Oct 2020',
      title: 'Run 2020.10.01',
      subtitle: 'Effects of various measures to control virus spreading.',
    },
    {
      url: '/2020-09-11/bmbf',
      date: 'Released: 11 Sep 2020',
      title: 'Run 2020.09.11',
      subtitle: 'Effects of different intervention methods in educational facilities.',
    },
    {
      url: '/2020-07-22',
      date: 'Released: 22 July 2020',
      title: 'Run 2020.07.22',
      subtitle:
        'Behavioral changes after June 01 and increased indoor activities in winter; further measures at October 01.',
    },
    {
      url: '/2020-07-21',
      date: 'Released: 21 July 2020',
      title: 'Run 2020.07.21',
      subtitle: 'Behavioral changes after June 01 and increased indoor activities in winter.',
    },
    {
      url: '/2020-06-19',
      date: 'Released: 19 June 2020',
      title: 'Run 2020.06.19',
      subtitle:
        'Closing of educational facilities; reduced activities and public transport; masks; contact tracing.',
    },
    {
      url: '/2020-06-05',
      date: 'Released: 19 June 2020',
      title: 'Run 2020.06.05',
      subtitle: 'Contact tracing and school reopenings',
    },
    {
      url: '/v9/masks/berlin',
      date: 'Released: 11 May 2020',
      title: 'v9: Masks',
      subtitle: 'Impact of different types of masks and their usage levels',
    },
    {
      url: '/v9/tracing2/berlin',
      date: 'Released: 11 May 2020',
      title: 'v9: Contact Tracing',
      subtitle: 'Part 2: More contact tracing options',
    },
    {
      url: '/v8/masks',
      date: 'Released: 11 May 2020',
      title: 'v8: Masks',
      subtitle: 'Impact of different types of masks and their usage levels',
    },
    {
      url: '/v7',
      date: 'Released: 22 April 2020',
      title: 'School Reopening Options (3)',
      subtitle:
        'Select adherence rates for stay-at-home and explore re-opening options for kindergarten/schools/universities.',
    },
    {
      url: '/v5',
      date: 'Updated: 6 April 2020',
      title: 'School Reopening Options (2)',
      subtitle:
        'Select adherence rates for stay-at-home and explore re-opening options for kindergarten/schools/universities.',
    },
    {
      url: '/v4',
      date: 'Released: 1 April 2020',
      title: 'School Reopening Options (1)',
      subtitle:
        'Explore re-opening of kindergarten, primary and secondary school, and universities.',
    },
    {
      url: '/v2',
      date: 'Updated: 28 March 2020',
      title: 'Adherence Rates for Different Intervention Strategies',
      subtitle: 'Different adherence rates for different stay-at-home interventions.',
    },
    {
      url: '/v1',
      date: 'Updated: 25 March 2020',
      title: 'Timings of Different Intervention Strategies',
      subtitle: 'Different timings of different stay-at-home interventions.',
    },
  ]

  private visualizations: any[] = [
    {
      url: '/v3?day=5',
      title: 'Infection Traces',
      subtitle: 'Animation of infection spreading through the population.',
    },
    {
      url: '/timelapse',
      title: '90 Day Time Lapse',
      subtitle: 'Home locations of residents, colored by their infection status through time.',
    },
  ]
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

#home {
  background-color: $paleBackground;
}

.content {
  flex: 1;
  padding: 2rem 3rem 8rem 3rem;
  display: flex;
  width: 100%;
}

.banner {
  display: flex;
  flex-direction: column;
  padding: 4rem 3rem 1rem 3rem;
  background-color: #1e1f2c;
  color: white;
  background: url(../assets/images/banner.jpg);
  background-repeat: no-repeat;
  background-size: cover;
}

.banner h2 {
  margin-bottom: 0rem;
  font-size: 1.6rem;
  background-color: #1e1f2c;
  line-height: 1.6rem;
  margin-right: auto;
}

.banner h3 {
  font-size: 1.3rem;
  font-weight: normal;
  margin-bottom: 0;
  line-height: 1.4rem;
  padding-bottom: 0.25rem;
  background-color: #1e1f2c;
  width: max-content;
}

a {
  font-size: 1.1rem;
  color: #00499c;
}

.readme {
  margin-top: 1rem;
  margin-bottom: 3rem;
  flex: 1;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.3rem;
}

.main h2 {
  margin-top: 3rem;
  font-weight: normal;
  color: $bannerHighlight;
}

.viz-cards {
  padding-bottom: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 2rem;
}

.one-viz {
  margin-bottom: 1rem;
}

.preamble {
  display: flex;
}

.top {
  margin-top: 1rem;
}

.colophon {
  padding: 2rem 2rem 1rem 5rem;
  text-align: right;
  font-size: 0.85rem;
  background-color: white;
}

.main {
  max-width: 64rem;
}

.main .top a {
  font-size: 0.9rem;
}

.page-area {
  display: flex;
  flex-direction: row-reverse;
}

.headline {
  font-size: 2rem;
  line-height: 2.7rem;
  padding: 1rem 0;
  color: $themeColor;
}

.box {
  display: flex;
  flex-direction: column;
}

.box:hover {
  box-shadow: 0px 4px 8px 5px #00000022;
  transition: all 150ms linear;
}

.box h5 {
  margin-bottom: 0;
}

.latest-updates {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

@media only screen and (max-width: 1000px) {
  .latest-updates {
    grid-template-rows: auto auto auto;
    grid-template-columns: 1fr;
  }
}

@media only screen and (max-width: 800px) {
  .colophon {
    padding: 2rem 1rem 1rem 1rem;
  }
}

@media only screen and (max-width: 640px) {
  .banner {
    padding: 2rem 1rem;
  }

  .content {
    padding: 2rem 1rem 8rem 1rem;
    flex-direction: column-reverse;
  }

  .colophon {
    display: none;
  }

  .headline {
    padding: 0rem 0rem 1rem 0rem;
    font-size: 1.5rem;
    line-height: 1.8rem;
  }
}
</style>
