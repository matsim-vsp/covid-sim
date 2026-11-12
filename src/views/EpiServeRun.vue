<template>
  <div>
    <main v-if="!showViewer" class="run-details">
      <router-link to="/">← All sources</router-link>
      <p v-if="loading" role="status">Loading run details…</p>
      <p v-else-if="error" role="alert">{{ error }} <button @click="load">Retry</button></p>
      <template v-else-if="run">
        <p class="eyebrow" style="margin-top: 24px">EPISERVE MODEL RUN</p>
        <h1>{{ run.run_id }}</h1>
        <p>{{ run.model_name }}</p>
        <p class="run-description">Status: {{ run.status }} · {{ run.run_timestamp }}</p>
        <section class="source-panel" style="margin: 24px 0">
          <template v-if="inspection"
            ><h2 class="detail-title">EpiSim package available</h2>
            <p>{{ inspection.yaml.city }} · Viewer V{{ inspection.yaml.viewerVersion || 1 }}</p>
            <button class="button is-link" @click="showViewer = true">
              Open EpiSim viewer
            </button></template
          >
          <template v-else
            ><h2 class="detail-title">EpiSim visualization unavailable</h2>
            <p>{{ compatibilityMessage }}</p></template
          >
        </section>
        <h2 class="detail-title">Output files</h2>
        <ul class="detail-files">
          <li v-for="url in run.output_files" :key="url">
            <a :href="safeFile(url)" target="_blank" rel="noopener">{{ filename(url) }}</a>
          </li>
        </ul>
        <p v-if="!run.output_files.length">No output files are available for this run.</p>
        <h2 class="detail-title">Input files</h2>
        <ul class="detail-files">
          <li v-for="url in run.input_files" :key="url">
            <a :href="safeFile(url)" target="_blank" rel="noopener">{{ filename(url) }}</a>
          </li>
        </ul>
        <p style="margin-top: 24px">
          <a
            :href="
              'https://data.episerve.zib.de/dataset/' + encodeURIComponent(run.qid.toLowerCase())
            "
            target="_blank"
            rel="noopener"
            >View in the EpiServe data catalog ↗</a
          >
        </p>
      </template>
    </main>
    <template v-if="showViewer && inspection"
      ><button class="button" @click="showViewer = false">← Run details</button
      ><component
        :is="inspection.yaml.viewerVersion === 2 ? 'V2RunViewer' : 'V1RunViewer'"
        :key="run.run_id"
        :runYaml="inspection.yaml"
        :runId="inspection.runId"
        :baseUrl="inspection.baseUrl"
        :chartYamlFiles="inspection.charts"
    /></template>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { API_ROOT, ModelRun, readJson, inspectRun, fileUrl } from '@/util/runSources'
export default defineComponent({
  components: {
    V1RunViewer: () => import('./v1/V1RunViewer.vue'),
    V2RunViewer: () => import('./v2/V2RunViewer.vue'),
  },
  data: () => ({
    run: null as ModelRun | null,
    inspection: null as Awaited<ReturnType<typeof inspectRun>>,
    loading: false,
    error: '',
    compatibilityMessage: '',
    showViewer: false,
    request: 0,
  }),
  mounted() {
    this.load()
  },
  watch: {
    '$route.params.runId'() {
      this.load()
    },
  },
  methods: {
    async load() {
      const request = ++this.request
      this.loading = true
      this.error = ''
      this.showViewer = false
      this.inspection = null
      this.run = null
      try {
        const run = await readJson<ModelRun>(
          API_ROOT + '/model-runs/' + encodeURIComponent(this.$route.params.runId)
        )
        if (request !== this.request) return
        this.run = run
        document.title = run.run_id + ' · EpiServe'
        try {
          const inspection = await inspectRun(run)
          if (request !== this.request) return
          this.inspection = inspection
          this.compatibilityMessage = inspection
            ? ''
            : 'This run does not contain an EpiSim metadata.yaml package. You can still inspect and download its files.'
        } catch (error) {
          if (request === this.request)
            this.compatibilityMessage =
              error instanceof Error ? error.message : 'Could not check the EpiSim package.'
        }
      } catch {
        if (request === this.request) this.error = 'Could not load this run.'
      } finally {
        if (request === this.request) this.loading = false
      }
    },
    safeFile(url: string): string | undefined {
      try {
        return fileUrl(url)
      } catch {
        return undefined
      }
    },
    filename(url: string): string {
      try {
        return decodeURIComponent(new URL(url).pathname.split('/').pop() || url)
      } catch {
        return url
      }
    },
  },
})
</script>
<style scoped>
.detail-title {
  font-size: 20px;
  margin: 20px 0 12px;
}
.detail-files {
  line-height: 2;
  overflow-wrap: anywhere;
}
.run-description {
  margin-top: 12px;
  color: #637a89;
}
.button {
  margin-top: 16px;
}
</style>
