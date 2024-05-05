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
import { useEntryStore, usePromptStore, useUserStore } from 'src/stores'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const updated = ref(false)
const userStore = useUserStore()
const promptStore = usePromptStore()
const entriesStore = useEntryStore()
const router = useRouter()
const email = ref('')
const currentPath = ref('')
const isAdminPromptPath = currentPath.value.includes('/admin/prompts')
const { href, params, path, name } = router.currentRoute.value

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

onMounted(async () => {
  if (params.year && params.month && !params.id) {
    promptStore.fetchPromptBySlug(`${params.year}-${params.month}`).catch((error) => errorStore.throwError(error))
  }

  if (params.id) {
    entriesStore.fetchEntryBySlug(`/${params.year}/${params.month}/${params.id}`).catch((error) => errorStore.throwError(error))
  }

  if (href === '/month') {
    await promptStore.fetchMonthsPrompt()
  }

  if (params.slug) {
    promptStore.fetchPromptBySlug(href).catch((error) => errorStore.throwError(error))
  }
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
