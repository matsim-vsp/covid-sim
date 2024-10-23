<template lang="pug">
.vue-component

  .report-list
    .report-tab(v-for="report in reports" :key="report.title"
      @click="changeReport(report)"
      :class="{active: report === selectedReport}")
      p() {{ report.title }}

  .report-details
    .banner
      p(style="flex: 1; margin-right: 0.5rem;") Summary of report:
      button.button.is-danger(@click="clickedDownload()") Full PDF (Deutsch)
    p.report-summary(v-html="selectedReport.html")

</template>

<script lang="ts">
import MarkdownIt from 'markdown-it'

import allReports from '@/assets/reports'

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'ReportViewer',
  components: {},
  props: {
    // state: { type: Object, required: true },
    // measure: { type: String, required: true },
  },
  data() {
    return {
      reports: allReports,
      selectedReport: allReports[0],
    }
  },

  mounted() {
    this.loadReports() // this will return immediately and load in background
  },

  computed: {},
  watch: {},

  methods: {
    clickedDownload() {
      window.location.href = this.selectedReport.url
    },

    changeReport(report: any) {
      this.selectedReport = report
    },

    async loadReports() {
      for (const report of this.reports) {
        const response = await fetch(report.md)
        const text = await response.text()
        const md = mdParser.render(text)

        report.html = md
      }
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.vue-component {
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

@media only screen and (max-width: 800px) {
  .report-tab {
    cursor: pointer;
    padding: 0.5rem 0.5rem 0.5rem 0.25rem;
    font-size: 0.9rem;
  }

  .report-details {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .banner {
    flex-direction: column-reverse;
  }

  .banner button {
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
}
</style>
