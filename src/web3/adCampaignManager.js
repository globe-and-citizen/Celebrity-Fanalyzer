import { ethers } from 'ethers'
import { customWeb3modal } from './walletConnect'
import { Notify, useQuasar } from 'quasar'
import { useWalletStore } from '../stores'
import AdCampaignManager from 'src/contracts/artifacts/contracts/AdCampaignManager.sol/AdCampaignManager.json'

const walletStore = useWalletStore()
const iface = new ethers.utils.Interface(AdCampaignManager.abi)

const checkConnection = async () => {
  if (!customWeb3modal.getAddress()) {
    await customWeb3modal.open()
    return true
  }
  return true
}

const getProvider = async () => {
  try {
    const isConnected = await checkConnection()
    if (isConnected) {
      const walletProvider = customWeb3modal.getWalletProvider()

      // With the walletProvider obtained, proceed to create the ethers provider and signer
      const provider = new ethers.providers.Web3Provider(walletProvider)
      //const signer = provider.getSigner()
      //console.log("the network =========== ", await provider.getNetwork().name)

      return provider
    }
  } catch (error) {
    console.error('Error getting provider:', error)
    const errorMessage = 'please connect your wallet'
    error = 'please connect your wallet'
    throw error // Rethrow the error to handle it where getProvider is called
  }
}

const getContractInstance = async () => {
  const provider = await getProvider()

  //console.log("the wallet provider ==== ", walletProvider);
  // With the walletProvider obtained, proceed to create the ethers provider and signer
  //const provider = new ethers.providers.Web3Provider(walletProvider)
  //console.log("the provider ============ ", provider);
  //const signer = provider.getSigner()
  //console.log("the network =========== ", await provider.getNetwork().name)

  const signer = provider.getSigner()
  const contractAddress = import.meta.env.VITE_ADVERTISEMENT_CAMPAIGN_CONTRACT_ADDRESS

  // Create a new instance of the contract
  const adCampaignManager = new ethers.Contract(contractAddress, AdCampaignManager.abi, signer)

  return adCampaignManager
}
//advertiser preferably
export const contractCreateAdCampaign = async (payload = { budgetInMatic: 0 }) => {
  if (payload.budgetInMatic > 0) {
    try {
      // Convert the budget from MATIC to Wei
      const amountInWei = ethers.utils.parseUnits(payload.budgetInMatic.toString(), 'ether')
      // Get the contract instance
      const adCampaignManager = await getContractInstance()
      //console.log("the contract instance === ", adCampaignManager);
      // Call the createAdCampaign function on the contract

      const tx = await adCampaignManager.createAdCampaign({ value: amountInWei })

      const receipt = await tx.wait()
      //const events = receipt.logs.map(log => adCampaignManager.interface.parseLog(log));
      const events = receipt.logs.map((log) => decodeLog(log)).filter((log) => log !== null)
      //console.log('Ad campaign created successfully')
      return { status: 'success', events }
    } catch (error) {
      console.error('Error creating ad campaign:', error)
      const errorData = { message: error.data.message }
      if (errorData.message.includes('insufficient funds for gas')) {
        errorData.message = 'insufficient funds for gas'
      }
      return { status: 'error', error: errorData }
    }
  } else {
    const errorMessage = 'Make sure the budget is greater than zero'
    console.error('Error claiming payment:', errorMessage)
    return { status: 'error', error: { message: errorMessage } }
  }
}
//only owner
export const claimPayment = async (payload = { campaignCode: '', currentAmounSpentInMatic: 0 }) => {
  if (payload.campaignCode.length > 1 && payload.currentAmounSpentInMatic > 0) {
    try {
      const adCampaignManager = await getContractInstance()
      if (
        customWeb3modal.getAddress() &&
        customWeb3modal.getAddress().toLowerCase() == import.meta.env.VITE_ADVERTISEMENT_COMPAIGN_CONTRACT_OWNER.toLowerCase()
      ) {
        const tx = await adCampaignManager.claimPayment(
          payload.campaignCode,
          ethers.utils.parseEther(payload.currentAmounSpentInMatic.toString())
        )
        const receipt = await tx.wait()
        const events = receipt.logs.map((log) => decodeLog(log)).filter((log) => log !== null)

        return { status: 'success', events }
      } else {
        const errorMessage = 'You must be connected as the contract owner to withdraw the advertisement amount spent'
        console.error('Error claiming payment:', errorMessage)
        return { status: 'error', error: { message: errorMessage } }
      }
    } catch (error) {
      console.error('Error claiming payment:', error)
      return { status: 'error', error: error.error ? error.error.data : error }
    }
  } else {
    const errorMessage = 'Make sure the amount claimed is greater than zero and the campaignCode is not empty string'
    console.error('Error claiming payment:', errorMessage)
    return { status: 'error', error: { message: errorMessage } }
  }
}

