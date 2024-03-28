<template>
  <q-footer class="bg-white" elevated>
    <q-tabs active-class="text-primary" align="justify" class="tabs text-secondary" data-test="main-menu" switch-indicator>
      <q-route-tab v-for="(route, index) in routes" exact :icon="route.icon" :key="index" :to="route.path">
        <q-tooltip class="text-center" style="white-space: pre-line">{{ route.tooltip }}</q-tooltip>
      </q-route-tab>
      <q-route-tab v-if="userStore.isWriterOrAbove" exact icon="admin_panel_settings" to="/admin">
        <q-tooltip>Admin Panel</q-tooltip>
      </q-route-tab>
    </q-tabs>
  </q-footer>
  <q-dialog v-model="updated" persistent>
      <q-card >
        <q-card-section class="bg-primary text-white q-pa-sm " >
          <div class="text-h6 ">
          Role Updated
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none bg-white q-py-lg">
            <div class="text-subtitle1 ">
              Your role has been updated. Please log out and log in again.
            </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup @click="onLogout" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script setup>
import { collection, onSnapshot } from 'firebase/firestore'
import { useUserStore } from 'src/stores'
import { db } from 'src/firebase'
import {ref} from "vue"
import { useRouter } from 'vue-router'

const updated=ref(false)
const userStore = useUserStore()
const router = useRouter()
const routes = [
  { icon: 'home', path: '/', tooltip: 'Home' },
  { icon: 'search', path: '/search', tooltip: 'Search' },
  { icon: 'description', path: '/month', tooltip: "Month's Prompt" },
  { icon: 'person', path: '/profile', tooltip: 'Profile' }
]
const email = ref('')
function onLogout() {
  userStore.logout()
  updated.value=false
  router.push({ path: 'profile', query: { email: email.value }})

}
onSnapshot(collection(db, 'users'), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'modified') {
      const user = change.doc.data()
      if (user.email === userStore._user.email && user.role !== userStore._user.role) {
        email.value = userStore._user.email
        updated.value=true
      }
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

.tabs .q-tabs__arrow--left,
.tabs .q-tabs__arrow--right {
  display: none;
}
</style>
