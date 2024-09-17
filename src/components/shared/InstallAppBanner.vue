<template>
  <q-banner inline-actions dense class="bg-primary text-white">
    <b>Install Celebrity Fanalyzer?</b>

    <template v-slot:avatar>
      <q-avatar font-size="22px"><img alt="logo" src="favicon.ico" /></q-avatar>
    </template>
    <template v-slot:action>
      <q-btn class="buttons" dense flat label="Yes" @click="installApp" />
      <q-btn class="buttons" dense flat label="Later" @click="$emit('closeBanner')" />
      <q-btn class="buttons" dense flat label="Dismiss" @click="dismissBanner" />
    </template>
  </q-banner>
</template>

<script setup>
import { LocalStorage } from 'quasar'

const props = defineProps(['deferredPrompt'])
const emit = defineEmits(['closeBanner', 'setDeferredPrompt'])

const installApp = async () => {
  props.deferredPrompt.prompt()
  const { outcome } = await props.deferredPrompt.userChoice

  if (outcome === 'accepted') {
    emit('setDeferredPrompt', null)
  }

  emit('setDeferredPrompt', null)
  emit('closeBanner')
}

const dismissBanner = () => {
  LocalStorage.set('dismissBanner', true)
  emit('closeBanner')
}
</script>
<style lang="scss" scoped>
.buttons {
  @media (min-width: 720px) {
    padding: 0 10px 0 10px;
  }
}
</style>
