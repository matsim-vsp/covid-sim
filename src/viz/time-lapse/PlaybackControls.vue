<template lang="pug">
.pbvue-component
  b-slider.slider(v-model="sliderValue"
    v-bind="sliderOptions"
    @dragging="dragging"
    @dragstart="dragStart"
    @dragend="dragEnd")

  .buttons
    .playpause(@click='toggleSimulation')
      i.button-icon.fa.fa-1x.fa-pause(v-if="state.isRunning")
      i.button-icon.fa.fa-1x.fa-play(v-else)

</template>

<script lang="ts">
import store from '@/store'
import EventBus from '@/EventBus.vue'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'PlaybackControls',
  components: {},
  props: {},
  data() {
    return {
      state: store.state,

      sliderValue: 0,
      maxSliderVal: 90.0,

      sliderOptions: {
        min: 0,
        max: 90,
        clickable: false,
        duration: 0,
        lazy: true,
        tooltip: true,
        size: 'is-large',
        'tooltip-always': true,
        'tooltip-placement': 'top',
        'custom-formatter': (v: number) => {
          return 'Day ' + Math.floor(v)
        },
      },
    }
  },

  mounted() {
    const parent = this

    EventBus.$on(EventBus.SIMULATION_PERCENT, function (time: number) {
      parent.sliderValue = time
    })

    window.addEventListener('keyup', this.onKeyPressed)
  },

  beforeDestroy() {
    EventBus.$off(EventBus.SIMULATION_PERCENT)
    window.removeEventListener('keyup', this.onKeyPressed)
  },

  computed: {},
  watch: {},

  methods: {
    toggleSimulation() {
      this.$emit('click')
    },

    dragStart() {
      console.log('start')
      EventBus.$emit(EventBus.DRAG, -1)
    },

    dragEnd() {
      console.log('end')
      EventBus.$emit(EventBus.DRAG, -2)
    },
    dragging(value: any) {
      EventBus.$emit(EventBus.DRAG, Math.floor(value))
    },

    onKeyPressed(ev: KeyboardEvent) {
      if (ev.code === 'Space') this.toggleSimulation()
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.pbvue-component {
  display: flex;
  flex-direction: row;
}

.slider {
  margin: auto 0;
  flex: 1;
  font-weight: bold;
}

.buttons {
  margin: 0 0 0 2rem;
}

.playpause {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  color: white;
  background-color: $themeColor;
  display: flex;
  text-align: center;
  // box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  pointer-events: auto;
}

.playpause:hover {
  background-color: #39a8f1;
  border: 2px solid white;
}

.button-icon {
  margin: auto auto;
}

@media only screen and (max-width: 640px) {
  #vue-component {
    display: flex;
    flex-direction: row;
  }

  .slider {
    flex: 1;
    margin: auto 0rem;
  }

  .buttons {
    margin: 0.25rem 0 0 2rem;
  }
}
</style>
