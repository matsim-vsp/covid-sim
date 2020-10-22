<template lang="pug">
#home
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .r-calculator(v-if="yaml.optionGroups")

    h2 R-Value Calculator
    h3(:style="{marginBottom: '1rem', color: '#596'}") {{ this.calcId}}

    h3.badpage(v-if="badPage") That page not found, sorry!

    .goodpage(v-else)
      p(v-if="yaml.description") {{ yaml.description}}

      h3 Base R value:&nbsp;&nbsp;
        span.greenbig {{ yaml.baseValue ? yaml.baseValue.toFixed(2) : selectedBaseR.toFixed(2) }}

      .base-buttons(v-if="yaml.baseValues")
        button.button.is-small(
          v-for="base in yaml.baseValues"
          :class="{ active: selectedBaseR == Object.values(base)[0], 'is-link': selectedBaseR == Object.values(base)[0] }"
          @click="handleNewBaseValue(Object.values(base)[0])"
        ) {{ Object.keys(base)[0] }}

      h3 Calculated R value:&nbsp;&nbsp;
        span.greenbig(:style="{fontSize: '2.5rem', fontWeight: 'bold', color: '#596'}") {{ (adjustedR*0.9).toFixed(2) }} &ndash; {{(adjustedR*1.1).toFixed(2)}}

      .option-groups
        .option-group(v-for="group in optionGroups" :key="group")

          h4 {{ group }}
            span(:style="{fontWeight: 'normal'}" v-if="factors[group] != 1") &nbsp; : {{ factors[group].toFixed(2) }}x

          .measures
            .measure(v-for="m in lookup[group]" :key="group + m.title")

              button.button.is-small(
                :class="{active: selections[group] == m.title, 'is-link': selections[group] == m.title}"
                @click="handleButton(m,group)"
              ) {{ m.title }}

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import YAML from 'yaml'
import { Route } from 'vue-router'

type RCalcYaml = {
  baseValue?: number
  baseValues?: { [date: string]: number }[]
  optionGroups: { [group: string]: { [measure: string]: any }[] }
}

@Component({ components: {}, props: {} })
export default class VueComponent extends Vue {
  private public_svn =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'

  private calcId = ''

  private yaml: RCalcYaml = { baseValue: 0, optionGroups: {} }

  private adjustedR = 2.5
  private selectedBaseR = 2.5

  private badPage = false

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

    const url = this.public_svn + `r-calculator/${this.calcId}.yaml`

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

  private async handleButton(m: any, group: string) {
    this.selections[group] = m.title
    this.factors[group] = m.value
    this.updateR()
    this.$forceUpdate()
  }

  private get optionGroups() {
    return Object.keys(this.yaml.optionGroups)
  }

  private finalR = 2.5

  private updateR() {
    let r = 3.0
    if (this.yaml.baseValue) r = this.yaml.baseValue
    else if (this.yaml.baseValues) r = this.selectedBaseR

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

  private lookup: any = {}
  private factors: { [measure: string]: number } = {}
  private selections: { [measure: string]: string } = {}

  private buildUI() {
    if (this.yaml.baseValues) {
      this.selectedBaseR = Object.values(this.yaml.baseValues[0])[0]
    }

    for (const group of Object.keys(this.yaml.optionGroups)) {
      const measures = this.yaml.optionGroups[group]
      this.lookup[group] = []

      for (const measure of measures) {
        const title = Object.keys(measure)[0]
        const value = measure[title]

        if (!isNaN(value)) {
          this.lookup[group].push({ title, value })

          // first?
          if (!this.factors[group]) {
            this.factors[group] = value
            this.selections[group] = title
          }
        } else {
          // user specified a default with an asterisk* after the number
          const trimAsterisk = parseFloat(value.substring(0, value.length - 1))
          this.lookup[group].push({ title, value: trimAsterisk })
          this.selections[group] = title
          this.factors[group] = trimAsterisk
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
  border: 1px solid #ccc;
  padding: 0.75rem 0.75rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
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