//only advertiser
export const requestAndApproveWithdrawal = async (payload = { campaignCode: '', currentAmounSpentInMatic: 0 }) => {
  if (payload.campaignCode.length > 1) {
    try {
      const adCampaignManager = await getContractInstance()
      const tx = await adCampaignManager.requestAndApproveWithdrawal(
        payload.campaignCode,
        ethers.utils.parseEther(payload.currentAmounSpentInMatic.toString())
      )
      const receipt = await tx.wait()
      const events = receipt.logs.map((log) => decodeLog(log)).filter((log) => log !== null)
      //console.log('Withdrawal requested and approved successfully')
      return { status: 'success', events }
    } catch (error) {
      console.error('Error claiming payment:', error)
      return { status: 'error', error: error.error ? error.error.data : error }
    }
  } else {
    const errorMessage = 'Make sure the campaignCode is not empty string'
    console.error('Error claiming payment:', errorMessage)
    return { status: 'error', error: { message: errorMessage } }
  }
}
//everyone
export const getAdCampaignByCode = async (payload = { campaignCode: '' }) => {
  if (payload.campaignCode.length > 1) {
    try {
      const adCampaignManager = await getContractInstance()
      const campaign = await adCampaignManager.getAdCampaignByCode(payload.campaignCode)
      //console.log('Ad campaign details:', campaign)
      return { status: 'success', data: campaign }
    } catch (error) {
      console.error('Error fetching ad campaign details:', error)
      return { status: 'error', error: error }
    }
  } else {
    const errorMessage = 'Make sure the campaignCode is not empty string'
    console.error('Error claiming payment:', errorMessage)
    return { status: 'error', error: { message: errorMessage } }
  }
}

// Function to decode log data
function decodeLog(log) {
  try {
    const eventFragment = iface.getEvent(log.topics[0])
    const decodedLog = iface.decodeEventLog(eventFragment, log.data, log.topics)
    // Convert BigNumber values to Ether
    const args = {}
    for (const [key, value] of Object.entries(decodedLog)) {
      if (ethers.BigNumber.isBigNumber(value)) {
        args[key] = ethers.utils.formatEther(value)
      } else {
        args[key] = value
      }
    }

    return {
      event_name: eventFragment.name,
      args: args
    }
  } catch (error) {
    console.log(`Log could not be decoded:`, error)
    return null
  }
}

//only contract owner
export const pauseContract = async () => {
  try {
    const adCampaignManager = await getContractInstance()
    const tx = await adCampaignManager.pause()
    const receipt = await tx.wait()
    const events = receipt.logs.map((log) => decodeLog(log)).filter((log) => log !== null)
    //console.log('Contract paused successfully')
    return { status: 'success', events }
  } catch (error) {
    console.error('Error pausing contract:', error)
    return { status: 'error', error: error }
  }
}
//only contract owner

export const unpauseContract = async () => {
  try {
    const adCampaignManager = await getContractInstance()
    const tx = await adCampaignManager.unpause()
    const receipt = await tx.wait()
    const events = receipt.logs.map((log) => decodeLog(log)).filter((log) => log !== null)
    //console.log('Contract unpaused successfully')
    return { status: 'success', events }
  } catch (error) {
    console.error('Error unpausing contract:', error)
    return { status: 'error', error: error }
  }
}

export const getEventsForCampaign = async (campaignCode) => {
  if (campaignCode.length > 1) {
    try {
      const adCampaignManager = await getContractInstance()

      // Get all logs for the relevant events
      const adCampaignCreatedLogs = await adCampaignManager.queryFilter(adCampaignManager.filters.AdCampaignCreated())
      const paymentReleasedLogs = await adCampaignManager.queryFilter(adCampaignManager.filters.PaymentReleased())
      const paymentReleasedOnWithdrawApprovalLogs = await adCampaignManager.queryFilter(
        adCampaignManager.filters.PaymentReleasedOnWithdrawApproval()
      )
      const budgetWithdrawnLogs = await adCampaignManager.queryFilter(adCampaignManager.filters.BudgetWithdrawn())

      // Decode the logs and filter by campaignCode
      const adCampaignCreatedEvents = adCampaignCreatedLogs
        .map((log) => decodeLog(log))
        .filter((event) => event !== null && event.args.campaignCode === campaignCode)

      const paymentReleasedEvents = paymentReleasedLogs
        .map((log) => decodeLog(log))
        .filter((event) => event !== null && event.args.campaignCode === campaignCode)

      const budgetWithdrawnEvents = budgetWithdrawnLogs
        .map((log) => decodeLog(log))
        .filter((event) => event !== null && event.args.campaignCode === campaignCode)

      const paymentReleasedOnWithdrawApprovalEvents = paymentReleasedOnWithdrawApprovalLogs
        .map((log) => decodeLog(log))
        .filter((event) => event !== null && event.args.campaignCode === campaignCode)

      const adCampaignCreatedData = adCampaignCreatedEvents.map((event) => ({
        campaignCode: event.args.campaignCode,
        amount: event.args.budget
      }))

      const paymentReleasedOnWithdrawApprovalData = paymentReleasedOnWithdrawApprovalEvents.map((event) => ({
        campaignCode: event.args.campaignCode,
        amount: event.args.paymentAmount
      }))

      const paymentReleasedData = paymentReleasedEvents.map((event) => ({
        campaignCode: event.args.campaignCode,
        amount: event.args.paymentAmount
      }))

      const budgetWithdrawnData = budgetWithdrawnEvents.map((event) => ({
        campaignCode: event.args.campaignCode,
        advertiser: event.args.advertiser,
        amount: event.args.amount
      }))

      // Create JSON object to return
      const result = {
        paymentReleasedEvents: paymentReleasedData,
        budgetWithdrawnEvents: budgetWithdrawnData,
        paymentReleasedOnWithdrawApprovalEvents: paymentReleasedOnWithdrawApprovalData,
        adCampaignCreatedEvents: adCampaignCreatedData
      }

      //console.log('Events retrieved successfully')
      return { status: 'success', events: result }
    } catch (error) {
      const errorMessage = error.error ? error.error.data : error
      return { status: 'error', error: { message: errorMessage } }
    }
  } else {
    const errorMessage = 'Make sure the campaignCode is not an empty string'
    console.error('Error retrieving events:', errorMessage)
    return { status: 'error', error: { message: errorMessage } }
  }
}
