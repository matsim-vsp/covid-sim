<template lang="pug">
#home
  .banner
    h2 VSP / Technische Universität Berlin
    h3 COVID-19 Analysis Portal

  .page-area
    colophon.colophon
    .content
      .main
        .top
          p.headline {{ $t('headline1')  }}

        p(v-html="mdDescription($t('description'))")

        .viz-cards
          .one-viz(v-for="rcalc in rCalculators" :key="rcalc.url")
            router-link(:to="rcalc.url")
              .box
                h5 {{rcalc.title}}
                .date {{ rcalc.date}}
                img(width=250 :style="{height: '100px', 'object-fit': 'fill'}" :src="rcalc.image")

</template>

<script lang="ts">
const i18n = {
  messages: {
    en: {
      badpage: 'That page not found, sorry!',
      headline1: 'R-Value and Risk Calculators',
      description:
        'Measures such as contact tracing, mask-wearing and school closures could each impact the ability of the disease to spread. The following R-Value Calculators allow you to experiment with these and other measures to see how they contribute to the R-Value of the disease.',
    },
    de: {
      badpage: 'Seite wurde nicht gefunden.',
      headline1: 'R-Wert-Rechner und Ansteckungsrechner',
      description: `Mit Hilfe des **„R-Wert-Rechners“** kann der Effekt verschiedener Maßnahmen bzw. Maßnahmenpakete auf das Infektionsgeschehen bestimmmt werden.
    Der R-Wert gibt an, wie viele weitere Personen eine infizierte Person im Durchschnitt mit dem Corona-Virus ansteckt.
    Daher ist es erforderlich den R-Wert langfristig kleiner 1 zu halten, um die Corona-Pandemie nachhaltig einzudämmen.

    Mit Hilfe des **„Ansteckungsrechners“** lässt sich die rechnerische Wahrscheinlichkeit ermitteln, wenn in bestimmten Situationen eine ansteckende Person anwesend ist, sich selbst mit dem Virus zu infizieren.


    Weitere Infos zur Methodik der gesamten Simulation finden Sie auf unserer [Startseite](https://covid-sim.info/) .`,
    },
  },
}

import MarkdownIt from 'markdown-it'

import Colophon from '@/components/Colophon.vue'
import allCalculators from '@/assets/calculators'

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'Calculators',
  i18n,
  components: { Colophon },
  props: {},
  data() {
    return {
      rCalculators: allCalculators,
    }
  },

  mounted() {},
  computed: {},
  watch: {},

  methods: {
    mdDescription(msg: string) {
      return mdParser.render(msg)
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

#home {
  background-color: $paleBackground;
}

.content {
  flex: 1;
  padding: 2rem 3rem 8rem 3rem;
  display: flex;
  width: 100%;
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

a {
  font-size: 1.1rem;
  color: #00499c;
}

.readme {
  margin-top: 1rem;
  margin-bottom: 3rem;
  flex: 1;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.3rem;
}

.main h2 {
  margin-top: 3rem;
  font-weight: normal;
  color: $bannerHighlight;
}

.preamble {
  display: flex;
}

.top {
  margin-top: 1rem;
}

.colophon {
  padding: 2rem 2rem 1rem 5rem;
  text-align: right;
  font-size: 0.85rem;
  background-color: white;
}

.main {
  max-width: 64rem;
}

.main .top a {
  font-size: 0.9rem;
}

.page-area {
  display: flex;
  flex-direction: row-reverse;
}

.headline {
  font-size: 2rem;
  line-height: 2.7rem;
  padding: 1rem 0;
  color: $themeColor;
}

.box {
  display: flex;
  flex-direction: column;
}

.box:hover {
  box-shadow: 0px 4px 8px 5px #00000022;
  transition: all 150ms linear;
}

.box h5 {
  margin-bottom: 0;
}

.viz-cards {
  padding-bottom: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 2rem;
}

.one-viz {
  margin-bottom: 1rem;
}

@media only screen and (max-width: 1000px) {
}

@media only screen and (max-width: 800px) {
  .colophon {
    padding: 2rem 1rem 1rem 1rem;
  }
}

@media only screen and (max-width: 640px) {
  .banner {
    padding: 2rem 1rem;
  }

  .content {
    padding: 2rem 1rem 8rem 1rem;
    flex-direction: column-reverse;
  }

  .colophon {
    display: none;
  }

  .headline {
    padding: 0rem 0rem 1rem 0rem;
    font-size: 1.5rem;
    line-height: 1.8rem;
  }
}
</style>
