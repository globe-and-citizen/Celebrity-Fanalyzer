import { useUserStore } from 'stores'

const routes = [
  {
    path: '/robots.txt',
    component: '/robots.txt'
  },
  {
    path: '/sitemap.xml',
    component: '/sitemap.xml'
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: 'terms-of-service',
        component: () => import('pages/TermsOfService.vue')
      },
      {
        path: 'search|:year(\\d{4})',
        component: () => import('pages/SearchPage.vue')
      },
      {
        path: 'month',
        name: 'month',
        component: () => import('pages/PromptPage.vue')
      },
      {
        path: ':slug',
        name: 'slug',
        component: () => import('pages/PromptPage.vue')
      },
      {
        path: ':year(\\d{4})/:month(\\d{2})',
        name: 'year-month',
        component: () => import('pages/PromptPage.vue')
      },
      {
        path: ':year(\\d{4})/:month(\\d{2})/:id',
        component: () => import('pages/EntryPage.vue')
      },
      {
        path: 'fan/:username',
        component: () => import('pages/PublicProfilePage.vue')
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
          if (userStore.isWriterOrAbove) next()
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
