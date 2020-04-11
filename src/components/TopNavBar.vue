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

<style scoped lang="scss">
@import '@/styles.scss';

#nav {
  padding: 0.5rem 2rem;
  background-color: $matsimBlue;
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

@media only screen and (max-width: 640px) {
  #nav {
    padding: 0.5rem 0.5rem;
  }

  .space {
    margin: 0 0.6rem;
  }
}
</style>
