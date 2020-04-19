<template lang="pug">
#vue-component
  vue-slider.speed-slider(v-model="sliderValue"
    v-bind="sliderOptions"
    @dragging="dragging"
    @drag-start="dragStart"
    @drag-end="dragEnd")
  .buttons
    button.button.is-white.is-outlined.is-small(
      @click='toggleSimulation') {{ state.isRunning ? 'Pause' : 'Start'}}

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VueSlider from 'vue-slider-component'
import * as timeConvert from 'convert-seconds'

import store from '@/store'
import EventBus from '@/EventBus.vue'

@Component({ components: { VueSlider }, props: {} })
export default class VueComponent extends Vue {
  private state = store.state
  private sliderValue = 0

  private sliderOptions = {
    min: 0,
    max: 10000,
    dotSize: 20,
    duration: 0,
    lazy: true,
    tooltip: 'active',
    'tooltip-placement': 'top',
    'tooltip-formatter': (v: number) => {
      return this.convertSecondsToClockTimeMinutes(v)
    },
  }

  private toggleSimulation() {
    this.$emit('click')
  }

  private convertSecondsToClockTimeMinutes(index: number) {
    const seconds = (index / 10000) * 86400

    try {
      const hms = timeConvert(seconds)
      const minutes = ('00' + hms.minutes).slice(-2)
      return `${hms.hours}:${minutes}`
    } catch (e) {
      return '0:00'
    }
  }

  @Watch('sliderValue') sliderChanged() {
    // this.sliderOptions['tooltip-placement'] = this.sliderValue > 1000 ? 'left' : 'right'
  }

  private dragStart() {
    console.log('start')
    EventBus.$emit(EventBus.DRAG, -1)
  }

  private dragEnd() {
    console.log('end')
    EventBus.$emit(EventBus.DRAG, -2)
  }

  private dragging(value: any) {
    const seconds = (value / 10000) * 86400
    EventBus.$emit(EventBus.DRAG, seconds)
  }

  mounted() {
    const parent = this

    EventBus.$on(EventBus.SIMULATION_PERCENT, function(time: number) {
      parent.sliderValue = Math.floor(10000 * time)
    })
  }

  beforeDestroy() {
    EventBus.$off(EventBus.SIMULATION_PERCENT)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

#vue-component {
  display: flex;
  flex-direction: column;
}

.buttons {
  margin: 0.25rem auto 0 auto;
}

@media only screen and (max-width: 640px) {
}
</style>
