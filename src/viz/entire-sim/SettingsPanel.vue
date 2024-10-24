<template lang="pug">
.settings-panel-content

</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ToggleButton } from 'vue-js-toggle-button'

export default defineComponent({
  name: 'SettingsPanel',
  components: { ToggleButton },
  props: {
    items: { type: Object, required: true },
  },

  mounted() {},
  computed: {},
  watch: {},

  methods: {},
})
</script>

<style scoped lang="scss">
.settings-panel-content {
  margin: 2rem 0.25rem 0 0.25rem;
}

h4 {
  text-align: 'right';
  font-weight: 'bold';
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  color: white;
}

.row {
  display: 'grid';
  grid-template-columns: 'auto 1fr';
}

label {
  margin: auto 0 auto 0rem;
  text-align: 'left';
}

.toggle {
  margin-bottom: 0.25rem;
  margin-right: 0.5rem;
}
</style>
