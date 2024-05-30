import { ethers } from 'ethers'
import { customWeb3modal } from './walletConnect'
import { Notify, useQuasar } from 'quasar'
import { useWalletStore } from '../stores';
import AdCampaignManager from 'src/contracts/artifacts/contracts/AdCampaignManager.sol/AdCampaignManager.json'

const walletStore=useWalletStore();
const iface = new ethers.utils.Interface(AdCampaignManager.abi);
const  getContractInstance= async ()=>{
    const walletProvider = customWeb3modal.getWalletProvider()
    console.log("the wallet provider ==== ", walletProvider);
    // With the walletProvider obtained, proceed to create the ethers provider and signer
    const provider = new ethers.providers.Web3Provider(walletProvider)
    console.log("the provider ============ ", provider);
    //const signer = provider.getSigner()
    //console.log("the network =========== ", await provider.getNetwork().name)

    const signer = provider.getSigner()
    const contractAddress = '0x9503f03c3848e9Aa490975F7391425979Ac0072F';

    // Create a new instance of the contract
    const adCampaignManager = new ethers.Contract(contractAddress, AdCampaignManager.abi, signer);

    return adCampaignManager
}

function _parseEther(ether) {
    return ethers.utils.parseUnits(ether, 18);
}


export const contractCreateAdCampaign=async (budgetInMatic)=> {
    try {
        
        const amountInEther=ethers.utils.parseUnits(budgetInMatic.toString(), 'ether');
        
        const adCampaignManager=await getContractInstance();
        //console.log("the contract instance === ", adCampaignManager);
        const tx = await adCampaignManager.createAdCampaign({ value: amountInEther});
        const receipt = await tx.wait();
        //const events = receipt.logs.map(log => adCampaignManager.interface.parseLog(log));
        const events= receipt.logs.map(log => decodeLog(log)).filter(log => log !== null);
        console.log('Ad campaign created successfully');
        return { status: 'success', events };
    } catch (error) {
        console.error('Error creating ad campaign:', error);
       return { status: 'error', error: error.message };
    }
}

export const claimPayment=async (payload={'campaignCode':"",currentAmounSpent:"0"})=> {
    if(payload.campaignCode.length>1 && payload.currentAmounSpent>0){
        try {
            const adCampaignManager=await getContractInstance();
            const tx = await adCampaignManager.claimPayment(payload.campaignCode, ethers.utilis.paseEther(payload.currentAmounSpent.toString()));
            const receipt = await tx.wait();
            const events= receipt.logs.map(log => decodeLog(log)).filter(log => log !== null);
            console.log('Payment claimed successfully');
            return { status: 'success', events };
        } catch (error) {
            console.error('Error claiming payment:', error);
            return { status: 'error', error: error.message };
        }
    }else{
        const errorMessage='Make sure the amount claimed is greater than zero and the campaignCode is not empty string'
        console.error('Error claiming payment:', errorMessage);
        return { status: 'error', error: errorMessage };
    }
}


export const requestWithdrawal=async(payload={'campaignCode':campaignCode})=> {
    if(payload.campaignCode.length>0){
        try {
            const adCampaignManager=await getContractInstance();
            const tx = await adCampaignManager.requestWithdrawal(payload.campaignCode);
            const receipt = await tx.wait();
            const events = receipt.logs.map(log => decodeLog(log)).filter(log => log !== null);;
            console.log('Withdrawal requested successfully');
            return { status: 'success', events };
        } catch (error) {
            console.error('Error requesting withdrawal:', error);
            return { status: 'error', error: error.message };
        }

    }else{
        const errorMessage='Make sure  the campaignCode is not empty string'
        console.error('Error on request Withdrawal payment:', errorMessage);
        return { status: 'error', error: errorMessage };
    }
}

export const approveWithdrawal=async(campaignCode, currentAmountSpent)=> {
    try {
        const adCampaignManager=await getContractInstance();
        const tx = await adCampaignManager.approveWithdrawal(campaignCode, currentAmountSpent);
        const receipt = await tx.wait();
        const events = receipt.logs.map(log => contract.interface.parseLog(log));
        console.log('Withdrawal approved and funds transferred successfully');
        return { status: 'success', events };
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        return { status: 'error', error: error.message };
    }
}

async function requestAndApproveWithdrawal(campaignCode) {
    try {
        const adCampaignManager=await getContractInstance();
        const tx = await adCampaignManager.requestAndApproveWithdrawal(campaignCode);
        const receipt = await tx.wait();
        const events = receipt.logs.map(log => contract.interface.parseLog(log));
        console.log('Withdrawal requested and approved successfully');
        return { status: 'success', events };
    } catch (error) {
        console.error('Error requesting and approving withdrawal:', error);
        return { status: 'error', error: error.message };
    }
}

async function pauseContract() {
    try {
        const adCampaignManager=await getContractInstance();
        const tx = await adCampaignManager.pause();
        const receipt = await tx.wait();
        const events = receipt.logs.map(log => contract.interface.parseLog(log));
        console.log('Contract paused successfully');
        return { status: 'success', events };
    } catch (error) {
        console.error('Error pausing contract:', error);
        return { status: 'error', error: error.message };
    }
}

async function unpauseContract() {
    try {
        const adCampaignManager=await getContractInstance();
        const tx = await adCampaignManager.unpause();
        const receipt = await tx.wait();
        const events = receipt.logs.map(log => contract.interface.parseLog(log));
        console.log('Contract unpaused successfully');
        return { status: 'success', events };
    } catch (error) {
        console.error('Error unpausing contract:', error);
        return { status: 'error', error: error.message };
    }
}


async function getAdCampaignByCode(campaignCode) {
    try {
        const adCampaignManager=await getContractInstance();
        const campaign = await adCampaignManager.getAdCampaignByCode(campaignCode);
        console.log('Ad campaign details:', campaign);
        return { status: 'success', data: campaign };
    } catch (error) {
        console.error('Error fetching ad campaign details:', error);
        return { status: 'error', error: error.message };
    }
}

// Function to decode log data
function decodeLog(log) {
    try {
      const eventFragment = iface.getEvent(log.topics[0]);
      const decodedLog = iface.decodeEventLog(eventFragment, log.data, log.topics);
      // Convert BigNumber values to Ether
      const args = {};
      for (const [key, value] of Object.entries(decodedLog)) {
        if (ethers.BigNumber.isBigNumber(value)) {
          args[key] = ethers.utils.formatEther(value);
        } else {
          args[key] = value;
        }
      }
      
      return {
        event_name: eventFragment.name,
        args: args
      };
    } catch (error) {
      console.log(`Log could not be decoded:`, error);
      return null;
    }
  }