<template>
    <q-card>
    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="onSubmit()">
        <q-input  hide-hint label="Winner wallet address" maxlength="80" required v-model="_walletAddress" disable />
        <q-input
          v-model="amount"
          label="Price in ether"
          mask="#.######"
          fill-mask="0"
          icon="account_balance_wallet"
          reverse-fill-mask
        >
        </q-input>
        <q-card-actions align="right">
            <q-btn  color="primary"  label="Cancel" v-close-popup  />
            <q-btn  label='proceed payment' :disable="!amount" color="green" data-test="confirm-delete-entry"  type="submit"  v-close-popup  />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<script setup>

    import { useQuasar } from 'quasar'
    import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
    import { ref,onMounted } from 'vue'
    import { initiateSendEther } from 'app/src/web3/transfers.js';
    import {useCryptoTransactionStore} from 'app/src/stores/crypto-transactions'
    const $q = useQuasar()
    const entryStore = useEntryStore()
    const errorStore = useErrorStore()
    const promptStore = usePromptStore()
    const userStore = useUserStore()
    const cryptoTransactionStore= useCryptoTransactionStore()

    const emit = defineEmits(['hideDialog'])
    const props= defineProps({
        walletAddress: { type: String, required: true },
        entry:null
    })

    const _walletAddress=ref("");
    const amount=ref(0);

    onMounted(() => {
        _walletAddress.value=props.walletAddress
    });

    
    async function onSubmit() {
        $q.loading.show();
        await 
        initiateSendEther(props.walletAddress,amount.value)
        .then(
            (transactionResult) =>{
                console.log("the received transaction result ==== ", transactionResult);
                if(transactionResult.success==true)
                {
                    const payload={
                        initiator:userStore.getUser,
                        entry:props.entry,
                        tHash:transactionResult.transactionId,
                        status:transactionResult.success
                    }
                    cryptoTransactionStore.addCryptoTransaction(payload)
                    .then(
                        $q.notify({ type: 'info', message: 'transaction saved sucessfully' })
                    )
                    .catch((error) => {
                        console.log("error ==== ", error)
                    
                        errorStore.throwError(error, 'Error when saving the transaction')
                    })
                }else{
                    $q.notify({ type: 'negative', message: 'transaction failed' })
                }
                
                $q.notify({ type: 'info', message: 'payment successfull' })
            } )
        .catch((error) => errorStore.throwError(error, 'Error when sending ether'))
        .finally(()=>$q.loading.hide())
        
        
        emit('hideDialog')
        
       
    }
    

</script>