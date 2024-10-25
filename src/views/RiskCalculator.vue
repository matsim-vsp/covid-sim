<template lang="pug">
.rcc
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .center-area(v-if="yaml.multipliers")

    h2 {{ $t('risk-calculator') }}
    h5(:style="{marginBottom: '1rem', color: '#596'}") {{ $t('released')}} {{ this.calcId}}

    h3.badpage(v-if="badPage") {{ $t('badpage') }}

    .goodpage(v-else)
      p(v-if="yaml.description") {{ yaml.description}}

      h3: b {{ $t('explore-scenarios') }}:
      .measures
        .measure(v-for="m in Object.keys(yaml.scenarios)" :key="m")
          button.button.is-danger.is-outlined.is-small(@click="handleScenario(m)") {{ m }}

      p {{ selectedScenario ? selectedScenario.description : $t('try-combos') }}

  h3.center-area.sticky: b {{ $t('estimated-risk') }}:&nbsp;
    span.greenbig(:style="{fontSize: '2.5rem', fontWeight: 'bold', color: '#596'}") {{ adjustedR.toFixed(1) }}%

  .center-area(v-if="yaml.multipliers")
    .option-groups
      //- multipliers
      .option-group(v-for="group in multipliers" :key="`add+${group}`")
        h4 {{ group }}
        .description {{ yaml.multipliers[group].description }}

        b-slider.slider(
            :value="0"
            v-model="sliders[group]"
            :min="0" :max="lookup[group].length-1"
            :tooltip="false"
            size="is-large"
            @input="handleFactorButton(group)"
        )
            b-slider-tick(v-for="tick,i in lookup[group]" :key="tick.title" :value="i")

        p.slider-label {{ lookup[group][sliders[group]].title}}


      //- divisors
      .option-group(v-for="group in divisors" :key="group")
        h4 {{ group }}
        .description {{ yaml.divisors[group].description }}

        b-slider.slider(
            :value="0"
            v-model="sliders[group]"
            :min="0" :max="lookup[group].length-1"
            :tooltip="false"
            size="is-large"
            @input="handleDivFactorButton(group)"
        )
            b-slider-tick(v-for="tick,i in lookup[group]" :key="tick.title" :value="i")

        p.slider-label {{ lookup[group][sliders[group]].title}}


      br

      h3(v-if="yaml.notes"): b {{$t('remarks') }}:

      ul(v-if="yaml.notes")
        li.notes-item(v-for="line in yaml.notes" v-html="parseMarkdown(line)")

</template>

<script lang="ts">
const i18n = {
  messages: {
    en: {
      'risk-calculator': 'Personal Risk Calculator',
      badpage: 'That page not found, sorry!',
      released: 'Released',
      'estimated-risk': 'Estimated Infection Risk',
      'explore-scenarios': 'Explore typical scenarios',
      'try-combos': '...or try different combinations below.',
      remarks: 'Remarks',
    },
    de: {
      'risk-calculator': 'Personalrisiko Rechner',
      badpage: 'Seite wurde nicht gefunden.',
      released: 'Veröffentlicht',
      'explore-scenarios': 'Typische Szenarien erforschen',
      'try-combos': '...oder versuchen Sie verschiedene Kombinationen unten.',
      'estimated-risk': 'Geschätztes Infektionsrisiko',
      remarks: 'Bemerkungen',
    },
  },
}

import YAML from 'yaml'
import MarkdownIt from 'markdown-it'

import { PUBLIC_SVN } from '@/Globals'

const markdownParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

