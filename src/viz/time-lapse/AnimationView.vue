<template lang="pug">
#anim-container

</template>

<script lang="ts">
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import Papaparse from '@simwrapper/papaparse'
import ZipLoader from 'zip-loader'
import * as THREE from 'three'

import store from '@/store'
import AgentGeometry from './AgentGeometry'
import EventBus from '@/EventBus.vue'
import {
  AgentProgessingThroughDisease,
  ColorScheme,
  ColorSet,
  Infection,
  Health,
  DARK_MODE,
  LIGHT_MODE,
} from '@/Globals'

import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import vertexShader from './shaderVert.vert?raw'
import fragmentShader from './shaderFrag.frag?raw'

import { MapControls } from '@/util/OrbitControl'

import rawCSV from './timelapse.csv?raw'

export default defineComponent({
  name: 'AnimationView',
  components: {},
  props: {
    speed: { type: Number, required: true },
    day: { type: Number, required: true },
    showSusceptible: { type: Boolean, required: true },
  },
  data() {
    const initColors = DARK_MODE

    return {
      timeFactor: 1.0,
      timeDirection: 1,
      vertexShader,
      fragmentShader,

      networkFilename: '/network.zip',
      state: store.state,
      colors: initColors,

      // keep track of time - current time in the simulation itself
      simulationTime: 0,

      // Count the seconds since the clock started running;
      // Every pause resets the anim clock to zero!
      animationTimeSinceUnpaused: 0,
      clock: new THREE.Clock(false), // do not autostart clock!

      // when to next update the visible clock
      nextClockUpdateTime: 0,

      scene: new THREE.Scene(),
      renderer: new THREE.WebGLRenderer({ antialias: true }),
      camera: null as null | THREE.PerspectiveCamera,

      container: {} as any,
      cameraControls: {} as any,

      linkMaterial: new THREE.LineBasicMaterial({ color: initColors.links }),

      xRange: [1e25, -1e25],
      yRange: [1e25, -1e25],

      // berlin
      midpointX: 4595000,
      midpointY: 5820000,

      agentList: [] as AgentProgessingThroughDisease[],
      infectionList: {} as { [id: string]: Infection },

      wasSimulationRunning: true,
      networkLayers: [] as THREE.LineSegments[],

      agentMaterial: null as null | THREE.ShaderMaterial,
      agentGeometry: null as null | AgentGeometry,
    }
  },

  mounted() {
    this.setInitialClockTime()
    this.setupSimulation()
    this.setupDragListener()

    window.addEventListener('resize', this.onWindowResize, false)
    document.addEventListener('visibilitychange', this.handleVisibilityChange, false)
  },

  beforeDestroy() {
    // reset the sim to zero
    this.exitSimulation()

    window.removeEventListener('resize', this.onWindowResize)
    document.removeEventListener('visibilityChange', this.handleVisibilityChange)
    EventBus.$off(EventBus.DRAG)

    // Some types of THREE objects must be manually destroyed
    // https://threejs.org/docs/index.html#manual/en/introduction/How-to-dispose-of-objects
    if (this.agentMaterial) this.agentMaterial.dispose()
    if (this.agentGeometry) this.agentGeometry.dispose()

    for (const networkLayer of this.networkLayers) {
      networkLayer.geometry.dispose()
    }

    this.linkMaterial.dispose()
    this.scene.dispose()
  },

  computed: {},

  watch: {
    showSusceptible() {
      if (!this.agentGeometry) return
      if (!this.agentMaterial) return

      const show = this.showSusceptible ? 1.0 : 0.0
      this.agentMaterial.uniforms['showSusceptible'].value = show
      this.agentMaterial.uniformsNeedUpdate = true
    },

    speed() {
      this.$store.commit('setSimulation', true)

      const newDirection = this.speed < 0 ? -1 : 1
      if (newDirection === this.timeDirection) return

      // switch everything backwards
      this.clock.stop()
      this.clock = new THREE.Clock(false)

      this.timeDirection = newDirection

      this.clock.start()
      this.animationTimeSinceUnpaused = 0
      requestAnimationFrame(this.moveCameraWhilePaused)
    },

    'state.isRunning'() {
      if (this.state.isRunning) {
        // pressed play.
        this.clock.start()
        requestAnimationFrame(this.animate)
      } else {
        // pressed pause
        this.clock.stop()
        this.clock = new THREE.Clock(false)

        // Reset animation frame-clock to zero
        this.animationTimeSinceUnpaused = 0
        requestAnimationFrame(this.moveCameraWhilePaused)
      }
    },

    'state.colorScheme'() {
      this.colors = this.state.colorScheme == ColorScheme.LightMode ? LIGHT_MODE : DARK_MODE

      // background
      this.scene.background = new THREE.Color(this.colors.background)

      // agents
      if (this.agentMaterial) {
        this.agentMaterial.uniforms['cSusceptible'].value = new THREE.Color(this.colors.susceptible)
        this.agentMaterial.uniforms['cInfectedButNotContagious'].value = new THREE.Color(
          this.colors.infectedButNotContagious
        )
        this.agentMaterial.uniforms['cContagious'].value = new THREE.Color(this.colors.contagious)
        this.agentMaterial.uniforms['cSymptomatic'].value = new THREE.Color(this.colors.symptomatic)
        this.agentMaterial.uniforms['cSeriouslyIll'].value = new THREE.Color(
          this.colors.seriouslyIll
        )
        this.agentMaterial.uniforms['cCritical'].value = new THREE.Color(this.colors.critical)
        this.agentMaterial.uniforms['cRecovered'].value = new THREE.Color(this.colors.recovered)
      }

      // road network
      // rebuild the streets
      const net = this.scene.getObjectByName('network')
      if (net) this.scene.remove(net)

      this.linkMaterial.dispose()
      this.linkMaterial = new THREE.LineBasicMaterial({ color: this.colors.links })

      for (const networkLayer of this.networkLayers) {
        const name = networkLayer.name
        const mesh = this.scene.getObjectByName(name)
        if (mesh) this.scene.remove(mesh)

        const newLayer = new THREE.LineSegments(networkLayer.geometry, this.linkMaterial)
        newLayer.name = name
        this.scene.add(newLayer)
      }
    },
  },

  methods: {
    onWindowResize() {
      this.container = document.getElementById('anim-container')
      if (!this.container || !this.camera) return

      const canvas = this.renderer.domElement

      this.camera.aspect = this.container.clientWidth / this.container.clientHeight
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    },

    async setupSimulation() {
      this.initScene()

      this.$store.commit('setStatusMessage', 'loading agents')

      await this.loadPopulation()

      // this can happen in the background
      this.addNetworkToScene()
    },

    startSimulation() {
      console.log('START SIMULATION')
      // let UI know we're about to begin!
      this.$emit('loaded', true)

      if (!this.state.isShowingHelp) {
        this.clock.start()
        this.animate()
        this.$store.commit('setSimulation', true)
      }
    },

    async networkLayerAdder(nodes: any[], netlinks: any[], index: number) {
      const batchSize = 20000

      // if we're done loading network, start the simulation
      if (index > netlinks.length) {
        this.startSimulation()
        return
      }

      const links: THREE.BufferGeometry[] = []
      const start = index
      const end = index + batchSize > netlinks.length ? netlinks.length : index + batchSize

      for (let i = start; i < end; i++) {
        const link = netlinks[i]
        const from = new THREE.Vector3(nodes[link.from_node].x, nodes[link.from_node].y, 0)
        const to = new THREE.Vector3(nodes[link.to_node].x, nodes[link.to_node].y, 0)
        const segment = new THREE.BufferGeometry().setFromPoints([from, to])

        links.push(segment)
      }

      const mergedLines = BufferGeometryUtils.mergeBufferGeometries(links)
      const networkMesh = new THREE.LineSegments(mergedLines, this.linkMaterial)

      networkMesh.name = 'network' + index

      this.scene.add(networkMesh)
      if (this.camera) this.renderer.render(this.scene, this.camera)

      this.networkLayers.push(networkMesh)
      mergedLines.dispose()

      // start the next batch. 1ms timeout required so UI doesn't freeze
      const nextIndex = index + batchSize
      setTimeout(() => {
        this.networkLayerAdder(nodes, netlinks, nextIndex)
      }, 1)
    },

    async addNetworkToScene() {
      console.log('loading network', this.networkFilename)
      this.networkLayers = []

      // load zipfile
      const zipLoader = new ZipLoader(this.networkFilename)
      await zipLoader.load()

      // extract json
      const network = zipLoader.extractAsJSON('network.json')

      // eslint-disable-next-line
      const nodes: any = {}
      for (const node of network.nodes) {
        nodes[node.node_id] = { x: node.x - this.midpointX, y: node.y - this.midpointY }
      }

      console.log('network has links:', network.links.length)

      this.networkLayerAdder(nodes, network.links, 0)
    },

    async loadPopulation() {
      console.log('loading agents and their infections')

      const agentData = Papaparse.parse(rawCSV, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      this.agentList = agentData

      console.log('--Done reading agents.')
      console.log({ agentData })

      this.finishedLoadingPopulation()
    },

    setInitialClockTime() {
      // set specified time, if we got one
      const secondsParam = '' + this.$route.query.start
      if (secondsParam && !Number.isNaN(parseInt(secondsParam))) {
        const seconds = parseInt(secondsParam)
        if (seconds >= 0 || seconds < 86400) {
          this.simulationTime = seconds
          this.$nextTick()
        }
      }
    },

    handleVisibilityChange() {
      console.log('window visibility changed!! hidden:', document.hidden)
      this.$store.commit('setSimulation', document.hidden ? false : true)
    },

    setupDragListener() {
      const parent = this
      EventBus.$on(EventBus.DRAG, function (seconds: number) {
        if (seconds === -1) {
          // start drag
          parent.wasSimulationRunning = parent.state.isRunning
          parent.$store.commit('setSimulation', false)
        } else if (seconds === -2) {
          // end drag
          parent.$store.commit('setSimulation', parent.wasSimulationRunning)
        } else {
          // dragging
          parent.simulationTime = parent.nextClockUpdateTime = seconds
          parent.animate()
        }
      })
    },

    exitSimulation() {
      this.clock = new THREE.Clock(false)
      this.simulationTime = 0
      this.nextClockUpdateTime = 0
      this.timeDirection = 1

      while (this.scene.children.length) {
        this.scene.remove(this.scene.children[0])
      }
    },

    finishedLoadingPopulation() {
      if (this.agentGeometry) this.agentGeometry.dispose()
      this.agentGeometry = new AgentGeometry(this.agentList, this.midpointX, this.midpointY)

      this.agentMaterial = new THREE.ShaderMaterial({
        uniforms: {
          simulationTime: { value: 0.0 },
          showSusceptible: { value: this.showSusceptible },
          colorLinks: { value: new THREE.Color(this.colors.links) },

          cSusceptible: { value: new THREE.Color(this.colors.susceptible) },
          cContagious: { value: new THREE.Color(this.colors.contagious) },
          cInfectedButNotContagious: {
            value: new THREE.Color(this.colors.infectedButNotContagious),
          },
          cSymptomatic: {
            value: new THREE.Color(this.colors.symptomatic),
          },
          cSeriouslyIll: {
            value: new THREE.Color(this.colors.seriouslyIll),
          },
          cCritical: {
            value: new THREE.Color(this.colors.critical),
          },
          cRecovered: {
            value: new THREE.Color(this.colors.recovered),
          },
        },
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader,
        blending: THREE.NoBlending,
        depthTest: true,
        transparent: true,
      })
      const points = new THREE.Points(this.agentGeometry, this.agentMaterial)
      points.name = 'agents'

      console.log({ points })
      // zap the old points, if we have them
      const agentLayer = this.scene.getObjectByName('agents')
      if (agentLayer) this.scene.remove(agentLayer)
      this.scene.add(points)

      if (this.camera) this.renderer.render(this.scene, this.camera)
      this.$store.commit('setStatusMessage', 'loading network')

      console.log('added points')
    },

    initScene() {
      console.log('INIT SCENE 5-----')

      this.container = document.getElementById('anim-container')
      if (!this.container) return

      this.scene.background = new THREE.Color(this.colors.background)

      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
      this.container.appendChild(this.renderer.domElement)

      const near = 1
      const far = 100000

      this.camera = new THREE.PerspectiveCamera(
        170,
        this.container.clientWidth / this.container.clientHeight,
        near,
        far
      )

      //@ts-ignore
      this.cameraControls = new MapControls(this.camera, this.renderer.domElement)

      this.cameraControls.enablePan = true
      this.cameraControls.screenSpacePanning = true
      this.cameraControls.enableZoom = true
      this.cameraControls.enableRotate = false

      this.camera.position.set(0, 0, 1500)
      this.camera.lookAt(0, 0, -1)

      this.cameraControls.update()

      this.renderer.render(this.scene, this.camera)

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
      // update all the time & clock tickers
      const elapsedTicks = this.clock.getElapsedTime()

      const timeDelta =
        this.timeFactor * this.speed * (elapsedTicks - this.animationTimeSinceUnpaused)

      this.animationTimeSinceUnpaused = elapsedTicks

      this.simulationTime = this.simulationTime + timeDelta

      // are we done?
      if (this.simulationTime < 0.0) {
        this.$store.commit('setSimulation', false)
        this.simulationTime = 0
      } else if (this.simulationTime > 86400) {
        this.$store.commit('setSimulation', false)
        this.simulationTime = 86400 - 1
      }

      // tell agents to move their butts
      if (this.agentMaterial)
        this.agentMaterial.uniforms['simulationTime'].value = this.simulationTime

      // update statusbar, clocks, etc
      if (
        this.simulationTime * this.timeDirection >=
        this.nextClockUpdateTime * this.timeDirection
      ) {
        this.nextClockUpdateTime += 0.1 * this.timeDirection
        EventBus.$emit(EventBus.SIMULATION_PERCENT, this.simulationTime)
        this.$store.commit('setStatusMessage', 'Day ' + Math.floor(this.simulationTime))
      }

      if (this.camera) this.renderer.render(this.scene, this.camera)
      this.cameraControls.update()

      if (this.state.isRunning) requestAnimationFrame(this.animate) // endless animation loop
    },
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@use '@/styles.scss' as *;

#anim-container {
  margin: 0 0;
  padding: 0 0;
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  z-index: -1;
}
</style>
