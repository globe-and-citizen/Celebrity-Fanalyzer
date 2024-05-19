import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5'
import { useWalletStore } from '../stores'

//console.log("the cahins === ",useWalletStore().getChains)
// 1. Get projectId at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID

const baseUrl = window.location.origin
const chains= useWalletStore().getChains;

const currentNetworkName = import.meta.env.VITE_CURRENT_NETWORK_NAME.toLowerCase();
//console.log("Current network name: ", currentNetworkName);

// 3. Define a function to get the chain configuration based on the current network name

// 4. Get the chain configuration
const chainConfig = useWalletStore().getChainConfig(currentNetworkName);

//console.log("Chain configuration: ", chainConfig);

//default chain polygon amoy... 
// var chain={
//   chainId: import.meta.env.VITE_POLYGON_AMOY_NETWORK_ID,
//   name: "Polygon Mainnet",
//   currency: import.meta.env.VITE_POLYGON_AMOY_CURRENCY,
//   explorerUrl: import.meta.env.VITE_ALCHEMY_POLYGON_AMOY_SCAN_URL,
//   rpcUrl: import.meta.env.VITE_ALCHEMY_POLYGON_AMOY_PROVIDER_URL
// }

// if (import.meta.env.VITE_CURRENT_NETWORK_NAME.toLowerCase().includes("sepolia")){
//   chain={
//     chainId: import.meta.env.VITE_SEPOLIA_NETWORK_ID,
//     name: import.meta.env.VITE_SEPOLIA_NETWORK_NAME,
//     currency: import.meta.env.VITE_SEPOLIA_CURRENCY,
//     explorerUrl: import.meta.env.VITE_ALCHEMY_SEPOLIA_SCAN_URL,
//     rpcUrl: import.meta.env.VITE_ALCHEMY_SEPOLIA_PROVIDER_URL
//   }
// }

// 3. Create your application's metadata object
const metadata = {
  name: 'Celebrity Fanalyser',
  description: 'Celebrity Fanalyser',
  url: baseUrl, // url must match your domain & subdomain
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
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})
