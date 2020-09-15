<template lang="pug">
#vue-component

  .report-list
    .report-tab(v-for="report in reports" :key="report.title"
      @click="changeReport(report)"
      :class="{active: report === selectedReport}")
      p() {{ report.title }}

  .report-details
    .banner
      p(style="flex: 1; margin-right: 0.5rem;") Summary of report:
      button.button.is-danger(@click="clickedDownload()") PDF(Deutsch)
    p.report-summary(v-html="selectedReport.html")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import MarkdownIt from 'markdown-it'

@Component({ components: {}, props: {} })
export default class VueComponent extends Vue {
  private mdParser = new MarkdownIt()

  private reports: any[] = [
    {
      md: '/reports/report-2020-09-11.md',
      title: '11 Sep 2020',
      url: 'https://doi.org/10.14279/depositonce-10553 ',
      html: '',
    },
    {
      md: '/reports/report-2020-08-21.md',
      title: '21 Aug 2020',
      url: 'https://dx.doi.org/10.14279/depositonce-10480',
      html: '',
    },
    {
      md: '/reports/report-2020-07-24.md',
      title: '24 July 2020',
      url: 'https://dx.doi.org/10.14279/depositonce-10417',
      html: '',
    },
    {
      md: '/reports/report-2020-07-03.md',
      title: '03 July 2020',
      url: 'https://dx.doi.org/10.14279/depositonce-10373',
      html: '',
    },
    {
      md: '/reports/report-2020-06-19.md',
      title: '19 Jun 2020',
      url: 'https://doi.org/10.14279/depositonce-10335',
      html: '',
    },
    {
      md: '/reports/report-2020-06-05.md',
      title: '05 Jun 2020',
      url: 'https://dx.doi.org/10.14279/depositonce-10152',
      html: '',
    },
    {
      md: '/reports/report-2020-05-20.md',
      title: '20 May 2020',
      url: 'https://dx.doi.org/10.14279/depositonce-10085',
      html: '',
    },
    {
      md: '/reports/report-2020-05-07.md',
      title: '07 May 2020',
      url: 'https://doi.org/10.14279/depositonce-10018',
      html: '',
    },
    {
      md: '/reports/report-2020-04-24.md',
      title: '24 Apr 2020',
      url: 'https://doi.org/10.14279/depositonce-10017',
      html: '',
    },
    {
      md: '/reports/report-2020-04-08.md',
      title: '08 Apr 2020',
      url: 'https://doi.org/10.14279/depositonce-10016',
      html: '',
    },
  ]

  private selectedReport = this.reports[0]

  private mounted() {
    this.loadReports() // this will return immediately and load in background
  }

  private clickedDownload() {
    window.location.href = this.selectedReport.url
  }

  private changeReport(report: any) {
    this.selectedReport = report
  }

  private async loadReports() {
    for (const report of this.reports) {
      const response = await fetch(report.md)
      const text = await response.text()
      const md = this.mdParser.render(text)

      report.html = md
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

#vue-component {
  display: flex;
  flex-direction: row;
  margin-bottom: 3rem;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.report-list {
  width: max-content;
}

.report-tab {
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.report-tab.active {
  background-color: white;
  font-weight: bold;
}

.report-details {
  padding: 1rem 1rem;
  background-color: white;
  flex: 1;
}

.report-summary {
  padding-top: 1rem;
}

.banner {
  display: flex;
}

@media only screen and (max-width: 640px) {
}
</style>
