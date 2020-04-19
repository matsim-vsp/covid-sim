<template lang="pug">
#anim-container

</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import ZipLoader from 'zip-loader'
import * as THREE from 'three'

import store from '@/store'
import { Agent, ColorScheme, Health } from '@/Interfaces'
import AgentGeometry from './AgentGeometry'
import EventBus from '@/EventBus.vue'

interface Trip {
  id: number
  timestamps: number[]
  path?: number[]
  status?: string
}

@Component
export default class AnimationView extends Vue {
  @Prop() private isLoaded!: boolean

  @Prop({ required: true }) private speed!: number

  private timeFactor = 600.0
  private timeDirection = 1

  private vertexShader = require('./shaderVertex.vert').default
  private fragmentShader = require('./shaderFragment.frag').default

  private networkFilename = 'network.zip'

  private lightMode = {
    background: 0xdddde4,
    links: 0x9999aa,
    susceptible: 0x333333,
    infectedButNotContagious: 0x0077ff,
    contagious: 0xbb0044,
  }

  private darkMode = {
    background: 0x181518,
    links: 0x223355,
    susceptible: 0xffff00,
    infectedButNotContagious: 0x00ffff,
    contagious: 0xff33cc,
  }
  private state = store.state

  private colors = this.state.colorScheme == ColorScheme.DarkMode ? this.darkMode : this.lightMode

  // keep track of time - current time in the simulation itself
  private simulationTime = 0

  // Count the seconds since the clock started running;
  // Every pause resets the anim clock to zero!
  private animationTimeSinceUnpaused = 0
  private clock = new THREE.Clock(false) // do not autostart clock!

  // when to next update the visible clock
  private nextClockUpdateTime = 0

  private scene = new THREE.Scene()
  private renderer = new THREE.WebGLRenderer({ antialias: true })
  private camera?: THREE.PerspectiveCamera

  private OrbitControl = require('@/OrbitControl')

  // eslint-disable-next-line
  private container: any

  // eslint-disable-next-line
  private cameraControls: any

  private geomSmall = new THREE.CircleBufferGeometry(100, 4)
  private geomMed = new THREE.CircleBufferGeometry(275, 5).rotateZ((18.0 * Math.PI) / 180)
  private geomBig = new THREE.CircleBufferGeometry(300, 30)

  private linkMaterial = new THREE.LineBasicMaterial({ color: this.colors.links })

  private yellow = new THREE.MeshBasicMaterial({ color: this.colors.susceptible })
  /*

  private red = new THREE.MeshBasicMaterial({
    color: this.colors.contagious,
    transparent: true,
    opacity: 0.8,
  })

  private cyan = new THREE.MeshBasicMaterial({
    color: this.colors.infectedButNotContagious,
    transparent: true,
    opacity: 0.8,
  })
  */

  private xRange = [1e25, -1e25]
  private yRange = [1e25, -1e25]

  // berlin
  private midpointX = 4595000
  private midpointY = 5820000

  private agents: { [id: string]: THREE.Mesh } = {}
  private agentList: { [id: string]: Agent } = {}

  private allTripsHaveBegun = false

  private publicPath = ''

  @Watch('speed') speedChanged() {
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
    console.log('done flip')
  }

  @Watch('state.isRunning')
  private playPauseSim() {
    // endless animation loop
    if (this.state.isRunning) {
      this.clock.start()
      requestAnimationFrame(this.animate)
    } else {
      this.clock.stop()
      this.clock = new THREE.Clock(false)

      // Reset animation frame-clock to zero
      this.animationTimeSinceUnpaused = 0
      requestAnimationFrame(this.moveCameraWhilePaused)
    }
  }

  @Watch('state.colorScheme')
  private switchColorScheme(scheme: ColorScheme) {
    this.colors = scheme == ColorScheme.LightMode ? this.lightMode : this.darkMode

    this.scene.background = new THREE.Color(this.colors.background)

    setTimeout(() => {
      //  this.bgSwapColors()
    }, 50)
  }

  /*
  private bgSwapColors() {
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
  }
  */

  private mounted() {
    this.publicPath = process.env.NODE_ENV === 'production' ? '/covid-sim/' : '/'

    this.setup()
    this.setupDragListener()

    window.addEventListener('resize', this.onWindowResize, false)
  }

  private wasSimulationRunning = true

