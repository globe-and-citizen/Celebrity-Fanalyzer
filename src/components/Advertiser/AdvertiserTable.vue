<template>
  <div>
    <div class="q-pa-md">
      <q-table
        v-if="advertises.length > 0"
        flat
        bordered
        title="Manage Advertisements"
        :rows="advertises"
        :columns="columns"
        row-key="name"
        :rows-per-page-options="[0]"
        style="margin: 10px 0px"
        virtual-scroll
        hide-bottom
      >
        <template #body-cell-published="props">
          <q-td :props="props">
            <q-icon v-if="!props.row.isApproved" name="schedule" size="18px" />
            <q-icon
              v-else-if="props.value === 'Inactive'"
              @click="changeActiveStatus(props.row, 'Active')"
              name="play_circle"
              size="18px"
              color="green-6"
              class="cursor-pointer"
            />
            <q-icon
              v-else
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
            <q-icon v-if="userStore.isAdmin && !props.row.isApproved" name="done_outline" color="green" size="18px" @click="onApproveAdvertise(props.row)" class="cursor-pointer q-mr-sm" />
            <q-icon name="edit" color="blue" size="18px" @click="$emit('openAdvertiseDialog', props.row)" class="cursor-pointer q-mr-sm" />
            <q-icon name="delete" color="red" size="18px" @click="onDeleteAdvertise(props.row.id, props.row.type)" class="cursor-pointer" />
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
    <q-dialog v-model="openDialog">
      <q-card style="min-width: 20rem; max-width: 30rem">
        <q-card-section class="bg-primary text-white q-pa-sm">
          <div class="text-h6">Alert</div>
        </q-card-section>
        <q-card-section class="q-pt-none bg-white q-py-lg text-center">
          <div class="text-subtitle1 wrap">{{ alertMessage }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
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

const props = defineProps({
  advertises: {
    required: true,
    default: () => [],
    type: Array
  }
})

const router = useRouter()
const openDialog = ref(false)
const $q = useQuasar()
const advertiseStore = useAdvertiseStore()
const errorStore = useErrorStore()
const userStore = useUserStore()
const alertMessage = ref('')

function checkDurationStatus() {
  for (const advertise of props.advertises) {
    if (
      advertise.duration &&
      (advertise.duration < 7 || computedDuration(advertise.endDate) < 7) &&
      advertise.status === 'Active' &&
      userStore.isAdvertiser
    ) {
      alertMessage.value = 'Please extend the advertise duration to more than 7 days.'
      openDialog.value = true
    }
  }
}
function goToUrl(id, type) {
  router.push('/campaign/' + id)
}
onMounted(checkDurationStatus)

function onDeleteAdvertise(id, type) {
  advertiseStore
    .deleteAdvertise(id, type === 'Banner')
    .then(() => $q.notify({ type: 'negative', message: 'Advertise successfully deleted' }))
    .catch((error) => {
      console.log(error)
      errorStore.throwError(error, 'Advertise deletion failed')
    })
}

function onApproveAdvertise(advertise, approve=true) {
  advertise.isApproved=approve
  advertiseStore.editAdvertise(advertise)
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
    label: 'Budget'
  },
  {
    name: 'clicks',
    field: 'clicks',
    label: 'Number of Click'
  },
  {
    name: 'impression',
    field: 'impressions',
    label: 'Number of Impression'
  },
  {
    name: 'durations',
    field: 'duration',
    label: 'Durations'
  },
  {
    name: 'action',
    field: 'action',
    label: ''
  }
])
function changeActiveStatus(advertise, status) {
  if (!calculateStatus(advertise.publishDate) && status === 'Active') {
    alertMessage.value = 'Change your publish date'
    openDialog.value = true
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
