<script lang="ts">
import { defineComponent } from 'vue'

const eventbus = defineComponent({
  name: 'EventBus',
  data() {
    return {
      SIMULATION_PERCENT: 'sim-percent',
      DRAG: 'sim-drag',
    }
  },
})

export default new eventbus()
</script>
