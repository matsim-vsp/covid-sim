import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeIndex from '@/views/HomeIndex.vue'
import Imprint from '@/views/Imprint.vue'

Vue.use(VueRouter)

const latestRCalculator = '/r-calcs-v2/2021-01-24b'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeIndex,
  },
  {
    path: '/imprint',
    name: 'Imprint',
    component: Imprint,
  },
  {
    // REDIRECT for old */covid-sim/* links
    path: '/covid-sim/*',
    redirect: '/*',
  },
  {
    path: '/v1',
    name: 'V1',
    component: () => import(/* webpackChunkName: "V1" */ '@/runs/v1/V1.vue'),
  },
  {
    path: '/v2',
    name: 'V2',
    component: () => import(/* webpackChunkName: "V2" */ '@/runs/v2/V2.vue'),
  },
  {
    path: '/v3',
    name: 'V3',
    component: () =>
      import(/* webpackChunkName: "V3" */ '@/viz/multiday-agents/MultiDayViewer.vue'),
  },
  {
    path: '/v4',
    name: 'V4',
    component: () => import(/* webpackChunkName: "V4" */ '@/runs/v4/V4.vue'),
  },
  {
    path: '/v5',
    name: 'V5',
    component: () => import(/* webpackChunkName: "V5" */ '@/runs/v5/V5.vue'),
  },
  {
    path: '/v6',
    redirect: '/v6/berlin',
  },
  {
    path: '/v6/:city',
    name: 'V6',
    component: () => import(/* webpackChunkName: "V6" */ '@/runs/v6/V6.vue'),
  },
  {
    path: '/v6/:city/:pm',
    redirect: '/v6/:city',
  },
  {
    path: '/v7',
    redirect: '/v7/berlin',
  },
  {
    path: '/v7/:city',
    name: 'V7',
    component: () => import(/* webpackChunkName: "V7" */ '@/runs/v7/V7.vue'),
  },
  {
    path: '/v7/:city/:pm',
    redirect: '/v7/:city',
  },
  {
    path: '/norun',
    name: 'norun',
    component: () => import(/* webpackChunkName: "norun" */ '@/views/MessagePage.vue'),
  },
  {
    path: '/multiday',
    component: () =>
      import(/* webpackChunkName: "multiday" */ '@/viz/multiday-agents/MultiDayViewer.vue'),
  },
  {
    path: '/timelapse',
    component: () => import(/* webpackChunkName: "multiday" */ '@/viz/time-lapse/TimeLapseViz.vue'),
  },
  {
    path: '/entiresim',
    component: () => import(/* webpackChunkName: "entiresim" */ '@/viz/entire-sim/EntireSim.vue'),
  },
  {
    path: '/shader',
    redirect: '/multiday',
  },
  {
    path: '/runs/*',
    redirect: '/*',
  },
  {
    path: '/calculators',
    component: () => import(/* webpackChunkName: "calculators" */ '@/views/Calculators.vue'),
  },
  {
    path: '/calculator',
    redirect: latestRCalculator,
  },
  {
    path: '/r-calc',
    redirect: latestRCalculator,
  },
  {
    path: '/r-calcs-v1/:rcalc',
    component: () => import(/* webpackChunkName: "r-calcs" */ '@/views/RCalculator.vue'),
  },
  {
    path: '/r-calcs-v2/:rcalc',
    component: () => import(/* webpackChunkName: "r-calcs" */ '@/views/RCalculatorNew.vue'),
  },
  {
    path: '/risk-calcs/:rcalc',
    component: () => import(/* webpackChunkName: "risk-calcs" */ '@/views/RiskCalculator.vue'),
  },
  {
    path: '/hospital',
    component: () =>
      import(/* webpackChunkName: "hospital" */ '@/views/RkiHospitalizationsByRegion.vue'),
  },
  {
    path: '/mobility',
    component: () => import(/* webpackChunkName: "mobility" */ '@/views/MobilityPage.vue'),
  },
  {
    path: '/mobility/duration',
    component: () => import(/* webpackChunkName: "mobility" */ '@/views/MobilityPage.vue'),
  },
  {
    path: '/mobility/distance',
    component: () => import(/* webpackChunkName: "mobility" */ '@/views/MobilityPage.vue'),
  },
  {
    path: '/mobility/proportion-mobile-persons',
    component: () => import(/* webpackChunkName: "mobility" */ '@/views/MobilityPage.vue'),
  },
  {
    path: '/mobility-counties',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/duration/week',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/distance/week',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/proportion-mobile-persons/week',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/duration/weekday',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/distance/weekday',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/proportion-mobile-persons/weekday',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/duration/weekend',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/distance/weekend',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/proportion-mobile-persons/weekend',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/nightly-activity/week',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/nightly-activity/weekday',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/mobility-counties/nightly-activity/weekend',
    component: () =>
      import(/* webpackChunkName: "mobility" */ '@/views/MobilityPageLandkreise.vue'),
  },
  {
    path: '/*',
    component: () =>
      import(/* webpackChunkName: "runviewer" */ '@/views/battery-viewer/RunPage.vue'),
  },
  {
    // catch-all back to home page
    path: '*',
    redirect: '/',
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes, // native-like back/forward and top-of-page routing
  scrollBehavior(to, from, savedPosition) {
    if (to.path === from.path) return
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
})

export default router
