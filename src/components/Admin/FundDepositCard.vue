<template>
  <q-card>
    <q-card-section class="q-pt-none">
      <q-form @submit="onSubmit">
        <!-- <q-input hide-hint label="Winner wallet address" maxlength="80" required v-model="_walletAddress" disable /> -->
        <q-input hide-hint label="Current connected wallet address" maxlength="80" required v-model="_walletAddress" disable />
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
          <q-btn label="deposit fund" :disable="!usdAmount" color="green" data-test="confirm-deposit-fund" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { useQuasar } from 'quasar'
import { useErrorStore, useUserStore } from 'src/stores'
import { ref, onMounted, computed } from 'vue'
import { initiateSendEther, fetchMaticRate } from 'app/src/web3/transfers.js'
import { useCryptoTransactionStore } from 'app/src/stores/crypto-transactions'
import { usePromptStore } from 'src/stores'
import { depositFunds } from 'app/src/web3/escrow'

const $q = useQuasar()
const errorStore = useErrorStore()
const userStore = useUserStore()
const cryptoTransactionStore = useCryptoTransactionStore()

const promptStore = usePromptStore()

const emit = defineEmits(['hideDialog', 'forward-update-entry'])

const props = defineProps({
  walletAddress: { type: String, required: true },
  prompt: { type: Object }
})

const _walletAddress = ref('')
const _prompt = ref(null)
const usdAmount = ref(0)
const maticAmount = ref(0)
const maticRate = ref(0)

onMounted(async () => {
  _walletAddress.value = props.walletAddress
  _prompt.value = props.prompt
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
    const result = await depositFunds({ amountInMatic: maticAmount.value })
    if (result?.status?.includes('success')) {
      if (_prompt?.value) {
        //save advertisement to database
        _prompt.value.escrowId = result.events[0].args.escrowId
        const payload = {
          promptId: _prompt.value.id,
          escrowId: result.events[0].args.escrowId
        }
        await promptStore
          .updateEscrowId(payload)
          .then(() => {
            $q.notify({ type: 'info', message: 'fund deposited sucessfully' })
          })
          .catch((error) => {
            errorStore.throwError(error, 'fund deposit failed on prompt edition')
          })
          .finally(() => {
            $q.loading.hide()
            emit('hideDialog')
          })
      } else {
        $q.notify({ type: 'negative', message: 'prompt should not be null' })
        emit('hideDialog')
      }
    } else {
      $q.notify({ message: result?.error?.message, type: 'negative' })
      $q.loading.hide()
      emit('hideDialog')
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'oups fund deposit failed' })
    errorStore.throwError(errorMessage, error)
    emit('hideDialog')
    $q.loading.hide()
  }
}
</script>
