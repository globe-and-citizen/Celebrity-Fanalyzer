<template>
  <div v-if="page_name == 'profile'">
    <div class="text-right" v-if="isConnected">
      <div class="q-pa-md q-gutter-sm">
        <q-btn icon="edit" @click.prevent.stop="updateWalletInfo()" color="primary" label="" data-test="Open Connect Modal" size="sm" />
      </div>
    </div>
    <div class="text-right" v-if="!isConnected">
      <div class="q-pa-md q-gutter-sm">
        <q-btn icon="edit" @click.prevent.stop="updateWalletInfo()" color="primary" label="" data-test="Open Connect Modal" size="sm"
        flat
        dense
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { customWeb3modal } from 'src/web3/walletConnect'
import { computed } from 'vue'
import { useWalletStore } from 'app/src/stores'

const walletStore = useWalletStore()
//let's define props
defineProps({
  page_name: {
    type: String,
    default: 'profile'
  }
})

const address = computed(() => {
  return customWeb3modal.getAddress()
})

const chainId = computed(() => {
  return customWeb3modal.getChainId()
})

const isConnected = computed(() => {
  return customWeb3modal.getIsConnected()
})

async function updateWalletInfo() {
  customWeb3modal.open()
  if(chainId.value){
    walletStore.setNetworkId(chainId.value)
  }
  if(address.value){
    walletStore.setWalletAddress(address.value)
  }
}

function handleChange({ provider, providerType, address, error, chainId, isConnected }) {
  if (address) {
    walletStore.setWalletAddress(address)
  }
}

customWeb3modal.subscribeProvider(handleChange)
</script>
