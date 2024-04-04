import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '9dcf39cb8034882a971d5086066c7f17'

// 2. Set chains
const sepolia = {
  chainId: 11155111,
  name: 'sepolia',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: import.meta.env.VITE_ALCHEMY_SEPOLIA_PROVIDER_URL
}

// 3. Create your application's metadata object
const metadata = {
  name: 'My Website',
  description: 'Celebrity Fanalyser',
  url: 'http://localhost:9200', // url must match your domain & subdomain
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
