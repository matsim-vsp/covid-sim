import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    message: 'loading',
    isRunning: true,
    isFullScreen: false,
  },
  mutations: {
    setFullScreen(state, value) {
      state.isFullScreen = value
    },
    setMessage(state, value) {
      state.message = value
    },
    setSimulation(state, value) {
      state.isRunning = value
    },
  },
  actions: {},
  modules: {},
})
