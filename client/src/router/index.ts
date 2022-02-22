import Vue from 'vue';
import Router from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
NProgress.configure({ showSpinner: true });

Vue.use(Router);

export const routes = [
  {
    path: '/',
    redirect: '/repositories',
  },
  {
    path: '/repositories',
    name: 'repositories',
    component: () => import('@/pages/repositories/Index.vue')
  },
  {
    path: '/repositories/:id',
    name: 'repositoriesDetail',
    component: () => import('@/pages/repositories/Form.vue')
  },
  {
    path: '/scans',
    name: 'scans',
    component: () => import('@/pages/scans/Index.vue')
  },
  {
    path: '/findings',
    name: 'findings',
    component: () => import('@/pages/findings/Index.vue')
  },
  {
    path: '/rules',
    name: 'rules',
    component: () => import('@/pages/rules/Index.vue')
  },
  {
    path: '/rules/:id',
    name: 'rulesForm',
    component: () => import('@/pages/rules/Form.vue')
  },
  {
    path: '/blank',
    name: 'blank',
    component: () => import('@/pages/BlankPage.vue')
  },
  {
    path: '*',
    name: 'error',
    component: () => import('@/pages/error/NotFoundPage.vue'),
    meta: {
      layout: 'error'
    }
  }
]

const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL || '/',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    return { x: 0, y: 0 }
  },
  routes
})

router.beforeEach(async (to, from, next) => {
  if(to.path != from.path) {
    NProgress.start()
  }
  next()
})

router.afterEach((to, from) => {
  NProgress.done()
})

export default router
