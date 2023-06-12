<template>
  <q-btn color="secondary" flat icon="notifications" round size="1rem">
    <q-menu anchor="bottom right" self="top right">
      <q-item clickable>
        <q-item-section>New tab</q-item-section>
      </q-item>
      <q-item clickable>
        <q-item-section>New incognito tab</q-item-section>
      </q-item>
    </q-menu>
  </q-btn>
</template>

<script setup>
function notify() {
  Notification.requestPermission().then((result) => {
    if (result === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('Vibration Sample', {
          body: 'Buzz! Buzz!',
          icon: 'img:/logo.svg',
          // vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'vibration-sample'
        })
      })
    }
  })
}
</script>
