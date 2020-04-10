<template lang="pug">
.card
  .card-image
  // (:style="thumbnailCSS")

  .card-title {{ viz.title }}

  .card-bottom
    .card-endnotes {{ timestamp }}

  .card-subtitle {{ viz.subtitle }}

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

interface Viz {
  url: string
  title: string
  subtitle?: string
}

@Component({ props: { viz: {} } })
export default class VizThumbnail extends Vue {
  @Prop({ required: true })
  private viz!: Viz

  private get timestamp() {
    return this.viz.url.slice(1) // 'no timestamp' // new Date(this.viz.createdAt * 1000.0).toUTCString().slice(0, -7)
  }

  private get thumbnailCSS() {
    return {
      backgroundImage: 'url(/assets/images/v1-thumb.png)',
    }
  }
}
</script>

<style scoped>
.card {
  display: grid;
  flex-direction: column;
  border-top: solid 0.5rem #1e5538;
  min-height: 10rem;
  margin-bottom: 2rem;
  grid-template-rows: 1fr auto auto;
  grid-template-columns: auto;
  opacity: 0.9;
  transition: 0.2s;
}

.card:hover {
  box-shadow: 1px 2px 5px 1px rgba(0, 0, 50, 0.3);
  cursor: pointer;
  opacity: 1;
}

.card .card-image {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  height: 12rem;
  background-size: cover;
  overflow: hidden;
  background-color: #e8e8ea;
  background-image: url(../assets/images/v1-thumb.png);
}

.card .card-title {
  z-index: 2;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  font-size: 2rem;
  font-weight: bold;
  font-family: 'Roboto Slab', Roboto, Avenir, Helvetica, sans-serif;
  color: white;
  line-height: 1.9rem;
  margin-top: auto;
  margin-bottom: 0.75rem;
  margin-right: auto;
  padding: 0.5rem 0.5rem 0.75rem 0.5rem;
  background-color: #479ccc;
  opacity: 0.85;
}

.card .card-bottom {
  grid-row: 3 / 4;
  grid-column: 1 / 2;
  padding: 0.5rem 1.5rem 0.25rem 0.5rem;
}

.card-endnotes {
  font-size: 1.2rem;
  margin-top: -3px;
  margin-right: -0.75rem;
  text-align: right;
  line-height: 90%;
}

.card-subtitle {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
  padding: 1rem 0.5rem;
  color: #1e5538;
  background-color: #f4f4f4;
  font-weight: normal;
  font-size: 1.2rem;
  line-height: 1.3rem;
}

.thumbnail-pic {
  background-size: cover;
}

@media only screen and (max-width: 640px) {
  .card {
    min-height: 8rem;
  }
}
</style>