  private setupDragListener() {
    const parent = this
    EventBus.$on(EventBus.DRAG, function(seconds: number) {
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
  }

  private exitSimulation() {
    this.clock = new THREE.Clock(false)
    this.simulationTime = 0
    this.nextClockUpdateTime = 0
    this.timeDirection = 1

    this.agents = {}

    while (this.scene.children.length) {
      this.scene.remove(this.scene.children[0])
    }
  }

  private beforeDestroy() {
    // reset the sim to zero
    this.exitSimulation()

    window.removeEventListener('resize', this.onWindowResize)
    EventBus.$off(EventBus.DRAG)

    // Some types of THREE objects must be manually destroyed
    // https://threejs.org/docs/index.html#manual/en/introduction/How-to-dispose-of-objects
    if (this.networkMesh) this.networkMesh.geometry.dispose()
    if (this.agentMaterial) this.agentMaterial.dispose()
    if (this.agentGeometry) this.agentGeometry.dispose()

    this.linkMaterial.dispose()

    /*
    this.yellow.dispose()
    this.red.dispose()
    this.cyan.dispose()
    */
    this.geomSmall.dispose()
    this.geomBig.dispose()
    this.scene.dispose()
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
    this.networkMesh = await this.loadNetworkMeshFromFile()
    this.networkMesh.name = 'network'
    this.scene.add(this.networkMesh)

    this.$store.commit('setMessage', 'done')
    this.initScene()

    // let UI know we're about to begin!
    this.$emit('loaded', true)

    this.clock.start()
    this.animate()
  }

  private networkMesh?: THREE.LineSegments

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
    this.networkMesh = new THREE.LineSegments(mergedLines, this.linkMaterial)

    return this.networkMesh
  }

  private async loadAgents() {
    console.log('loading agents and infections')

    // we're going to do this async and streamy!
    const response = await fetch(this.publicPath + '008-infections.json')
    if (!response.body) return

    this.tempStreamBuffer = ''
    const decoder = new TextDecoder('utf-8')
    const reader = response.body.getReader()

    // no need to await - will run in background
    this.loopReader(reader, decoder)
  }

  private loopReader(reader: ReadableStreamDefaultReader, decoder: TextDecoder) {
    reader.read().then(({ value, done }) => {
      if (done) {
        if (this.tempStreamBuffer) this.processNewlyReadAgent(this.tempStreamBuffer)
        console.log('Done reading agents: ')
        this.finishedLoadingAgents()
      } else {
        this.processNDJSONchunk(value, decoder)

        // go back for another chunk
        this.loopReader(reader, decoder)
      }
    })
  }

  private tempStreamBuffer = ''

  private processNDJSONchunk(value: Uint8Array, decoder: TextDecoder, splitOn: string = '\n') {
    const chunk = decoder.decode(value)
    this.tempStreamBuffer += chunk
    const parts = this.tempStreamBuffer.split(splitOn)

    parts.slice(0, -1).forEach(ndjson => {
      this.processNewlyReadAgent(ndjson)
    })
    this.tempStreamBuffer = parts[parts.length - 1]
    console.log('agents:', Object.keys(this.agentList).length)
  }

  private processNewlyReadAgent(ndjson: string) {
    const agent: Agent = JSON.parse(ndjson)
    if (agent.path.length === 0) return

    this.agentList[agent.id] = agent
  }

  private agentMaterial?: THREE.ShaderMaterial
  private agentGeometry?: AgentGeometry

  private finishedLoadingAgents() {
    if (this.agentGeometry) this.agentGeometry.dispose()

    this.agentGeometry = new AgentGeometry(this.agentList, this.midpointX, this.midpointY)

    this.agentMaterial = new THREE.ShaderMaterial({
      uniforms: {
        simulationTime: { value: 0.0 },
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: false,
    })

    const points = new THREE.Points(this.agentGeometry, this.agentMaterial)
    this.scene.add(points)

    console.log('added points')
  }

  /*
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
    */

  /*
  private async loadAgents() {
    console.log('loading agents and infections')

    const response = await fetch(this.publicPath + '008-infections.json')
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
  }
  */

  private initScene() {
    console.log('hereee 5-----')

    this.container = document.getElementById('anim-container')
    if (!this.container) return

    console.log('hereee 0-----')
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
    this.cameraControls = new this.OrbitControl.MapControls(this.camera, this.renderer.domElement)
    this.cameraControls.enablePan = true
    this.cameraControls.screenSpacePanning = true
    this.cameraControls.enableZoom = true
    this.cameraControls.enableRotate = false

    this.camera.position.set(0, 0, 3000)
    this.camera.lookAt(0, 0, -1)

    this.cameraControls.update()

    console.log('--init complete!')
  }

  private moveCameraWhilePaused() {
    if (!this.camera) return

    if (!this.state.isRunning) {
      this.renderer.render(this.scene, this.camera)
      this.cameraControls.update()
      requestAnimationFrame(this.moveCameraWhilePaused) // endless animation loop
    }
  }

  private setVisibleClock() {
    const hour = Math.floor(this.simulationTime / 3600)
    const minute = Math.floor(this.simulationTime / 60) % 60
    this.$store.commit(
      'setMessage',
      (hour < 10 ? '0' : '') + hour + (minute < 10 ? ':0' : ':') + minute
    )
  }

  private animate() {
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
    if (this.simulationTime * this.timeDirection >= this.nextClockUpdateTime * this.timeDirection) {
      this.setVisibleClock()
      this.nextClockUpdateTime += 60 * this.timeDirection
      EventBus.$emit(EventBus.SIMULATION_PERCENT, this.simulationTime / 86400)
    }

    if (this.camera) this.renderer.render(this.scene, this.camera)
    this.cameraControls.update()

    if (this.state.isRunning) requestAnimationFrame(this.animate) // endless animation loop
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
}
</style>
