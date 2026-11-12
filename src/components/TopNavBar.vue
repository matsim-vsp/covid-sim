<template lang="pug">
nav.navbar.is-link(role="navigation" aria-label="main navigation")
  .navbar-brand
    router-link.home-link.navbar-item(to="/") Home
    router-link.navbar-item(to="/about") About
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'TopNavBar' })
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

#nav {
  background-color: $matsimBlue;
}

.navbar-item {
  color: white;
}

.navbar-item.router-link-exact-active {
  font-weight: bold;
}

.home-link {
  margin-left: 2.25rem;
}

@media only screen and (max-width: 640px) {
  .home-link {
    margin-left: 0.25rem;
  }
}
</style>
