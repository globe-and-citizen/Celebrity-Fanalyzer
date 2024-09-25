import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5'

import { useWalletStore } from '../stores'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID

const baseUrl = window.location.origin

const currentNetworkName = import.meta.env.VITE_CURRENT_NETWORK_NAME.toLowerCase()

// 3. Define a function to get the chain configuration based on the current network name

// 4. Get the chain configuration
const chainConfig = useWalletStore().getChainConfig(currentNetworkName)

// 3. Create your application's metadata object
const metadata = {
  name: 'Celebrity Fanalyser',
  description: 'Celebrity Fanalyser',
  // url must match your domain & subdomain
  url: baseUrl,
  icons: ['']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata
  /*Optional*/
})

// 5. Create a Web3Modal instance
export const customWeb3modal = createWeb3Modal({
  ethersConfig,
  chains: [chainConfig],
  projectId,
  // Optional - defaults to your Cloud configuration
  enableAnalytics: true,
  // Optional - false as default
  enableOnramp: true
})
