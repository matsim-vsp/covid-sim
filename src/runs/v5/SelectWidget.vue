<template lang="pug">
#slider-thing
  vue-slide-bar.my-slider(v-if="showSlider" :speed="0" :data="stops" v-model="value")

  .button-choices(v-if="showButtons")
    button.button.is-small(
      v-for="choice in stops"
      :class="{'is-link': choice===value}"
      :key="choice"
      @click='choseButton(choice)') {{ choice }}

  p {{ measureTitle }}

</template>

<script lang="ts">
import VueSlideBar from 'vue-slide-bar'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'SelectWidget',
  components: { VueSlideBar },
  props: {
    state: { type: Object, required: true },
    measure: { type: String, required: true },
  },
  data() {
    return {
      value: 0 as any,
      stops: [0, 1000],
      showButtons: false,
      showSlider: true,

      interventions: {
        remainingFractionKiga: 'Going to kindergarten',
        remainingFractionPrimary: 'Going to primary school',
        remainingFractionSecondary: 'Going to secondary school',
        remainingFractionHigher: 'Going to univ./higher ed.',

        remainingFractionWork: 'Work activities',
        remainingFractionShopping: 'Shopping activities',
        remainingFractionLeisure: 'Leisure activities',
        remainingFractionErrandsBusiness: 'Errands & Business',
      } as any,
    }
  },

  mounted() {
    const experiments = []
    for (const x of this.state.measures[this.measure]) {
      let label = x
      if (x === 0.2) label = '20%'
      if (x === 0.4) label = '40%'
      if (x === 0.6) label = '60%'
      if (x === 0.8) label = '80%'

      if (isNaN(label)) {
        if (!this.showButtons) this.value = label // select first choice
        this.showButtons = true
        this.showSlider = false
      }

      experiments.push(label)
    }

    this.stops = experiments.map(x => (x <= 1 ? x * 100 : x))
    if (this.showSlider) this.value = 'Never'
  },

  computed: {
    measureTitle() {
      return this.interventions[this.measure]
    },
  },
  watch: {
    value() {
      let answer = this.value
      if (answer === 'Never') {
        answer = 1000
      } else if (answer === '20%') {
        answer = 0.2
      } else if (answer === '40%') {
        answer = 0.4
      } else if (answer === '60%') {
        answer = 0.6
      } else if (answer === '80%') {
        answer = 0.8
      } else if (!isNaN(answer)) {
        answer = 0.01 * answer
      }
      console.log(answer)
      this.$emit('changed', this.measure, answer)
    },
  },

  methods: {
    choseButton(choice: string) {
      console.log(choice)
      this.value = choice
    },
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.my-slider {
  margin-top: 1rem;
}

.button-choices {
  margin-top: 1rem;
}

.button-choices button {
  margin-right: 0.5rem;
}

@media only screen and (max-width: 768px) {
  .my-slider {
    margin-top: 0.25rem;
  }
}
</style>
