// Custom GLSL Shader for 1000x performance, we hope!
import * as THREE from 'three'

import { Agent } from '@/Interfaces'

class AgentPoints extends THREE.BufferGeometry {
  constructor(agentList: { [id: string]: Agent }, midX: number, midY: number) {
    const vertices = AgentPoints.buildInitialPositions(agentList, midX, midY)
    const endpoints = AgentPoints.buildEndpoints(agentList, midX, midY)
    const time1 = AgentPoints.buildTime1(agentList)
    const time2 = AgentPoints.buildTime2(agentList)

    const infectionTimes = AgentPoints.buildInfectionTimes(agentList)
    const infectionTypes = AgentPoints.buildInfectionTypes(agentList)

    super()

    this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    this.setAttribute('position2', new THREE.Float32BufferAttribute(endpoints, 3))
    this.setAttribute('time1', new THREE.Float32BufferAttribute(time1, 1))
    this.setAttribute('time2', new THREE.Float32BufferAttribute(time2, 1))

    this.setAttribute('infectionTime', new THREE.Float32BufferAttribute(infectionTimes, 3))
    this.setAttribute('infectionStatus', new THREE.Float32BufferAttribute(infectionTypes, 3))
  }

  private static buildInitialPositions(
    agentList: { [id: string]: Agent },
    midX: number,
    midY: number
  ) {
    const vertices: number[] = []

    for (const id of Object.keys(agentList)) {
      const agent = agentList[id]
      const initialX = agent.path[0][0] - midX
      const initialY = agent.path[0][1] - midY

      vertices.push(initialX, initialY, 2)
    }

    return vertices
  }

  private static buildEndpoints(agentList: { [id: string]: Agent }, midX: number, midY: number) {
    const vertices: number[] = []

    for (const id of Object.keys(agentList)) {
      const agent = agentList[id]

      const index = agent.path[1] ? 1 : 0
      const initialX = agent.path[index][0] - midX
      const initialY = agent.path[index][1] - midY

      vertices.push(initialX, initialY, 2)
    }

    return vertices
  }

  private static buildTime1(agentList: { [id: string]: Agent }) {
    const times: number[] = []
    for (const id of Object.keys(agentList)) {
      const agent = agentList[id]
      times.push(agent.time[0])
    }

    return times
  }

  private static buildTime2(agentList: { [id: string]: Agent }) {
    const times: number[] = []
    for (const id of Object.keys(agentList)) {
      const agent = agentList[id]

      const time = agent.time[1] ? agent.time[1] : -1
      times.push(time)
    }

    return times
  }

  /**
   * For mad efficiency, let's take advantage of the fact that in EpiSim
   * there can only be one disease event per day for each agent;
   * add start-day and end-of-day status changes, there is a max of THREE.
   * So we can use a vec3 to push ALL infection events to all agents! Woot.
   */
  private static buildInfectionTimes(agentList: { [id: string]: Agent }) {
    const times: number[] = []

    for (const id of Object.keys(agentList)) {
      const agent = agentList[id]

      switch (agent.disease_time.length) {
        case 0:
          times.push(0.0, -1.0, -1.0)
          break
        case 1:
          times.push(agent.disease_time[0], -1.0, -1.0)
          break
        case 2:
          times.push(agent.disease_time[0], agent.disease_time[1], -1.0)
          break
        case 3:
          times.push(agent.disease_time[0], agent.disease_time[1], agent.disease_time[2])
          break
      }
    }
    return times
  }

  private static buildInfectionTypes(agentList: { [id: string]: Agent }) {
    const types: number[] = []

    for (const id of Object.keys(agentList)) {
      const agent = agentList[id]

      switch (agent.disease.length) {
        case 0: // nothing? assume susceptible
          types.push(0.0, -1.0, -1.0)
          break
        case 1:
          types.push(agent.disease[0], -1.0, -1.0)
          break
        case 2:
          types.push(agent.disease[0], agent.disease[1], -1.0)
          break
        case 3:
          types.push(agent.disease[0], agent.disease[1], agent.disease[2])
          break
      }
    }
    return types
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
