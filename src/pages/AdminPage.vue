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
            <q-btn color="negative" flat icon="delete" round size="sm" @click="onDeleteDialog(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-page>

    <q-dialog v-model="deleteDialog.show">
      <q-card>
        <q-card-section class="q-pb-none">
          <h6 class="q-my-sm">Delete Post?</h6>
        </q-card-section>
        <q-card-section>
          <span class="q-ml-sm">
            Are you sure you want to delete the post
            <b>{{ deleteDialog.post.title }}</b>
            ?
          </span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="onDeletePost(deleteDialog.post.id)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
const deleteDialog = ref({})
const isLoading = ref(false)
const posts = ref([])
const post = ref({})

onMounted(async () => {
  isLoading.value = true
  await postStore.fetchPosts()
  posts.value = postStore.getPosts
  isLoading.value = false
})

function onDeleteDialog(post) {
  deleteDialog.value.show = true
  deleteDialog.value.post = post
}

function onDeletePost(id) {
  postStore
    .deletePost(id)
    .then(() => $q.notify({ message: 'Post successfully deleted' }))
    .catch(() => $q.notify({ message: 'Post deletion failed' }))

  deleteDialog.value.show = false
  deleteDialog.value.post = {}
}
</script>
