<template>
  <q-footer class="bg-white" elevated>
    <q-tabs active-class="text-primary" align="justify" class="tabs text-secondary" data-test="main-menu" switch-indicator>
      <q-route-tab v-for="(route, index) in routes" :key="index" :icon="route?.icon" :to="route?.path">
        <q-tooltip class="text-center" style="white-space: pre-line">{{ route?.tooltip }}</q-tooltip>
      </q-route-tab>
      <q-route-tab class="adminTab" v-if="userStore.isWriterOrAbove" icon="admin_panel_settings" @click="onAdminTabClick">
        <q-tooltip>Admin Panel</q-tooltip>
      </q-route-tab>
      <div class="q-tab__indicator absolute-top"></div>
    </q-tabs>
  </q-footer>

  <q-dialog v-model="updated" persistent>
    <q-card>
      <q-card-section class="bg-primary text-white q-pa-sm">
        <div class="text-h6">Role Updated</div>
      </q-card-section>
      <q-card-section class="q-pt-none bg-white q-py-lg">
        <div class="text-subtitle1">Your role has been updated. Please log out and log in again.</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup @click="onLogout" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useUserStore } from 'src/stores'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const updated = ref(false)
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const email = ref('')
const currentPath = ref('')
const isAdminPromptPath = currentPath.value.includes('/admin/prompts')

const routes = computed(() => [
  { icon: 'home', path: '/', tooltip: 'Home' },
  { icon: 'search', path: '/search', tooltip: 'Search' },
  { icon: 'description', path: '/month', tooltip: "Month's Prompt" },
  { icon: 'person', path: '/profile', tooltip: 'Profile' }
])

function onLogout() {
  userStore.logout()
  updated.value = false
  router.push({ path: 'profile', query: { email: email.value } })
}

const onAdminTabClick = () => {
  if (!isAdminPromptPath) {
    router.push('/admin/prompts')
  } else {
    router.push('/admin')
  }
}

onMounted(() => {
  currentPath.value = router.currentRoute.value.path
  const adminTab = document.querySelector('.adminTab')
  const activeHomeTab = document.querySelector('[href="/"]')
  const handleHomeTabClasses = () => {
    activeHomeTab?.classList.remove('q-tab--active')
    activeHomeTab?.classList.remove('text-primary')
    activeHomeTab?.classList.add('q-tab--inactive')
  }
  if (router.currentRoute.value.fullPath.includes('/admin')) {
    setTimeout(() => {
      handleHomeTabClasses()
    })

    if (adminTab) {
      adminTab?.classList.add('admin_tab', 'cursor-pointer', 'q-router-link--active')
      adminTab?.classList.replace('q-tab--inactive', 'q-tab--active')
    }
  }

  watch(route, () => {
    if (router.currentRoute.value.fullPath.includes('/admin')) {
      setTimeout(() => {
        handleHomeTabClasses()
      }, 50)

      if (adminTab) {
        adminTab?.classList.add('admin_tab', 'cursor-pointer', 'q-router-link--active')
        adminTab?.classList.replace('q-tab--inactive', 'q-tab--active')
      }
    } else {
      activeHomeTab?.classList.remove('q-tab--inactive')
      adminTab?.classList.remove('admin_tab', 'cursor-pointer', 'q-router-link--active')
      adminTab?.classList.replace('q-tab--active', 'q-tab--inactive')
    }
  })
})
</script>

<style lang="scss">
.tabs .q-tab__icon {
  display: grid;
  font-size: 2rem;
  height: 3.5rem !important;
}

.admin_tab {
  color: #e54757 !important;
}

.tabs .q-tabs__arrow--left,
.tabs .q-tabs__arrow--right {
  display: none;
}
</style>
