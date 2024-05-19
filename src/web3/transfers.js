import { ethers } from 'ethers'
import { customWeb3modal } from './walletConnect'
import { Notify, useQuasar } from 'quasar'
import { useWalletStore } from '../stores';

const walletStore=useWalletStore();

console.log("the walletStore ", useWalletStore);
const $q = useQuasar()

export const sendEther = async (recipientAddress, amountInEther, signer, provider) => {
  //initate transaction..
  const network=await provider.getNetwork();

  const networkName = network?.name === "unknown" ? "amoy" : network?.name.toLowerCase();
  const networkConfig = findNetworkConfig(networkName);
  const explorerUrl = networkConfig ? networkConfig.explorerUrl : '';


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
      networkName:networkName,
      explorerUrl:explorerUrl
     
    }
  } catch (error) {
    //$q.notify({ message: error.data.message, type: 'negative' })
    return {
      success: false,
      error: error.data.message
    }
  }
}



const findNetworkConfig = (networkName) => {
  for (const key in walletStore.getChains) {
    if (networkName.toLowerCase().includes(key)) {
      return walletStore.getChains[key];
    }
  }
  return null;
};

const getProvider = async () => {
  try {
    const walletProvider = customWeb3modal.getWalletProvider()
    
    // With the walletProvider obtained, proceed to create the ethers provider and signer
    const provider = new ethers.providers.Web3Provider(walletProvider)
    //const signer = provider.getSigner()
    //console.log("the network =========== ", await provider.getNetwork().name)

    return provider
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
      
      const provider = await getProvider() // Get the signer
      const signer = provider.getSigner()
      
      if (signer) {
        
        const transactionResult = await sendEther(recipientAddress, amountInEther, signer,provider)
        return transactionResult
        // Further logic to handle successful transaction
      }
    } else {
      //$q.notify({ message: 'the wallet is not connected', type: 'negative' })
    }
  } catch (error) {
    //console.log("the error ============================== ", error);
    //$q.notify({ message: 'error when sending ether', type: 'negative' });
    return {
      success: false,
      error: error.data.message
    }
    //console.error('Error initiating sendEther:', error);
  }
}

export const getTransactionDetails = async (txHash,networkName) => {
  const providerUrl=walletStore.getChainConfig(networkName)?.rpcUrl;
  //console.log("the  providerUrl ======  ",providerUrl)
  
  const provider = new ethers.providers.JsonRpcProvider(providerUrl)
  console.log("the provider ======= ", provider);
  try {
    // Fetch the transaction details
    const transaction = await provider.getTransaction(txHash)
    // Fetch the transaction receipt to get the status
    
    const receipt = await provider.getTransactionReceipt(txHash)
    //console.log("the transaction detail is called ==================== ", transaction)
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
