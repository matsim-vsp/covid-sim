<i18n>
en:
  r-value-calculator: 'R-Value Calculator'
  badpage: 'That page not found, sorry!'
  base-r-value: 'Base R Value'
  calculated-r-value: 'Calculated R Value'
  remarks: 'Remarks'
de:
  r-value-calculator: 'R-Wert-Rechner'
  badpage: 'Seite wurde nicht gefunden.'
  base-r-value: 'Basis R-Wert'
  calculated-r-value: 'Resultierender R-Wert'
  remarks: 'Bemerkungen'
</i18n>

<template lang="pug">
#home
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .r-calculator(v-if="yaml.optionGroups")

    h2 {{ $t('r-value-calculator') }}
    h3(:style="{marginBottom: '1rem', color: '#596'}") {{ this.calcId}}

    h3.badpage(v-if="badPage") {{ $t('badpage') }}

    .goodpage(v-else)
      p(v-if="yaml.description" v-html="topDescription")

      h3: b {{ $t('base-r-value')}}:&nbsp;&nbsp;
      h3.greenbig {{ (selectedBaseR*0.9).toFixed(2) }} &ndash; {{ (selectedBaseR*1.1).toFixed(2) }}

      .base-buttons(v-if="yaml.baseValues")
        button.button.is-small(
          v-for="base in yaml.baseValues"
          :class="{active: selectedBaseR == Object.values(base)[0], 'is-link': selectedBaseR == Object.values(base)[0] }"
          @click="handleNewBaseValue(Object.values(base)[0])"
        ) {{ Object.keys(base)[0] }}

      h3: b {{ $t('calculated-r-value')}}:
      h3.greenbig(:style="{fontSize: '2.5rem', fontWeight: 'bold', color: '#596'}") {{ (adjustedR*0.9).toFixed(2) }} &ndash; {{(adjustedR*1.1).toFixed(2)}}

      .option-groups
        //- additive factors
        .option-group(v-for="measure in additiveGroups" :key="`add+${measure}`")
          h4 {{ measure }}
            span(:style="{fontWeight: 'normal'}"
                 v-if="additions[measure] != 0") &nbsp; : {{additions[measure]>0 ? '+' : ''}}{{ additions[measure].toFixed(3) }}

          vue-slider.slider(
                v-model="sliders[measure]"
                :data="lookup[measure]"
                :data-value="'value'"
                :data-label="'title'"
                tooltip="none"
                :adsorb="true"
                :dotSize=20
                @change="handleAdditiveButton(measure)"
          )
          p.slider-label {{ sliders[measure].title }}


        //- multiplicative factors
        .option-group(v-for="measure in optionGroups" :key="measure")
          h4 {{ measure }}
            span(:style="{fontWeight: 'normal'}" v-if="factors[measure] != 1") &nbsp; : {{ factors[measure].toFixed(2) }}x

          vue-slider.slider(
                v-model="sliders[measure]"
                :data="lookup[measure]"
                :data-value="'value'"
                :data-label="'title'"
                tooltip="none"
                :adsorb="true"
                :dotSize=20
                @change="handleButton(measure)"
          )
          p.slider-label {{ sliders[measure].title }}


      br

      h3(v-if="yaml.notes"): b {{ $t('remarks') }}:

      ul(v-if="yaml.notes")
        li.notes-item(v-for="line in yaml.notes" v-html="parseMarkdown(line)")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import YAML from 'yaml'
import { Route } from 'vue-router'
import MarkdownIt from 'markdown-it'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

type RCalcYaml = {
  description?: string
  baseValue?: number
  baseValues?: { [date: string]: number }[]
  optionGroups: { [group: string]: { [measure: string]: any }[] }
  additiveGroups: { [group: string]: { [measure: string]: any }[] }
  notes: string[]
}

@Component({ components: { VueSlider }, props: {} })
export default class VueComponent extends Vue {
  private public_svn =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'

  private calcId = ''

  private yaml: RCalcYaml = { baseValue: 0, optionGroups: {}, additiveGroups: {}, notes: [] }

  private adjustedR = 2.5
  private selectedBaseR = 2.5

  private badPage = false

  private markdownParser = new MarkdownIt()

  private parseMarkdown(text: string) {
    return this.markdownParser.render(text)
  }

  private get topDescription() {
    if (!this.yaml.description) return ''
    return this.markdownParser.render(this.yaml.description)
  }

  @Watch('$route') routeChanged(to: Route, from: Route) {
    this.buildPageForURL()
  }

