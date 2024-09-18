<template>
  <q-table
    flat
    :hide-bottom="!!rows.length"
    :class="{ 'entries-table': !userStore.isEditorOrAbove }"
    :columns="!!rows.length ? columns : []"
    :dense="userStore.isEditorOrAbove"
    :filter="filter"
    :bordered="!userStore.isEditorOrAbove"
    :hide-header="userStore.isEditorOrAbove"
    :pagination="pagination"
    :rows="rows"
    :title="!userStore.isEditorOrAbove ? 'Manage Entries' : ''"
    no-data-label="No entries found."
    :loading="entryStore.isLoading"
  >
    <template #body-cell-created="props">
      <td class="text-center relative-position">
        <img v-if="props.row.isWinner" src="/favicon-16x16.png" style="position: absolute; left: 3%" />
        {{ dayMonthYear(props.row.created) }}
      </td>
    </template>
    <template v-slot:body-cell-actions="props">
      <td class="text-right">
        <span v-if="_currentPrompt?.escrowId || props.row?.isWinner">
          <q-btn
            v-if="
              userStore.isEditorOrAbove &&
              props.row.isWinner !== true &&
              _currentPrompt?.isTreated !== true &&
              _currentPrompt?.hasWinner !== true
            "
            color="black"
            :disable="userStore.getUser.role !== 'Admin'"
            flat
            size="sm"
            icon="toggle_off"
            @click="onSelectWinnerDialog(props.row)"
          >
            <q-tooltip class="positive" :offset="[10, 10]">select winner!</q-tooltip>
          </q-btn>
          <q-btn
            v-if="props.row.isWinner === true && _currentPrompt?.isTreated !== true"
            color="dark"
            :disable="props.row.author.id == userStore.getUserId"
            flat
            icon="payment"
            size="sm"
            label=""
            @click="onProceedPaymentDialog(props.row)"
          >
            <q-tooltip class="positive" :offset="[10, 10]">claim payment!</q-tooltip>
          </q-btn>
          <q-btn
            v-if="props.row.isWinner === true && _currentPrompt?.isTreated === true"
            color="dark"
            :disable="userStore.getUser.role !== 'Admin'"
            flat
            icon="payment"
            size="sm"
            label=""
            @click="onProceedPaymentDialog(props.row)"
          >
            <q-tooltip class="positive" :offset="[10, 10]">view transaction detail!</q-tooltip>
          </q-btn>

          <span v-if="_currentPrompt?.hasWinner !== true">
            <span v-if="props.row.isWinner !== true">
              <q-btn
                v-if="userStore.isEditorOrAbove || userStore.getUser.uid === props.row.author.uid"
                color="warning"
                flat
                icon="edit"
                round
                size="sm"
                @click="onEditDialog(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
            </span>
            <span v-if="props.row.isWinner !== true">
              <q-btn
                v-if="userStore.isEditorOrAbove || userStore.getUser.uid === props.row.author.uid"
                color="negative"
                data-test="button-delete-entry"
                flat
                icon="delete"
                round
                size="sm"
                @click="onDeleteDialog(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </span>
          </span>
        </span>
        <span v-else>deposit funds first</span>
      </td>
    </template>
  </q-table>

  <q-dialog full-width position="bottom" v-model="entry.dialog">
    <EntryCard v-bind="entry" @hideDialog="entry = {}" @forward-update-entry="forwardHandleUpdateEntry" />
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
        <q-btn
          color="negative"
          data-test="confirm-delete-entry"
          flat
          label="Delete"
          @click="onDeleteEntry(deleteDialog.entry.id, deleteDialog.entry.prompt.id)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="selectWinnerDialog.show">
    <q-card>
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
    <q-card style="width: 400px; max-width: 60vw">
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Claim Payment Confirmation</h6>
      </q-card-section>
      <WalletPaymentCard
        :walletAddress="proceedPaymentDialog.walletAddress"
        :entry="proceedPaymentDialog.entry"
        :prompt="_currentPrompt"
        :depositedAmount="proceedPaymentDialog.depositedAmount"
        @forward-update-entry="forwardHandleUpdateEntry"
        @hideDialog="proceedPaymentDialog.show = false"
      />
    </q-card>
  </q-dialog>

  <q-dialog v-model="displayCrytptoTransactionDialog.show">
    <q-card style="width: 400px; max-width: 60vw">
      <q-card-section class="q-pb-none">
        <h6 class="q-my-sm">Transaction Detail</h6>
      </q-card-section>
      <CryptoTransactionDetailCard
        :cryptoTransaction="displayCrytptoTransactionDialog.cryptoTransaction"
        :detail="displayCrytptoTransactionDialog.detail"
      />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useEntryStore, useErrorStore, usePromptStore, useUserStore } from 'src/stores'
