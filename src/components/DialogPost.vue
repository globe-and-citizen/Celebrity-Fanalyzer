<template>
  <q-btn color="primary" icon="control_point" round @click="show = true">
    <q-tooltip>New Post</q-tooltip>
  </q-btn>
  <q-dialog full-width position="bottom" v-model="show">
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
</template>

<script setup>
import { useQuasar } from 'quasar'
import { usePostStore } from 'src/stores'
import { reactive, ref } from 'vue'

const $q = useQuasar()
const postStore = usePostStore()

const categoryOptions = ref(['Trending', 'Lifestyle', 'Culture', 'Sports', 'Politics', 'Technology', 'Science', 'Health', 'Education'])
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
const show = ref(false)

function uploadPhoto() {
  const reader = new FileReader()
  reader.readAsDataURL(imageModel.value)
  reader.onload = () => (post.image = reader.result)
}

async function onSubmit() {
  isLoading.value = true

  post.slug = `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${post.title}`
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, '-')

  await postStore
    .addPost(post)
    .then(() => $q.notify({ message: 'Post successfully submitted' }))
    .catch(() => $q.notify({ message: 'Post submission failed' }))

  isLoading.value = false
  show.value = false
}
</script>
