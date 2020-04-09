import Vue from 'vue'
import Vuex from 'vuex'
import { ColorScheme } from '@/Interfaces'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    message: 'loading',
    isRunning: true,
    isFullScreen: false,
    colorScheme: ColorScheme.DarkMode,
  },
  mutations: {
    setFullScreen(state, value: boolean) {
      state.isFullScreen = value
    },
    setMessage(state, value: string) {
      state.message = value
    },
    setSimulation(state, value: boolean) {
      state.isRunning = value
    },
    rotateColors(state) {
      state.colorScheme = state.colorScheme === ColorScheme.DarkMode ? ColorScheme.LightMode : ColorScheme.DarkMode
    },
  },
  actions: {},
  modules: {},
})
