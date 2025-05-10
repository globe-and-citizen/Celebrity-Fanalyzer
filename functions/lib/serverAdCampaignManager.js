const { ethers } = require('ethers')
const AdCampaignManager = require('./AdCampaignManager.sol/AdCampaignManager.json')
const functions = require('firebase-functions')

const RPC_URL = functions.config().web3.rpc_url_polygon
const CONTRACT_ADDRESS = functions.config().web3.adcampaign_contract_address

const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

const contract = new ethers.Contract(CONTRACT_ADDRESS, AdCampaignManager.abi, provider)

exports.getAdCampaignCosts = async () => {
  try {
    const costPerImpression = await contract.costPerImpression()
    const costPerClick = await contract.costPerClick()

    return {
      status: 'success',
      data: {
        costPerClick: ethers.utils.formatEther(costPerClick),
        costPerImpression: ethers.utils.formatEther(costPerImpression)
      }
    }
  } catch (error) {
    console.error('Error fetching costs: ', error)
    return { status: 'error', error: error }
  }
}
