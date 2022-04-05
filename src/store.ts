import Vue from 'vue'
import Vuex from 'vuex'
import { ColorScheme } from '@/Globals'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    statusMessage: 'loading',
    clock: '',
    isRunning: true,
    isFullScreen: false,
    isShowingHelp: false,
    isWideMode: false,
    graphStartDate: '',
    colorScheme: localStorage.getItem('colorscheme')
      ? localStorage.getItem('colorscheme')
      : ColorScheme.DarkMode,

    sawAgentAnimationHelp: localStorage.getItem('agentAnimHelp')
      ? localStorage.getItem('agentAnimHelp')
      : false,
  },
  mutations: {
    setGraphStartDate(state, value: string) {
      state.graphStartDate = value
    },
    setWideMode(state, value: boolean) {
      state.isWideMode = value
    },
    setFullScreen(state, value: boolean) {
      state.isFullScreen = value
    },
    setStatusMessage(state, value: string) {
      state.statusMessage = value
    },
    setClock(state, value: string) {
      state.clock = value
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
