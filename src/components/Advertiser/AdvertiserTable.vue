<template>
  <div>
    <div class="q-pa-md">
      <q-table
        v-if="advertises.length > 0"
        flat
        bordered
        virtual-scroll
        hide-bottom
        title="Manage Advertisements"
        row-key="name"
        style="margin: 10px 0px"
        :filter="filter"
        :rows="advertises"
        :columns="columns"
        :rows-per-page-options="[0]"
        :loading="advertiseStore.isLoading"
      >
        <template v-slot:top-right>
          <q-input debounce="300" dense placeholder="Search" v-model="filter">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template #body-cell-published="props">
          <q-td :props="props">
            <q-icon v-if="!props.row.isApproved" name="schedule" size="18px" color="blue" />
            <q-icon
              v-else-if="props.value === 'Inactive'"
              name="play_circle"
              size="18px"
              color="green-6"
              class="cursor-pointer"
              @click="changeActiveStatus(props.row, 'Active')"
            />
            <q-icon
              v-else-if="props.row.status === 'Active'"
              name="pause_circle"
              size="18px"
              color="red-8"
              class="cursor-pointer"
              @click="changeActiveStatus(props.row, 'Inactive')"
            />
          </q-td>
        </template>
        <template #body-cell-action="props">
          <q-td :props="props">
            <q-icon
              v-if="userStore.getUser.role === 'Admin' && props.row.campaignCode?.length > 5 && props.row.status == 'Active'"
              flat
              color="green"
              name="payment"
              size="18px"
              label=""
              class="q-mr-sm"
              :disable="userStore.getUser.role !== 'Admin'"
              @click="onwithdrawAmountSpentDialog(props.row)"
            >
              <q-tooltip class="positive" :offset="[10, 10]">withdraw amount spent!</q-tooltip>
            </q-icon>
            <q-icon
              v-if="userStore.getUser.email == props.row.author.email && props.row.campaignCode?.length > 5 && props.row.status == 'Active'"
              flat
              color="primary"
              name="free_cancellation"
              size="18px"
              label=""
              class="q-mr-sm"
              :disable="userStore.getUser.role !== 'Advertiser' && userStore.getUser.email != props.row.author.email"
              @click="onWithdrawRemainingBudgetDialog(props.row)"
            >
              <q-tooltip class="positive" :offset="[10, 10]">withdraw remaining budget!</q-tooltip>
            </q-icon>
            <q-icon
              v-if="props.row.campaignCode?.length > 5"
              flat
              color="dark"
              name="receipt_long"
              size="18px"
              label=""
              class="q-mr-sm"
              @click="_getEventsForCampaign(props.row)"
            >
              <q-tooltip class="positive" :offset="[10, 10]">view events!</q-tooltip>
            </q-icon>
            <q-icon
              v-if="userStore.isAdmin && !props.row.isApproved"
              name="done_outline"
              color="green"
              size="18px"
              class="cursor-pointer q-mr-sm"
              @click="openApprovalDialog(props.row)"
            />
            <q-icon
              v-show="props.row.status === 'Inactive'"
              name="edit"
              color="blue"
              size="18px"
              class="cursor-pointer q-mr-sm"
              @click="$emit('openAdvertiseDialog', props.row)"
            />
            <q-icon name="delete" color="red" size="18px" @click="openDeleteDialog(props.row.id, props.row.type)" class="cursor-pointer" />
          </q-td>
        </template>
        <template #body-cell-durations="props">
          <q-td>
            {{ props.row.status === 'Inactive' ? props.row.duration : computedDuration(props.row.endDate) }} day's
            <q-tooltip>{{ props.row.publishDate }} to {{ props.row.endDate }}</q-tooltip>
          </q-td>
        </template>
        <template #body-cell-status="props">
          <q-td>
            {{ props.row.status }}
          </q-td>
        </template>
        <template #body-cell-content="props">
          <q-td @click="goToUrl(props.row.id)" class="cursor-pointer">
            {{ props.row.content?.length > 30 ? props.row.content.substring(0, 30) + '...' : props.row.content }}
          </q-td>
        </template>
        <template #body-cell-name="props">
          <q-td @click="goToUrl(props.row.id)" class="cursor-pointer">
            {{ props.row.title?.length > 30 ? props.row.title.substring(0, 30) + '...' : props.row.title }}
          </q-td>
        </template>
      </q-table>
      <h4 v-else class="text-center">Add advertises to view and manage them</h4>
    </div>
    <q-dialog v-model="dialog.open">
      <q-card style="min-width: 20rem; max-width: 30rem">
        <q-card-section class="bg-primary text-white q-pa-sm">
          <div class="text-h6">{{ dialog.title }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none bg-white q-py-lg text-center">
          <div class="text-subtitle1 wrap">{{ dialog.subTitle }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <template v-if="dialog.type === 'ChangePublishDate'">
            <q-btn flat label="Yes" color="primary" v-close-popup @click="changePublishDate" />
            <q-btn flat label="No" color="primary" v-close-popup @click="onDeselect" />
          </template>
          <template v-else-if="dialog.type === 'DeleteCampaign'">
            <q-btn flat label="Yes" color="primary" v-close-popup @click="onDeleteAdvertise" />
            <q-btn flat label="No" color="primary" v-close-popup @click="onDeselect" />
          </template>
          <template v-else-if="dialog.type === 'ApproveCampaign'">
            <q-btn flat label="Yes" color="primary" v-close-popup @click="onApproveAdvertise" />
            <q-btn flat label="No" color="primary" v-close-popup @click="onDeselect" />
          </template>
          <template v-else>
            <q-btn flat label="Ok" color="primary" v-close-popup @click="onDeselect" />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="withdrawAmountSpentDialog.show">
      <q-card>
        <q-card-section class="q-pb-none">
          <h6 class="q-my-sm">Withdraw Amount Spent : {{ withdrawAmountSpentDialog.currentAmountSpent }}</h6>
        </q-card-section>
        <q-card-section>Are you sure you want to withdraw it ?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Confirm"
            color="negative"
            @click="_claimPayment(withdrawAmountSpentDialog.advertise, withdrawAmountSpentDialog.currentAmountSpent)"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="withdrawRemainingBudgetDialog.show">
      <q-card>
        <q-card-section class="q-pb-none">
          <h6 class="q-my-sm">Withdraw Remaining Budget : {{ withdrawRemainingBudgetDialog.remainingBudget }}</h6>
        </q-card-section>
        <q-card-section>Are you sure you want to withdraw it ?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            data-test="delete-button"
            flat
            label="Confirm"
            color="negative"
            @click="_withdrawRemainingBudget(withdrawRemainingBudgetDialog.advertise, withdrawRemainingBudgetDialog.currentAmounSpent)"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="advertismentPaymentEventsDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="col">Campaign Events</div>
          <q-btn icon="close" flat round dense @click="advertismentPaymentEventsDialog.show = false" />
        </q-card-section>
        <q-card-section>
          <q-table :rows="eventRows" :columns="eventColumns" row-key="index" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAdvertiseStore, useErrorStore, useUserStore } from 'src/stores'
import { useRouter } from 'vue-router'
import { getCurrentDate, calculateEndDate } from 'src/utils/date'
import { claimPayment, getAdCampaignByCode, requestAndApproveWithdrawal, getEventsForCampaign } from 'app/src/web3/adCampaignManager'

const props = defineProps({
  advertises: {
    required: true,
    default: () => [],
    type: Array
  }
})

const router = useRouter()
const dialog = ref({ open: false, title: '', subTitle: '', type: '' })
const withdrawAmountSpentDialog = ref({})
const withdrawRemainingBudgetDialog = ref({})
const advertismentPaymentEventsDialog = ref({ show: false })
const $q = useQuasar()
const advertiseStore = useAdvertiseStore()
const errorStore = useErrorStore()
const userStore = useUserStore()
const selectedAdvertise = ref({})
const filter = ref('')

const eventRows = ref([])
const eventColumns = ref([
  { name: 'eventType', align: 'left', label: 'Event Type', field: 'eventType' },
  { name: 'amount', align: 'right', label: 'Amount', field: 'amount', format: (val) => `${val} MATIC` }
])

async function calculateAmountSpent(advertise) {
  return (
    import.meta.env.VITE_ADVERTISE_CLICK_RATE * advertise.clicks + import.meta.env.VITE_ADVERTISE_IMPRESSION_RATE * advertise.impressions
  )
}

async function _getEventsForCampaign(advertise) {
  if (advertise?.campaignCode) {
    $q.loading.show()
    const result = await getEventsForCampaign(advertise.campaignCode)

    if (result.status.includes('success')) {
      $q.notify({ message: 'events retreived successfully ', type: 'positive' })
      // Combine events into a single array with eventType field

      const adCampaignCreatedEvents = result.events.adCampaignCreatedEvents.map((event) => ({
        ...event,
        eventType: 'Campaign Created'
      }))

      const paymentReleasedEvents = result.events.paymentReleasedEvents.map((event) => ({
        ...event,
        eventType: 'Payment Released'
      }))

      const budgetWithdrawnEvents = result.events.budgetWithdrawnEvents.map((event) => ({
        ...event,
        eventType: 'Remaining Budget Withdrawn'
      }))

      const paymentReleasedOnWithdrawApprovalEvents = result.events.paymentReleasedOnWithdrawApprovalEvents.map((event) => ({
        ...event,
        eventType: 'Payment Released on Withdraw Approval'
      }))

      eventRows.value = [
        ...adCampaignCreatedEvents,
        ...paymentReleasedEvents,
        ...budgetWithdrawnEvents,
        ...paymentReleasedOnWithdrawApprovalEvents
      ]
      //let's change the advertise status.
      advertismentPaymentEventsDialog.value.show = true
      console.log('the result ======= ', result)
      console.log('the event rows=== ', this.eventRows.value)
    } else {
      $q.notify({ message: result?.error?.message, type: 'negative' })
    }
  } else {
    $q.notify({ message: 'No campaign code associated', type: 'negative' })
  }
  $q.loading.hide()
}

async function onWithdrawRemainingBudgetDialog(advertise) {
  if (advertise?.campaignCode) {
    $q.loading.show()
    const currentAmountSpent = await calculateAmountSpent(advertise)
    const remainingBudget = advertise.budget - currentAmountSpent < 0 ? 0 : advertise.budget - currentAmountSpent
    withdrawRemainingBudgetDialog.value.advertise = advertise
    withdrawRemainingBudgetDialog.value.currentAmounSpent = currentAmountSpent
    withdrawRemainingBudgetDialog.value.remainingBudget = remainingBudget
    withdrawRemainingBudgetDialog.value.show = true
  } else {
    $q.notify({ message: 'No campaign code associated', type: 'negative' })
  }
  $q.loading.hide()
}

async function onwithdrawAmountSpentDialog(advertise) {
  if (advertise?.campaignCode) {
    $q.loading.show()
    const currentAmountSpent = await calculateAmountSpent(advertise)
    if (currentAmountSpent > 0) {
      withdrawAmountSpentDialog.value.advertise = advertise
      withdrawAmountSpentDialog.value.currentAmountSpent = currentAmountSpent
      withdrawAmountSpentDialog.value.show = true
    } else {
      $q.notify({ message: 'The curent balance to claim should be greater than zero' })
    }
  } else {
    $q.notify({ message: 'No campaign code associated', type: 'negative' })
  }
  $q.loading.hide()
}
async function _claimPayment(advertise, currentAmountSpent) {
  $q.loading.show()
  const result = await claimPayment({ campaignCode: advertise.campaignCode, currentAmounSpentInMatic: currentAmountSpent })
  if (result.status.includes('success')) {
    console.log('the result claimPayment result ====', result)
    $q.notify({ message: 'campaign payment claimed successfully ', type: 'positive' })
    //let's change the advertise status.
    if (currentAmountSpent >= advertise.budget) {
      await _completeAdvertise(advertise)
    }
  } else {
    $q.notify({ message: result?.error?.message, type: 'negative' })
  }
  $q.loading.hide()
}

async function _completeAdvertise(advertise) {
  advertise.status = 'Complete'
  advertiseStore
    .editAdvertise(advertise)
    .then(() => $q.notify({ type: 'info', message: 'Advertise status Changed to complete ' }))
    .catch((error) => {
      console.log(error)
      errorStore.throwError(error, 'Advertise edit failed')
    })
}
async function _withdrawRemainingBudget(advertise, currentAmounSpent) {
  $q.loading.show()
  const result = await requestAndApproveWithdrawal({ campaignCode: advertise.campaignCode, currentAmounSpentInMatic: currentAmounSpent })
  if (result.status.includes('success')) {
    console.log('the result claimPayment result ====', result)
    $q.notify({ message: 'remaing budget withdrawn successfully ', type: 'positive' })
    //let's change the advertise status
    await _completeAdvertise(advertise)
  } else {
    $q.notify({ message: result?.error?.message, type: 'negative' })
  }
  $q.loading.hide()
}

function goToUrl(id, type) {
  router.push('/campaign/' + id)
}
onMounted(() => {
  advertiseStore.fetchAdvertises()
})

function openDeleteDialog(id, type) {
  dialog.value.open = true
  dialog.value.title = 'Delete campaign'
  dialog.value.subTitle = 'Are you sure you want to delete this campaign'
  dialog.value.type = 'DeleteCampaign'
  selectedAdvertise.value.id = id
  selectedAdvertise.value.type = type
}

function openApprovalDialog(advertise, approve = true) {
  dialog.value.open = true
  dialog.value.title = 'Approval'
  dialog.value.subTitle = 'Are you sure you want to approve this campaign'
  dialog.value.type = 'ApproveCampaign'
  selectedAdvertise.value = { ...advertise }
  selectedAdvertise.value.isApproved = approve
}
function changePublishDate() {
  const date = getCurrentDate()
  selectedAdvertise.value.publishDate = date
  selectedAdvertise.value.endDate = calculateEndDate(date, selectedAdvertise.value.duration)
  advertiseStore
    .editAdvertise(selectedAdvertise.value)
    .then(() =>
      $q.notify({
        type: 'info',
        message: selectedAdvertise.value.status === 'Active' ? 'Advertise published successfully' : 'Advertise unpublished successfully'
      })
    )
    .catch((error) => {
      console.log(error)
      errorStore.throwError(error, 'Advertise edit failed')
    })
    .finally(() => {
      selectedAdvertise.value = {}
    })
}

function onDeleteAdvertise() {
  const id = selectedAdvertise.value?.id
  const type = selectedAdvertise.value?.type
  if (id && type) {
    advertiseStore
      .deleteAdvertise(id, type === 'Banner')
      .then(() => $q.notify({ type: 'negative', message: 'Advertise successfully deleted' }))
      .catch((error) => {
        console.log(error)
        errorStore.throwError(error, 'Advertise deletion failed')
      })
      .finally(() => {
        selectedAdvertise.value = {}
      })
  }
  selectedAdvertise.value = {}
}
function onDeselect() {
  selectedAdvertise.value = {}
}

function onApproveAdvertise() {
  advertiseStore
    .editAdvertise(selectedAdvertise.value)
    .then(() => $q.notify({ type: 'info', message: 'Advertise Approved successfully' }))
    .catch((error) => {
      console.log(error)
      errorStore.throwError(error, 'Advertise Approval failed')
    })
    .finally(() => {
      selectedAdvertise.value = {}
    })
}
const columns = ref([
  {
    name: 'published',
    required: true,
    label: 'Published',
    align: 'left',
    field: 'status',
    style: 'width:100px'
  },
  {
    name: 'name',
    required: true,
    label: 'Advertiser Name',
    field: 'title'
  },
  {
    name: 'content',
    required: true,
    field: 'content',
    label: 'Advertiser Content'
  },
  {
    name: 'type',
    required: true,
    field: 'type',
    label: 'Advertiser Type'
  },
  {
    name: 'status',
    field: 'publishDate',
    label: 'Status'
  },
  {
    name: 'budget',
    field: 'budget',
    label: 'Budget',
    sortable: true
  },
  {
    name: 'clicks',
    field: 'clicks',
    label: 'Number of Click',
    sortable: true
  },
  {
    name: 'impression',
    field: 'impressions',
    label: 'Number of Impression',
    sortable: true
  },
  {
    name: 'durations',
    field: 'duration',
    label: 'Durations',
    sortable: true
  },

  {
    name: 'action',
    field: 'action',
    label: ''
  }
])
function changeActiveStatus(advertise, status) {
  if (!calculateStatus(advertise.publishDate) && status === 'Active') {
    dialog.value.open = true
    dialog.value.title = 'Publish Status'
    dialog.value.subTitle = 'Do you want to change your publish date and publish this campaign today?'
    dialog.value.type = 'ChangePublishDate'
    selectedAdvertise.value = { ...advertise }
    selectedAdvertise.value.status = status
    return
  }
  advertise.status = status
  advertiseStore
    .editAdvertise(advertise)
    .then(() =>
      $q.notify({ type: 'info', message: status === 'Active' ? 'Advertise published successfully' : 'Advertise unpublished successfully' })
    )
    .catch((error) => {
      console.log(error)
      errorStore.throwError(error, 'Advertise edit failed')
    })
}

function computedDuration(endDate) {
  const date1 = new Date()
  const date2 = new Date(endDate)
  date1.setHours(0, 0, 0, 0)
  date2.setHours(0, 0, 0, 0)
  let Difference_In_Time = date2.getTime() - date1.getTime()
  let Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24))
  return Difference_In_Days
}

function calculateStatus(date) {
  const currentDate = new Date()
  const publishDate = new Date(date)

  return publishDate <= currentDate
}
</script>

<style lang="scss" scoped></style>
