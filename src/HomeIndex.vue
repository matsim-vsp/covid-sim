<template lang="pug">
#home
  .content
    h2 VSP Technische Universität Berlin
    h3 COVID-19 Analysis Portal

    .readme(v-html="readme")

    h5 Available visualizations:
    ul
      li: router-link(to="/v1") v1: Intervention Strategies
      li: router-link(to="/v2") v2: Compliance Rates
      li: a(href="/covid-sim/v3/") v3: Trip Visualization
      li: router-link(to="/v4") v4: School Attendance
      li: router-link(to="/v5") v5: Reopening Options

    hr
    .readme(v-html="readmeBottom")

</template>

<script lang="ts">
const readme = require('@/assets/index.md')
const bottom = require('@/assets/index-bottom.md')

export default {
  name: 'Home',
  components: {},
  data: function() {
    return { readme, readmeBottom: bottom }
  },
}
</script>

<style scoped>
#home {
  padding: 2rem 2rem 8rem 2rem;
  background-color: #eee;
}

.content h2 {
  margin-bottom: 0.25rem;
}

.content h3 {
  font-size: 1.4rem;
  font-weight: normal;
  margin-top: 0px;
  margin-bottom: 2rem;
}

a {
  font-size: 1.1rem;
  color: #00499c;
}

.readme {
  margin-bottom: 2rem;
}
</style>
