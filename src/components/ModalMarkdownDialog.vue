<template lang="pug">
.modal
  .modal-background
  .modal-card
    header.modal-card-head
      p.modal-card-title {{ title }}
      button.delete(aria-label="close" @click="clicked('close')")

    section.modal-card-body
      .content
        .my-html(v-html="html")

    footer.modal-card-foot
      button(v-if="buttons.length == 1" class="button is-link" @click="clicked(buttons[0])") {{ buttons[0] }}
      button.button(v-for="msg in buttons.slice(1)" :key="msg" @click="clicked(msg)") {{ msg }}
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import html from '@/assets/animation-helptext.md?raw'

export default defineComponent({
  name: 'ModalMarkdownDialog',
  props: {
    title: { type: String, required: true },
    md: { type: String, required: true },
    buttons: { type: Array as PropType<string[]>, required: true },
  },
  data() {
    return {
      html: '',
    }
  },

  mounted() {
    this.html = html
  },

  methods: {
    clicked(msg: string) {
      this.$emit('click', msg)
    },
  },
})
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.modal {
  margin-top: 3rem;
}

@media only screen and (max-width: 640px) {
}
</style>
