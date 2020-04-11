<template lang="pug">
#home
  .banner
    h2 VSP Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .content
    .main
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
  padding: 2rem 2rem;
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
  margin-top: 1rem;
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
