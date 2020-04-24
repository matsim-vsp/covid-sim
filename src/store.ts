import Vue from 'vue'
import Vuex from 'vuex'
import { ColorScheme } from '@/Globals'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    message: 'loading',
    isRunning: true,
    isFullScreen: false,
    isShowingHelp: false,

    colorScheme: localStorage.getItem('colorscheme')
      ? localStorage.getItem('colorscheme')
      : ColorScheme.DarkMode,

    sawAgentAnimationHelp: localStorage.getItem('agentAnimHelp')
      ? localStorage.getItem('agentAnimHelp')
      : false,
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
    setShowingHelp(state, value: boolean) {
      state.isShowingHelp = value
    },
    setSawAgentAnimationHelp(state, value: boolean) {
      state.sawAgentAnimationHelp = value
      localStorage.setItem('agentAnimHelp', 'seen')
    },
    rotateColors(state) {
      state.colorScheme =
        state.colorScheme === ColorScheme.DarkMode ? ColorScheme.LightMode : ColorScheme.DarkMode
      localStorage.setItem('colorscheme', state.colorScheme)
    },
  },
  actions: {},
  modules: {},
})
