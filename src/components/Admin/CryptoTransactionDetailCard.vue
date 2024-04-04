<template>
    <q-card>
    <q-card-section class="q-pt-none">
      <q-form>
        <q-input  
            hide-hint 
            label="Intiator" 
            v-model="cryptoTransactionDetail.initiatorEmail" 
            disable 
        />
        
        <q-input
          v-model="cryptoTransactionDetail.amount"
          label="Amount"
          mask="#.######"
          fill-mask="0"
          icon="account_balance_wallet"
          reverse-fill-mask
          readonly
        />
        <q-input  
            hide-hint 
            label="sender" 
            v-model="cryptoTransactionDetail.sender" 
            readonly 
        />
        <q-input  
            hide-hint 
            label="receiver" 
            v-model="cryptoTransactionDetail.receiver" 
            readonly 
        />
        <q-input  
            hide-hint 
            label="status" 
            v-model="cryptoTransactionDetail.status" 
            readonly 
        />
        <q-input  
            hide-hint 
            label="Hash" 
            v-model="cryptoTransactionDetail.transactionHash" 
            readonly 
        />
        <q-input  
        hide-hint 
        label="Check" 
        readonly
        v-model="cryptoTransactionDetail.checkLink"
        >
        
            <q-icon name="open_in_new" class="cursor-pointer" @click="openLink(cryptoTransactionDetail.checkLink)"></q-icon>
        
        </q-input>
        
        
      </q-form>
      <q-card-actions align="right">
        <q-btn color="primary"  label="Close" v-close-popup />
    </q-card-actions>
    </q-card-section>
  </q-card>
</template>
<script setup>

    import { useQuasar } from 'quasar'
    import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
    import { ref,onMounted } from 'vue'
    import { getTransactionDetails } from 'app/src/web3/transfers.js';
    import {useCryptoTransactionStore} from 'app/src/stores/crypto-transactions';
    
    const $q = useQuasar()
    const entryStore = useEntryStore()
    const errorStore = useErrorStore()
    const promptStore = usePromptStore()
    const userStore = useUserStore()
    const cryptoTransactionStore= useCryptoTransactionStore()

    const emit = defineEmits(['hideDialog'])
    const props= defineProps({
        cryptoTransaction: { required: true },
    })

    const cryptoTransactionDetail=ref({
        initiatorEmail:"",
        amount:0,
        sender:"",
        receiver:"",
        status:"",
        transactionHash:"",
        checkLink:""
    });
    const _initiator=ref("");
    
    const amount=ref(0);

    onMounted(async () => {
        $q.loading.show();
        await loadCrytptoTransactionDetail();
        $q.loading.hide();
    });
    
    function openLink(url) {
        window.open(url, '_blank').focus();
    }
   
    
    async function loadCrytptoTransactionDetail(){
        try {
            console.log("the received cryptoTransaction ", props.cryptoTransaction)
            cryptoTransactionDetail.value.transactionHash=props.cryptoTransaction?.tHash
            const initiator=userStore.getUserById(props.cryptoTransaction.initiator.id);
            
            const retreivedTransactionDetail= await getTransactionDetails(props.cryptoTransaction?.tHash)
            cryptoTransactionDetail.value.initiatorEmail=initiator?.email
            cryptoTransactionDetail.value.sender=retreivedTransactionDetail?.sender;
            cryptoTransactionDetail.value.receiver=retreivedTransactionDetail?.receiver;
            cryptoTransactionDetail.value.amount=retreivedTransactionDetail?.amount;
            cryptoTransactionDetail.value.status=retreivedTransactionDetail?.status
            cryptoTransactionDetail.value.checkLink=`https://sepolia.etherscan.io/tx/${props.cryptoTransaction?.tHash}`
        } catch (error) {
            console.error(error)
            $q.notify({ type: 'negative', message: ' the entry author should set wallet address '}); 
        }
    }

</script>