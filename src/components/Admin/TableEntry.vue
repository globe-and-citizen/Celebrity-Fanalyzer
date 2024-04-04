<template>
  <q-spinner v-if="entryStore.isLoading" color="primary" size="2em" class="block q-mx-auto q-my-md" />
  <q-table v-else :columns="columns" dense flat :filter="filter" hide-bottom hide-header :pagination="pagination" :rows="rows">
    <template v-slot:body-cell-actions="props">
      <td class="text-right">
        <q-btn
          v-if=" 
          props.row.isWinner !=true
          "
          color="black"
          :disable="userStore.getUser.role !== 'Admin' "
          flat          
          size="sm"
          icon="toggle_off"
          @click="onSelectWinnerDialog(props.row)"
        >
        <q-tooltip class="positive" :offset="[10, 10]">
          select winner!
        </q-tooltip>
        </q-btn>
        <q-btn
          v-if="
          props.row.isWinner ==true"
          color="dark"
          :disable="userStore.getUser.role !== 'Admin'"
          flat
          icon="payment"
          size="sm"
          label=""
          @click="onProceedPaymentDialog(props.row)"
        >
        <q-tooltip class="positive" :offset="[10, 10]">
          proceed payment!
        </q-tooltip>
        </q-btn>
        <q-btn
          v-if="
          
          props.row.isWinner ==true"
          color="positive"
          :disable="userStore.getUser.role !== 'Admin'"
          flat
          icon="toggle_on"
          size="sm"
          label=""
          @click="onSelectWinnerDialog(props.row)"
        >
        <q-tooltip class="negative" :offset="[10, 10]">
          unselect winner!
        </q-tooltip>
        </q-btn>      
        <q-btn
          color="warning"
          :disable="userStore.getUser.role === 'Writer' && userStore.getUser.uid !== props.row.author.uid"
          flat
          icon="edit"
          round
          size="sm"
          @click="onEditDialog(props.row)"
        />
        <q-btn
          color="negative"
          :disable="userStore.getUser.role === 'Writer' && userStore.getUser.uid !== props.row.author.uid"
          data-test="button-delete-entry"
          flat
          icon="delete"
          round
          size="sm"
          @click="onDeleteDialog(props.row)"
        />
      </td>
    </template>
  </q-table>

  <q-dialog full-width position="bottom" v-model="entry.dialog">
    <EntryCard v-bind="entry" @hideDialog="entry = {}" />
  </q-dialog>

  <q-dialog v-model="deleteDialog.show">
    <q-card>
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Delete Entry?</h6>
      </q-card-section>
      <q-card-section>
        <span class="q-ml-sm">
          Are you sure you want to delete the entry:
          <b>{{ deleteDialog.entry.title }}</b>
          ?
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" flat label="Cancel" v-close-popup />
        <q-btn color="negative" data-test="confirm-delete-entry" flat label="Delete" @click="onDeleteEntry(deleteDialog.entry.id)" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="selectWinnerDialog.show">
    <q-card >
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm" v-html="selectWinnerTitle"></h6>
      </q-card-section>
      <q-card-section>
          <p v-html="selectWinnerMessage"></p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" flat label="Cancel" v-close-popup />
        <q-btn color="green" data-test="confirm-delete-entry" flat label="Confirm" @click="onSelectWinner(selectWinnerDialog.entry)" />
      </q-card-actions>
    </q-card>
  </q-dialog>


  <q-dialog v-model="proceedPaymentDialog.show">
    <q-card style="width: 400px; max-width: 60vw;">
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Payment Confirmation</h6>
      </q-card-section>
      <WalletPaymentCard :walletAddress="proceedPaymentDialog.walletAddress" :entry="proceedPaymentDialog.entry"/>
    </q-card>
  </q-dialog>

  <q-dialog v-model="displayCrytptoTransactionDialog.show">
    <q-card style="width: 400px; max-width: 60vw;">
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Transaction Detail</h6>
      </q-card-section>
      <CryptoTransactionDetailCard :cryptoTransaction="displayCrytptoTransactionDialog.cryptoTransaction" />
    </q-card>
    
  </q-dialog>

</template>

<script setup>
import { useQuasar } from 'quasar'
import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { ref,onMounted } from 'vue'
import EntryCard from './EntryCard.vue'
import WalletPaymentCard from './WalletPaymentCard.vue'
import CryptoTransactionDetailCard from './CryptoTransactionDetailCard.vue'
import { useCryptoTransactionStore } from 'app/src/stores/crypto-transactions';

