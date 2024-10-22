<template lang="pug">
#run-page
  .banner
    .version-banner {{ viewerPrettyName }}
    .banner-text
      h2 VSP / Technische Universität Berlin
      h3 COVID-19 Analysis Portal
    .city-picker(v-if="!badPage")
      .which-city(v-for="(run,index) in allRuns"
        :key="run.runId"
        :class="{'selected': run.name === city}"
        @click="switchCity(index)" :to="'/runs/' + run.runId")
        h1 {{ run.name }}

  //- banner(:badPage="badPage" :allRuns="allRuns" )

  nav.breadcrumb(aria-label="breadcrumbs" v-if="currentCity == -2")
    ul
      li(v-for="path in allRuns[currentCity].crumbs"
        :class="{isActive: path.isActive}")
        router-link(:to="path.url") {{ path.title}}

  .badpage(v-if="badPage")
    h3 404 No Page Found
    p There is nothing available at this URL.
    p Go back to the&nbsp;
      router-link(to="/") main page.

  .view-container
    .view-section
      //- the viewer component is versioned and set using yaml 'viewerVersion: 1' etc
      component.viewer(v-if="currentCity > -1"
        :is="viewerComponent"
        :runYaml="allRuns[currentCity].yaml"
        :runId="allRuns[currentCity].runId"
        :chartYamlFiles="chartYamlFiles"
      )

  //- .view-section-test
  //-   p1 Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos erat, et nonumy sed tempor et et invidunt justo labore Stet clita ea et gubergren, kasd magna no rebum. sanctus sea sed takimata ut vero voluptua. est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat. Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita

</template>

<script lang="ts">
import YAML from 'yaml'
import { Route } from 'vue-router'

import { RunYaml, PUBLIC_SVN } from '@/Globals'
import SVNFileSystem from '@/util/SVNFileSystem'

import V1RunViewer from './v1/V1RunViewer.vue'
import V2RunViewer from './v2/V2RunViewer.vue'

interface Breadcrumb {
  title: string
  url: string
  isActive?: boolean
}

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'RunPage',
  components: { V1RunViewer, V2RunViewer },
  props: {},

  data() {
    return {
      publicPath: '/',
      badPage: false,
      runId: '',
      city: '',
      plusminus: '0',

      // The viewer itself is now versioned
      defaultViewerComponent: 'V1RunViewer',
      viewerComponent: 'V1RunViewer',
      viewerPrettyName: '',

      chartYamlFiles: [] as string[],
      allRuns: [] as { name: string; yaml: RunYaml; runId: string; crumbs: Breadcrumb[] }[],

      svnRoot: new SVNFileSystem(PUBLIC_SVN + 'battery/'),
      currentCity: -1,
    }
  },

  mounted() {
    this.buildPageForURL()
  },

  beforeDestroy() {
    document.title = 'covid-sim.info'
  },

  computed: {},
  watch: {
    $route(to: Route, from: Route) {
      console.log('ROUTE CHANGED', to)

      // skip a reload if only the search query changed.
      if (to.path === from.path) return

      this.buildPageForURL()
    },
  },

  methods: {
    async buildPageForURL() {
      this.badPage = false
      //console.log({ route: this.$route })
      this.runId = this.$route.params.pathMatch

      let trim = this.runId.endsWith('/') ? 1 : 0
      document.title = this.runId.slice(0, this.runId.length - trim) + ' : covid-sim.info'
      this.currentCity = -1
      this.allRuns = []

      // Try to fetch metadata.yaml from the URL.
      // If it exists, show the run.
      // If it does not exist, we will try to build a multi-city page
      try {
        const readYaml = await this.loadYaml(this.runId)
        // got something!
        const crumbs = this.buildBreadcrumbs(this.runId)

        this.chartYamlFiles = await this.getChartYamls()

        // now we have versions of the viewer itself. default is V1
        this.viewerComponent = readYaml.viewerVersion
          ? `V${readYaml.viewerVersion}RunViewer`
          : this.defaultViewerComponent

        this.viewerPrettyName = readYaml.viewerVersion
          ? `Viewer V${readYaml.viewerVersion}`
          : 'Viewer V1'

        this.allRuns.push({ name: readYaml.city, yaml: readYaml, runId: this.runId, crumbs })
        this.city = readYaml.city
        this.currentCity = 0
      } catch (e) {
        console.warn('' + e)
        this.attemptMulticityFromURL()
      }
    },

    buildBreadcrumbs(folder: string) {
      const crumbs: Breadcrumb[] = []
      const pathElements = folder.split('/')

      let url = '/runs/'

      for (const p of pathElements) {
        if (!p) continue

        url += p + '/'
        crumbs.push({ title: p, url })
      }

      crumbs[crumbs.length - 1].isActive = true
      return crumbs
    },

    async getChartYamls(): Promise<string[]> {
      // Perhaps we want to see some charts! Check the dir for chart*.yaml files
      const yamlFiles = []
      const folderContents = await this.svnRoot.getDirectory(this.runId)
      for (const file of folderContents.files) {
        if (file.match(/^chart.*\.yaml$/)) yamlFiles.push(file)
      }
      return yamlFiles
    },

    async attemptMulticityFromURL() {
      // We know at this point that the given URL does not contain a run.
      // We hope that it instead contains subfolders, which each contain a run.

      const folderContents = await this.svnRoot.getDirectory(this.runId)
      if (folderContents.dirs.length) {
        this.fetchMultiYamls(folderContents.dirs)
      } else {
        // User gave a bad URL; maybe tell them.
        this.setBadPage()
      }
    },

    switchCity(index: number) {
      // console.log('switchCity: ', index)
      this.currentCity = index
      this.city = this.allRuns[index].name
      this.$nextTick()
    },

    // Try to get a yaml for each folder
    async fetchMultiYamls(dirs: string[]) {
      this.allRuns = []

      for (const folder of dirs) {
        try {
          let subfolder = this.runId
          subfolder += subfolder.endsWith('/') ? folder : '/' + folder
          const readYaml = await this.loadYaml(subfolder)

          // now we have versions of the viewer itself. default is V1
          this.viewerComponent = readYaml.viewerVersion
            ? `V${readYaml.viewerVersion}RunViewer`
            : this.defaultViewerComponent

          this.viewerPrettyName = readYaml.viewerVersion
            ? `Viewer V${readYaml.viewerVersion}`
            : 'Viewer V1'

          const crumbs = this.buildBreadcrumbs(subfolder)
          this.allRuns.push({ name: readYaml.city, yaml: readYaml, runId: subfolder, crumbs })

          // load first one!
          if (this.currentCity == -1) {
            this.currentCity = 0
            this.city = readYaml.city
          }
        } catch (e) {
          // if that folder was a dud, just ignore it
        }
      }

      if (!this.allRuns.length) this.setBadPage()
    },

    setBadPage() {
      console.log('BAD USER! No such URL.', this.runId)
      // add some bad-page helper thingy here
      this.badPage = true
    },

    // this will throw an error if /path/metadata.yaml is not found
    async loadYaml(path: string) {
      const url = PUBLIC_SVN + 'battery/' + path + '/metadata.yaml'

      const response = await fetch(url)
      const text = await response.text()
      const yml: RunYaml = YAML.parse(text)

      return yml
    },
  },
})
</script>