type RiskYaml = {
  description: string
  calibrationParam: number
  notes: string[]
  multipliers: {
    [measure: string]: {
      description: string
      options: { [choice: string]: any }[]
    }
  }
  divisors: {
    [measure: string]: {
      description: string
      options: { [choice: string]: any }[]
    }
  }
  scenarios: {
    [scenario: string]: {
      description: string
      presets: { [measure: string]: any }[]
    }
  }
}

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'RiskCalculator',
  i18n,
  components: {},
  props: {},

  data() {
    return {
      calcId: '',

      yaml: {
        description: '',
        calibrationParam: 0.075,
        multipliers: {},
        divisors: {},
        scenarios: {},
        notes: [],
      } as RiskYaml,

      badPage: false,
      selectedScenario: {} as any,

      finalR: 0,
      adjustedR: 0,

      lookup: {} as { [measure: string]: { title: string; value: number }[] },
      sliders: {} as { [measure: string]: number },
      factors: {} as { [measure: string]: number },
      divFactors: {} as { [measure: string]: number },
    }
  },

  mounted() {
    this.buildPageForURL()
  },

  computed: {
    multipliers() {
      return Object.keys(this.yaml.multipliers)
    },
    divisors() {
      return Object.keys(this.yaml.divisors)
    },
  },

  watch: {
    $route() {
      this.buildPageForURL()
    },
  },

  methods: {
    parseMarkdown(text: string) {
      return markdownParser.render(text)
    },

    async buildPageForURL() {
      this.badPage = false

      this.calcId = this.$route.params.rcalc

      const lang = this.$i18n.locale //  === 'de' ? '.de' : ''
      const url = PUBLIC_SVN + `risk-calculator/${this.calcId}.${lang}.yaml`

      let responseText = ''

      try {
        const response = await fetch(url)
        responseText = await response.text()
      } catch (e) {
        console.error(e)
      }

      // maybe .de. doesn't exist, fallback .en.:
      if (!responseText && url.indexOf('.de.') > -1) {
        console.warn('no', url, 'falling back to .en.')
        const en_url = url.replace('.de.', '.en.')
        console.log(en_url)
        try {
          const response = await fetch(en_url)
          responseText = await response.text()
        } catch (e) {
          console.error(e)
        }
      }

      if (!responseText) {
        this.badPage = true
        return
      }

      this.yaml = YAML.parse(responseText)
      this.buildUI()
      this.updateR()
    },

    async handleDivFactorButton(measure: string) {
      const idx = this.sliders[measure]
      const option = this.lookup[measure][idx]
      this.divFactors[measure] = option.value
      this.updateR()
      this.$forceUpdate()
    },

    async handleFactorButton(measure: string) {
      const idx = this.sliders[measure]
      const option = this.lookup[measure][idx]
      this.factors[measure] = option.value
      this.updateR()
      this.$forceUpdate()
    },

    async handleScenario(scenario: string) {
      this.selectedScenario = this.yaml.scenarios[scenario]
      for (const measure of Object.keys(this.selectedScenario.presets) as any) {
        const title = this.selectedScenario.presets[measure]

        //@ts-ignore:
        const value = this.lookup[measure].find((a: any) => a.title === title).value

        console.log(measure, title, value)

        if (this.multipliers.indexOf(measure) > -1) this.factors[measure] = value
        if (this.divisors.indexOf(measure) > -1) this.divFactors[measure] = value

        // find this entry for the slider!
        for (let i = 0; i < this.lookup[measure].length; i++) {
          const choice = this.lookup[measure][i]
          if (choice.title === title) {
            this.sliders[measure] = i
            break
          }
        }
      }

      this.updateR()
      this.$forceUpdate()
    },

    updateR() {
      let r = this.yaml.calibrationParam

      // multiplicative factors
      for (const factor of Object.values(this.factors)) r *= factor
      // divisors factors, already 1/x
      for (const factor of Object.values(this.divFactors)) r *= factor
      // exp result
      r = 1.0 - Math.exp(-1.0 * r)

      // fancy!
      this.finalR = Math.min(99, r * 100.0) // percentage
      this.animateTowardNewRValue()
    },

    animateTowardNewRValue() {
      const diff = this.finalR - this.adjustedR
      const step = this.adjustedR + diff * 0.2
      this.adjustedR = step

      if (Math.abs(this.adjustedR - this.finalR) < 0.01) {
        this.adjustedR = this.finalR
      } else {
        setTimeout(this.animateTowardNewRValue, 16)
      }
    },

    buildUI() {
      // multiplicative factors
      for (const measureName of Object.keys(this.yaml.multipliers)) {
        const measures = this.yaml.multipliers[measureName]
        this.lookup[measureName] = []

        for (let i = 0; i < measures.options.length; i++) {
          const option = measures.options[i]
          const title = Object.keys(option)[0]
          const value = option[title]

          Number.isNaN
          if (!isNaN(value)) {
            this.lookup[measureName].push({ title, value })

            // first?
            if (this.yaml.multipliers[measureName].options === undefined) {
              this.factors[measureName] = value
              this.sliders[measureName] = i // this.lookup[measureName][0].value
            }
          } else {
            // user specified a default with an asterisk* after the number
            const trimAsterisk = parseFloat(value.substring(0, value.length - 1))
            const choice = { title, value: trimAsterisk }
            this.lookup[measureName].push(choice)
            this.sliders[measureName] = i
            this.factors[measureName] = trimAsterisk
          }
        }
      }

      // divisors
      for (const measureName of Object.keys(this.yaml.divisors)) {
        const measures = this.yaml.divisors[measureName]
        this.lookup[measureName] = []

        for (let i = 0; i < measures.options.length; i++) {
          const option = measures.options[i]
          const title = Object.keys(option)[0]
          const value = option[title]

          if (!isNaN(value)) {
            this.lookup[measureName].push({ title, value: 1.0 / value })

            // first?
            if (this.yaml.divisors[measureName].options === undefined) {
              this.divFactors[measureName] = value
              this.sliders[measureName] = i // this.lookup[measureName][0].value
            }
          } else {
            // user specified a default with an asterisk* after the number
            const trimAsterisk = 1.0 / parseFloat(value.substring(0, value.length - 1))
            const choice = { title, value: trimAsterisk }
            this.lookup[measureName].push(choice)
            this.sliders[measureName] = i // choice.value
            this.divFactors[measureName] = trimAsterisk
          }
        }
      }
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.center-area {
  max-width: 70rem;
  padding: 1rem 3rem 1rem 3rem;
}

.option-groups {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.option-group {
  border: solid 1px #bbf;
  border-radius: 4px;
  background-color: #fff;
  padding: 0.5rem 0.5rem;
}

.measures {
  padding: 0.5rem 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

h2 {
  font-size: 2rem;
}

h3 {
  font-weight: normal;
  font-size: 1.3rem;
  margin-bottom: -0.5rem;
}

h4 {
  color: #596;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0 0;
  padding: 0 0;
}

.button {
  padding: 0 0.5rem;
  margin: 0 0.15rem 0.15rem 0;
}

p {
  margin-bottom: 1rem;
}

p.factor {
  margin: auto 0 auto 1rem;
  color: #ccc;
}

.banner {
  display: flex;
  flex-direction: column;
  padding: 4rem 3rem 1rem 3rem;
  background-color: #1e1f2c;
  color: white;
  background: url(../assets/images/banner.jpg);
  background-repeat: no-repeat;
  background-size: cover;
}

.banner h2 {
  margin-bottom: 0rem;
  font-size: 1.6rem;
  background-color: #1e1f2c;
  line-height: 1.6rem;
  margin-right: auto;
}

.banner h3 {
  font-size: 1.3rem;
  font-weight: normal;
  margin-bottom: 0;
  line-height: 1.4rem;
  padding-bottom: 0.25rem;
  background-color: #1e1f2c;
  width: max-content;
}

.base-buttons {
  margin-bottom: 1rem;
}

.greenbig {
  color: #596;
  font-weight: bold;
  font-size: 2.5rem;
}

.notes-item {
  list-style-type: square;
  margin-left: 1rem;
  margin-top: 0.5rem;
  color: #222;
}

li.notes-item {
  line-height: 1.3rem;
}

.description {
  font-size: 0.85rem;
  margin-top: 0;
  margin-bottom: 0.25rem;
}

.sticky {
  top: 3rem;
  position: sticky;
  background-color: #eee;
  padding-top: 0;
  padding-bottom: 0rem;
}

.slider {
  padding: 0.5rem;
  margin: 0rem 0rem;
}

.slider-label {
  font-size: 0.9rem;
  font-weight: bold;
  color: #383ab1;
  margin: 0 0;
}

@media only screen and (max-width: 850px) {
  .option-groups {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media only screen and (max-width: 640px) {
  .banner {
    padding: 2rem 1rem;
  }

  .center-area {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .option-groups {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
