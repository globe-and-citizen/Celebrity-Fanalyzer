<template>
  <q-btn color="secondary" dense flat icon="notifications" round size="1rem">
    <q-badge v-if="unreadNotifications.length" color="red" floating rounded>{{ unreadNotifications.length }}</q-badge>
    <q-menu anchor="bottom right" self="top right">
      <q-item style="min-width: 320px">
        <q-item-section class="text-center">
          <q-btn class="no-wrap" color="primary" dense label="Mark all as read" outline @click="markAllAsRead" />
        </q-item-section>
        <q-item-section>
          <q-btn color="primary" dense label="Clear all" outline @click="deleteAll" />
        </q-item-section>
      </q-item>
      <q-item v-for="notification in notificationStore.getNotifications" class="non-selectable" :key="notification.id">
        <q-item-section side>
          <q-icon
            class="cursor-pointer"
            :color="notification.read ? 'white' : 'blue'"
            name="circle"
            size="0.75rem"
            @click="markOneAsRead(notification.id)"
          />
        </q-item-section>
        <q-item-section class="cursor-pointer" @click="goToLink(notification.link)">{{ notification.message }}</q-item-section>
        <q-item-section side>
          <q-btn flat icon="clear" round size="sm" @click="deleteOne(notification.id)" />
        </q-item-section>
      </q-item>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { useNotificationStore } from 'app/src/stores'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const notificationStore = useNotificationStore()

onMounted(async () => {
  await notificationStore.readList()
})

const unreadNotifications = computed(() => notificationStore.getNotifications.filter((notification) => !notification.read))

function markOneAsRead(id) {
  if (unreadNotifications.value.some((i) => i.id === id)) {
    notificationStore.markOneAsRead(id)
  }
}

function markAllAsRead() {
  notificationStore.markAllAsRead()
}

function goToLink(link) {
  router.push(link || '/')
}

function deleteOne(id) {
  console.log(id)
  // notificationStore.deleteOne(id)
}

function deleteAll() {
  // notificationStore.deleteAll()
}

function notify() {
  Notification.requestPermission().then((result) => {
    if (result === 'granted') {
      const options = {
        body: `Hello, this is a notification!`,
        icon: 'logo.svg',
        vibrate: [100, 50, 100]
      }
      new Notification('CelebrityFanalyzer', options)
    }
  })
}
</script>
