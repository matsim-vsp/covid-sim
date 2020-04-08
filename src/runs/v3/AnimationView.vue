<template lang="pug">
#anim-container

</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import ZipLoader from 'zip-loader'

import store from '@/store/index.ts'

interface Trip {
  agentId: number
  timestamps: number[]
  path: number[]
}

interface Agent {
  path: []
  timestamps: number[]
  id: number
}

@Component
export default class AnimationView extends Vue {
  @Prop() private isLoaded!: boolean

  private timeFactor = 720.0
  private networkFilename = 'network.zip'

  private state = store.state

  private scene = new THREE.Scene()
  private renderer = new THREE.WebGLRenderer({ antialias: true })
  private camera?: THREE.PerspectiveCamera

  private clock = new THREE.Clock(false) // do not autostart clock!
  private OrbitControl = require('@/OrbitControl')

  // eslint-disable-next-line
  private container: any

  // eslint-disable-next-line
  private cameraControls: any

  private geomSmall = new THREE.CircleBufferGeometry(100, 4)
  private geomBig = new THREE.CircleBufferGeometry(400, 16)

  private yellow = new THREE.MeshBasicMaterial({ color: 0xffff00 })
  private cyan = new THREE.MeshBasicMaterial({ color: 0x00ffff })
  private red = new THREE.MeshBasicMaterial({ color: 0xff00bb })

  private linkMaterial = new THREE.LineBasicMaterial({ color: 0x223355 })

  private agents: THREE.Mesh[] = []

  private xRange = [1e25, -1e25]
  private yRange = [1e25, -1e25]

  // berlin
  private midpointX = 4595000
  private midpointY = 5820000

  private allTrips: Trip[] = []
  private currentTrips = new Map()
  private indexOfNextTripToAnimate = 0

  private publicPath = ''

  @Watch('state.isRunning')
  private playPauseSim() {
    // endless animation loop
    if (this.state.isRunning) {
      this.clock.start()
      requestAnimationFrame(this.animate)
    } else {
      // save where we are in the sim
      this.pauseTime = this.pauseTime + this.clock.getElapsedTime()
      this.clock.stop()
      this.clock = new THREE.Clock(false)
      requestAnimationFrame(this.moveCameraWhilePaused)
    }
  }

