<template>
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
import { useUserStore } from 'src/stores'
import { ref, computed } from 'vue'

const userStore = useUserStore()
const filter = ref('')

const filteredUsers = computed(() => {
  if (!filter.value) return userStore.getUsers
  const search = filter.value.toLowerCase()
  return userStore.getUsers.filter((user) => {
    return user.displayName.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
  })
})

const columnsUser = [
  { name: 'displayName', label: 'Name', field: 'displayName', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
  { name: 'role', label: 'Role', field: 'role', sortable: true, align: 'center' }
]
const options = ['Admin', 'Editor', 'Advertiser', 'User']
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