const props= defineProps({
  filter: { type: String, required: false, default: '' },
  rows: { type: Array, required: true, default: () => [] }
})


onMounted(async() => {
  
});


const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const userStore = useUserStore()
const cryptoTransactions=useCryptoTransactionStore()

const columns = [
  { name: 'created', align: 'center', label: 'Created', field: (row) => shortMonthDayTime(row.created) },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author?.displayName },
  { name: 'title', align: 'left', label: 'Title', field: 'title' },
  { name: 'actions', field: 'actions' }
]

const deleteDialog = ref({})
const entry = ref({})
const selectWinnerDialog=ref({})
const selectWinnerMessage=ref("")
const selectWinnerTitle=ref("")
const proceedPaymentDialog=ref({})
const displayCrytptoTransactionDialog=ref({})
const pagination = { sortBy: 'date', descending: true, rowsPerPage: 0 }

function onEditDialog(props) {
  entry.value = props
  entry.value.prompt = promptStore.getPrompts?.find((prompt) => prompt.id === props.id.split('T')[0])
  entry.value.dialog = true
}

function onDeleteDialog(entry) {
  deleteDialog.value.show = true
  deleteDialog.value.entry = entry
}

async function onProceedPaymentDialog(props) {
  //console.log("the entry author=== ",props.author);
  //let's check if the entry already have valid payment..
  const cryptoTransactionExist=await  cryptoTransactions.getCryptoTransactionsByEntry(props.id)
  console.log("the corresponding transactions ===== ", cryptoTransactionExist)
  if(cryptoTransactionExist.length>0){
    displayCrytptoTransactionDialog.value.cryptoTransaction=cryptoTransactionExist[0];
    displayCrytptoTransactionDialog.value.show=true;
  }else{
    if(!props.author.walletAddress)
    {
      $q.notify({ type: 'negative', message: ' the entry author should set wallet address '}); 
    }
    else{
      proceedPaymentDialog.value.show = true
      proceedPaymentDialog.value.walletAddress = props.author.walletAddress
      proceedPaymentDialog.value.entry=props
    }
  }
}

function onSelectWinnerDialog(props) {
  const currentPrompt=promptStore.getPrompts?.find((prompt) => prompt.id === props.id.split('T')[0]);
  
  // Toggle the isWinner state
  const isWinner=props.isWinner==true?false:true
  // Dynamically set the selectWinnerMessage and selectWinnerTitle based on isWinner
  selectWinnerMessage.value=
    isWinner==true?`Are sure you want to select the entry <b>${props.title}</b> as competition winner ?`:
    `Are sure you want to deselect the entry ${props.title} </b> ?`
  selectWinnerTitle.value=isWinner==true?"Select Winner": "Deselect winner"
  const promptHasWinner=currentPrompt.hasWinner==true?true:false
  const promptIsTreated=currentPrompt.isTreated==true?true:false
  //let's check if the corresponding promt already have a winner selected
  if(promptIsTreated== true){
    $q.notify({ type: 'negative', message: 'the corresponding prompt is already treated' });
  }else{
    if(isWinner==true &&promptHasWinner==true ){
      $q.notify({ type: 'negative', message: 'the corresponding prompt alredy have a winner ' });
    }else
    {
      let payload={...props}
      selectWinnerDialog.value.show = true
      selectWinnerDialog.value.entry = payload
      //console.log("the payload ==== ", payload)
    }
  }
  
}



function onDeleteEntry(id) {
  entryStore
    .deleteEntry(id)
    .then(() => $q.notify({ type: 'negative', message: 'Entry deleted' }))
    .catch((error) => errorStore.throwError(error, 'Error deleting entry'))
  deleteDialog.value.show = false
}

function onSelectWinner(entry) {
  const isWinner=entry.isWinner==true?false:true
  const payload={entry:entry,isWinner:isWinner}
  //let's first check if the prompt don't already have selected entry
  entryStore
    .dataUpdateEntry(payload)
    .then(() => $q.notify({ type: 'positive', message: 'Succeed' }))
    .catch((error) => {
      console.log(error)
      errorStore.throwError(error, 'Error selcting winner')
    })
  
  selectWinnerDialog.value.show = false
}
</script>
