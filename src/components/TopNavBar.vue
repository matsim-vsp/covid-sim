<template lang="pug">
#me
  router-link.space(to="/") Home
  | |
  router-link.space(to="/v1") V1
  | |
  router-link.space(to="/v2") V2
  | |
  router-link.space(to="/v3") V3
  | |
  router-link.space(to="/v4") V4
  | |
  router-link.space(to="/v5") V5

</template>

<script lang="ts">
export default {
  name: 'TopNavBar',
  components: {},
}
</script>

<style scoped>
#nav {
  padding: 0.5rem 1rem;
  background-color: #648cb4;
}

#nav a {
  font-weight: bold;
  color: #043b26;
}

#nav a.router-link-exact-active {
  color: #ffffff;
}

h2 {
  font-size: 2.5rem;
  font-weight: bold;
}

h3 {
  font-size: 1.5rem;
  font-weight: bold;
}

#nav a {
  font-weight: bold;
  color: #043b26;
}

#nav a.router-link-exact-active {
  color: #ffffff;
}

.space {
  margin: 0 1rem;
}
</style>
