<script setup lang="ts">
  import {customWeb3modal} from 'src/web3/walletConnect'
  import { computed,ref } from 'vue';
  import { useWalletStore } from 'app/src/stores';
  
  const walletStore=useWalletStore()
  //let's define props
  const props = defineProps({
    page_name: {
      type: String,
      default: 'default' // Specify your default value here
    }
  });

  const addressUpdated=ref(false); //profil page

  const address = computed(()=>{
    return customWeb3modal.getAddress()
  })

  const chainId = computed(()=>{
    return customWeb3modal.getChainId()
  })

  const isConnected = computed(()=>{
    console.log("the isConnected ======== ",customWeb3modal.getIsConnected())
     return customWeb3modal.getIsConnected()
  })
  
  async function updateWalletInfo(){
   customWeb3modal.open()
   //console.log("the wallet address====== ", chainId);
   //console.log("the received signer ", signer);
   walletStore.setNetworkId(chainId.value);
   walletStore.setWalletAddress(address.value);
   //walletStore.setSigner(signer);
   addressUpdated.value=true;
   
  }

  
  function resetWalletAddress(){
    walletStore.setWalletAddress(null);
    addressUpdated.value=false;
  }
</script>

<template>
  <div v-if="page_name=='default'">
    <!-- <div class="q-mt-md" v-if="isConnected && address">
      
      <q-btn v-if="isConnected && address" @click.prevent.stop="customWeb3modal.open()" color="primary" label="web3 wallet connected " data-test="Open Connect Modal" rounded inline >
        &nbsp; <q-icon name="preview"></q-icon>
      </q-btn> -->
      <!-- <p v-if="address" 	><span class="text-bold text-h6 text-secondary">wallet address</span>: {{ address }} 
        <q-btn
          class="text-right"
          color="negative"
          icon="edit"
          @click.prevent.stop="updateWalletInfo('Connect')"
          size="sm"
        />
      </p> -->
      <!-- <q-btn @click.prevent.stop="modal.open({ view: 'Networks' })" label="network" color="primary" data-test="Open Network Modal" inline /> -->
    <!-- </div>
    <div class="q-mb-lg" v-if="!isConnected">
      <q-btn @click.prevent.stop="updateWalletInfo" color="secondary" label="connect your web3 wallet" data-test="Open Connect Modal" size="md" inline  rounded />
    </div> -->
  </div>

  <div v-if="page_name=='adminentries'">
    <div  v-if="isConnected">
      
      <q-btn v-if="isConnected" @click.prevent.stop="customWeb3modal.open()" color="primary" label="web3 wallet connected " data-test="Open Connect Modal" v-close-popup >
        &nbsp; <q-icon name="preview"></q-icon>
      </q-btn>
      <!-- <p v-if="address" 	><span class="text-bold text-h6 text-secondary">wallet address</span>: {{ address }} 
        <q-btnv-close-popup
          class="text-right"
          color="negative"
          icon="edit"
          @click.prevent.stop="updateWalletInfo('Connect')"
          size="sm"
        />
      </p> -->
      <!-- <q-btn @click.prevent.stop="modal.open({ view: 'Networks' })" label="network" color="primary" data-test="Open Network Modal" inline /> -->
    </div>
    <div  v-if="!isConnected">
      <q-btn @click.prevent.stop="updateWalletInfo" color="secondary" label="connect your web3 wallet" data-test="Open Connect Modal" size="md"  v-close-popup />
    </div>
  </div>
  <div v-if="page_name=='profile'">
    <div class="text-right" v-if="isConnected">
        <div class="q-pa-md q-gutter-sm">
          <q-btn v-if="addressUpdated==false" icon="edit" @click.prevent.stop="updateWalletInfo()" color="primary" label="" data-test="Open Connect Modal"  size="sm"/>
          <q-btn v-if="addressUpdated==true"  icon="history" @click.prevent.stop="resetWalletAddress()" color="primary" label="" data-test="Open Connect Modal"  size="sm"/> 
        </div>  
    </div>
    <div class="text-right" v-if="!isConnected">
      <div class="q-pa-md q-gutter-sm">
        <q-btn  icon="edit" @click.prevent.stop="updateWalletInfo()" color="primary" label="" data-test="Open Connect Modal" size="sm" />
      </div>
    </div>
  </div>
</template>

