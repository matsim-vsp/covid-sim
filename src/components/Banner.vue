<template lang="pug">
.banner
    .banner-text
      h2 VSP / Technische Universität Berlin
      h3 COVID-19 Analysis Portal
    .city-picker(v-if="!badPage")
      .which-city(v-for="(run,index) in allRuns"
        :key="run.runId"
        :class="{'selected': run.name === city}"
        @click="switchCity(index)" :to="'/runs/' + run.runId")
        h1 {{ run.name }}

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'

@Component({ components: {}, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: false }) private badPage!: boolean
  @Prop({ required: true }) private allRuns!: Object[]
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.banner {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  position: sticky;
  display: flex;
  flex-direction: column;
  padding: 2rem 3rem 0rem 3rem;
  background-color: #1e1f2c;
  color: white;
  background: url(../assets/images/banner.jpg);
  background-repeat: no-repeat;
  background-size: cover;
}

.banner h2 {
  margin-bottom: 0rem;
  font-size: 1.6rem;
  background-color: #1e1f2c;
  line-height: 1.6rem;
  //margin-right: auto;
  margin-right: 1rem;
}

.banner h3 {
  font-size: 1.3rem;
  font-weight: normal;
  margin-bottom: 1rem;
  line-height: 1.4rem;
  //padding-bottom: 0.25rem;
  padding-top: 0.2rem;
  background-color: #1e1f2c;
  width: max-content;
}

.banner-text {
  display: flex;
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
  background-color: white;
}

a.selected {
  color: black;
}
</style>
