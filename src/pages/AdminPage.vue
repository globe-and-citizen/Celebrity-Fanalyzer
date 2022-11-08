<template>
  <q-header>
    <q-toolbar class="bg-white q-px-lg shadow-1">
      <q-toolbar-title>
        <b class="text-secondary">Admin Panel</b>
      </q-toolbar-title>
      <DialogPost v-bind="post" @hideDialog="post = {}" />
    </q-toolbar>
  </q-header>
  <section class="q-pa-md">
    <q-page padding>
      <q-table :columns="columns" flat hide-bottom :loading="isLoading" :rows="posts" title="Manage Posts">
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn color="warning" flat icon="edit" round size="sm" @click="post = props.row" />
            <q-btn color="negative" flat icon="delete" round size="sm" @click="onDeletePost(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-page>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import DialogPost from 'src/components/DialogPost.vue'
import { usePostStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const $q = useQuasar()
const postStore = usePostStore()

const columns = [
  {
    name: 'created',
    label: 'Created at',
    align: 'left',
    field: (row) => row.created.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    format: (val) => `${val}`,
    sortable: true
  },
  {
    name: 'author',
    align: 'center',
    label: 'Author',
    field: (row) => row.author.displayName,
    sortable: true
  },
  { name: 'title', align: 'left', label: 'Title', field: 'title', sortable: true },
  { name: 'actions', field: 'actions' }
]
const isLoading = ref(false)
const posts = ref([])
const post = ref({})

onMounted(async () => {
  isLoading.value = true
  await postStore.fetchPosts()
  posts.value = postStore.getPosts
  isLoading.value = false
})

function onDeletePost(id) {
  postStore
    .deletePost(id)
    .then(() => $q.notify({ message: 'Post successfully deleted' }))
    .catch(() => $q.notify({ message: 'Post deletion failed' }))
}
</script>
