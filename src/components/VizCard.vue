<template lang="pug">
.card
  .card-image(:style="{'background-image': `url(${thumbnail})`}")

  .card-title {{ viz.title }}

  .card-id
    .card-endnotes {{ vizNumber }}

  .card-subtitle {{ viz.subtitle }}

  .card-date {{ viz.date }}

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import pngV3 from '@/assets/images/v3-thumb.png'
import pngTimelapse from '@/assets/images/timelapse.jpg'
import pngV6 from '@/assets/images/thumb-v6.png'

interface Viz {
  url: string
  title: string
  subtitle?: string
}

export default defineComponent({
  name: 'VizCard',
  props: {
    viz: { type: Object as PropType<Viz>, required: true },
  },
  computed: {
    vizNumber() {
      const n = this.viz.url.slice(1)
      const query = n.indexOf('?')
      if (query === -1) return n
      return n.substring(0, query)
    },

    thumbnail() {
      if (this.viz.url.indexOf('v3') > -1) {
        return pngV3
      } else if (this.viz.url.indexOf('timelapse') > -1) {
        return pngTimelapse
      } else {
        return pngV6
      }
    },
  },
})
</script>

<style scoped lang="scss">
@use '@/styles.scss' as *;

.card {
  display: grid;
  flex-direction: column;
  border: solid 1px #ccc;
  border-top: solid 0.5rem $bannerHighlight;
  grid-template-rows: auto 1fr;
  grid-template-columns: auto;
  opacity: 0.9;
  transition: 0.1s;
  height: 100%;
}

.card:hover {
  box-shadow: 1px 2px 5px 1px rgba(0, 0, 50, 0.3);
  cursor: pointer;
  opacity: 1;
}

.card .card-image {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  height: 10rem;
  background-size: cover;
  overflow: hidden;
  background-color: #e8e8ea;
}

.card .card-title {
  z-index: 2;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  font-size: 1.6rem;
  font-weight: bold;
  font-family: 'Roboto Slab', Roboto, Avenir, Helvetica, sans-serif;
  color: white;
  line-height: 1.9rem;
  margin-top: auto;
  margin-bottom: 0;
  margin-right: auto;
  padding: 0.5rem 0.5rem 0.75rem 0.5rem;
  background-color: $matsimBlue;
  opacity: 0.92;
}

.card .card-id {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  padding: 0rem 0.5rem 0.4rem 0.5rem;
  background-color: $bannerHighlight;
  z-index: 3;
  margin: 0 0 auto auto;
}

.card-endnotes {
  font-size: 1rem;
  text-align: right;
  line-height: 90%;
  color: white;
}

.card-subtitle {
  grid-row: 3 / 4;
  grid-column: 1 / 2;
  padding: 0.5rem 0.5rem;
  color: $bannerHighlight;
  background-color: #f4f4f4;
  font-size: 0.9rem;
  line-height: 1.3rem;
}

.card-date {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
  padding: 0.25rem 0.5rem 0rem 0.5rem;
  color: $bannerHighlight;
  background-color: #f4f4f4;
  font-size: 0.9rem;
  line-height: 1.3rem;
  font-style: italic;
}

.thumbnail-pic {
  background-size: cover;
}

@media only screen and (max-width: 640px) {
  .card .card-image {
    height: 11rem;
  }

  .card .card-subtitle {
    font-size: 1rem;
  }

  .card .card-endnotes {
    font-size: 1rem;
  }
}
</style>
