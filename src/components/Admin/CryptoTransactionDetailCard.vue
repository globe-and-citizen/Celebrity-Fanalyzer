<template>
  <q-card>
    <q-card-section class="q-pt-none">
      <q-form>
        <q-input hide-hint label="Network" v-model="cryptoTransactionDetail.networkName" disable />
        <q-input hide-hint label="Intiator" v-model="cryptoTransactionDetail.initiatorEmail" disable />

        <q-input v-model="cryptoTransactionDetail.amount" label="Amount" icon="account_balance_wallet" reverse-fill-mask readonly />
        <q-input hide-hint label="receiver" v-model="cryptoTransactionDetail.receiver" readonly />
        <q-input hide-hint label="status" v-model="cryptoTransactionDetail.status" readonly />
        <q-input hide-hint label="Hash" v-model="cryptoTransactionDetail.transactionHash" readonly />
        <q-input hide-hint label="Check" readonly v-model="cryptoTransactionDetail.checkLink">
          <q-icon name="open_in_new" class="cursor-pointer" @click="openLink(cryptoTransactionDetail.checkLink)"></q-icon>
        </q-input>
      </q-form>
      <q-card-actions align="right">
        <q-btn color="primary" label="Close" v-close-popup />
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { useQuasar } from 'quasar'
import { useErrorStore, useUserStore } from 'src/stores'
import { ref, onMounted } from 'vue'
import { getTransactionDetails } from 'app/src/web3/transfers.js'
const $q = useQuasar()

const errorStore = useErrorStore()

const userStore = useUserStore()
const emit = defineEmits(['hideDialog'])
const props = defineProps({
  cryptoTransaction: { required: true },
  detail: { required: true }
})

const cryptoTransactionDetail = ref({
  initiatorEmail: '',
  amount: '',
  sender: '',
  receiver: '',
  status: '',
  transactionHash: '',
  networkName: '',
  checkLink: ''
})

onMounted(async () => {
  $q.loading.show()
  await loadCrytptoTransactionDetail()
  $q.loading.hide()
})

function openLink(url) {
  window.open(url, '_blank').focus()
}

async function loadCrytptoTransactionDetail() {
  try {
    cryptoTransactionDetail.value.transactionHash = props.cryptoTransaction?.tHash

    const retreivedTransactionDetail = await getTransactionDetails(props.cryptoTransaction?.tHash, props.cryptoTransaction?.networkName)
    cryptoTransactionDetail.value.initiatorEmail = props.detail?.depositor
    cryptoTransactionDetail.value.sender = retreivedTransactionDetail?.sender
    cryptoTransactionDetail.value.receiver = props.detail?.recipient
    cryptoTransactionDetail.value.amount = props.detail?.amount
    cryptoTransactionDetail.value.status = retreivedTransactionDetail?.status
    cryptoTransactionDetail.value.checkLink = props.cryptoTransaction?.explorerUrl + props.cryptoTransaction?.tHash
    cryptoTransactionDetail.value.networkName = props.cryptoTransaction?.networkName
  } catch (error) {
    errorStore.throwError(error, 'Error updating profile')
    $q.notify({ type: 'negative', message: ' the entry author should set wallet address ' })
  }
}
</script>