import { dayMonthYear, shortMonthDayTime } from 'src/utils/date'
import { ref, watchEffect } from 'vue'
import EntryCard from './EntryCard.vue'
import WalletPaymentCard from './WalletPaymentCard.vue'
import CryptoTransactionDetailCard from './CryptoTransactionDetailCard.vue'
import { useCryptoTransactionStore } from 'app/src/stores/crypto-transactions'
import { customWeb3modal } from 'app/src/web3/walletConnect'
import { setRecipient, getEventsForEscrow } from 'app/src/web3/escrow'

const props = defineProps({
  filter: { type: String, required: false, default: '' },
  rows: { type: Array, required: true, default: () => [] },
  currentPrompt: { type: Object },
  loadedEntries: { type: Array, default: () => [] }
})

const _currentPrompt = ref({})

watchEffect(() => {
  _currentPrompt.value = props.currentPrompt
})

// Emit event to parent
const emit = defineEmits(['update-entry', 'delete-entry'])
const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const userStore = useUserStore()
const cryptoTransactions = useCryptoTransactionStore()

const columns = [
  { name: 'created', align: 'center', label: 'Created', field: (row) => shortMonthDayTime(row.created), sortable: true },
  { name: 'author', align: 'center', label: 'Author', field: (row) => row.author?.displayName },
  { name: 'title', align: 'left', label: 'Title', field: 'title', sortable: true },
  { name: 'actions', field: 'actions' }
]

const deleteDialog = ref({})
const entry = ref({})
const selectWinnerDialog = ref({})
const selectWinnerMessage = ref('')
const selectWinnerTitle = ref('')
const proceedPaymentDialog = ref({})
const displayCrytptoTransactionDialog = ref({})
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
  if (!_currentPrompt.value && props?.prompt?.id) {
    const fetchedPrompt = await promptStore.fetchPromptById(props.prompt.id)
    _currentPrompt.value = Array.isArray(fetchedPrompt) && fetchedPrompt.length > 0 ? fetchedPrompt[0] : null
  }
  if (_currentPrompt.value) {
    $q.loading.show()
    if (!customWeb3modal.getAddress()) {
      $q.notify({ type: 'negative', message: ' please connect your wallet ' })
      customWeb3modal.open()
      $q.loading.hide()
    } else {
      //let's check if the entry already have valid payment..
      const cryptoTransactionExist = await cryptoTransactions.getCryptoTransactionsByEntry(props.id)
      if (cryptoTransactionExist.length > 0) {
        const escrowEvents = await getEventsForEscrow({ escrowId: _currentPrompt.value.escrowId })

        if (escrowEvents?.status?.includes('success')) {
          displayCrytptoTransactionDialog.value.detail = {
            amount: escrowEvents?.events?.releaseEvents[0]?.args.amount,
            recipient: escrowEvents?.events?.releaseEvents[0]?.args.recipient
          }
        } else {
          displayCrytptoTransactionDialog.value.detail = {
            amount: '0',
            recipient: ''
          }
        }
        displayCrytptoTransactionDialog.value.cryptoTransaction = cryptoTransactionExist[0]
        displayCrytptoTransactionDialog.value.show = true
      } else {
        if (!props.author.walletAddress) {
          $q.notify({ type: 'negative', message: ' the entry author should set wallet address ' })
        } else {
          const escrowEvents = await getEventsForEscrow({ escrowId: _currentPrompt.value.escrowId })

          if (escrowEvents?.status?.includes('success')) {
            proceedPaymentDialog.value.depositedAmount = escrowEvents?.events?.depositEvents[0]?.args.amount
            proceedPaymentDialog.value.show = true
            proceedPaymentDialog.value.walletAddress = escrowEvents?.events?.recipientSetEvents[0]?.args.recipient
            proceedPaymentDialog.value.entry = props
          }
          $q.loading.hide()
        }
      }
    }
  } else {
    $q.notify({ type: 'negative', message: " oups can't find the related entry prompt" })
  }
}

