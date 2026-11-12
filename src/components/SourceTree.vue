<template>
  <li class="source-node">
    <div class="node-row">
      <button class="folder-button" @click="toggle" :aria-expanded="expanded">
        <span aria-hidden="true">{{ expanded ? '▾' : '▸' }}</span> {{ label }}
      </button>
      <router-link v-if="isRun" class="open-run" :to="'/' + path">Open viewer →</router-link>
    </div>
    <div v-if="expanded" class="node-content">
      <p v-if="loading" role="status">Loading folder…</p>
      <p v-else-if="error" role="alert">{{ error }} <button @click="load">Retry</button></p>
      <template v-else>
        <ul v-if="dirs.length" class="source-tree">
          <source-tree v-for="dir in dirs" :key="dir" :label="dir" :path="path + '/' + dir" />
        </ul>
        <ul v-if="files.length" class="file-list">
          <li v-for="file in files" :key="file">
            <a :href="fileHref(file)" target="_blank" rel="noopener">{{ file }}</a>
          </li>
        </ul>
        <p v-if="!dirs.length && !files.length">This folder is empty.</p>
      </template>
    </div>
  </li>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { PUBLIC_SVN } from '@/Globals'
import SVNFileSystem from '@/util/SVNFileSystem'
export default defineComponent({
  name: 'SourceTree',
  props: {
    label: { type: String, required: true },
    path: { type: String, required: true },
    initiallyOpen: Boolean,
  },
  data: () => ({
    expanded: false,
    loaded: false,
    loading: false,
    error: '',
    dirs: [] as string[],
    files: [] as string[],
  }),
  computed: {
    isRun(): boolean {
      return this.files.includes('metadata.yaml')
    },
  },
  mounted() {
    if (this.initiallyOpen) this.toggle()
  },
  methods: {
    fileHref(file: string): string {
      return (
        PUBLIC_SVN +
        'battery/' +
        this.path.split('/').map(encodeURIComponent).join('/') +
        '/' +
        encodeURIComponent(file)
      )
    },
    toggle() {
      this.expanded = !this.expanded
      if (this.expanded && !this.loaded) this.load()
    },
    async load() {
      this.loading = true
      this.error = ''
      try {
        const result = await new SVNFileSystem(PUBLIC_SVN + 'battery/').getDirectory(
          this.path,
          true
        )
        this.dirs = result.dirs.sort().reverse()
        this.files = result.files.sort()
        this.loaded = true
      } catch {
        this.error = 'Could not load this folder.'
      } finally {
        this.loading = false
      }
    },
  },
})
</script>
<style scoped>
.source-node {
  list-style: none;
  margin: 6px 0;
}
.node-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.folder-button {
  border: 0;
  background: transparent;
  color: #163d59;
  cursor: pointer;
  font: inherit;
  text-align: left;
  padding: 7px 2px;
  overflow-wrap: anywhere;
}
.open-run {
  font-size: 12px;
  font-weight: 600;
}
.node-content {
  border-left: 1px solid #d8e1e7;
  margin-left: 7px;
  padding-left: 15px;
}
.source-tree,
.file-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.file-list {
  font-size: 12px;
  line-height: 1.9;
  overflow-wrap: anywhere;
}
p {
  font-size: 13px;
  color: #667788;
}
</style>
