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
        :loading="advertiseStore.isLoading"
        :rows-per-page-options="[0]"
      >
        <template v-slot:top-right>
          <q-input v-model="filter" debounce="300" dense placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template #body-cell-published="props">
          <q-td :props="props">
            <q-icon v-if="!props.row.isApproved" name="schedule" size="18px" color="blue" />
            <q-icon
              v-else-if="props.row.status==='Budget Crossed'"
              name="close"
              size="18px"
              color="primary"
            >
              <q-tooltip>Budget crossed</q-tooltip>
            </q-icon>
            <q-icon v-else-if="props.row.status==='Complete'" name="task_alt" size="18px" color="green">
              <q-tooltip>Complete</q-tooltip>
            </q-icon>
            <q-icon
              v-else-if="props.value === 'Inactive'"
              name="play_circle"
              size="18px"
              color="green-6"
              class="cursor-pointer"
              @click="changeActiveStatus(props.row, 'Active')"
            />
            <q-icon
              v-else-if="props.value === 'Active'"
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
              v-if="userStore.isAdmin && !props.row.isApproved"
              name="done_outline"
              color="green"
              size="18px"
              class="cursor-pointer q-mr-sm"
              @click="onApproveAdvertise(props.row)"
            />
            <q-icon
              v-show="
                props.row.status === 'Inactive' &&
                computedDuration(props.row.endDate) > 0 &&
                computeAdvertisementMatic(props.row.impressions, props.row.clicks, props.row.visits) < props.row.budget
              "
              name="edit"
              color="blue"
              size="18px"
              class="cursor-pointer q-mr-sm"
              @click="$emit('openAdvertiseDialog', props.row)"
            />
            <q-icon name="delete" color="red" size="18px" class="cursor-pointer" @click="onDeleteAdvertise(props.row.id, props.row.type)" />
          </q-td>
        </template>
        <template #body-cell-durations="props">
          <q-td class="text-right">
            {{ computedDuration(props.row.endDate) }} day's
            <q-tooltip>{{ props.row.publishDate }} to {{ props.row.endDate }}</q-tooltip>
          </q-td>
        </template>
        <template #body-cell-status="props">
          <q-td class="text-right">
            {{ showStatus(props.row) }}
          </q-td>
        </template>
        <template #body-cell-content="props">
          <q-td class="cursor-pointer" @click="goToUrl(props.row.id)">
            {{ props.row.content?.length > 30 ? props.row.content.substring(0, 30) + '...' : props.row.content }}
          </q-td>
        </template>
        <template #body-cell-name="props">
          <q-td class="cursor-pointer" @click="goToUrl(props.row.id)">
            {{ props.row.title?.length > 30 ? props.row.title.substring(0, 30) + '...' : props.row.title }}
          </q-td>
        </template>
        <template #body-cell-total_cost="props">
          <q-td class="text-right">
            {{ viewMatic(computeAdvertisementMatic(props.row.impressions, props.row.clicks, props.row.visits)) }}
            <q-tooltip>{{ computeAdvertisementMatic(props.row.impressions, props.row.clicks, props.row.visits) }}</q-tooltip>
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
          <q-btn flat label="Ok" color="primary" v-close-popup="-1" />
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
const dialog = ref({ open: false, title: '', subTitle: '', type: '' })
const $q = useQuasar()
const advertiseStore = useAdvertiseStore()
const errorStore = useErrorStore()
const userStore = useUserStore()
const filter = ref('')


function goToUrl(id, type) {
  router.push('/campaign/' + id)
}
onMounted(() => {
  advertiseStore.fetchAdvertises()
})

function onDeleteAdvertise(id, type) {
  advertiseStore
    .deleteAdvertise(id, type === 'Banner')
    .then(() => $q.notify({ type: 'negative', message: 'Advertise successfully deleted' }))
    .catch((error) => {
      console.log(error)
      errorStore.throwError(error, 'Advertise deletion failed')
    })
}

function onApproveAdvertise(advertise, approve = true) {
  advertise.isApproved = approve
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
    label: 'Advertise Title',
    field: 'title'
  },
  {
    name: 'content',
    required: true,
    field: 'content',
    label: 'Advertise Content'
  },
  {
    name: 'type',
    required: true,
    field: 'type',
    label: 'Advertise Type'
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
    name: 'visits',
    field: 'visits',
    label: 'Number of Visits',
    sortable: true
  },
  {
    name: 'total_cost',
    field: 'total_cost',
    label: 'Total Cost',
    sortable: true
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
    dialog.value.open = true
    dialog.value.title = 'Alert'
    dialog.value.subTitle = 'Change your publish date'
    dialog.value.type = 'ChangePublishDate'
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
function computeAdvertisementMatic(impressions = 0, clicks = 0, views = 0) {
  let impressionsMatic = impressions / 100
  let clicksMatic = clicks / 20
  let viewsMatic = views / 20
  return impressionsMatic + clicksMatic + viewsMatic
}
function viewMatic(matic) {
  if (Number.isInteger(matic)) return matic
  const maticSplit = String(matic).split('.')
  let floatNumbers = maticSplit[1]
  if (floatNumbers.length > 3) {
    floatNumbers = floatNumbers.slice(0, 3) + '...'
  }
  return maticSplit[0] + '.' + floatNumbers
}
function showStatus(data) {
  const create = calculateStatus(data.publishDate)
  const ended = calculateStatus(data.endDate)
  if (!create) {
    return 'Publish date pending'
  } else if (computeAdvertisementMatic(data.impressions, data.clicks, data.visits) > Number(data.budget)) {
    return 'Budget Crossed'
  } else if (ended) {
    return 'Complete'
  } else if (create && !ended) {
    return 'Ready to Publish'
  }
  return 'Pending: Publish date not yet reached'
}
</script>