  private mounted() {
    this.publicPath = process.env.NODE_ENV === 'production' ? '/covid-sim/' : '/'

    setTimeout(() => {
      this.setup()
    }, 10)

    window.addEventListener('resize', this.onWindowResize, false)
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize)
  }

  private onWindowResize() {
    this.container = document.getElementById('anim-container')
    if (!this.container || !this.camera) return

    const canvas = this.renderer.domElement

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
  }

  private async setup() {
    this.$store.commit('setMessage', 'loading agents')
    await this.loadAgents()

    this.$store.commit('setMessage', 'loading network')
    const networkMesh = await this.loadNetworkMeshFromFile()
    console.log({ networkMesh })
    this.scene.add(networkMesh)

    this.$store.commit('setMessage', 'done')
    this.initScene()

    // let UI know we're about to begin!
    this.$emit('loaded', true)

    this.clock.start()
    this.animate()
  }

  private async loadNetworkMeshFromFile() {
    console.log('loading network', this.networkFilename)

    // load zipfile
    const zipLoader = new ZipLoader(this.publicPath + this.networkFilename)
    await zipLoader.load()

    // extract json
    const json = zipLoader.extractAsText('network.json')
    const network = JSON.parse(json)

    // eslint-disable-next-line
    const nodes: any = {}
    const links: THREE.BufferGeometry[] = []

    for (const node of network.nodes) {
      nodes[node.node_id] = { x: node.x - this.midpointX, y: node.y - this.midpointY }
    }

    for (const link of network.links) {
      const from = new THREE.Vector3(nodes[link.from_node].x, nodes[link.from_node].y, -5)
      const to = new THREE.Vector3(nodes[link.to_node].x, nodes[link.to_node].y, -5)
      const segment = new THREE.BufferGeometry().setFromPoints([from, to])

      links.push(segment)
    }

    const mergedLines = BufferGeometryUtils.mergeBufferGeometries(links)
    const networkMesh = new THREE.LineSegments(mergedLines, this.linkMaterial)

    return networkMesh
  }

  private async loadAgents() {
    console.log('loading agents')

    const response = await fetch(this.publicPath + '3js.3000.json')
    const data = await response.json()

    let id = 0
    for (const agent of data) {
      agent.id = id++

      const isSusceptible = agent.status == 'susceptible'
      const circle = isSusceptible
        ? new THREE.Mesh(this.geomSmall, this.yellow)
        : new THREE.Mesh(this.geomBig, this.red)

      const initialX = agent.path[0][0]
      const initialY = agent.path[0][1]
      circle.position.set(initialX, initialY, isSusceptible ? 0 : 1) // infected on top!

      for (const point of agent.path) {
        this.xRange = [Math.min(this.xRange[0], point[0]), Math.max(this.xRange[1], point[0])]
        this.yRange = [Math.min(this.yRange[0], point[1]), Math.max(this.yRange[1], point[1])]
      }

      this.agents.push(circle)

      this.parseTripsForAgent(agent)
    }

    // normalize the xy now that we know the full map extent
    // berlin: not gonna cuz its hardcode up above
    if (!this.midpointX) this.midpointX = (this.xRange[0] + this.xRange[1]) / 2
    if (!this.midpointY) this.midpointY = (this.yRange[0] + this.yRange[1]) / 2

    for (const agent of this.agents) {
      agent.position.setX(agent.position.x - this.midpointX)
      agent.position.setY(agent.position.y - this.midpointY)
    }

    this.sortAllTrips()
  }

  private parseTripsForAgent(agent: Agent) {
    // need at least two timepoints to make a trip!
    if (agent.timestamps.length < 2) return

    for (let i = 1; i < agent.timestamps.length; i++) {
      const newPoint = agent.path[i]

      if (agent.path[i - 1][0] === newPoint[0] && agent.path[i - 1][1] === newPoint[1]) {
        // don't create a trip with identical start/end POINTS
        continue
      } else if (agent.timestamps[i - 1] === agent.timestamps[i]) {
        // don't create a trip with identical start/end TIMES
        continue
      } else {
        this.allTrips.push({
          agentId: agent.id,
          timestamps: [agent.timestamps[i - 1], agent.timestamps[i]],
          path: [agent.path[i - 1], newPoint],
        })
      }
    }
  }

  private sortAllTrips() {
    console.log('sorting trips')
    this.allTrips = this.allTrips.sort((a, b) => (a.timestamps[0] < b.timestamps[0] ? -1 : 1))
    console.log(this.allTrips.length, 'trips sorted')
    console.log({ trips: this.allTrips })
  }

  private initScene() {
    console.log('hereee 5-----')

    this.container = document.getElementById('anim-container')
    if (!this.container) return

    console.log('hereee 0-----')
    this.scene.background = new THREE.Color(0x181518)

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.container.appendChild(this.renderer.domElement)

    const near = 1
    const far = 50000
    this.camera = new THREE.PerspectiveCamera(170, this.container.clientWidth / this.container.clientHeight, near, far)

    this.cameraControls = new this.OrbitControl.MapControls(this.camera, this.renderer.domElement)
    this.cameraControls.enablePan = true
    this.cameraControls.screenSpacePanning = true
    this.cameraControls.enableZoom = true
    this.cameraControls.enableRotate = false

    this.camera.position.set(0, 0, 3000)
    this.camera.lookAt(0, 0, -1)

    for (const agent of this.agents) {
      this.scene.add(agent)
    }

    this.cameraControls.update()

    console.log('--init complete!')
  }

  private nextClockUpdateTime = 0
  private pauseTime = 0

  private moveCameraWhilePaused() {
    if (!this.camera) return

    if (!this.state.isRunning) {
      this.renderer.render(this.scene, this.camera)
      this.cameraControls.update()
      requestAnimationFrame(this.moveCameraWhilePaused) // endless animation loop
    }
  }

  private animate() {
    const elapsedSeconds = this.timeFactor * (this.clock.getElapsedTime() + this.pauseTime)

    // add any newly active trips
    this.addTripsForTimestampToQueue(elapsedSeconds)

    // update statusbar clock
    if (elapsedSeconds >= this.nextClockUpdateTime) {
      const hour = Math.floor(elapsedSeconds / 3600)
      const minute = Math.floor(elapsedSeconds / 60) % 60
      this.$store.commit('setMessage', (hour < 10 ? '0' : '') + hour + (minute < 10 ? ':0' : ':') + minute)
      this.nextClockUpdateTime += 300
    }

    // update xy for all active trips
    for (const tripNumber of this.currentTrips.keys()) {
      const trip = this.currentTrips.get(tripNumber)

      // remove finished trips -- does this break the looP
      if (elapsedSeconds > trip.timestamps[1]) {
        this.currentTrips.delete(tripNumber)
        if (this.currentTrips.size === 0) this.clock.stop()
        continue
      }

      const tripDuration = trip.timestamps[1] - trip.timestamps[0]
      const currentProgress = elapsedSeconds - trip.timestamps[0]
      const percentComplete = (1.0 * currentProgress) / tripDuration

      const worldX = trip.path[0][0] + percentComplete * (trip.path[1][0] - trip.path[0][0]) - this.midpointX
      const worldY = trip.path[0][1] + percentComplete * (trip.path[1][1] - trip.path[0][1]) - this.midpointY

      this.agents[trip.agentId].position.setX(worldX)
      this.agents[trip.agentId].position.setY(worldY)
    }

    if (this.camera) this.renderer.render(this.scene, this.camera)
    this.cameraControls.update()

    if (this.state.isRunning) requestAnimationFrame(this.animate) // endless animation loop
  }

  private addTripsForTimestampToQueue(elapsedSeconds: number) {
    // maybe we've added everything already
    if (this.indexOfNextTripToAnimate >= this.allTrips.length) return

    const seconds = Math.floor(elapsedSeconds)

    let nextTrip = this.allTrips[this.indexOfNextTripToAnimate]

    while (nextTrip.timestamps[0] <= seconds) {
      // use trip index as key --> monotonically increases
      this.currentTrips.set(this.indexOfNextTripToAnimate, nextTrip)
      this.indexOfNextTripToAnimate++

      if (this.indexOfNextTripToAnimate >= this.allTrips.length) break

      nextTrip = this.allTrips[this.indexOfNextTripToAnimate]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$navHeight: 2.5rem;

#anim-container {
  margin: 0 0;
  padding: 0 0;
  position: absolute;
  width: 100%;
  top: $navHeight;
  bottom: 0.25rem;
  background-color: #223;
}
</style>
