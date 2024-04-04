<script setup lang="ts">

  import {ethers} from "ethers";
  import {createWeb3Modal,defaultConfig, useWeb3Modal } from '@web3modal/ethers5/vue'
  import { useWeb3ModalAccount,useWeb3ModalProvider } from '@web3modal/ethers5/vue'
  
  import { useWalletStore } from 'app/src/stores';
  
  import { computed, ref } from 'vue';
  import { useUserStore } from 'app/src/stores';

  const userStore=useUserStore()
  const user = userStore.getUser
  const walletStore=useWalletStore()
  //let's define props
  const props = defineProps({
    page_name: {
      type: String,
      default: 'default' // Specify your default value here
    }
  });

  const addressUpdated=ref(false); //profil page

  
  // 1. Get projectId
  const projectId = '9dcf39cb8034882a971d5086066c7f17'

  // 2. Set chains
  const mainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
  }

  // 3. Create modal
  const metadata = {
    name: 'My Website',
    description: 'My Website description',
    url: 'http://localhost:9200', // origin must match your domain & subdomain
    icons: ['http://localhost:9200/logo.svg']
  }

  createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet],
    projectId,
    enableAnalytics: true // Optional - defaults to your Cloud configuration
  })
  // 4. Use modal composable
  const modal = useWeb3Modal()
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  //const { walletProvider } = useWeb3ModalProvider()
  
  // const provider = computed(() => {
  //     // This will be reactive and update whenever walletProvider changes
  //     if (walletProvider.value) {
  //       return new ethers.providers.Web3Provider(walletProvider.value);
  //     }
  //     return null;
  // });

  // const signer = computed(() => {
  //   // This will be reactive and update whenever provider changes
  //   return provider.value ? provider.value.getSigner() : null;
  // });

  async function updateWalletInfo(view){
   
   modal.open({view:view})
   //console.log("the received signer ", signer);
   walletStore.setNetworkId(chainId);
   walletStore.setWalletAddress(address);
   //walletStore.setSigner(signer);
   this.addressUpdated=true;
   
  }
  
  
  function resetWalletAddress(){
    walletStore.setWalletAddress(null);
    this.addressUpdated=false;
  }
</script>

<template>
  <div v-if="page_name=='default'">
    <div class="q-mt-md" v-if="isConnected">
      
      <q-btn v-if="isConnected" @click.prevent.stop="modal.open({view:'Account'})" color="primary" label="web3 wallet connected " data-test="Open Connect Modal" rounded inline >
        &nbsp; <q-icon name="preview"></q-icon>
      </q-btn>
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
    </div>
    <div class="q-mb-lg" v-if="!isConnected">
      <q-btn @click.prevent.stop="updateWalletInfo" color="secondary" label="connect your web3 wallet" data-test="Open Connect Modal" size="md" inline  rounded />
    </div>
  </div>

  <div v-if="page_name=='adminentries'">
    <div  v-if="isConnected">
      
      <q-btn v-if="isConnected" @click.prevent.stop="modal.open({view:'Account'})" color="primary" label="web3 wallet connected " data-test="Open Connect Modal" v-close-popup >
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
          <q-btn v-if="addressUpdated==false" icon="edit" @click.prevent.stop="updateWalletInfo('Account')" color="primary" label="" data-test="Open Connect Modal"  size="sm"/>
          <q-btn v-if="addressUpdated==true"  icon="history" @click.prevent.stop="resetWalletAddress()" color="primary" label="" data-test="Open Connect Modal"  size="sm"/> 
        </div>  
    </div>
    <div class="text-right" v-if="!isConnected">
      <div class="q-pa-md q-gutter-sm">
        <q-btn  icon="edit" @click.prevent.stop="updateWalletInfo('Connect')" color="primary" label="" data-test="Open Connect Modal" size="sm" />
      </div>
    </div>
  </div>
</template>

