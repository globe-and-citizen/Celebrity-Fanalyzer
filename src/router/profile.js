export default [
  {
    path: 'profile',
    component: () => import('pages/profile/ProfileIndex.vue'),
    name: 'profile',
    redirect: { name: 'profile.index' },
    children: [
      {
        name: 'profile.index',
        path: '',
        component: () => import('pages/profile/ProfileTab.vue')
      },
      {
        name: 'profile.subscriptions',
        path: 'subscriptions',
        component: () => import('pages/profile/SubscriptionsIndex.vue')
      },
      {
        name: 'profile.feedback',
        path: 'feedback',
        component: () => import('pages/profile/FeedbackIndex.vue')
      },
      {
        name: 'profile.settings',
        path: 'settings',
        component: () => import('pages/profile/SettingsIndex.vue')
      }
    ]
  }
]
