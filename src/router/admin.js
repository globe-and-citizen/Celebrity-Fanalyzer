import { useUserStore } from 'stores'

export default [
  {
    path: '/admin',
    name: 'admin',
    beforeEnter: (_to, _from, next) => {
      const userStore = useUserStore()
      if (userStore.isWriterOrAbove) next()
      else next('/')
    },
    redirect: { path: 'admin/prompts' },
    component: () => import('pages/admin/AdminIndex.vue'),
    children: [
      {
        path: 'prompts',
        component: () => import('pages/admin/PromptsIndex.vue')
      },
      {
        path: 'users',
        component: () => import('pages/admin/UsersIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isAdmin) next()
          else next('/')
        }
      },
      {
        path: 'feedbacks',
        component: () => import('pages/admin/FeedbacksIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isEditorOrAbove) next()
          else next('/')
        }
      },
      {
        path: 'errors',
        component: () => import('pages/admin/ErrorsIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isAdmin) next()
          else next('/')
        }
      },
      {
        path: 'reports',
        component: () => import('pages/admin/ReportsIndex.vue'),
        beforeEnter: (_to, _from, next) => {
          const userStore = useUserStore()
          if (userStore.isEditorOrAbove) next()
          else next('/')
        }
      }
    ]
  }
]
