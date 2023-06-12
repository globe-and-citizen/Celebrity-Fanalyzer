<template>
  <q-btn color="secondary" flat icon="notifications" round size="1rem">
    <q-menu anchor="bottom right" self="top right">
      <q-item clickable @click="notify">
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
