<template>
  <main class="source-home">
    <header class="catalog-header">
      <p class="eyebrow">MATSim · EpiSim · EpiServe</p>
      <h1>Explore model runs</h1>
      <p>Browse simulation results and model outputs from two research data sources.</p>
    </header>
    <div class="source-columns">
      <section class="source-panel" aria-labelledby="svn-title">
        <header class="source-panel-heading">
          <div>
            <span class="source-label">FILE REPOSITORY</span>
            <h2 id="svn-title">SVN</h2>
          </div>
          <a :href="svnRoot" target="_blank" rel="noopener">Source ↗</a>
        </header>
        <p class="panel-description">
          Explore the complete folder tree. Open a viewer wherever EpiSim metadata is available.
        </p>
        <ul class="tree-root">
          <source-tree label="jaro" path="jaro" initially-open />
        </ul>
      </section>
      <section class="source-panel" aria-labelledby="episerve-title">
        <header class="source-panel-heading">
          <div>
            <span class="source-label">MODEL RUN CATALOG</span>
            <h2 id="episerve-title">EpiServe</h2>
          </div>
          <button class="text-button" @click="load" :disabled="loading">Refresh</button>
        </header>
        <p class="panel-description">
          All model runs, including outputs that are not compatible with the EpiSim viewer.
        </p>
        <label class="search-label" for="run-search">Find a run</label
        ><input
          id="run-search"
          v-model="query"
          type="search"
          placeholder="Search by model, run ID or status"
        />
        <p v-if="loading" class="state-message" role="status">Loading model runs…</p>
        <p v-else-if="error" class="error-message" role="alert">
          {{ error }} <button @click="load">Retry</button>
        </p>
        <template v-else
          ><p class="result-count">{{ filtered.length }} of {{ runs.length }} runs</p>
          <p v-if="!filtered.length" class="state-message">No runs match your search.</p>
          <div class="run-list">
            <router-link
              v-for="run in filtered"
              :key="run.run_id"
              class="run-card"
              :to="'/episerve/' + encodeURIComponent(run.run_id)"
            >
              <div class="run-card-top">
                <span class="run-id">{{ run.run_id }}</span
                ><span class="run-status" :class="{ success: run.status === 'success' }">{{
                  run.status
                }}</span>
              </div>
              <h3>{{ run.model_name }}</h3>
              <div class="run-card-bottom">
                <time>{{ formatDate(run.run_timestamp) }}</time
                ><span
                  >{{
                    hasMetadata(run) ? 'EpiSim package · check details' : 'Files & details'
                  }}
                  →</span
                >
              </div>
            </router-link>
          </div>
        </template>
      </section>
    </div>
    <p class="catalog-footnote">
      Looking for publications, calculators or earlier visualizations?
      <router-link to="/about">About the project →</router-link>
    </p>
  </main>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import SourceTree from '@/components/SourceTree.vue'
import { listRuns, ModelRun, outputPath, SVN_ROOT } from '@/util/runSources'
export default defineComponent({
  components: { SourceTree },
  data: () => ({ svnRoot: SVN_ROOT, runs: [] as ModelRun[], loading: false, error: '', query: '' }),
  computed: {
    filtered(): ModelRun[] {
      const q = this.query.toLowerCase()
      return this.runs.filter(r =>
        [r.run_id, r.model_name, r.status].some(v => v.toLowerCase().includes(q))
      )
    },
  },
  mounted() {
    document.title = 'Model runs · EpiSim'
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.error = ''
      try {
        this.runs = await listRuns()
      } catch {
        this.error = 'Could not load EpiServe runs. Please check the source connection.'
      } finally {
        this.loading = false
      }
    },
    hasMetadata(run: ModelRun): boolean {
      return (run.output_files || []).some(url => outputPath(url) === 'metadata.yaml')
    },
    formatDate(value: string): string {
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB')
    },
  },
})
</script>
<style>
.source-home,
.run-details {
  background: #f3f6f8;
  padding: 48px max(24px, calc((100vw - 1360px) / 2));
  color: #183449;
  min-height: 75vh;
}
.catalog-header {
  margin-bottom: 32px;
}
.eyebrow,
.source-label {
  color: #56788d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.6px;
}
.catalog-header h1,
.run-details h1 {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  margin: 8px 0 12px;
}
.catalog-header > p:last-child {
  color: #607485;
}
.source-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}
.source-panel {
  background: white;
  border: 1px solid #d9e3e9;
  border-radius: 14px;
  padding: 26px;
  min-width: 0;
}
.source-panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: transparent;
  padding: 0;
  border: 0;
}
.source-panel-heading h2 {
  font-size: 26px;
  margin: 4px 0 0;
}
.source-panel-heading > a,
.text-button {
  font-size: 13px;
  color: #167183;
}
.text-button {
  background: transparent;
  border: 0;
  cursor: pointer;
}
.panel-description {
  color: #6b7d89;
  line-height: 1.6;
  font-size: 14px;
  margin: 18px 0 24px;
}
.tree-root {
  margin: 0;
  padding: 0;
}
.search-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}
#run-search {
  width: 100%;
  border: 1px solid #cbd8e0;
  border-radius: 7px;
  padding: 11px 12px;
  font: inherit;
  font-size: 13px;
  background: #fff;
  color: #183449;
}
.result-count {
  font-size: 12px;
  color: #738694;
  margin: 14px 0;
}
.run-list {
  max-height: 650px;
  overflow-y: auto;
  padding-right: 4px;
}
.run-card {
  display: block;
  color: inherit;
  border: 1px solid #e1e8ed;
  border-radius: 9px;
  padding: 16px;
  margin-bottom: 10px;
}
.run-card:hover {
  border-color: #338e9f;
  background: #f7fbfc;
  color: inherit;
}
.run-card-top,
.run-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 11px;
  color: #697e8d;
}
.run-id {
  font-family: monospace;
}
.run-status {
  border-radius: 20px;
  padding: 3px 8px;
  background: #edf0f2;
}
.run-status.success {
  color: #207254;
  background: #e8f5ef;
}
.run-card h3 {
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
  margin: 12px 0;
}
.run-card-bottom span {
  color: #167183;
}
.state-message,
.error-message {
  padding: 20px 0;
  font-size: 14px;
}
.error-message {
  color: #a13d30;
}
.catalog-footnote {
  margin-top: 24px;
  color: #607485;
  font-size: 13px;
}
@media (max-width: 800px) {
  .source-columns {
    grid-template-columns: 1fr;
  }
  .source-home,
  .run-details {
    padding: 28px 16px;
  }
  .source-panel {
    padding: 20px;
  }
}
</style>
