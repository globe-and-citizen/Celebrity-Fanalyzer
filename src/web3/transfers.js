import { ethers } from 'ethers'
import { customWeb3modal } from './walletConnect'
import { Notify, useQuasar } from 'quasar'
const $q = useQuasar()

export const sendEther = async (recipientAddress, amountInEther, signer) => {
  //initate transaction..
  const transaction = {
    to: ethers.utils.getAddress(recipientAddress),
    value: ethers.utils.parseEther(amountInEther)
  }
  try {
    const txResponse = await signer.sendTransaction(transaction)
    const txReceipt = await txResponse.wait()
    return {
      transactionId: txReceipt.transactionHash,
      blockNumberVITE_WALLET_CONNECT_PROJECT_ID: txReceipt.blockNumber,
      success: txReceipt.status === 1
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

const getProvider = async () => {
  try {
    const walletProvider = customWeb3modal.getWalletProvider()
    
    // With the walletProvider obtained, proceed to create the ethers provider and signer
    const provider = new ethers.providers.Web3Provider(walletProvider)
    const signer = provider.getSigner()

    return signer
  } catch (error) {
    console.error('Error getting provider:', error)
    throw error // Rethrow the error to handle it where getProvider is called
  }
}

// Example usage:
export const initiateSendEther = async (recipientAddress, amountInEther) => {
  try {
    if (!customWeb3modal.getAddress()) {
      await customWeb3modal.open()
    }
    if (customWeb3modal.getAddress()) {
      
      const signer = await getProvider() // Get the signer
      if (signer) {
        
        const transactionResult = await sendEther(recipientAddress, amountInEther, signer)
        return transactionResult
        // Further logic to handle successful transaction
      }
    } else {
      $q.notify({ message: 'the wallet is not connected', type: 'negative' })
    }
  } catch (error) {
    $q.notify({ message: 'error when sending ether', type: 'negative' })
    //console.error('Error initiating sendEther:', error);
  }
}

export const getTransactionDetails = async (txHash) => {
  const sepoliaProviderUrl = import.meta.env.VITE_ALCHEMY_SEPOLIA_PROVIDER_URL
  
  const sepoliaProvider = new ethers.providers.JsonRpcProvider(sepoliaProviderUrl)
  try {
    // Fetch the transaction details
    const transaction = await sepoliaProvider.getTransaction(txHash)
    // Fetch the transaction receipt to get the status
    const receipt = await sepoliaProvider.getTransactionReceipt(txHash)

    // Extracting the desired information
    const amount = ethers.utils.formatEther(transaction.value) // Convert Wei to Ether for the transaction amount
    const sender = transaction.from
    const receiver = transaction.to
    const status = receipt.status === 1 ? 'Success' : 'Failed'

    const result = {
      amount: amount,
      gasPrice: ethers.utils.gasPrice,
      sender: sender,
      receiver: receiver,
      status: status
    }
    return result
  } catch (error) {
    //console.error('Error retrieving transaction details:', error);
  }
}
