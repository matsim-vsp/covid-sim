<i18n>
en:
  badpage: 'That page not found, sorry!'

de:
  badpage: 'Seite wurde nicht gefunden.'

</i18n>

<template lang="pug">

.reports 
  .report-container
    .report-header 
      h2 Reports
    .report-content
    report-viewer
      .single-report 
        h1 Title 
        p Link 


</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ReportViewer from '@/components/ReportViewer.vue'

@Component({
  components: { ReportViewer },
  props: {},
})
export default class VueComponent extends Vue {}
</script>

<style scoped lang="scss">
@import '@/styles.scss';
.reports {
  width: 100%;
}

.report-container {
  margin: 50px 200px 0 200px;
}

.report-header {
  font-weight: bold;
  font-size: 2rem;
  line-height: 2.7rem;
  padding: 1rem 0;
  color: black;
}

@media only screen and (max-width: 950px) {
  .report-container {
    margin: 50px 20px 20px 20px;
  }

  .report-header {
    margin-left: 50px;
  }
}

@media only screen and (max-width: 640px) {
}
</style>
