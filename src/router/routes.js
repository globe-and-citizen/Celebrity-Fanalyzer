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
        path: ':id(\\d{4}-\\d{2})/',
        component: () => import('pages/PromptPage.vue')
      },
      {
        path: 'entry/:id',
        component: () => import('pages/EntryPage.vue')
      },
      {
        path: ':year(\\d{4})',
        component: () => import('pages/YearArchivePage.vue')
      },
      {
        path: ':year(\\d{4})/:month',
        component: () => import('pages/MonthArchivePage.vue')
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
