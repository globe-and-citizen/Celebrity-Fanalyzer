<template>
  <q-header>
    <q-toolbar class="bg-white q-px-lg shadow-1">
      <q-toolbar-title>
        <b class="text-secondary">Admin Panel</b>
      </q-toolbar-title>
      <q-btn color="primary" dense icon="control_point" label="New Post" rounded @click="dialog = true" />
    </q-toolbar>
  </q-header>
  <section class="q-pa-md">
    <q-page padding>
      <q-table :columns="columns" flat hide-bottom :loading="isLoading" :rows="posts" title="Manage Posts">
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn color="warning" flat icon="edit" round size="sm" @click="onEditPost(props.row.id)" />
            <q-btn color="negative" flat icon="delete" round size="sm" @click="onDeletePost(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-page>

    <q-dialog full-width position="bottom" v-model="dialog">
      <q-card>
        <q-card-section class="row items-center no-wrap">
          <h2 class="q-my-none text-h6">New Post</h2>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="onSubmit()">
            <q-input counter hide-hint label="Title" maxlength="80" required v-model="post.title" />
            <q-input autogrow counter label="Description" maxlength="400" required v-model="post.description" />
            <q-file
              accept=".jpg, image/*"
              counter
              hide-hint
              hint="Landscape images are better"
              label="Image"
              :max-total-size="1000000"
              required
              v-model="imageModel"
              @update:model-value="uploadPhoto()"
            >
              <template v-slot:append>
                <q-icon name="image" />
              </template>
            </q-file>
            <q-select
              behavior="menu"
              counter
              hide-hint
              label="Categories"
              multiple
              :options="categoryOptions"
              use-input
              use-chips
              :rules="[(val) => val.length > 0 || 'Please select at least one category']"
              v-model="post.categories"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">No results</q-item-section>
                </q-item>
              </template>
            </q-select>
            {{ post.categories }}
            <q-img v-if="post.image" class="q-mt-md" :src="post.image" />
            <q-btn class="full-width q-mt-xl" color="primary" label="Save" rounded type="submit" />
          </q-form>
        </q-card-section>
        <q-inner-loading color="primary" :showing="isLoading" />
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { usePostStore } from 'src/stores'
import { onMounted, reactive, ref } from 'vue'

const $q = useQuasar()
const postStore = usePostStore()

const categoryOptions = ref(['Trending', 'Lifestyle', 'Culture', 'Sports', 'Politics', 'Technology', 'Science', 'Health', 'Education'])
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
const dialog = ref(false)
const imageModel = ref([])
const isLoading = ref(false)
const post = reactive({
  categories: null,
  description: '',
  image: '',
  info: { comments: 0, dislikes: 0, likes: 0, shares: 0 },
  slug: '',
  title: ''
})
const posts = ref([])

onMounted(async () => {
  isLoading.value = true
  await postStore.fetchPosts()
  posts.value = postStore.getPosts
  isLoading.value = false
})

function uploadPhoto() {
  const reader = new FileReader()
  reader.readAsDataURL(imageModel.value)
  reader.onload = () => (post.image = reader.result)
}

function onSubmit() {
  isLoading.value = true

  post.slug = `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${post.title}`
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, '-')

  postStore
    .addPost(post)
    .then(() => $q.notify({ message: 'Post successfully submitted' }))
    .catch(() => $q.notify({ message: 'Post submission failed' }))

  dialog.value = false
  isLoading.value = false
}

function onEditPost(id) {
  $q.notify({ color: 'warning', message: `This feature is under development` })
}

function onDeletePost(id) {
  postStore
    .deletePost(id)
    .then(() => $q.notify({ message: 'Post successfully deleted' }))
    .catch(() => $q.notify({ message: 'Post deletion failed' }))
}
</script>
