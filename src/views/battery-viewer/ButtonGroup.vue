<template lang="pug">
.slider-thing
  .button-choices(v-if="showButtons")
    button.button.is-small(
      v-for="choice in stops"
      :class="{'is-link': choice===selectedValue}"
      :key="choice"
      @click='choseButton(choice)') {{ choice }}

</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class VueComponent extends Vue {
  @Prop({ required: true }) private options!: any[]
  @Prop({ required: true }) private measure!: { measure: string; title: string; order?: string }

  private selectedValue: string = ''
  private stops: any[] = []

  private showButtons = false

  private choseButton(choice: string) {
    this.selectedValue = choice

    // add param to URL if it's not the first option
    const params = Object.assign({}, this.$route.query)
    if (choice !== this.stops[0]) {
      params[this.measure.measure] = choice
    } else {
      delete params[this.measure.measure]
    }
    this.$router.replace({ query: params })
  }

  private mounted() {
    this.updateOptions()
  }

  @Watch('options') private updateOptions() {
    let experiments = []
    if (!this.options) return

    // if the options are (a) all numbers and (b) all 0.0 > x > 1.0, then use %
    // otherwise treat as text
    let usePercent = true
    let hasDecimal = false

    for (const x of this.options) {
      // is it non-numeric?
      if (isNaN(x)) {
        usePercent = false
        break
      } else {
        // ok it is a number, but does it have an E in it?
        if (x.indexOf('e') > -1 || x.indexOf('E') > -1) {
          usePercent = false
          break
        }
        // also btw does it have a decimal point?
        if (x.indexOf('.') > -1) hasDecimal = true
      }

      if (x < 0.0 || x > 1.0) {
        usePercent = false
        break
      }
    }

    // one last test: if none of the numbers had decimals, don't use percent
    if (usePercent && !hasDecimal) usePercent = false

    // build labels
    for (const x of this.options) {
      let label = usePercent ? '' + Math.round(x * 100) + '%' : '' + x

      this.showButtons = true
      experiments.push(label)
    }

    if (experiments[0].startsWith('+')) experiments.sort()

    // hand-selected button order, if available
    if (this.measure.order) {
      const newOrder = []
      for (const item of this.measure.order.split(',')) {
        const btn = experiments.filter(a => a === item)
        if (btn.length) newOrder.push(btn[0])
      }
      experiments = newOrder
    }

    // Does URL have the measure value hard-coded? use it if so!
    this.selectedValue = experiments[0] // select first choice

    try {
      if (this.$route.query && this.measure.measure in this.$route.query) {
        if (this.$route.query[this.measure.measure].length > 0) {
          this.selectedValue = this.$route.query[this.measure.measure] as string
        } else {
          this.selectedValue = experiments[0] // select first choice
        }
      }
    } catch (e) {
      console.warn(e)
      this.selectedValue = experiments[0] // select first choice
    }
    this.stops = experiments
  }

  @Watch('selectedValue')
  private valueChanged() {
    // don't fire events if we're just building the widget
    // if (this.isUpdating) {
    //   console.log('ignoring')
    //   return
    // }

    if (this.selectedValue.endsWith('%') && !this.selectedValue.startsWith('+')) {
      const answer = this.selectedValue.substring(0, this.selectedValue.length - 1)
      let v = '' + parseFloat(answer) / 100.0
      if (v === '0') v = '0.0'
      if (v === '1') v = '1.0'
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
}

.button-choices button {
  margin-top: 0.2rem;
  margin-right: 0.2rem;
}

.button-choices button.full-width {
  width: 100%;
}

@media only screen and (max-width: 768px) {
  .my-slider {
    margin-top: 0.25rem;
  }
}
</style>
