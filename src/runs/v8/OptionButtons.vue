<template lang="pug">
#slider-thing
  .button-choices(v-if="showButtons")
    button.button.is-small(
      v-for="choice in stops"
      :class="{'is-link': choice===value}"
      :key="choice"
      @click='choseButton(choice)') {{ choice }}

  p {{ measure.title }}

</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class VueComponent extends Vue {
  @Prop({ required: true }) private measure!: { measure: string; title: string }
  @Prop({ required: true }) private options!: number[]

  private value: any = 0
  private stops: any[] = []

  private showButtons = false

  private choseButton(choice: string) {
    console.log(choice)
    this.value = choice
  }

  private mounted() {
    this.updateOptions()
  }

  @Watch('options') private updateOptions() {
    const experiments = []
    if (!this.options) return

    for (const x of this.options) {
      let label = '' + x * 100 + '%'

      this.value = label // select first choice
      this.showButtons = true

      experiments.push(label)
    }

    this.stops = experiments
    console.log({ stops: this.stops })
  }

  @Watch('value')
  private valueChanged() {
    let answer = this.value.substring(0, this.value.length - 1)
    answer = parseFloat(answer) / 100.0
    this.$emit('changed', this.measure.measure, answer)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.my-slider {
  margin-top: 1rem;
}

.button-choices {
  margin-left: 0;
  margin-top: 1rem;
}

.button-choices button {
  margin-right: 0.2rem;
}

@media only screen and (max-width: 768px) {
  .my-slider {
    margin-top: 0.25rem;
  }
}
</style>
