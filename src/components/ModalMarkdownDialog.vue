<template>
  <div class="modal">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
        <button class="delete" aria-label="close" @click="clicked('close')"></button>
      </header>
      <section class="modal-card-body">
        <div class="content">
          <div v-html="html" />
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          v-if="buttons.length == 1"
          class="button is-link"
          @click="clicked(buttons[0])"
        >{{ buttons[0] }}</button>

        <button
          v-for="msg in buttons.slice(1)"
          :key="msg"
          class="button"
          @click="clicked(msg)"
        >{{ msg }}</button>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'

@Component({ components: {}, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private title!: string
  @Prop({ required: true }) private md!: string
  @Prop({ required: true }) private buttons!: string[]

  private html: string = ''

  private mounted() {
    this.html = require('@/assets/animation-helptext.md')
  }

  private clicked(msg: string) {
    this.$emit('click', msg)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

@media only screen and (max-width: 640px) {
}
</style>
