import { useUserStore } from 'stores'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: 'search',
        component: () => import('pages/SearchPage.vue')
      },
      {
        path: 'month',
        component: () => import('pages/PromptPage.vue')
      },
      {
        path: ':slug',
        component: () => import('pages/PromptPage.vue')
      },
      {
        path: ':year(\\d{4})/:month(\\d{2})',
        component: () => import('pages/PromptPage.vue')
      },
      {
        path: ':year(\\d{4})/:month(\\d{2})/:id',
        component: () => import('pages/EntryPage.vue')
      },
      {
        path: ':year(\\d{4})',
        component: () => import('pages/YearArchivePage.vue')
      },
      {
        path: 'profile',
        component: () => import('pages/ProfilePage.vue')
      },
      {
        path: 'admin',
        component: () => import('pages/AdminPage.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isAdmin) next()
          else next('/')
        }
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    alias: '/404',
    component: () => import('pages/404Error.vue')
  }
]

export default routes
