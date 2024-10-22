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
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'ButtonGroup',
  components: {},
  props: {
    options: { type: Array as PropType<any[]>, required: true },
    measure: {
      type: Object as PropType<{
        measure: string
        title: string
        order?: string
        asPercent?: boolean
      }>,
      required: true,
    },
  },
  data() {
    return {
      selectedValue: '',
      stops: [] as any[],
      showButtons: false,
    }
  },

  mounted() {
    this.updateOptions()
  },

  computed: {},
  watch: {
    options() {
      this.updateOptions()
    },

    selectedValue() {
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
    },
  },

  methods: {
    updateOptions() {
      let experiments = []
      if (!this.options) return

      // build labels
      for (const x of this.options) {
        let label = this.usePercent() ? `${Math.round(x * 100)}%` : `${x}`
        experiments.push(label)
        this.showButtons = true
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
    },

    choseButton(choice: string) {
      this.selectedValue = choice

      // add param to URL if it's not the first option
      const params = Object.assign({}, this.$route.query)
      if (choice !== this.stops[0]) {
        params[this.measure.measure] = choice
      } else {
        delete params[this.measure.measure]
      }
      this.$router.replace({ query: params })
    },

    usePercent() {
      // if asPercent is present, respect it
      if (this.measure.asPercent !== undefined) return this.measure.asPercent

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

      return usePercent
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
