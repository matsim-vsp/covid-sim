<template lang="pug">
.bavue-component
  .content

    .stuff(v-html="mdContent")

    hr

    p Go back to the&nbsp;
      router-link(to="/") main page.

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import MarkdownIt from 'markdown-it'
import textNoSuchRun from '@/assets/no-such-run.md?raw'
const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

export default defineComponent({
  name: 'MessagePane',
  data() {
    return {
      mdContent: '',
      currentCity: -1,
    }
  },
  mounted() {
    this.mdContent = mdParser.render(textNoSuchRun)
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.content {
  margin-top: 4rem;
  margin-bottom: 2rem;
  padding: 0 3rem;
}

.viewer {
  padding: 0rem 0rem;
  margin: 0rem 0rem;
  max-width: 70em;
  display: flex;
  flex-direction: column;
}

.city-picker {
  display: flex;
  background-color: $bannerHighlight;
  padding: 0.3rem 3rem 0 3rem;
}

.which-city {
  padding: 0rem 2rem 0.2rem 2rem;
  margin-top: 0.1rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: capitalize;
  color: #bbb;
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
