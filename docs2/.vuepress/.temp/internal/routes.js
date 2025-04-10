export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/index.html.js"), meta: {"title":""} }],
  ["/docs2/", { loader: () => import(/* webpackChunkName: "docs2_index.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/index.html.js"), meta: {"title":"Introduction"} }],
  ["/docs2/configuration.html", { loader: () => import(/* webpackChunkName: "docs2_configuration.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/configuration.html.js"), meta: {"title":"Configuration"} }],
  ["/docs2/episimsimulation.html", { loader: () => import(/* webpackChunkName: "docs2_episimsimulation.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/episimsimulation.html.js"), meta: {"title":"EpiSim - Simulation"} }],
  ["/docs2/example.html", { loader: () => import(/* webpackChunkName: "docs2_example.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/example.html.js"), meta: {"title":"Example"} }],
  ["/docs2/introduction.html", { loader: () => import(/* webpackChunkName: "docs2_introduction.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/introduction.html.js"), meta: {"title":"EpiSim - Introduction"} }],
  ["/docs2/outputandanalysis.html", { loader: () => import(/* webpackChunkName: "docs2_outputandanalysis.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/outputandanalysis.html.js"), meta: {"title":"EpiSim - Outputs and Analysis"} }],
  ["/docs2/plots.html", { loader: () => import(/* webpackChunkName: "docs2_plots.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/plots.html.js"), meta: {"title":"Plots"} }],
  ["/docs2/quickstart.html", { loader: () => import(/* webpackChunkName: "docs2_quickstart.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/quickstart.html.js"), meta: {"title":"EpiSim - Quickstart"} }],
  ["/docs2/repositorystructure.html", { loader: () => import(/* webpackChunkName: "docs2_repositorystructure.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/repositorystructure.html.js"), meta: {"title":"EpiSim - Repository Structure"} }],
  ["/docs2/run-setup.html", { loader: () => import(/* webpackChunkName: "docs2_run-setup.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/run-setup.html.js"), meta: {"title":"MATSim Episim"} }],
  ["/docs2/simulationsetup.html", { loader: () => import(/* webpackChunkName: "docs2_simulationsetup.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/simulationsetup.html.js"), meta: {"title":"EpiSim - Simulation Setup"} }],
  ["/docs2/website.html", { loader: () => import(/* webpackChunkName: "docs2_website.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/docs2/website.html.js"), meta: {"title":"COVID Episim Website"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"/Users/friedrichvolkers/GIT/covid-sim/docs2/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
]);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateRoutes) {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
  }
  if (__VUE_HMR_RUNTIME__.updateRedirects) {
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ routes, redirects }) => {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  })
}
