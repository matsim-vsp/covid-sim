<template lang="pug">
.my-vue-component
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
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import timeConvert from 'convert-seconds'

import store from '@/store'
import EventBus from '@/EventBus.vue'

const maxSliderVal = 100000.0

const getSecondsFromSlider = (oneToTenThousand: number) => {
  let seconds = (oneToTenThousand / maxSliderVal) * 86400
  if (seconds === 86400) seconds = 86400 - 1
  return seconds
}

const convertSecondsToClockTimeMinutes = (index: number) => {
  const seconds = getSecondsFromSlider(index)

  try {
    const hms = timeConvert(seconds)
    const minutes = ('00' + hms.minutes).slice(-2)
    return `${hms.hours}:${minutes}`
  } catch (e) {
    return '00:00'
  }
}

export default defineComponent({
  name: 'PlaybackControls',
  components: {},

  data: () => {
    return {
      state: store.state,
      sliderValue: 0,
      maxSliderVal,
      sliderOptions: {
        min: 0,
        max: maxSliderVal - 1,
        clickable: false,
        dotSize: 28,
        duration: 0,
        lazy: true,
        tooltip: 'active',
        size: 'is-large',
        'tooltip-always': true,
        'tooltip-placement': 'top',
        'custom-formatter': convertSecondsToClockTimeMinutes,
        // (v: number) => {
        //   return convertSecondsToClockTimeMinutes(v)
        // },
      },
    }
  },
  methods: {
    onKeyPressed(ev: KeyboardEvent) {
      if (ev.code === 'Space') this.toggleSimulation()
    },

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
      EventBus.$emit(EventBus.DRAG, getSecondsFromSlider(value))
    },
  },

  mounted() {
    // this.sliderOptions['tooltip-formatter'] = convertSecondsToClockTimeMinutes

    EventBus.$on(EventBus.SIMULATION_PERCENT, (time: number) => {
      this.sliderValue = Math.floor(this.maxSliderVal * time)
    })
    window.addEventListener('keyup', this.onKeyPressed)
  },

  beforeDestroy() {
    EventBus.$off(EventBus.SIMULATION_PERCENT)
    window.removeEventListener('keyup', this.onKeyPressed)
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.my-vue-component {
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
