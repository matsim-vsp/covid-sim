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
          p.headline Imprint

          .imprint(v-html="imprint")


           


</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import Colophon from '@/components/Colophon.vue'
import ReportViewer from '@/components/ReportViewer.vue'
import VizCard from '@/components/VizCard.vue'

@Component({ components: { Colophon, ReportViewer, VizCard }, props: {} })
export default class VueComponent extends Vue {
  private imprint = require('@/assets/imprint.en.md')
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

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

.imprint {
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

@media only screen and (max-width: 1000px) {
  .latest-updates {
    grid-template-rows: auto auto auto;
    grid-template-columns: 1fr;
  }
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