  private handleNewBaseValue(base: number) {
    this.selectedBaseR = base
    this.updateR()
  }

  private async mounted() {
    this.buildPageForURL()
  }

  private async buildPageForURL() {
    this.badPage = false

    this.calcId = this.$route.params.rcalc

    const lang = this.$i18n.locale //  === 'de' ? '.de' : ''
    const url = this.public_svn + `r-calculator/${this.calcId}.${lang}.yaml`

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

    // some old yamls might not have any additive groups
    if (!this.yaml.additiveGroups) this.yaml.additiveGroups = {}

    this.buildUI()
    this.updateR()
  }

  private async handleButton(measure: string) {
    const slider = this.sliders[measure]
    this.factors[measure] = slider.value
    this.updateR()
    this.$forceUpdate()
  }

  private async handleAdditiveButton(measure: string) {
    const slider = this.sliders[measure]
    this.additions[measure] = slider.value
    this.updateR()
    this.$forceUpdate()
  }

  private get optionGroups() {
    return Object.keys(this.yaml.optionGroups)
  }

  private get additiveGroups() {
    return Object.keys(this.yaml.additiveGroups)
  }

  private finalR = 2.5

  private updateR() {
    let r = 3.0
    if (this.yaml.baseValue) r = this.yaml.baseValue
    else if (this.yaml.baseValues) r = this.selectedBaseR

    // additive factors
    for (const addition of Object.values(this.additions)) r += addition

    // multiplicative factors
    for (const factor of Object.values(this.factors)) r *= factor

    // fancy!
    this.finalR = r
    this.animateTowardNewRValue()
  }

  private animateTowardNewRValue() {
    const diff = this.finalR - this.adjustedR
    const step = this.adjustedR + diff * 0.2
    this.adjustedR = step

    if (Math.abs(this.adjustedR - this.finalR) < 0.01) {
      this.adjustedR = this.finalR
    } else {
      setTimeout(this.animateTowardNewRValue, 16)
    }
  }

  private lookup: { [measure: string]: { title: string; value: number }[] } = {}

  private sliders: { [measure: string]: { title: string; value: number } } = {}

  private factors: { [measure: string]: number } = {}
  private additions: { [measure: string]: number } = {}

  private buildUI() {
    if (this.yaml.baseValues) {
      this.selectedBaseR = Object.values(this.yaml.baseValues[0])[0]
    }

    // multiplicative factors
    for (const group of Object.keys(this.yaml.optionGroups)) {
      const measures = this.yaml.optionGroups[group]
      this.lookup[group] = []

      for (const measure of measures) {
        const title = Object.keys(measure)[0]
        const value = measure[title]

        if (!isNaN(value)) {
          this.lookup[group].push({ title, value })

          // first?
          if (this.yaml.optionGroups[group] === undefined) {
            this.factors[group] = value
            this.sliders[group] = this.lookup[group][0]
          }
        } else {
          // user specified a default with an asterisk* after the number
          const trimAsterisk = parseFloat(value.substring(0, value.length - 1))
          const choice = { title, value: trimAsterisk }
          this.lookup[group].push(choice)
          this.sliders[group] = choice
          this.factors[group] = trimAsterisk
        }
      }
    }

    // additive factors
    for (const group of Object.keys(this.yaml.additiveGroups)) {
      const measures = this.yaml.additiveGroups[group]
      this.lookup[group] = []

      for (const measure of measures) {
        const title = Object.keys(measure)[0]
        const value = measure[title]

        if (!isNaN(value)) {
          this.lookup[group].push({ title, value })

          // first?
          if (this.yaml.additiveGroups[group] === undefined) {
            this.additions[group] = value
            this.sliders[group] = this.lookup[group][0]
          }
        } else {
          // user specified a default with an asterisk* after the number
          const trimAsterisk = parseFloat(value.substring(0, value.length - 1))
          const choice = { title, value: trimAsterisk }
          this.lookup[group].push(choice)
          this.sliders[group] = choice
          this.additions[group] = trimAsterisk
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.r-calculator {
  max-width: 70rem;
  padding: 2rem 3rem 5rem 3rem;
}

.option-groups {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  border: solid 1px #bbf;
  border-radius: 4px;
  background-color: #fff;
  padding: 0.5rem 0.5rem;
  min-height: 8rem;
}

.measures {
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

.slider {
  margin: 0.5rem 0.5rem;
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

  .r-calculator {
    padding: 2rem 1rem;
  }

  .option-groups {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
