<template lang="pug">
.vue-component

    .report-tab(v-for="post in posts" :key="post.filename")
      //- :class="{active: report === selectedReport}")
      h5 {{ post.date }}

      .report(v-if="post.type==='modelrun'")
        img(src="@/assets/images/dots.png")
        .stuff
          h3 New Model Run: {{ post.title }}
          p: i {{ post.subtitle }}
          p Full results&nbsp;
            router-link(:to="post.url") here

      .report(v-if="post.type==='report'")
        img(src="@/assets/images/document.png")
        .stuff
          h3 {{ post.title || "New findings reported" }}
          .wide
            p Full report in German delivered to the BMBF Ministry:
            button.button.is-danger(@click="clickedDownload(post.url)") Full PDF (Deutsch)
          .narrow
            button.button.is-danger(@click="clickedDownload(post.url)") Full PDF (Deutsch)
          p.summary(v-html="post.md")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import MarkdownIt from 'markdown-it'
import YAML from 'yaml'

import { PUBLIC_SVN } from '@/Globals'
import SVNFileSystem from '@/util/SVNFileSystem'

@Component({ components: {}, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private modelRuns!: any[]

  private svnPosts = new SVNFileSystem(PUBLIC_SVN + 'posts')

  private mdParser = new MarkdownIt()

  private posts: any[] = []

  private mounted() {
    this.loadPosts() // this will return immediately and load in background
  }

  private clickedDownload(href: string) {
    window.location.href = href
  }

  private async loadPosts() {
    const folderContents = await this.svnPosts.getDirectory('')
    const files = folderContents.files.sort().reverse()

    const allPosts: any[] = []
    for (const filename of folderContents.files) {
      // skip files that are not 0000-00-00-blah.md
      if (!filename.match(/^\d{4}-\d{2}-\d{2}-.*\.md$/)) continue

      try {
        const text = await this.svnPosts.getFile(filename)
        // get and parse yaml slice
        const mdStart = text.indexOf('\n---')
        if (mdStart === -1) continue

        const yamlSlice = text.substring(4, mdStart)
        const mdSlice = '**Summary:** ' + text.substring(mdStart + 5).trim()

        const yml = YAML.parse(yamlSlice)
        yml.filename = filename

        const md = this.mdParser.render(mdSlice)
        yml.md = md
        yml.sortBy = filename.substring(0, 10)

        allPosts.push(yml)
      } catch (e) {
        console.error(e)
      }
    }

    // merge in model runs! KRAZY
    for (const mRun of this.modelRuns) {
      mRun.sortBy = mRun.date
      mRun.type = 'modelrun'
      allPosts.push(mRun)
    }

    // sortie
    this.posts = allPosts
      .sort((a, b) => {
        return a.sortBy < b.sortBy ? -1 : 1
      })
      .reverse()
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.vue-component {
  display: flex;
  flex-direction: column;
  margin-bottom: 3rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.report {
  display: flex;
  flex-direction: row;
}

.report img {
  width: 6rem;
  height: 6rem;
  margin: 0.5rem 0.5rem 0 0;
  border: 1px solid #ccc;
}

.report-tab {
  // border-top: 2rem solid #c70715;
  padding: 0.5rem 0rem;
}

.content h3 {
  margin: 0.5rem 0 1rem 0;
  padding: 0 0;
}

.content h5 {
  margin: 0rem 0 0.25rem 0;
  background-color: rgb(96, 60, 136); //  #c70715;
  padding-left: 0.5rem;
  line-height: 2rem;
  color: white;
}

button {
  margin-bottom: 0.5rem;
}

.wide {
  font-size: 0.8rem;
  display: inherit;
  text-align: center;
  float: right;
  border: 1px solid rgb(177, 77, 77);
  border-radius: 4px;
  margin: 0.5rem 0rem 0.5rem 1rem;
  padding: 0.5rem 0.5rem 0 0.5rem;
  width: 12rem;
}

.narrow {
  display: none;
}

.stuff {
  // display: flex;
  // flex-direction: column;
  flex: 1;
  margin-bottom: 2rem;
}

@media only screen and (max-width: 800px) {
  .wide {
    display: none;
  }
  .narrow {
    display: inherit;
  }

  .report {
    flex-direction: column;
  }

  .report-tab {
    cursor: pointer;
    padding: 0.5rem 0.5rem 0.5rem 0.25rem;
    font-size: 0.9rem;
  }
}
</style>
