<script lang="ts">
import Vue from 'vue'

class EventBusClass extends Vue {
  public SIMULATION_PERCENT: string = 'sim-percent'
  public DRAG: string = 'sim-drag'

  constructor() {
    super()
  }
}

export default new EventBusClass()
</script>
