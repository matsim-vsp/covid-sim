<template lang="pug">
#home
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .r-calculator(v-if="yaml.multipliers")

    h2 Activity Risk Calculator
    h3(:style="{marginBottom: '1rem', color: '#596'}") {{ this.calcId}}

    h3.badpage(v-if="badPage") That page not found, sorry!

    .goodpage(v-else)
      p(v-if="yaml.description") {{ yaml.description}}

      //- h3: b Base R value:&nbsp;&nbsp;
      //- h3.greenbig {{ (selectedBaseR*0.9).toFixed(2) }} &ndash; {{ (selectedBaseR*1.1).toFixed(2) }}

      //- .base-buttons(v-if="yaml.baseValues")
      //-   button.button.is-small(
      //-     v-for="base in yaml.baseValues"
      //-     :class="{active: selectedBaseR == Object.values(base)[0], 'is-link': selectedBaseR == Object.values(base)[0] }"
      //-     @click="handleNewBaseValue(Object.values(base)[0])"
      //-   ) {{ Object.keys(base)[0] }}

      h3: b Estimated Infection Risk:&nbsp;
        span.greenbig(:style="{fontSize: '2.5rem', fontWeight: 'bold', color: '#596'}") {{ adjustedR }}%

      .option-groups
        //- multipliers
        .option-group(v-for="group in multipliers" :key="`add+${group}`")
          h4 {{ group }}
            span(:style="{fontWeight: 'normal'}" v-if="factors[group] != 1") &nbsp; : {{ factors[group].toFixed(2) }}x

          .measures
            .measure(v-for="m in lookup[group]" :key="`addgroup-${group + m.title}`")
              button.button.is-link.is-small(
                :class="{active: selections[group] == m.title,  'is-outlined': selections[group] != m.title}"
                @click="handleFactorButton(m,group)"
              ) {{ m.title }}

        //- divisors
        .option-group(v-for="group in divisors" :key="group")
          h4 {{ group }}
            span(:style="{fontWeight: 'normal'}" v-if="divFactors[group] != 1") &nbsp; : {{ divFactors[group].toFixed(2) }}x

          .measures
            .measure(v-for="m in lookup[group]" :key="group + m.title")
              button.button.is-link.is-small(
                :class="{active: selections[group] == m.title, 'is-outlined': selections[group] != m.title}"
                @click="handleDivFactorButton(m,group)"
              ) {{ m.title }}

      br

      h3(v-if="yaml.notes"): b Remarks:

      ul(v-if="yaml.notes")
        li.notes-item(v-for="line in yaml.notes") {{ line }}

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import YAML from 'yaml'
import { Route } from 'vue-router'

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
}

@Component({ components: {}, props: {} })
export default class VueComponent extends Vue {
  private public_svn =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'

  private calcId = ''

  private yaml: RiskYaml = {
    description: '',
    calibrationParam: 0.075,
    multipliers: {},
    divisors: {},
    notes: [],
  }

  private badPage = false

  @Watch('$route') routeChanged(to: Route, from: Route) {
    this.buildPageForURL()
  }

  private async mounted() {
    this.buildPageForURL()
  }

  private async buildPageForURL() {
    this.badPage = false

    this.calcId = this.$route.params.rcalc

    const url = this.public_svn + `risk-calculator/${this.calcId}.yaml`

    try {
      const response = await fetch(url)
      this.yaml = YAML.parse(await response.text())

      this.buildUI()
      this.updateR()
    } catch (e) {
      console.error(e)
      this.badPage = true
    }
  }

  private async handleDivFactorButton(m: any, group: string) {
    this.selections[group] = m.title
    this.divFactors[group] = m.value
    this.updateR()
    this.$forceUpdate()
  }

  private async handleFactorButton(m: any, group: string) {
    this.selections[group] = m.title
    this.factors[group] = m.value
    this.updateR()
    this.$forceUpdate()
  }

  private get multipliers() {
    return Object.keys(this.yaml.multipliers)
  }

  private get divisors() {
    return Object.keys(this.yaml.divisors)
  }

  private finalR = 0
  private adjustedR = 0

  private updateR() {
    let r = this.yaml.calibrationParam

    // multiplicative factors
    for (const factor of Object.values(this.factors)) r *= factor
    // divisors factors, already 1/x
    for (const factor of Object.values(this.divFactors)) r *= factor

    // fancy!
    this.finalR = Math.floor(Math.min(99, r * 100.0)) // percentage
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

  private lookup: any = {}
  private factors: { [measure: string]: number } = {}
  private divFactors: { [measure: string]: number } = {}
  private selections: { [measure: string]: string } = {}

  private buildUI() {
    // multiplicative factors
    for (const measureName of Object.keys(this.yaml.multipliers)) {
      const measures = this.yaml.multipliers[measureName]
      this.lookup[measureName] = []

      for (const option of measures.options) {
        const title = Object.keys(option)[0]
        const value = option[title]
        console.log(title, value)

        if (!isNaN(value)) {
          this.lookup[measureName].push({ title, value })

          // first?
          if (this.yaml.multipliers[measureName].options === undefined) {
            this.factors[measureName] = value
            this.selections[measureName] = title
          }
        } else {
          // user specified a default with an asterisk* after the number
          const trimAsterisk = parseFloat(value.substring(0, value.length - 1))
          this.lookup[measureName].push({ title, value: trimAsterisk })
          this.selections[measureName] = title
          this.factors[measureName] = trimAsterisk
        }
      }
    }

    // divisors
    for (const measureName of Object.keys(this.yaml.divisors)) {
      const measures = this.yaml.divisors[measureName]
      this.lookup[measureName] = []

      for (const option of measures.options) {
        const title = Object.keys(option)[0]
        const value = option[title]
        console.log(title, value)

        if (!isNaN(value)) {
          this.lookup[measureName].push({ title, value: 1.0 / value })

          // first?
          if (this.yaml.divisors[measureName].options === undefined) {
            this.divFactors[measureName] = value
            this.selections[measureName] = title
          }
        } else {
          // user specified a default with an asterisk* after the number
          const trimAsterisk = 1.0 / parseFloat(value.substring(0, value.length - 1))
          this.lookup[measureName].push({ title, value: trimAsterisk })
          this.selections[measureName] = title
          this.divFactors[measureName] = trimAsterisk
        }
      }
    }
    console.log(this.selections)
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
  border: 1px solid #ccc;
  padding: 0.75rem 0.75rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.option-group {
  background-color: #fff;
  padding: 0.5rem 0.5rem;
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
  font-size: 1rem;
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
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
