<template>
  <div>
    <div class="q-pa-md">
      <q-table
        v-if="advertises.length > 0"
        flat
        bordered
        :filter="filter"
        title="Manage Advertisements"
        :rows="advertises"
        :columns="columns"
        row-key="name"
        :rows-per-page-options="[0]"
        style="margin: 10px 0px"
        virtual-scroll
        hide-bottom
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
              @click="changeActiveStatus(props.row, 'Active')"
              name="play_circle"
              size="18px"
              color="green-6"
              class="cursor-pointer"
            />
            <q-icon
              v-else-if="props.row.status==='Active'"
              @click="changeActiveStatus(props.row, 'Inactive')"
              name="pause_circle"
              size="18px"
              color="red-8"
              class="cursor-pointer"
            />
          </q-td>
        </template>
        <template #body-cell-action="props">
          <q-td :props="props">
            <q-icon
              v-if="userStore.isAdmin && !props.row.isApproved"
              name="done_outline"
              color="green"
              size="18px"
              @click="openApprovalDialog(props.row)"
              class="cursor-pointer q-mr-sm"
            />
            <q-icon
              v-show="props.row.status === 'Inactive'"
              name="edit"
              color="blue"
              size="18px"
              @click="$emit('openAdvertiseDialog', props.row)"
              class="cursor-pointer q-mr-sm"
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
            {{ calculateStatus(props.value) ? 'Active' : 'Inactive' }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAdvertiseStore, useErrorStore, useUserStore } from 'src/stores'
import { useRouter } from 'vue-router'
import { getCurrentDate, calculateEndDate } from 'src/utils/date'

const props = defineProps({
  advertises: {
    required: true,
    default: () => [],
    type: Array
  }
})

const router = useRouter()
const dialog = ref({ open: false, title: '', subTitle: '', type: '' })
const $q = useQuasar()
const advertiseStore = useAdvertiseStore()
const errorStore = useErrorStore()
const userStore = useUserStore()
const selectedAdvertise = ref({})
const filter = ref('')

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
