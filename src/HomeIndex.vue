<template lang="pug">
#home
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .content
    .main
      .top
        p This site disseminates COVID-19 research from the Transport Systems Planning and Transport Telematics group, Institute for Land and Sea Transport (ILS) at TU Berlin.
        p We use human mobility models, for which we are experts, and attach virus infection dynamics taken from recent literature and publications. This results in a virus spreading dynamics model.

        h2 Method: Mobility traces and the spreading of COVID-19
        p The virus spreading dynamics model is described in this paper:&nbsp;

          a(href="https://dx.doi.org/10.14279/depositonce-9835") https://dx.doi.org/10.14279/depositonce-9835

      .readme(v-html="readme")

      .viz-cards
        .one-viz(v-for="viz in links" :key="viz.url")
          router-link(:to="viz.url")
            viz-card(:viz="viz")

      .readme(v-html="readmeBottom")

    colophon.colophon

</template>

<script lang="ts">
const readme = require('@/assets/index.md')
const bottom = require('@/assets/index-bottom.md')

import Colophon from '@/components/Colophon.vue'
import VizCard from '@/components/VizCard.vue'

export default {
  name: 'Home',
  components: { Colophon, VizCard },
  data: function() {
    return {
      readme,
      readmeBottom: bottom,
      links: [
        {
          url: '/v1',
          title: 'Intervention Strategies',
          subtitle: 'Exploring the effects of several stay-at-home interventions (results from 24-25/mar).',
        },
        {
          url: '/v2',
          title: 'Adherence Rates',
          subtitle:
            'How COVID-19 spreads under various levels of adherence for work, shopping, leisure restrictions (results from 27-28/mar).',
        },
        {
          url: '/v3',
          title: 'Infection Traces',
          subtitle: 'Animation of infection spreading through the population.',
        },
        {
          url: '/v4',
          title: 'School Reopening Options (1)',
          subtitle: 'Explore re-opening of kindergarten, primary and secondary school, and universities (results from 1/apr).',
        },
        {
          url: '/v5',
          title: 'School Reopening Options (2)',
          subtitle:
            'Select adherence rates for stay-at-home and explore re-opening options for kindergarten/schools/universities (results from 3-6/apr).',
        },
      ],
    }
  },
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

#home {
  background-color: #e4e4e4;
}

.content {
  padding: 2rem 3rem 8rem 3rem;
  display: flex;
  width: 100%;
}

.banner {
  padding: 1.75rem 3rem 2rem 3rem;
  background-color: $bannerHighlight;
  color: white;
}

.banner h2 {
  margin-bottom: 0rem;
  font-size: 1.6rem;
}

.banner h3 {
  font-size: 1.3rem;
  font-weight: normal;
  margin-top: 0px;
}

a {
  font-size: 1.1rem;
  color: #00499c;
}

.readme {
  margin-top: 3rem;
  margin-bottom: 3rem;
  flex: 1;
}

.viz-cards {
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
  margin-left: auto;
  padding-left: 3rem;
  text-align: right;
  font-size: 0.85rem;
  margin-top: 1rem;
}

.main {
  max-width: 64rem;
}

.main .top a {
  font-size: 0.9rem;
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
}
</style>
