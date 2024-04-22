<template>
  <q-footer class="bg-white" elevated>
    <q-tabs active-class="text-primary" align="justify" class="tabs text-secondary" data-test="main-menu" switch-indicator>
      <q-route-tab v-for="(route, index) in routes" :key="index" :icon="route.icon" :to="route.path">
        <q-tooltip class="text-center" style="white-space: pre-line">{{ route.tooltip }}</q-tooltip>
      </q-route-tab>
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
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const updated = ref(false)
const userStore = useUserStore()
const router = useRouter()
const routes = computed(() => [
  { icon: 'home', path: '/', tooltip: 'Home' },
  { icon: 'search', path: '/search', tooltip: 'Search' },
  { icon: 'description', path: '/month', tooltip: "Month's Prompt" },
  { icon: 'person', path: '/profile', tooltip: 'Profile' },
  {
    icon: 'admin_panel_settings',
    path: `${userStore.isWriterOrAbove && router.currentRoute.value.fullPath.includes('admin') ? '/admin/prompts' : '/admin'}`,
    tooltip: 'Admin Panel'
  }
])
const email = ref('')
const currentUserEmail = userStore._user.email

function onLogout() {
  userStore.logout()
  updated.value = false
  router.push({ path: 'profile', query: { email: email.value } })
}

//
// const userRef = query(collection(db, 'users'), where('email', '==', currentUserEmail))
// getDocs(userRef)
//   .then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//       const user = doc.data()
//       console.log(user)
//       if (user.role !== userStore._user.role) {
//         email.value = currentUserEmail
//         updated.value = true
//       }
//     })
//   })
//   .catch((error) => {
//     console.error('Error getting user documents: ', error)
//   })

// onSnapshot(collection(db, 'users'), (snapshot) => {
//   snapshot.docChanges().forEach((change) => {
//     if (change.type === 'modified') {
//       const user = change.doc.data()
//       if (user.email === userStore._user.email && user.role !== userStore._user.role) {
//         email.value = userStore._user.email
//         updated.value = true
//       }
//     }
//   })
// })

const usersRef = collection(db, 'users')
getDocs(usersRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const user = doc.data()
      if (user.email === userStore._user.email && user.role !== userStore._user.role) {
        email.value = userStore._user.email
        updated.value = true
      }
    })
  })
  .catch((e) => {
    console.error(e)
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
