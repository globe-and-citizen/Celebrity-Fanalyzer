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
    <q-page padding>We can add some stats here...</q-page>
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
              hint="Max file size: 1MB"
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
              hint="Landscape images are better"
              label="Categories"
              multiple
              :options="categoryOptions"
              use-input
              use-chips
              required
              v-model="post.categories"
              @filter="filterCategories"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">No results</q-item-section>
                </q-item>
              </template>
            </q-select>
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
import { usePostStore } from 'src/stores/'
import { reactive, ref } from 'vue'

const $q = useQuasar()
const postStore = usePostStore()

const dialog = ref(false)

const post = reactive({
  categories: [],
  description: '',
  image: '',
  info: { comments: 0, dislikes: 0, likes: 0, shares: 0 },
  slug: '',
  title: ''
})
const imageModel = ref([])
const categoryOptions = ref([])
const isLoading = ref(false)

const options = ref(['Trending', 'Lifestyle', 'Culture', 'Sports', 'Politics', 'Business', 'Technology', 'Science', 'Health', 'Education'])

// TODO: improve filter
function filterCategories(val, update) {
  if (val === '') {
    update(() => (categoryOptions.value = options.value))
    return
  }
  update(() => (categoryOptions.value = categoryOptions.value.filter((v) => v.label.toLowerCase().indexOf(val.toLowerCase()) > -1)))
}

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
    .then(() => $q.notify({ color: 'positive', message: 'Post successfully submitted' }))
    .catch(() => $q.notify({ color: 'negative', message: 'Post submission failed' }))

  dialog.value = false
  isLoading.value = false
}
</script>
