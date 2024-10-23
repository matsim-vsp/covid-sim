import Vue from 'vue'
import VueI18n from 'vue-i18n'

import App from '@/App.vue'
import router from '@/router'
import store from '@/store'

Vue.config.productionTip = false

Vue.use(VueI18n)

console.log('here')
// locale: we only support EN and DE
const locale = localStorage.getItem('default-locale')
  ? '' + localStorage.getItem('default-locale')
  : // @ts-ignore
  // @ts-ignore
  (navigator.language || navigator.userLanguage).startsWith('de')
  ? 'de'
  : 'en'

const i18n = new VueI18n({
  locale,
  fallbackLocale: 'en',
})

new Vue({
  i18n,
  router,
  store,
  render: h => h(App),
}).$mount('#app')
