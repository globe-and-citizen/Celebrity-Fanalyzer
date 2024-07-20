<template>
  <q-card>
    <q-card-section class="q-pt-none">
      <q-form @submit="onSubmit">
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
import { useErrorStore, useUserStore } from 'src/stores'
import { ref, onMounted } from 'vue'
import { initiateSendEther, fetchMaticRate } from 'app/src/web3/transfers.js'
import { useCryptoTransactionStore } from 'app/src/stores/crypto-transactions'
const $q = useQuasar()
const errorStore = useErrorStore()
const userStore = useUserStore()
const cryptoTransactionStore = useCryptoTransactionStore()

const emit = defineEmits(['hideDialog', 'forward-update-entry'])

const props = defineProps({
  walletAddress: { type: String, required: true },
  entry: null,
  prompt: null
})

const _walletAddress = ref('')
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
  if (maticRate.value && usdAmount.value) {
    maticAmount.value = (usdAmount.value / maticRate.value).toFixed(6)
  }
}

async function onSubmit(event) {
  event.preventDefault()

  $q.loading.show()
  try {
    await initiateSendEther(props.walletAddress, maticAmount.value).then((transactionResult) => {
      if (transactionResult?.success === true) {
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
            }
            $q.notify({ type: 'info', message: 'payment successfull and transaction saved sucessfully' })
            emit('hideDialog')
            $q.loading.hide()
          })
          .catch((error) => {
            emit('hideDialog')

            errorStore.throwError(error, 'Error when saving the transaction')
            $q.loading.hide()
          })
      } else {
        var errorMessage = 'transaction failed'

        if (transactionResult?.error) {
          errorMessage = transactionResult?.error
        }
        $q.notify({ type: 'negative', message: errorMessage })

        $q.loading.hide()
        emit('hideDialog')
        errorStore.throwError(errorMessage, 'Error when saving the transaction')
      }
    })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'oups transaction failed' })
    errorStore.throwError(errorMessage, error)
    emit('hideDialog')
    $q.loading.hide()
  }
}
</script>
