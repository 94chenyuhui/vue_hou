import Vue from 'vue'
import VueRouter from 'vue-router'
// 路由懒加载
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// import users from '../components/user/users.vue'
const users = () => import(/* webpackChunkName: "users_Rigthss_Roles" */ '../components/user/users.vue')
// import Rigths from '../components/power/Rigths.vue'
const Rigths = () => import(/* webpackChunkName: "users_Rigths_Roles" */ '../components/power/Rigths.vue')
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "users_Rigths_Roles" */ '../components/power/Roles.vue')

// import cate from '../components/goods/cate.vue'
const cate = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/cate.vue')
// import params from '../components/goods/params.vue'
const params = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/params.vue')

// import list from '../components/goods/list.vue'
const list = () => import(/* webpackChunkName: "list_add_demo" */ '../components/goods/list.vue')
// import add from '../components/goods/add.vue'
const add = () => import(/* webpackChunkName: "list_add_demo" */ '../components/goods/add.vue')
// import demo from '../components/demo.vue'
const demo = () => import(/* webpackChunkName: "list_add_demo" */ '../components/demo.vue')

// import order from '../components/order/order.vue'
const order = () => import(/* webpackChunkName: "order_Report" */ '../components/order/order.vue')
// import report from '../components/report/Report.vue'
const report = () => import(/* webpackChunkName: "order_Report" */ '../components/report/Report.vue')
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' }, // 路由默认页面，重新定向
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome', // 路径重新定向
    children: [// 子路由
      { path: '/welcome', component: Welcome },
      { path: '/users', component: users },
      { path: '/rights', component: Rigths },
      { path: '/Roles', component: Roles },
      { path: '/categories', component: cate },
      { path: '/params', component: params },
      { path: '/goods', component: list },
      { path: '/goods/add', component: add },
      { path: '/demo', component: demo },
      { path: '/orders', component: order },
      { path: '/reports', component: report }
    ]
  }
]

const router = new VueRouter({
  routes

})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转
  if (to.path === '/login') { // 判断是否访问首页
    return next()// 放行
  }
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) { // 判断是否拥有token令牌
    return next('/login')// 强制跳转到首页
  }
  next()
})

export default router
