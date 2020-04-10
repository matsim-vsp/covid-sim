<template lang="pug">
#home
  .banner
    h2 VSP Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .content
    .readme(v-html="readme")

    h5 Available visualizations:

    .viz-cards
      .one-viz(v-for="viz in links")
        router-link(:to="viz.url")
          viz-card(:viz="viz")

    hr
    .readme(v-html="readmeBottom")

</template>

<script lang="ts">
const readme = require('@/assets/index.md')
const bottom = require('@/assets/index-bottom.md')

import VizCard from '@/components/VizCard.vue'

export default {
  name: 'Home',
  components: { VizCard },
  data: function() {
    return {
      readme,
      readmeBottom: bottom,
      links: [
        {
          url: '/v1',
          title: 'Intervention Strategies',
          subtitle: 'Exploring the effects of several stay-at-home interventions.',
        },
        {
          url: '/v2',
          title: 'Compliance Rates',
          subtitle:
            'How COVID-19 spreads under various levels of compliance for work, shopping, leisure',
        },
        {
          url: '/v3',
          title: 'Infection Traces',
          subtitle: 'Animation of infection spreading through the population',
        },
        {
          url: '/v4',
          title: 'School Attendance',
          subtitle:
            'Sending students back to kindergarten, primary and secondary school, and universities',
        },
        {
          url: '/v5',
          title: 'Reopening Options',
          subtitle:
            'Combinations of school reopening and people getting back to their regular activities',
        },
      ],
    }
  },
}
</script>

<style scoped lang="scss">
$fancyFont: 'Roboto Slab', Roboto, Avenir, Helvetica, sans-serif;

#home {
  background-color: #eee;
}

.content {
  padding: 2rem 2rem 8rem 2rem;
}

.banner {
  padding: 2rem 2rem;
  background-color: #1e5538;
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
  margin-bottom: 2rem;
}

.viz-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.5rem;
}
</style>
