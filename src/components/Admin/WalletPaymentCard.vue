<template>
  <q-card>
    <q-card-section class="q-pt-none">
      <q-form @submit="onSubmit">
        <!-- <q-input hide-hint label="sender wallet address" maxlength="80" required v-model="userStore.getUser.walletAddress" disable /> -->
        <q-input hide-hint label="Winner wallet address" maxlength="80" required v-model="_walletAddress" disable />
        <q-input
          v-model="usdAmount"
          label="Price in USD"
          min="0"
          mask="#.##"
          fill-mask="0"
          reverse-fill-mask
          @update:model-value="convertToMatic()"
        />
        <!-- Displaying Corresponding Ether Amount-->
        <q-input data-text="ether-amount" v-model="maticAmount" label="Price in matic" readonly></q-input>
        <q-card-actions align="right">
          <q-btn color="primary" label="Cancel" v-close-popup />
          <q-btn label="proceed payment" :disable="!usdAmount" color="green" data-test="confirm-delete-entry" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { useQuasar } from 'quasar'
import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
import { ref, onMounted } from 'vue'
import { initiateSendEther, fetchMaticRate } from 'app/src/web3/transfers.js'
import { useCryptoTransactionStore } from 'app/src/stores/crypto-transactions'
const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const userStore = useUserStore()
const cryptoTransactionStore = useCryptoTransactionStore()

const emit = defineEmits(['hideDialog', 'forward-update-entry'])

const props = defineProps({
  walletAddress: { type: String, required: true },
  entry: null,
  prompt: null
})

const _walletAddress = ref('')
const amount = ref(0)
const usdAmount = ref(0)
const maticAmount = ref(0)
const maticRate = ref(0)

onMounted(async () => {
  _walletAddress.value = props.walletAddress
  const maticRateResult = await fetchMaticRate()
  if (maticRateResult?.success) {
    maticRate.value = maticRateResult.maticRate
  } else {
    $q.notify({ type: 'negative', message: 'Failed to fetch Matic rate' })
  }
})

function convertToMatic() {
  //console.log('convert to matic called');
  if (maticRate.value && usdAmount.value) {
    maticAmount.value = (usdAmount.value / maticRate.value).toFixed(6)
  }
}

// async function fetchMaticRate() {
//   try {
//     const maticRateApiLink = import.meta.env.VITE_MATIC_RATE_API_LINK
//     const response = await fetch(maticRateApiLink)
//     const data = await response.json()
//     //console.log('the data ===== ', data)
//     maticRate.value = data['matic-network'].usd
//     //console.log("the ether rate ====== ",maticRate.value);
//   } catch (error) {
//     console.error('Error fetching Matic rate:', error)
//     $q.notify({ type: 'negative', message: 'Failed to fetch Matic rate' })
//   }
// }

async function onSubmit(event) {
  //console.log('on submit called ========= ')
  event.preventDefault()

  $q.loading.show()
  try {
    await initiateSendEther(props.walletAddress, maticAmount.value).then((transactionResult) => {
      //console.log("the transaction result ====== ", transactionResult)
      if (transactionResult?.success == true) {
        const payload = {
          initiator: userStore.getUser,
          entry: props.entry,
          prompt: props.prompt,
          tHash: transactionResult.transactionId,
          status: transactionResult?.success,
          networkName: transactionResult.networkName,
          explorerUrl: transactionResult.explorerUrl
        }
        cryptoTransactionStore
          .addCryptoTransaction(payload)
          .then(async (response) => {
            const { _entry, _prompt } = response
            if (_entry && _prompt) {
              emit('forward-update-entry', { _entry, _prompt })
              //console.log('the updated enty ==== ', _entry)
            }
            $q.notify({ type: 'info', message: 'payment successfull and transaction saved sucessfully' })
            emit('hideDialog')
            $q.loading.hide()
          })
          .catch((error) => {
            emit('hideDialog')
            //console.log('error when saving transaction === ', error)
            errorStore.throwError(error, 'Error when saving the transaction')
            $q.loading.hide()
          })
      } else {
        //console.log("the error=====mmmmm========= ", transactionResult  )
        var errorMessage = 'transaction failed'
        //console.log('the transaction result ', transactionResult)
        if (transactionResult?.error) {
          errorMessage = transactionResult?.error
        }
        $q.notify({ type: 'negative', message: errorMessage })
        //console.log('error during payment  transaction ==== ', errorMessage)
        $q.loading.hide()
        emit('hideDialog')
        //errorStore.throwError(transactionResult?.error, 'Error when saving the transaction')
      }
    })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'oups transaction failed' })
    //console.log('the error ==== ', error)
    emit('hideDialog')
    $q.loading.hide()
  }
}
</script>
