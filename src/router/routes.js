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
        path: 'notifications',
        component: () => import('pages/NotificationsPage.vue')
      },
      {
        path: 'profile',
        component: () => import('pages/ProfilePage.vue')
      },
      {
        path: 'prompt/:id',
        component: () => import('pages/PromptPage.vue')
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
    component: () => import('pages/404Error.vue')
  }
]

export default routes
