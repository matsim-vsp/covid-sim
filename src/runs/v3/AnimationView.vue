<template lang="pug">
#anim-container

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import * as THREE from 'three'
import ZipLoader from 'zip-loader'

import store from '@/store'
import { ColorScheme, Health } from '@/Globals'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MapControls } from '@/util/OrbitControl'

interface Trip {
  id: number
  timestamps: number[]
  path?: number[]
  status?: string
}

export default defineComponent({
  name: 'AnimationView',
  props: {
    isLoaded: Boolean,
  },

  data() {
    const lightMode = {
      background: 0xdddde4,
      links: 0x9999aa,
      susceptible: 0x333333,
      infectedButNotContagious: 0x0077ff,
      contagious: 0xbb0044,
    }
    const darkMode = {
      background: 0x181518,
      links: 0x223355,
      susceptible: 0xffff00,
      infectedButNotContagious: 0x00ffff,
      contagious: 0xff33cc,
    }

    const initColors = store.state.colorScheme == ColorScheme.DarkMode ? darkMode : lightMode

    return {
      networkMesh: null as null | THREE.LineSegments,
      nextClockUpdateTime: 0,
      pauseTime: 0,
      allTripsHaveBegun: false,

      timeFactor: 960.0,
      networkFilename: 'network.zip',
      state: store.state,
      lightMode,
      darkMode,
      colors: initColors,

      scene: new THREE.Scene(),
      renderer: new THREE.WebGLRenderer({ antialias: true }),
      camera: null as null | THREE.PerspectiveCamera,

      clock: new THREE.Clock(false), // do not autostart clock!

      container: {} as any,
      cameraControls: {} as any,

      geomSmall: new THREE.CircleBufferGeometry(100, 4),
      geomMed: new THREE.CircleBufferGeometry(275, 5).rotateZ((18.0 * Math.PI) / 180),
      geomBig: new THREE.CircleBufferGeometry(300, 30),

      linkMaterial: new THREE.LineBasicMaterial({ color: initColors.links }),
      red: new THREE.MeshBasicMaterial({
        color: initColors.contagious,
        transparent: true,
        opacity: 0.8,
      }),
      yellow: new THREE.MeshBasicMaterial({ color: initColors.susceptible }),
      cyan: new THREE.MeshBasicMaterial({
        color: initColors.infectedButNotContagious,
        transparent: true,
        opacity: 0.8,
      }),

      xRange: [1e25, -1e25],
      yRange: [1e25, -1e25],

      // berlin
      midpointX: 4595000,
      midpointY: 5820000,

      agents: {} as { [id: string]: THREE.Mesh },
      allTrips: [] as Trip[],
      currentTrips: new Map(),
      indexOfNextTripToAnimate: 0,

      publicPath: '/',
    }
  },

  watch: {
    'state.isRunning'() {
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
    },

    'state.colorScheme'() {
      this.colors = this.state.colorScheme == ColorScheme.LightMode ? this.lightMode : this.darkMode

      this.scene.background = new THREE.Color(this.colors.background)

      setTimeout(() => {
        this.bgSwapColors()
      }, 50)
    },
  },

  methods: {
    bgSwapColors() {
      const oldRed = this.red
      const oldYellow = this.yellow
      const oldCyan = this.cyan

      this.red = new THREE.MeshBasicMaterial({
        color: this.colors.contagious,
        transparent: true,
        opacity: 0.8,
      })
      this.yellow = new THREE.MeshBasicMaterial({ color: this.colors.susceptible })
      this.cyan = new THREE.MeshBasicMaterial({
        color: this.colors.infectedButNotContagious,
        transparent: true,
        opacity: 0.8,
      })

      // rebuild the streets
      const net = this.scene.getObjectByName('network')
      if (net) this.scene.remove(net)

      this.linkMaterial.dispose()
      this.linkMaterial = new THREE.LineBasicMaterial({ color: this.colors.links })

      if (this.networkMesh) {
        this.networkMesh = new THREE.LineSegments(this.networkMesh.geometry, this.linkMaterial)
        this.networkMesh.name = 'network'
        this.scene.add(this.networkMesh)
      }

      // rebuild every agent
      for (const id of Object.keys(this.agents)) {
        const agent = this.agents[id]
        if (!agent) return

        // get infection status
        let healthStatus = Health.Susceptible
        if (agent.material === oldRed) healthStatus = Health.Contagious
        if (agent.material === oldCyan) healthStatus = Health.InfectedButNotContagious

        const facelift = this.getMeshForInfection(healthStatus)
        facelift.position.copy(agent.position)

        this.scene.remove(agent)
        this.scene.add(facelift)
        this.agents[id] = facelift
      }
    },

    exitSimulation() {
      this.clock = new THREE.Clock(false)
      this.pauseTime = 0
      this.nextClockUpdateTime = 0
      this.indexOfNextTripToAnimate = 0
      this.currentTrips.clear()
      this.allTrips = []
      this.agents = {}

      while (this.scene.children.length) {
        this.scene.remove(this.scene.children[0])
      }
    },

    onWindowResize() {
      this.container = document.getElementById('anim-container')
      if (!this.container || !this.camera) return

      const canvas = this.renderer.domElement

      this.camera.aspect = this.container.clientWidth / this.container.clientHeight
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    },

    async setup() {
      this.$store.commit('setStatusMessage', 'loading agents')
      await this.loadAgents()

      this.$store.commit('setStatusMessage', 'loading network')
      this.networkMesh = await this.loadNetworkMeshFromFile()
      this.networkMesh.name = 'network'
      this.scene.add(this.networkMesh)

      this.$store.commit('setStatusMessage', '')
      this.initScene()

      // let UI know we're about to begin!
      this.$emit('loaded', true)

      this.clock.start()
      this.animate()
    },

    async loadNetworkMeshFromFile() {
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
      this.networkMesh = new THREE.LineSegments(mergedLines, this.linkMaterial)

      return this.networkMesh
    },

    async loadAgents() {
      console.log('loading agents and infections')

      const response = await fetch(this.publicPath + 'infections.json')
      const allEvents = await response.json()

      for (const event of allEvents) {
        const id = event.id

        // first trip for this agent? Save as start-point
        if (!this.agents[id] && event.path) {
          const circle = new THREE.Mesh(this.geomSmall, this.yellow)
          const initialX = event.path[0][0]
          const initialY = event.path[0][1]
          circle.position.set(initialX, initialY, 2)
          this.agents[id] = circle
        }

        // record range of coords (for non-Berlin use later)
        if (event.path) {
          for (const point of event.path) {
            this.xRange = [Math.min(this.xRange[0], point[0]), Math.max(this.xRange[1], point[0])]
            this.yRange = [Math.min(this.yRange[0], point[1]), Math.max(this.yRange[1], point[1])]
          }
        }
      }
      this.allTrips = allEvents

      // normalize the xy now that we know the full map extent
      // berlin: not gonna cuz its hardcode up above
      if (!this.midpointX) this.midpointX = (this.xRange[0] + this.xRange[1]) / 2
      if (!this.midpointY) this.midpointY = (this.yRange[0] + this.yRange[1]) / 2

      // center the dots on 0,0
      for (const id of Object.keys(this.agents)) {
        const agent = this.agents[id]
        agent.position.setX(agent.position.x - this.midpointX)
        agent.position.setY(agent.position.y - this.midpointY)
        this.scene.add(agent)
      }
    },

    sortAllTrips() {
      console.log('sorting trips')
      this.allTrips = this.allTrips.sort((a, b) => (a.timestamps[0] < b.timestamps[0] ? -1 : 1))
      console.log(this.allTrips.length, 'trips sorted')
      console.log({ trips: this.allTrips })
    },

    initScene() {
      this.container = document.getElementById('anim-container')
      if (!this.container) return

      this.scene.background = new THREE.Color(this.colors.background)

      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
      this.container.appendChild(this.renderer.domElement)

      const near = 1
      const far = 50000

      this.camera = new THREE.PerspectiveCamera(
        170,
        this.container.clientWidth / this.container.clientHeight,
        near,
        far
      )
      this.cameraControls = MapControls(this.camera, this.renderer.domElement)
      this.cameraControls.enablePan = true
      this.cameraControls.screenSpacePanning = true
      this.cameraControls.enableZoom = true
      this.cameraControls.enableRotate = false

      this.camera.position.set(0, 0, 3000)
      this.camera.lookAt(0, 0, -1)

      this.cameraControls.update()

      console.log('--init complete!')
    },

    moveCameraWhilePaused() {
      if (!this.camera) return

      if (!this.state.isRunning) {
        this.renderer.render(this.scene, this.camera)
        this.cameraControls.update()
        requestAnimationFrame(this.moveCameraWhilePaused) // endless animation loop
      }
    },

    animate() {
      const elapsedSeconds = this.timeFactor * (this.clock.getElapsedTime() + this.pauseTime)

      // add any newly active trips
      this.addTripsForTimestampToQueue(elapsedSeconds)

      // update statusbar clock
      if (elapsedSeconds >= this.nextClockUpdateTime) {
        const hour = Math.floor(elapsedSeconds / 3600)
        const minute = Math.floor(elapsedSeconds / 60) % 60
        this.$store.commit(
          'setClock',
          (hour < 10 ? '0' : '') + hour + (minute < 10 ? ':0' : ':') + minute
        )
        this.nextClockUpdateTime += 300
      }

      // update xy for all active trips
      for (const tripNumber of this.currentTrips.keys()) {
        const trip = this.currentTrips.get(tripNumber)

        // Handle infection events first:
        if (trip.status) {
          this.handleInfectionEvent(trip)
          this.currentTrips.delete(tripNumber)
          continue
        }

        // Remove trips that already finished
        if (elapsedSeconds > trip.timestamps[1]) {
          this.currentTrips.delete(tripNumber)
          continue
        }

        const tripDuration = trip.timestamps[1] - trip.timestamps[0]
        const currentProgress = elapsedSeconds - trip.timestamps[0]
        const percentComplete = (1.0 * currentProgress) / tripDuration

        const worldX =
          trip.path[0][0] + percentComplete * (trip.path[1][0] - trip.path[0][0]) - this.midpointX
        const worldY =
          trip.path[0][1] + percentComplete * (trip.path[1][1] - trip.path[0][1]) - this.midpointY

        this.agents[trip.id].position.setX(worldX)
        this.agents[trip.id].position.setY(worldY)
      }

      // if ALL trips have been animation to completion, WE ARE DONE
      if (this.currentTrips.size === 0 && this.allTripsHaveBegun) this.clock.stop()

      if (this.camera) this.renderer.render(this.scene, this.camera)
      this.cameraControls.update()

      if (this.state.isRunning) requestAnimationFrame(this.animate) // endless animation loop
    },

    getMeshForInfection(status: string): THREE.Mesh {
      switch (status) {
        case 'contagious':
          return new THREE.Mesh(this.geomBig, this.red)
        case 'infectedButNotContagious':
          return new THREE.Mesh(this.geomMed, this.cyan)
        default:
          return new THREE.Mesh(this.geomSmall, this.yellow)
      }
    },

    handleInfectionEvent(event: Trip) {
      if (!event.status) return

      const agent = this.agents[event.id]
      if (!agent) return

      const infection = this.getMeshForInfection(event.status)

      infection.position.copy(agent.position)
      if (event.status === 'infectedButNotContagious') {
        infection.position.setZ(1)
      }
      if (event.status === 'contagious') {
        infection.position.setZ(0)
      }

      this.scene.remove(agent)
      this.scene.add(infection)
      this.agents[event.id] = infection
    },

    addTripsForTimestampToQueue(elapsedSeconds: number) {
      // maybe we've added everything already
      if (this.indexOfNextTripToAnimate >= this.allTrips.length) {
        this.allTripsHaveBegun = true
        return
      }

      const seconds = Math.floor(elapsedSeconds)

      let nextTrip = this.allTrips[this.indexOfNextTripToAnimate]

      while (nextTrip.timestamps[0] <= seconds) {
        // use trip index as key --> monotonically increases
        this.currentTrips.set(this.indexOfNextTripToAnimate, nextTrip)
        this.indexOfNextTripToAnimate++

        if (this.indexOfNextTripToAnimate >= this.allTrips.length) break

        nextTrip = this.allTrips[this.indexOfNextTripToAnimate]
      }
    },
  },

  mounted() {
    this.setup()
    window.addEventListener('resize', this.onWindowResize, false)
  },

  beforeDestroy() {
    // reset the sim to zero
    this.exitSimulation()

    window.removeEventListener('resize', this.onWindowResize)

    // Some types of THREE objects must be manually destroyed
    // https://threejs.org/docs/index.html#manual/en/introduction/How-to-dispose-of-objects
    if (this.networkMesh) this.networkMesh.geometry.dispose()
    this.linkMaterial.dispose()
    this.yellow.dispose()
    this.red.dispose()
    this.cyan.dispose()
    this.geomSmall.dispose()
    this.geomBig.dispose()
    this.scene.dispose()
  },
})
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
}
</style>
