import { ethers } from 'ethers'
import { customWeb3modal } from './walletConnect'
import { useWalletStore } from '../stores'

const walletStore = useWalletStore()

export const sendEther = async (recipientAddress, amountInEther, signer, provider) => {
  //initate transaction..
  const network = await provider.getNetwork()

  const networkName = network?.name === 'unknown' ? 'amoy' : network?.name.toLowerCase()
  const networkConfig = findNetworkConfig(networkName)
  const explorerUrl = networkConfig ? networkConfig.explorerUrl : ''

  const transaction = {
    to: ethers.utils.getAddress(recipientAddress),
    value: ethers.utils.parseEther(amountInEther)
  }
  try {
    const txResponse = await signer.sendTransaction(transaction)
    const txReceipt = await txResponse.wait()
    return {
      transactionId: txReceipt.transactionHash,
      blockNumber: txReceipt.blockNumber,
      success: txReceipt.status === 1,
      networkName: networkName,
      explorerUrl: explorerUrl
    }
  } catch (error) {
    return {
      success: false,
      error: await handleMetamaskError(error)
    }
  }
}

const findNetworkConfig = (networkName) => {
  for (const key in walletStore.getChains) {
    if (networkName.toLowerCase().includes(key)) {
      return walletStore.getChains[key]
    }
  }
  return null
}

const getProvider = async () => {
  try {
    const walletProvider = customWeb3modal.getWalletProvider()

    // With the walletProvider obtained, proceed to create the ethers provider and signer
    return new ethers.providers.Web3Provider(walletProvider)
  } catch (error) {
    console.error('Error getting provider:', error)
    // Rethrow the error to handle it where getProvider is called
    throw error
  }
}

// Example usage:
export const initiateSendEther = async (recipientAddress, amountInEther) => {
  try {
    if (!customWeb3modal.getAddress()) {
      await customWeb3modal.open()
    }
    if (customWeb3modal.getAddress()) {
      // Get the signer
      const provider = await getProvider()
      const signer = provider.getSigner()

      if (signer) {
        return await sendEther(recipientAddress, amountInEther, signer, provider)
        // Further logic to handle successful transaction
      }
    }
  } catch (error) {
    const errorMessage = await handleMetamaskError(error)
    return {
      success: false,
      error: errorMessage
    }
  }
}

export const fetchMaticRate = async () => {
  try {
    const maitcRateApiLink = import.meta.env.VITE_MATIC_RATE_API_LINK
    const response = await fetch(maitcRateApiLink)
    const data = await response.json()
    return {
      success: true,
      maticRate: data['matic-network'].usd
    }
  } catch (error) {
    console.error('error when getting matic Rate ')
    return {
      success: false,
      error: error
    }
  }
}

export const getTransactionDetails = async (txHash, networkName) => {
  const providerUrl = walletStore.getChainConfig(networkName)?.rpcUrl
  const provider = new ethers.providers.JsonRpcProvider(providerUrl)
  try {
    // Fetch the transaction details
    const transaction = await provider.getTransaction(txHash)
    // Fetch the transaction receipt to get the status

    const receipt = await provider.getTransactionReceipt(txHash)

    // Extracting the desired information
    // Convert Wei to Ether for the transaction amount
    const amount = ethers.utils.formatEther(transaction.value)
    const sender = transaction.from
    const receiver = transaction.to
    const status = receipt.status === 1 ? 'Success' : 'Failed'

    return {
      amount: amount,
      sender: sender,
      receiver: receiver,
      status: status
    }
  } catch (error) {
    const errorMessage = await handleMetamaskError(error)
    return {
      success: false,
      error: errorMessage
    }
  }
}

const handleMetamaskError = async (error) => {
  // Check if the error has a code property
  if (error.code) {
    switch (error.code) {
      case 4001:
        return 'Request was rejected by the user.'
      case -32603:
        const errorMessage = error?.data?.message
        if (errorMessage?.includes('insufficient funds for gas')) {
          return 'Insufficient funds. Please check your balance and try again.'
        } else {
          if (errorMessage) {
            return errorMessage
          }
        }
        return 'Internal JSON-RPC error. Please try again later.'
      case -32000:
        return 'Insufficient funds. Please check your balance and try again.'
      case 'ACTION_REJECTED':
        return 'user rejected transaction'
      default:
        return `An unknown error occurred (code: ${error.code}). Please try again later.`
    }
  } else {
    // Handle errors without a code property by checking the message
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.'
    } else if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds. Please check your balance and try again.'
    } else if (error.message.includes('User denied')) {
      return 'Request was denied by the user.'
    } else {
      return 'An unknown error occurred. Please try again later.'
    }
  }
}
