<template>
  <q-table
    v-if="userStore.getUsers"
    :columns="columnsUser"
    bordered
    flat
    virtual-scroll
    :filter="filter"
    :loading="userStore.isLoading || !userStore.getUsers"
    :pagination="{ sortBy: 'role', rowsPerPage: 20 }"
    row-key="email"
    :rows="filteredUsers"
    title="Manage Users"
    class="q-ma-md custom-table"
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

userStore.fetchUsers()

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
