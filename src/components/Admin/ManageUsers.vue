<template>
  <q-table
    v-if="computedRequests.length"
    :columns="columnsRequests"
    flat
    hide-bottom
    :loading="userStore.isLoading"
    :pagination="{ rowsPerPage: 0 }"
    row-key="email"
    :rows="computedRequests"
    title="Manage Requests"
  >
    <template v-slot:body-cell-message="props">
      <q-td :props="props" style="white-space: pre-line">
        {{ props.row.message }}
      </q-td>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right">
        <q-btn color="warning" flat icon="account_circle" round @click="router.push(`/fan/${props.row.id}`)">
          <q-tooltip>Visit Profile</q-tooltip>
        </q-btn>
        <q-btn color="negative" flat icon="do_not_disturb_on" round @click="requestStore.denyWriter(props.row.id)">
          <q-tooltip>Deny as a Writer</q-tooltip>
        </q-btn>
        <q-btn color="positive" flat icon="verified" round @click="acceptWriter(props.row.id)">
          <q-tooltip>Approve as a Writer</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>

  <q-table
    :columns="columnsUser"
    flat
    :filter="filter"
    hide-bottom
    :loading="userStore.isLoading || !userStore.getUsers"
    :pagination="{ sortBy: 'role', rowsPerPage: 0 }"
    row-key="email"
    :rows="userStore.getUsers"
    title="Manage Users"
  >
    <template v-slot:top-right>
      <q-input
        debounce="300"
        data-test="query-input"
        dense
        placeholder="Search"
        v-model="filter"
        @update:model-value="userStore.queryUsers(filter)"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template v-slot:body-cell-role="props">
      <q-td>
        <q-select borderless dense :options="options" v-model="props.row.role" @update:model-value="userStore.updateRole(props.row)" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { useRequestStore, useUserStore } from 'src/stores'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const requestStore = useRequestStore()
const userStore = useUserStore()

const columnsRequests = [
  { name: 'displayName', label: 'Name', field: 'displayName', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
  { name: 'message', label: 'Message', field: 'message', sortable: true, align: 'left' },
  { name: 'actions', label: '', field: 'actions', sortable: true }
]
const columnsUser = [
  { name: 'displayName', label: 'Name', field: 'displayName', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
  { name: 'role', label: 'Role', field: 'role', sortable: true, align: 'center' }
]
const filter = ref('')
const options = ['Admin', 'Editor', 'Writer', 'User']

const computedRequests = computed(() => {
  return requestStore.getRequests
    .filter((request) => request.status === 'pending')
    .map((request) => ({ ...request, displayName: request.user?.displayName, email: request.user?.email, role: request.user?.role }))
})
</script>
