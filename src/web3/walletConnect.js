import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID

const baseUrl = window.location.origin
// 2. Set chains
const sepolia = {
  chainId: 11155111,
  name: 'sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: import.meta.env.VITE_ALCHEMY_SEPOLIA_PROVIDER_URL
}

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
  chains: [sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})
