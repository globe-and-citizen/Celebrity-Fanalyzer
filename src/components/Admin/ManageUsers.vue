<template>
  <q-table
    v-if="userStore.getUsers"
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
import { useUserStore } from 'src/stores'
import { ref } from 'vue'

const userStore = useUserStore()

const columnsUser = [
  { name: 'displayName', label: 'Name', field: 'displayName', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
  { name: 'role', label: 'Role', field: 'role', sortable: true, align: 'center' }
]
const filter = ref('')
const options = ['Admin', 'Editor', 'Advertiser', 'User']
</script>
