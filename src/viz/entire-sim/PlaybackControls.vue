<template lang="pug">
#vue-component
  vue-slider.slider(v-model="sliderValue"
    v-bind="sliderOptions"
    @dragging="dragging"
    @drag-start="dragStart"
    @drag-end="dragEnd")

  .buttons
    .playpause(@click='toggleSimulation')
      i.button-icon.fa.fa-1x.fa-pause(v-if="isRunning")
      i.button-icon.fa.fa-1x.fa-play(v-else)

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VueSlider from 'vue-slider-component'
import * as timeConvert from 'convert-seconds'

@Component({ components: { VueSlider }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true })
  private isRunning!: boolean

  @Prop({ required: true })
  private timeStart!: number

  @Prop({ required: true })
  private timeEnd!: number

  @Prop({ required: true })
  private currentTime!: number

  @Prop({ required: true })
  private currentDay!: number

  private sliderValue = 0

  private sliderOptions = {
    min: 0,
    max: 10000000,
    clickable: false,
    dotSize: 30,
    duration: 0,
    lazy: true,
    tooltip: 'active',
    'tooltip-placement': 'top',
    'tooltip-formatter': (v: number) => {
      return this.createTooltipFromValue(v)
    },
  }

  private toggleSimulation() {
    this.$emit('click')
  }

  private createTooltipFromValue(value: number) {
    const totalSeconds = this.getSecondsFromSlider(value)
    const day = 1 + Math.floor(totalSeconds / 86400)
    const secondsToday = totalSeconds % 86400

    try {
      const hms = timeConvert(secondsToday)
      const minutes = ('00' + hms.minutes).slice(-2)
      return `Day ${day}` // : ${hms.hours}:${minutes}`
    } catch (e) {
      return ''
    }
  }

  private pauseWhileDragging = false

  private dragStart() {
    if (this.isRunning) {
      this.pauseWhileDragging = true
      this.$emit('click')
    }
  }

  private dragEnd() {
    if (this.pauseWhileDragging) this.$emit('click')
    this.pauseWhileDragging = false
  }

  private dragging(value: number) {
    this.$emit('time', this.getSecondsFromSlider(value))
  }

  private onKeyPressed(ev: KeyboardEvent) {
    if (ev.code === 'Space') this.toggleSimulation()
  }

  private getSecondsFromSlider(value: number) {
    let seconds = ((this.timeEnd - this.timeStart) * value) / 10000000.0
    if (seconds === this.timeEnd) seconds = this.timeEnd - 1
    return seconds
  }

  @Watch('currentTime')
  @Watch('currentDay')
  handleTimeChanged() {
    const totalSeconds = 86400.0 * (this.currentDay - 1) + this.currentTime

    this.sliderValue =
      (10000000.0 * (totalSeconds - this.timeStart)) / (this.timeEnd - this.timeStart)
  }

  private mounted() {
    window.addEventListener('keyup', this.onKeyPressed)
  }

  private beforeDestroy() {
    window.removeEventListener('keyup', this.onKeyPressed)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

#vue-component {
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
