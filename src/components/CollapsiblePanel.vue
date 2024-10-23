<template lang="pug">
.outer
  .body(:style="{order: direction === 'left' ? 2 : 1, maxWidth: collapsed ? 0 : `${width}px`}"
  )
    slot.content(:style="{width: `${width}px`}")

  .xbutton(@click="handleClick"
    :style="{order: direction === 'left' ? 1 : 2, borderRadius: collapsed ? '4px' : '0px'}")

      .rotate(:style="{transform: `rotate(${collapsed ? 180 : 360}deg)`}") {{ direction === 'left' ? "&lt;" : "&gt;" }}

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'CollapsiblePanel',
  props: {
    width: { type: Number, required: true },
    direction: { type: String, required: true },
    darkMode: { type: Boolean, required: true },
    initialCollapsed: { type: Boolean },
  },
  data() {
    const collapsed = !!this.initialCollapsed
    return {
      collapsed,
    }
  },
  methods: {
    handleClick() {
      this.collapsed = !this.collapsed
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.outer {
  display: flex;
  justify-items: center;
  flex-direction: row;
}

.body {
  overflow: hidden;
  transition: max-width 0.15s ease-out;
}

.xbutton {
  display: flex;
  border: none;
  cursor: pointer;
  align-items: center;
  font-size: 22px;
  background-color: var(--bgCream3);
  outline: none;
  color: #888;
  transition:
    background-color 0.25s,
    border-radius 0.15s;
}

.xbutton:hover {
  background-color: var(--bgCream4);
  color: var(--link);
}

.rotate {
  flex: 1;
  margin: auto 0.35rem;
  transform-origin: center;
  transition: transform 0.15s ease-out;
}

@media only screen and (max-width: 640px) {
}
</style>
