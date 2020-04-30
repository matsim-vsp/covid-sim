<template lang="pug">
#slider-thing
  .button-choices(v-if="showButtons")
    button.button.is-small(
      v-for="choice in stops"
      :class="{'is-link': choice===selectedValue}"
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
  @Prop({ required: true }) private options!: any[]

  private selectedValue: string = ''
  private stops: any[] = []

  private showButtons = false

  private choseButton(choice: string) {
    console.log(choice)
    this.selectedValue = choice
  }

  private mounted() {
    this.updateOptions()
  }

  @Watch('options') private updateOptions() {
    const experiments = []
    if (!this.options) return

    let label = ''
    for (const x of this.options) {
      if (isNaN(x)) {
        label = '' + x
      } else {
        label = '' + Math.round(x * 100) + '%'
      }

      this.showButtons = true

      experiments.push(label)
    }

    this.selectedValue = experiments[0] // select first choice
    this.stops = experiments
  }

  @Watch('selectedValue')
  private valueChanged() {
    if (this.selectedValue.endsWith('%')) {
      const answer = this.selectedValue.substring(0, this.selectedValue.length - 1)
      const v = parseFloat(answer) / 100.0
      this.$emit('changed', this.measure.measure, v)
    } else {
      this.$emit('changed', this.measure.measure, this.selectedValue)
    }
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