function onSelectWinnerDialog(props) {
  // Toggle the isWinner state

  const isWinner = props.isWinner !== true
  // Dynamically set the selectWinnerMessage and selectWinnerTitle based on isWinner
  selectWinnerMessage.value =
    isWinner === true
      ? `Are sure you want to select the entry <b>${props.title}</b> as competition winner ?`
      : `Are sure you want to deselect the entry ${props.title} </b> ?`
  selectWinnerTitle.value = isWinner === true ? 'Select Winner' : 'Deselect winner'
  const promptHasWinner = _currentPrompt.value.hasWinner === true
  //let's check if the corresponding promt already have a winner selected
  if (_currentPrompt?.value.isTreated === true) {
    $q.notify({ type: 'negative', message: 'The corresponding prompt is already treated' })
  } else {
    if (isWinner === true && promptHasWinner === true) {
      $q.notify({ type: 'negative', message: 'The corresponding prompt already has a winner ' })
    } else {
      const payload = { ...props }
      selectWinnerDialog.value.show = true
      selectWinnerDialog.value.entry = payload
    }
  }
}

function forwardHandleUpdateEntry(payload) {
  emit('update-entry', payload)
}

function onDeleteEntry(entryId, promptId) {
  entryStore
    .deleteEntry(entryId)
    .then(() => {
      if (!userStore.isEditorOrAbove) {
        entryStore.fetchUserRelatedEntries(userStore.getUserId)
      } else if (userStore.isEditorOrAbove) {
        emit('delete-entry', entryId, promptId)
      }
    })
    .then(() => $q.notify({ type: 'positive', message: 'Entry deleted' }))
    .catch((error) => {
      $q.notify({ type: 'negative', message: 'Error deleting entry' })
      errorStore.throwError(error, 'Error deleting entry')
    })
  deleteDialog.value.show = false
}

async function onSelectWinner(entry) {
  $q.loading.show()
  const isWinner = entry.isWinner !== true
  const payload = { entry: entry, isWinner: isWinner }
  //let's first check if the prompt don't already have selected entry
  if (!customWeb3modal.getAddress()) {
    $q.notify({ type: 'negative', message: ' please connect your wallet ' })
    customWeb3modal.open()
    $q.loading.hide()
    selectWinnerDialog.value.show = false
  } else {
    if (entry?.author?.walletAddress) {
      const result = await setRecipient({ escrowId: _currentPrompt.value.escrowId, recipient: entry?.author?.walletAddress })
      if (result?.status?.includes('success')) {
        entryStore
          .dataUpdateEntry(payload)
          .then(async (response) => {
            const { _entry, _prompt } = response
            if (_entry && _prompt) {
              emit('update-entry', { _entry, _prompt })
            }
            $q.notify({ type: 'positive', message: 'winner selected' })
            $q.loading.hide()
          })
          .catch((error) => {
            errorStore.throwError(error, 'Error selecting winner')
            $q.loading.hide()
          })
          .finally(() => {
            selectWinnerDialog.value.show = false
          })

        selectWinnerDialog.value.show = false
      } else {
        $q.notify({ type: 'negative', message: 'oups winner selection failed ' })
        $q.loading.hide()
        selectWinnerDialog.value.show = false
      }
    } else {
      $q.notify({ type: 'negative', message: ' the entry author should set a wallet address ' })
      $q.loading.hide()
      selectWinnerDialog.value.show = false
    }
  }
}
</script>
<style scoped>
.entries-table {
  margin: 1rem 1rem 0 1rem;
}
</style>
