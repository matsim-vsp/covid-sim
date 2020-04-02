import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeIndex from '@/HomeIndex.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeIndex,
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
    path: '/v4',
    name: 'V4',
    component: () => import(/* webpackChunkName: "V4" */ '@/runs/v4/V4.vue'),
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
