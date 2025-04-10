import comp from "/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/quickstart.html.vue"
const data = JSON.parse("{\"path\":\"/docs2/quickstart.html\",\"title\":\"EpiSim - Quickstart\",\"lang\":\"de-DE\",\"frontmatter\":{},\"headers\":[],\"git\":{},\"filePathRelative\":\"docs2/quickstart.md\"}")
export { comp, data }

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
