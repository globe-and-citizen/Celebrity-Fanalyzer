<template>
  <section class="q-pa-md">
    <q-scroll-area :thumb-style="{ display: 'none' }" style="height: 3.8rem">
      <q-btn-toggle
        v-model="subject"
        class="q-my-sm"
        color="white"
        no-caps
        no-wrap
        rounded
        unelevated
        text-color="secondary"
        :options="subjects"
      />
    </q-scroll-area>
    <div class="flex justify-between">
      <h2 class="q-my-auto text-bold text-h5">Entries</h2>
      <q-btn color="primary" flat icon="control_point" round @click="dialog = true" />
    </div>
    <q-separator />

    <q-dialog full-width position="bottom" v-model="dialog">
      <q-card>
        <q-card-section class="row items-center no-wrap">
          <h2 class="q-my-none text-h6">New Post</h2>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="onSubmit()">
            <q-input label="Title" v-model="post.title" />
            <q-input autogrow label="Description" v-model="post.description" />
            <q-file accept=".jpg, image/*" label="Image" v-model="imageModel" @update:model-value="uploadPhoto()">
              <template v-slot:append>
                <q-icon name="image" />
              </template>
            </q-file>
            <q-select
              behavior="menu"
              label="Categories"
              multiple
              :options="categoryOptions"
              use-input
              use-chips
              v-model="post.categories"
              @filter="filterCategories"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">No results</q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-img v-if="post.image" :src="post.image" />
            <q-btn class="full-width q-mt-xl" color="primary" label="Save" rounded type="submit" />
          </q-form>
        </q-card-section>
        <!-- TODO: Add loading after push save button -->
        <!-- {{ isLoading }} -->
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { usePostStore } from 'src/stores/posts'
import { reactive, ref } from 'vue'

const $q = useQuasar()
const postStore = usePostStore()

const dialog = ref(false)
const subject = ref('multinational_support')

const subjects = ref([
  { label: 'Multinational Support', value: 'multinational_support' },
  { label: 'Bipartisanship', value: 'bipartisanship' },
  { label: 'Likes', value: 'likes' },
  { label: 'Dislikes', value: 'dislikes' },
  { label: 'Comments', value: 'comments' },
  { label: 'Shares', value: 'shares' }
])

const post = reactive({
  author: '',
  categories: [],
  created: '',
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
  // TODO: Add author, created, slug
  // post.slug = post.title.toLowerCase().replace(/ /g, '-')
  // TODO: Add validations before saving
  // TODO: load message of saving post + notification of success/failure + close dialog
  postStore.addPost(post).then(() => $q.notify({ color: 'positive', message: 'Post successfully submitted' }))

  // dialog.value = false
  isLoading.value = false
}
</script>

<style lang="scss" scoped></style>
