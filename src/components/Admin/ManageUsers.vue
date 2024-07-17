<template>
  <q-table
    v-if="requestStore.getRequests.length"
    :columns="columnsRequests"
    hide-bottom
    :loading="userStore.isLoading"
    :pagination="{ rowsPerPage: 0 }"
    row-key="email"
    :rows="requestStore.getRequests"
    title="Manage Requests"
    class="q-ma-md"
    bordered
    virtual-scroll
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
        <q-btn color="positive" flat icon="verified" round @click="requestStore.acceptWriter(props.row.id)">
          <q-tooltip>Approve as a Writer</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>

  <q-table
    v-if="userStore.getUsers"
    :columns="columnsUser"
    bordered
    virtual-scroll
    :filter="filter"
    :loading="userStore.isLoading || !userStore.getUsers"
    :pagination="{ sortBy: 'role', rowsPerPage: 20 }"
    row-key="email"
    :rows="filteredUsers"
    title="Manage Users"
    class="q-ma-md q-mb-xl users-table"
  >
    <template v-slot:top-right>
      <q-input debounce="400" data-test="query-input" dense placeholder="Search" v-model="filter">
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
const filter = ref('')

const filteredUsers = computed(() => {
  if (!filter.value) return userStore.getUsers
  const search = filter.value.toLowerCase()
  return userStore.getUsers.filter((user) => {
    return user.displayName.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
  })
})

const columnsRequests = [
  { name: 'displayName', label: 'Name', field: (row) => row.user.displayName, sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: (row) => row.user.email, sortable: true, align: 'left' },
  { name: 'message', label: 'Message', field: 'message', sortable: true, align: 'left' },
  { name: 'actions', label: '', field: 'actions', sortable: true }
]
const columnsUser = [
  { name: 'displayName', label: 'Name', field: 'displayName', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
  { name: 'role', label: 'Role', field: 'role', sortable: true, align: 'center' }
]
const options = ['Admin', 'Editor', 'Advertiser', 'Writer', 'User']

const computedUsers = computed(() => {
  if (!userStore._searchQuery) return userStore.getUsers
  return userStore.getUsers.filter((item) => {
    return item?.displayName.toLowerCase().includes(userStore._searchQuery.toLowerCase())
  })
})
</script>

<style>
.users-table {
  left: 0;
  right: 0;
  max-height: 76vh;
  @media (max-width: 720px) {
    max-height: 73vh;
  }
}
.users-table .q-table__middle > .q-table > thead > tr {
  background-color: white !important;
  position: sticky !important;
  top: 0;
  z-index: 1 !important;
}
</style>
