// Custom GLSL Shader for 1000x performance, we hope!
import * as THREE from 'three'

import { Agent } from '@/Interfaces'

class AgentPoints extends THREE.BufferGeometry {
  private tripEndTimes: { [seconds: number]: Set<Agent> } = {}

  getTripEndTimes() {
    return this.tripEndTimes
  }

  constructor(agentList: { [id: string]: Agent }, midX: number, midY: number) {
    super()

    const point1: number[] = [] // x,y,time
    const point2: number[] = [] // x,y,time
    const infectionTimes: number[] = []
    const infectionTypes: number[] = []

    let totalTimePoints = 0

    for (const id of Object.keys(agentList)) {
      const agent = agentList[id]

      totalTimePoints += agent.time.length

      point1.push(...AgentPoints.getWaypoint1(agent, midX, midY))
      point2.push(...AgentPoints.getWaypoint2(agent, midX, midY))

      infectionTimes.push(...AgentPoints.buildInfectionTimes(agent))
      infectionTypes.push(...AgentPoints.buildInfectionTypes(agent))

      // save trip completion times so we know when it's time to update
      if (agent.time.length > 1) {
        const endTime = agent.time[1]

        if (!this.tripEndTimes[endTime]) this.tripEndTimes[endTime] = new Set()

        this.tripEndTimes[endTime].add(agent)
      }
    }

    console.log('---- total time points', totalTimePoints)
    this.setAttribute('position', new THREE.Float32BufferAttribute(point1, 3))
    this.setAttribute('position2', new THREE.Float32BufferAttribute(point2, 3))

    this.setAttribute('infectionTime', new THREE.Float32BufferAttribute(infectionTimes, 3))
    this.setAttribute('infectionStatus', new THREE.Float32BufferAttribute(infectionTypes, 3))
  }

  private static getWaypoint1(agent: Agent, midX: number, midY: number) {
    const x = agent.path[0][0] - midX
    const y = agent.path[0][1] - midY
    const t = agent.time[0]

    return [x, y, t] // x,y,time. we deal with z-level in the vertex shader
  }

  private static getWaypoint2(agent: Agent, midX: number, midY: number) {
    // if there is only one point: use first point again
    const index = agent.path[1] ? 1 : 0
    const t = index ? agent.time[1] : -1 // -1 signifies no 2nd time point

    const x = agent.path[index][0] - midX
    const y = agent.path[index][1] - midY

    return [x, y, t] // x,y,time. we deal with z-level in the vertex shader
  }

  /**
   * For mad efficiency, let's take advantage of the fact that in EpiSim
   * there can only be one disease event per day for each agent;
   * add start-day and end-of-day status changes, there is a max of THREE.
   * So we can use a vec3 to push ALL infection events to all agents! Woot.
   */
  private static buildInfectionTimes(agent: Agent) {
    switch (agent.disease_time.length) {
      case 0:
        return [0.0, -1.0, -1.0]
      case 1:
        return [agent.disease_time[0], -1.0, -1.0]
      case 2:
        return [agent.disease_time[0], agent.disease_time[1], -1.0]
      case 3:
      default:
        return [agent.disease_time[0], agent.disease_time[1], agent.disease_time[2]]
    }
  }

  private static buildInfectionTypes(agent: Agent) {
    switch (agent.disease.length) {
      case 0: // nothing? assume susceptible
        return [0.0, -1.0, -1.0]
      case 1:
        return [agent.disease[0], -1.0, -1.0]
      case 2:
        return [agent.disease[0], agent.disease[1], -1.0]
      case 3:
      default:
        return [agent.disease[0], agent.disease[1], agent.disease[2]]
    }
  }
}

/*
  createAgentBufferAttribute(name: string, itemSize: number) {
    let attribute = new BufferAttribute(new Float32Array([]), itemSize)
    let agentLayer = this.scene.getObjectByName('BufferHolder.AGENT_LAYER()')
    agentLayer.geometry.addAttribute(name, attribute)
  }

  updateAgentBufferAttribute(name: string, array: any[]) {
    let agentLayer = this.scene.getObjectByName(BufferHolder.AGENT_LAYER())
    let attribute = agentLayer.geometry.getAttribute(name)
    attribute.setArray(array)
    attribute.needsUpdate = true
  }

  updateAgentBufferUniform(name: string, value: any) {
    let agentLayer = this.scene.getObjectByName(BufferHolder.AGENT_LAYER())
    agentLayer.material.uniforms[name].value = value
  }

  loadAgentBuffer() {
    if (this.hasLayer(BufferHolder.AGENT_LAYER())) return

    let shaderMaterial = new ShaderMaterial({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        timestepFraction: { value: 0.0 },
        size: { value: 10.0 * window.devicePixelRatio },
        selectedId: { value: -1 },

        color: { value: new Color(this._config.colors.agents) },
        selectedColor: { value: new Color(this._config.colors.selectedAgent) },
        triangle: { value: this.createTexture(triangle) },
        circle: { value: this.createTexture(circle) },
      },
      transparent: true,
      alphaTest: 0.1,
    })
    let points = new Points(new BufferGeometry(), shaderMaterial)
    points.name = BufferHolder.AGENT_LAYER()
    points.frustumCulled = false
    points.position.z = -10
    this.scene.add(points)

    this.createAgentBufferAttribute('position', 3)
    this.createAgentBufferAttribute('nextPosition', 3)
    this.createAgentBufferAttribute('shouldInterpolate', 1)
    this.createAgentBufferAttribute('id', 1)
  }

  createTexture(image: string, callback: Function) {
    let texture

    if (callback) {
      texture = new TextureLoader().load(image, t => callback())
    } else {
      texture = new TextureLoader().load(image)
    }

    texture.flipY = false
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    return texture
  }

  setMeshProperties(mesh: Mesh, name: string, z: number) {
    mesh.name = name
    mesh.position.z = z
    mesh.frustumCulled = false
  }
  */

export default AgentPoints
