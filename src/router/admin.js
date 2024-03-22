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
    redirect: { name: 'admin.prompts' },
    component: () => import('pages/admin/AdminIndex.vue'),
    children: [
      {
        name: 'admin.prompts',
        path: 'prompts',
        component: () => import('pages/admin/PromptsIndex.vue')
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
      }
    ]
  }
]
