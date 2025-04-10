import comp from "/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/documentation/example.html.vue"
const data = JSON.parse("{\"path\":\"/documentation/example.html\",\"title\":\"Example\",\"lang\":\"de-DE\",\"frontmatter\":{},\"headers\":[{\"level\":2,\"title\":\"Emphasis\",\"slug\":\"emphasis\",\"link\":\"#emphasis\",\"children\":[]},{\"level\":2,\"title\":\"Blockquotes\",\"slug\":\"blockquotes\",\"link\":\"#blockquotes\",\"children\":[]},{\"level\":2,\"title\":\"Lists\",\"slug\":\"lists\",\"link\":\"#lists\",\"children\":[]},{\"level\":2,\"title\":\"Code\",\"slug\":\"code\",\"link\":\"#code\",\"children\":[]},{\"level\":2,\"title\":\"Tables\",\"slug\":\"tables\",\"link\":\"#tables\",\"children\":[]},{\"level\":2,\"title\":\"Links\",\"slug\":\"links\",\"link\":\"#links\",\"children\":[]},{\"level\":2,\"title\":\"Images\",\"slug\":\"images\",\"link\":\"#images\",\"children\":[]}],\"git\":{},\"filePathRelative\":\"documentation/example.md\"}")
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
