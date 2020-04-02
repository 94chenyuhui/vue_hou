import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' }, // 路由默认页面，重新定向
  { path: '/login', component: Login }
]

const router = new VueRouter({
  routes

})

export default router
