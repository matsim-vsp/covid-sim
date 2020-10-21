<template lang="pug">
.r-calculator(v-if="yaml.optionGroups")

  h2 R-Value Calculator
  h3(:style="{marginBottom: '1rem', color: '#596'}") {{ this.calcId}}

  h3.badpage(v-if="badPage") That page not found, sorry!

  .goodpage(v-else)
    p(v-if="yaml.description") {{ yaml.description}}

    h3 Calculated R value:&nbsp;&nbsp;
      span(:style="{fontSize: '2.5rem', fontWeight: 'bold', color: '#596'}") {{ (adjustedR*0.9).toFixed(2) }} - {{(adjustedR*1.1).toFixed(2)}}

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

import { isNumeric } from 'vega-lite/build/src/util'

type RCalcYaml = {
  baseValue: number
  optionGroups: { [group: string]: { [measure: string]: any }[] }
}

@Component({ components: {}, props: {} })
export default class VueComponent extends Vue {
  private public_svn =
    'https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/'

  private calcId = ''

  private yaml: RCalcYaml = { baseValue: 0, optionGroups: {} }

  private adjustedR = 2.5

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

    const url = this.public_svn + `r-calculator/${this.calcId}.yaml`

    try {
      const response = await fetch(url)
      this.yaml = YAML.parse(await response.text())
      this.buildUI()
      this.updateR()
    } catch (e) {
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
    let r = this.yaml.baseValue

    for (const factor of Object.values(this.factors)) r *= factor

    // fancy!
    this.finalR = r
    this.animateTowardNewRValue()
  }

  private animateTowardNewRValue() {
    const diff = this.finalR - this.adjustedR
    const step = this.adjustedR + diff * 0.2
    this.adjustedR = step
    if (Math.abs(this.adjustedR - this.finalR) < 0.001) {
      this.adjustedR = this.finalR
    } else {
      setTimeout(this.animateTowardNewRValue, 16)
    }
  }

  private lookup: any = {}
  private factors: { [measure: string]: number } = {}
  private selections: { [measure: string]: string } = {}

  private buildUI() {
    for (const group of Object.keys(this.yaml.optionGroups)) {
      const measures = this.yaml.optionGroups[group]

      this.lookup[group] = [{ title: 'x', value: 1.0 }]
      this.factors[group] = 1.0
      this.selections[group] = 'x'

      for (const measure of measures) {
        const title = Object.keys(measure)[0]
        const value = measure[title]

        if (isNumeric(value)) {
          this.lookup[group].push({ title, value })
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

@media only screen and (max-width: 850px) {
  .option-groups {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media only screen and (max-width: 640px) {
  .r-calculator {
    padding: 2rem 1rem;
  }

  .option-groups {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
