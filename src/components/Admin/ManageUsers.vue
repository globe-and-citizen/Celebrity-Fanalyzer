<template>
  <q-table
    :columns="columns"
    flat
    hide-bottom
    :loading="userStore.isLoading"
    :pagination="pagination"
    :rows="users"
    row-key="email"
    style="left: 0; right: 0"
    title="Manage Users"
  >
    <template v-slot:body-cell-role="props">
      <q-td>
        <q-select borderless dense :options="options" v-model="props.row.role" @update:model-value="updateRole(props.row)" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { useUserStore } from 'src/stores'

const props = defineProps({
  users: { type: Array, required: true }
})

const userStore = useUserStore()

const columns = [
  { name: 'displayName', label: 'Name', field: 'displayName', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
  { name: 'role', label: 'Role', field: 'role', sortable: true, align: 'left' }
]
const options = ['Admin', 'Writer', 'User']
const pagination = { sortBy: 'email', descending: true, rowsPerPage: 0 }

function updateRole(user) {
  userStore.updateRole(user)
}
</script>
