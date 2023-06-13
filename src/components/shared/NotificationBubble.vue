<template>
  <q-btn color="secondary" flat icon="notifications" round size="1rem">
    <q-menu anchor="bottom right" self="top right">
      <q-item>
        <q-item-section class="text-center">
          <q-btn color="primary" dense label="Mark all as read" outline @click="readAll" />
        </q-item-section>
        <q-item-section>
          <q-btn color="primary" dense label="Clear all" outline @click="clearAll" />
        </q-item-section>
      </q-item>
      <q-item v-for="notification in notificationStore.getNotifications" class="non-selectable" :key="notification.id">
        <q-item-section side>
          <q-icon class="cursor-pointer" color="blue" name="circle" size="0.75rem" @click="toggleRead" />
        </q-item-section>
        <q-item-section class="cursor-pointer" @click="goToLink(notification.link)">{{ notification.message }}</q-item-section>
        <q-item-section side>
          <q-btn flat icon="clear" round size="sm" @click="remove" />
        </q-item-section>
      </q-item>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { useNotificationStore } from 'app/src/stores'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const notificationStore = useNotificationStore()

onMounted(() => {
  if (!notificationStore.getNotifications.length) {
    notificationStore.readNotifications()
  }
})

function toggleRead() {
  // notificationStore.toggleRead()
}

function readAll() {
  // notificationStore.readAll()
}

function goToLink(link) {
  router.push(link || '/')
}

function remove() {
  // notificationStore.remove()
}

function clearAll() {
  // notificationStore.clearAll()
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