<style scoped lang="scss">
@import '@/styles.scss';

#run-page {
  // display: grid;
  // grid-template-columns: 1fr;
  // grid-template-rows: auto auto auto auto auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.banner {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  width: 100vw;
  position: sticky;
}

.city-picker {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}

.breadcrumb {
  grid-column: 1 / 2;
  grid-row: 3 / 4;
}

.badpage {
  grid-column: 1 / 2;
  grid-row: 4 / 5;
}

.view-section {
  grid-column: 1 / 2;
  grid-row: 3 / 4;
  background: white;
  width: 100%;
  height: 100%;
  overflow: scroll;
}

.viewer {
  padding: 0rem 0rem;
  margin: 0rem 0rem;
  display: flex;
  flex-direction: row;
}

.city-picker {
  display: flex;
  padding: 0rem 3rem 0 3rem;
}

.which-city {
  padding: 0rem 2rem 0.2rem 2rem;
  margin-top: 0.1rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: capitalize;
  color: #bbb;
  background-color: #222233ff;
  cursor: pointer;
}

.which-city.selected {
  color: black;
}

.selected {
  padding-top: 0.1rem;
  background-color: $paleBackground;
}

a.selected {
  color: black;
}

.breadcrumb {
  margin: 1rem 3rem 0rem 3rem;
  font-size: 0.8rem;
}

.badpage {
  padding: 5rem 3rem;
  color: $bannerHighlight;
}

.banner {
  display: flex;
  flex-direction: column;
  padding: 2rem 3rem 0rem 3rem;
  background-color: black;
  color: white;
  background: url(../assets/images/banner.jpg);
  background-repeat: no-repeat;
  background-size: cover;
  height: max-content;
}

.banner h2 {
  margin-bottom: 0rem;
  font-size: 1.6rem;
  background-color: #1e1f2c;
  line-height: 1.6rem;
  margin-right: 1rem;
}

.banner h3 {
  font-size: 1.3rem;
  font-weight: normal;
  margin-bottom: 1rem;
  line-height: 1.4rem;
  padding-top: 0.2rem;
  background-color: #1e1f2c;
  width: max-content;
}

.banner-text {
  display: flex;
}

.view-container {
  background-color: green;
  height: min-content;
  position: relative;
}

.version-banner {
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: center;
  padding: 0px 1rem;
  color: black;
  font-size: 16px;
  font-weight: bold;
  line-height: 2rem;
  background-color: #fc4;
  z-index: 10000;
}

@media only screen and (max-width: 750px) {
  .view-section {
    overflow: visible;
  }
}

@media only screen and (max-width: 640px) {
  .breadcrumb {
    margin: 1rem 1rem 0rem 1rem;
  }

  .city-picker {
    padding: 0.3rem 1rem 0 1rem;
  }

  .which-city {
    padding: 0.5rem 1rem;
  }
}
</style>
