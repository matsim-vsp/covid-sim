<template lang="pug">
.slider-thing
  vue-slide-bar.my-slider(:speed="0" :data="stops" v-model="value")
  p {{ measureTitle }}

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import VueSlideBar from 'vue-slide-bar'

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

      interventions: {
        remainingFractionWork: 'Still going to work',
        remainingFractionShopping: 'Still shopping',
        remainingFractionLeisure: 'Still doing leisure activities',
        remainingFractionOther: 'Still doing other activities',
        ReopenAfter: 'Lift Shutdown After X Days',
      } as any,
    }
  },

  mounted() {
    const experiments = []
    for (const x of this.state.measures[this.measure]) {
      experiments.push(x === 1000 ? 'Never' : x)
    }

    this.stops = experiments.map(x => (x <= 1 ? x * 100 : x))
    this.value = 'Never'
  },

  computed: {
    measureTitle() {
      return this.interventions[this.measure]
    },
  },

  watch: {
    value() {
      let answer = this.value
      if (answer === 'Never') answer = 1000
      else if (answer !== 21) answer = 0.01 * answer
      this.$emit('changed', this.measure, answer)
    },
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.my-slider {
  margin-top: 1rem;
}

@media only screen and (max-width: 768px) {
  .my-slider {
    margin-top: 0.25rem;
  }
}
</style>
