<template>
  <q-card>
    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="onSubmit()">
        <!-- <q-input hide-hint label="sender wallet address" maxlength="80" required v-model="userStore.getUser.walletAddress" disable /> -->
        <q-input hide-hint label="Winner wallet address" maxlength="80" required v-model="_walletAddress" disable />
        <q-input
          v-model="usdAmount"
          label="Price in USD"
          type="number"
          min="1"
          @update:model-value="convertToEther()"
         />
        <!-- Displaying Corresponding Ether Amount-->
        <q-input
        data-text="ether-amount"
        v-model="etherAmount"
        label="Price in ether"
        mask="#.######"
        fill-mask="0"
        reverse-fill-mask
        readonly
        >
        </q-input>
        <q-card-actions align="right">
          <q-btn color="primary" label="Cancel" v-close-popup />
          <q-btn label="proceed payment" :disable="!etherAmount" color="green" data-test="confirm-delete-entry" type="submit" v-close-popup />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { useQuasar } from 'quasar'
import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
import { ref, onMounted } from 'vue'
import { initiateSendEther } from 'app/src/web3/transfers.js'
import { useCryptoTransactionStore } from 'app/src/stores/crypto-transactions'
const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const userStore = useUserStore()
const cryptoTransactionStore = useCryptoTransactionStore()

const emit = defineEmits(['hideDialog'])

const props = defineProps({
  walletAddress: { type: String, required: true },
  entry: null
})


const _walletAddress = ref('')
const amount = ref(0)
const usdAmount= ref(0);
const etherAmount=ref(0);
const ethRate= ref(0);

onMounted(async() => {
  _walletAddress.value = props.walletAddress;
  await fetchEthRate();
})

function convertToEther() {
  console.log('convert to ether called');
  if (ethRate.value && usdAmount.value) {
    etherAmount.value = (usdAmount.value / ethRate.value).toFixed(6);
  }
}
async function fetchEthRate(){
  // console.log("the ether rate ========================== ");
  try{
    const response=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=USD');
    const data= await response.json();
    ethRate.value=data.ethereum.usd;
    // console.log("the ether rate ====== ",ethRate.value);
  } catch(error){
    console.error('Error fetching ETH rate', error);
    $q.notify({type:'negative', message:'failed to fetch ETH rate'})
  }
}
async function onSubmit() {
  $q.loading.show()
  await initiateSendEther(props.walletAddress, etherAmount.value)
    .then((transactionResult) => {
      if (transactionResult.success == true) {
        const payload = {
          initiator: userStore.getUser,
          entry: props.entry,
          tHash: transactionResult.transactionId,
          status: transactionResult.success
        }
        cryptoTransactionStore
          .addCryptoTransaction(payload)
          .then($q.notify({ type: 'info', message: 'payment successfull and transaction saved sucessfully' }))
          .catch((error) => {
            errorStore.throwError(error, 'Error when saving the transaction')
          })
      } else {
        //console.log("the error=====mmmmm========= ", transactionResult  )
        $q.notify({ type: 'negative', message: transactionResult.error})
        errorStore.throwError(transactionResult?.error, 'Error when saving the transaction')
      }

     
    })
    .catch((error) => errorStore.throwError(error, 'Error when sending ether'))
    .finally(() => $q.loading.hide())

  emit('hideDialog')
}
</script>
