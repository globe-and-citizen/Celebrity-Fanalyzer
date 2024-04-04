import {ethers} from "ethers";
import { customWeb3modal } from "./walletConnect";

export const  sendEther=async (recipientAddress, amountInEther,signer)=>{
    //initate transaction.. 
    console.log("amount in ether",amountInEther)
    const transaction={
        to:ethers.utils.getAddress(recipientAddress),
        value: ethers.utils.parseEther(amountInEther)
    };
    try{
        const txResponse= await signer.sendTransaction(transaction);
        console.log('Transaction sent: ', txResponse.hash);
        // wait for the transaction to be mined
        const txReceipt= await txResponse.wait();
        console.log('transaction confirmed: Block',txReceipt.blockNumber);
        return {
            transactionId: txReceipt.transactionHash,
            blockNumber: txReceipt.blockNumber,
            success: txReceipt.status ===1,
        };
    }catch(error){
        console.error('Transaction failed: ',error.message );
        return {
            success:false,
            error:error.message
        }
    }
}

const getProvider = async () => {
    try {
        console.log("getProvider called================================ ");
        // Attempt to open the connection modal
        //await customWeb3modal.disconnect()
        //await customWeb3modal.open({'view': 'Connect'});
        // After the modal has been handled, check if the connection was successful
        console.log("is now connected================================ ");
        // Now that we're connected, get the wallet provider
        const walletProvider = await customWeb3modal.getWalletProvider();
        console.log("the wallet provider ======== ", walletProvider);
        // With the walletProvider obtained, proceed to create the ethers provider and signer
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = await provider.getSigner();

        return signer;
    
    } catch (error) {
        console.error('Error getting provider:', error);
        throw error; // Rethrow the error to handle it where getProvider is called
    }
};
  
// Example usage:
export const  initiateSendEther = async(recipientAddress, amountInEther) =>{
    console.log("calling getProvider================================ ");
    try {
        console.log("the wallet is connexted ", customWeb3modal.getAddress())
        if (!customWeb3modal.getAddress()){
            await customWeb3modal.open();
        }
        if (customWeb3modal.getAddress()){
            console.log("calling getProvider================================ ");
            const signer = await getProvider(); // Get the signer
            if (signer) {
                console.log("signer retreived successfully ===== ", signer);
                const transactionResult = await sendEther(recipientAddress, amountInEther, signer);
                return transactionResult
                // Further logic to handle successful transaction
            }
        }else{
            console.log("the wallet is not connected")
        }
       
    } catch (error) {
        // Handle errors from getProvider or sendEther
        console.error('Error initiating sendEther:', error);
        // Notify the user of a failed transaction
        // Display an error message, update UI, etc.
    }
}




export const getTransactionDetails= async (txHash) =>{
  const sepoliaProviderUrl=import.meta.env.VITE_ALCHEMY_SEPOLIA_PROVIDER_URL;
  console.log("the provider url=== ",sepoliaProviderUrl)
  const sepoliaProvider = new ethers.providers.JsonRpcProvider(sepoliaProviderUrl);
  try {
    // Fetch the transaction details
    const transaction = await sepoliaProvider.getTransaction(txHash);
    // Fetch the transaction receipt to get the status
    const receipt = await sepoliaProvider.getTransactionReceipt(txHash);

    // Extracting the desired information
    const amount = ethers.utils.formatEther(transaction.value); // Convert Wei to Ether for the transaction amount
    const gasPrice = ethers.utils.formatUnits(transaction.gasPrice, 'gwei'); // Convert Wei to Gwei for the gas price
    const sender = transaction.from;
    const receiver = transaction.to;
    const status = receipt.status === 1 ? 'Success' : 'Failed';

    const result={
        amount:amount,
        gasPrice:ethers.utils.gasPrice,
        sender:sender,
        receiver:receiver,
        status:status
    }
    return result

  } catch (error) {
    console.error('Error retrieving transaction details:', error);
  }
}


