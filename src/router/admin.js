import { useUserStore } from 'stores'

export default [
  {
    path: 'admin',
    name: 'admin',
    beforeEnter: (_to, _from, next) => {
      const userStore = useUserStore()
      if (userStore.isWriterOrAbove || userStore.isAdvertiser) next()
      else next('/')
    },
    component: () => import('pages/admin/AdminIndex.vue'),
    redirect: { path: 'admin/prompts' },
    children: [
      {
        name: 'admin.prompts',
        path: 'prompts',
        component: () => import('pages/admin/PromptsIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isWriterOrAbove) next()
          else next('/')
        }
      },
      {
        name: 'admin.users',
        path: 'users',
        component: () => import('pages/admin/UsersIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isAdmin) next()
          else next('/')
        }
      },
      {
        name: 'admin.feedbacks',
        path: 'feedbacks',
        component: () => import('pages/admin/FeedbacksIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isEditorOrAbove) next()
          else next('/')
        }
      },
      {
        name: 'admin.errors',
        path: 'errors',
        component: () => import('pages/admin/ErrorsIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isAdmin) next()
          else next('/')
        }
      },
      {
        name: 'admin.reports',
        path: 'reports',
        component: () => import('pages/admin/ReportsIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isEditorOrAbove) next()
          else next('/')
        }
      },
      {
        name: 'admin.advertises',
        path: 'advertises',
        component: () => import('app/src/pages/admin/AdvertisesIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isEditorOrAbove || userStore.isAdvertiser) next()
          else next('/')
        }
      }
    ]
  }
]
