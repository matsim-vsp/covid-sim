<template lang="pug">
.vue-component

    .post-container(v-for="post in listOfPosts" :key="post.filename")
      //- :class="{active: report === selectedReport}")

      .post.modelrun(v-if="post.type==='modelrun'")
        img(src="@/assets/images/dots.png")
        .stuff
          h3 New Model Run: {{ post.title }}
          h5 {{ post.date }}
          p: i {{ post.subtitle }}
          p Full results&nbsp;
            router-link(:to="post.url") here

      .post.report(v-if="post.type==='report'")
        img(src="@/assets/images/document.png")
        .stuff
          h3 {{ post.title || "New findings reported" }}
          h5 {{ post.date }}
          .wide
            p Full report in German delivered to the BMBF Ministry:
            button.button.is-danger(@click="clickedDownload(post.url)") Full PDF (Deutsch)
          .narrow
            button.button.is-danger(@click="clickedDownload(post.url)") Full PDF (Deutsch)
          p.summary(v-html="post.md")

    button.button(@click="showMore = !showMore") {{ showMore ? "Show Fewer Posts" : `Show All ${this.posts.length} Updates` }}

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import MarkdownIt from 'markdown-it'
import YAML from 'yaml'

import { PUBLIC_SVN } from '@/Globals'
import SVNFileSystem from '@/util/SVNFileSystem'

export default defineComponent({
  name: 'BlogList',
  props: {
    modelRuns: { type: Array as PropType<any[]>, required: true },
  },
  data() {
    return {
      svnPosts: new SVNFileSystem(PUBLIC_SVN + 'posts'),
      mdParser: new MarkdownIt(),
      posts: [] as any[],
      showMore: false,
    }
  },
  computed: {
    listOfPosts() {
      if (this.showMore) return this.posts
      return this.posts.slice(0, 6)
    },
  },

  mounted() {
    this.loadPosts() // this will return immediately and load in background
  },

  methods: {
    clickedDownload(href: string) {
      window.location.href = href
    },

    async loadPosts() {
      const folderContents = await this.svnPosts.getDirectory('')
      const files = folderContents.files.sort().reverse()

      const allPosts: any[] = []
      for (const filename of files) {
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
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.vue-component {
  display: flex;
  flex-direction: column;
  margin-bottom: 3rem;
  padding-top: 0rem;
  padding-bottom: 1rem;
}

.post {
  display: flex;
  flex-direction: row;
}

.post img {
  width: 4rem;
  height: 4rem;
  margin: 0.5rem 1rem 0 0rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.post-container {
  // border-top: 2rem solid #c70715;
  padding: 0.5rem 1rem;
  background-color: white;
  margin-bottom: 2rem;
  border-radius: 5px;
}

.report {
  /* */
}

.content h3 {
  margin: 0.5rem 0 0rem 0;
  padding: 0 0;
}

.content h5 {
  margin: 0rem 0 1rem 0;
  // background-color: rgb(96, 60, 136); //  #c70715;
  // color: white;
  // padding-left: 0.5rem;
  font-weight: normal;
  font-size: 1rem;
  color: $themeColorPale;
  line-height: 1.5rem;
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

  .post {
    flex-direction: column;
  }

  .post-container {
    padding: 0rem 0.5rem 0.5rem 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
}
</style>
