import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/edit',
      name: 'Edit',
      component: () => import('../views/Edit.vue')
    },
    {
      path: '/preview',
      name: 'Preview',
      component: () => import('../views/Preview.vue')
    },
    {
      path: '/witness',
      name: 'Witness',
      component: () => import('../views/Witness.vue')
    },
    {
      path: '/query',
      name: 'Query',
      component: () => import('../views/Query.vue')
    }
  ]
})

export default router
