<template lang="pug">
#slider-thing
  .button-choices(v-if="showButtons")
    button.button.is-small(
      v-for="choice in stops"
      :class="{'is-link': choice===value}"
      :key="choice"
      @click='choseButton(choice)') {{ choice }}

  p {{ measureTitle }}

</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class SectionViewer extends Vue {
  @Prop() private state!: any
  @Prop() private measure!: any

  private value: any = 0
  private stops: any[] = [0, 1000]

  private showButtons = false

  private interventions: any = {
    remainingFractionLeisure1: 'Leisure activities',

    remainingFractionWork: 'Work activities',
    remainingFractionLeisure2: 'Leisure activities',
    remainingFractionShoppingBusinessErrands: 'All other activities',

    remainingFractionKiga: 'Going to kindergarten',
    remainingFractionPrima: 'Going to primary school',
    remainingFractionSecon: 'Going to secondary/univ.',
  }

  private choseButton(choice: string) {
    console.log(choice)
    this.value = choice
  }

  private mounted() {
    const experiments = []

    for (const x of this.state.measures[this.measure]) {
      let label = '' + x * 100 + '%'
      /*
      if (x === 0) label = '0%'
      if (x === 0.2) label = '20%'
      if (x === 0.4) label = '40%'
      if (x === 0.6) label = '60%'
      if (x === 0.8) label = '80%'
      */

      this.value = label // select first choice
      this.showButtons = true

      experiments.push(label)
    }

    this.stops = experiments // experiments.map(x => (x <= 1 ? x * 100 : x))
  }

  private get measureTitle() {
    return this.interventions[this.measure]
  }

  @Watch('value')
  private valueChanged() {
    let answer = this.value.substring(0, this.value.length - 1)
    answer = parseFloat(answer) / 100.0

    /*
    if (answer === '0%') {
      answer = 0.0
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
    */
    console.log(answer)
    this.$emit('changed', this.measure, answer)
  }
}
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
  margin-right: 0.25rem;
}

@media only screen and (max-width: 768px) {
  .my-slider {
    margin-top: 0.25rem;
  }
}
</style>
