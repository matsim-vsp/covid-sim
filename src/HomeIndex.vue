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

        h2 Paper: Mobility traces and the spreading of COVID-19
        p The virus spreading dynamics model is described in this paper. The results should be verified, but because of the current time pressure, we publish them in their current state. Recommendations for improvement are welcome. Published on 20th March, 2020.

        p
          a(href="https://dx.doi.org/10.14279/depositonce-9835") https://dx.doi.org/10.14279/depositonce-9835
          br
          a(href="mailto:mueller@vsp.tu-berlin.de") Sebastian Alexander Müller,&nbsp;
          a(href="mailto:michael.balmer@senozon.com") Michael Balmer,&nbsp;
          a(href="mailto:andreas.neumann@senozon.com") Andreas Neumann,&nbsp;
          a(href="mailto:nagel@vsp.tu-berlin.de") Kai Nagel
          br
          a(href="https://vsp.tu-berlin.de/") VSP Technische Universität Berlin
          | &nbsp;|&nbsp;
          a(href="https://senozon.com/") Senozon AG

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
          url: '/v5',
          title: 'Reopening Options',
          subtitle:
            'Combinations of school reopening and people getting back to their regular activities',
        },
        {
          url: '/v4',
          title: 'School Attendance',
          subtitle: 'The return to kindergarten, primary and secondary school, and universities',
        },
        {
          url: '/v3',
          title: 'Infection Traces',
          subtitle: 'Animation of infection spreading through the population',
        },
        {
          url: '/v2',
          title: 'Compliance Rates',
          subtitle:
            'How COVID-19 spreads under various levels of compliance for work, shopping, leisure restrictions',
        },
        {
          url: '/v1',
          title: 'Intervention Strategies',
          subtitle: 'Exploring the effects of several stay-at-home interventions.',
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
  padding: 2rem 2rem 8rem 2rem;
  display: flex;
}

.banner {
  padding: 1.75rem 2rem 2rem 2rem;
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
  margin-left: 3rem;
  padding-left: 3rem;
  text-align: right;
  font-size: 0.85rem;
  margin-top: 1rem;
}

.main {
  width: 100%;
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
