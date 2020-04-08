import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    message: 'loading',
    isRunning: true,
  },
  mutations: {
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
