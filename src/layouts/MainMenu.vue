<template>
  <q-footer class="bg-white" elevated>
    <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
      <InstallAppBanner
        v-if="showAppInstallBanner"
        :deferredPrompt="deferredPrompt"
        @closeBanner="
          () => {
            deferredPrompt = null
            showAppInstallBanner = false
          }
        "
        @setDeferredPrompt="
          (e) => {
            deferredPrompt = e
          }
        "
      />
    </transition>
    <q-tabs active-class="text-primary" align="justify" class="tabs text-secondary" data-test="main-menu" switch-indicator>
      <q-route-tab v-for="(route, index) in routes" :key="index" :icon="route?.icon" :to="route?.path">
        <q-tooltip class="text-center" style="white-space: pre-line">{{ route?.tooltip }}</q-tooltip>
      </q-route-tab>

      <q-route-tab class="adminTab" v-if="userStore.isAuthenticated" icon="admin_panel_settings" @click="onAdminTabClick">
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
import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
import { computed, onMounted, ref, watchEffect, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from 'src/firebase'
import InstallAppBanner from 'components/shared/InstallAppBanner.vue'
import { LocalStorage } from 'quasar'
import { customWeb3modal } from 'src/web3/walletConnect'

const updated = ref(false)
const userStore = useUserStore()
const promptStore = usePromptStore()
const entriesStore = useEntryStore()
const errorStore = useErrorStore()
const router = useRouter()
const currentPath = ref('')
const isAdminPromptPath = currentPath.value.includes('/admin/prompts')
const { href, params } = router.currentRoute.value
const userDocRef = ref({})
let deferredPrompt
const showAppInstallBanner = ref(false)
const dismissed = LocalStorage.getItem('dismissBanner')

const routes = computed(() => [
  { icon: 'home', path: '/', tooltip: 'Home' },
  { icon: 'search', path: '/search', tooltip: 'Search' },
  { icon: 'description', path: '/month', tooltip: "Month's Prompt" },
  { icon: 'person', path: '/profile', tooltip: 'Profile' }
])

function onLogout() {
  if (customWeb3modal.getAddress()) {
    customWeb3modal.disconnect()
  }
  userStore.logout()
  updated.value = false
  router.push({ path: '/profile' })
}

const onAdminTabClick = () => {
  if (userStore.isAuthenticated) {
    router.push('/admin/prompts')
  } else if (!isAdminPromptPath) {
    router.push('/admin/prompts')
  } else {
    router.push('/admin')
  }
}

watchEffect(async () => {
  const uid = await userStore.getUser?.uid
  const userRole = await userStore.getUser?.role

  if (uid) {
    userDocRef.value = doc(db, 'users', uid)
    onSnapshot(userDocRef.value, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data()
        if (userRole !== userData.role) {
          localStorage.removeItem('user')
          updated.value = true
        }
      } else {
        console.error('User not found')
      }
    })
  }
})

const showBannerOnLoad = () => {
  deferredPrompt = null
  if (!dismissed) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      setTimeout(() => {
        showAppInstallBanner.value = true
      }, 3000)
    })
  }
}

onMounted(async () => {
  showBannerOnLoad()

  if (!userStore.getUserIp && !userStore.isAuthenticated) {
    await userStore.fetchUserIp()
  }

  if (userStore.isAuthenticated && userStore.getUser && !userStore.getUser.location) {
    await userStore.fetchUserIp()
  }
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
onBeforeUnmount(() => {
  promptStore.reset()
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

.tabs .q-tabs__content {
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
  }
}

.tabs .q-tabs__arrow--left,
.tabs .q-tabs__arrow--right {
  display: none;
}
</style>
