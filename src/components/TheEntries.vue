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
      <q-btn color="primary" flat icon="control_point" round @click="openDialog()" />
    </div>
    <q-separator />

    <q-dialog full-width position="bottom" v-model="seamless">
      <q-card>
        <!-- <q-linear-progress :value="0.9" color="pink" /> -->
        <q-card-section class="row items-center no-wrap">
          <h2 class="q-my-none text-h6">New Post</h2>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input label="Title" v-model="title" />
          <q-input autogrow label="Description" v-model="description" />
          <q-file accept=".jpg, image/*" label="Image" v-model="image" @rejected="onRejectedImage">
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
            v-model="category"
            @filter="filterCategories"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-btn class="full-width q-mt-xl" color="primary" label="Save" rounded @click="savePost()" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'

const $q = useQuasar()

const seamless = ref(false)
const subject = ref('multinational_support')

const subjects = ref([
  { label: 'Multinational Support', value: 'multinational_support' },
  { label: 'Bipartisanship', value: 'bipartisanship' },
  { label: 'Likes', value: 'likes' },
  { label: 'Dislikes', value: 'dislikes' },
  { label: 'Comments', value: 'comments' },
  { label: 'Shares', value: 'shares' }
])

const title = ref('')
const description = ref('')
const image = ref([])
const category = ref(undefined)
const categoryOptions = ref([])
const options = ref([
  { label: 'Trending', value: 'trending' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Culture', value: 'culture' },
  { label: 'Sports', value: 'sports' },
  { label: 'Politics', value: 'politics' },
  { label: 'Business', value: 'business' },
  { label: 'Technology', value: 'technology' },
  { label: 'Science', value: 'science' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' }
])

function openDialog() {
  console.log('add post')
  seamless.value = true
}

function onRejectedImage(file) {
  $q.notify({ type: 'negative', message: `${file.length} file(s) did not pass validation constraints` })
}

function filterCategories(val, update) {
  if (val === '') {
    update(() => (categoryOptions.value = options.value))
    return
  }
  update(() => (categoryOptions.value = categoryOptions.value.filter((v) => v.label.toLowerCase().indexOf(val.toLowerCase()) > -1)))
}

function savePost() {
  $q.notify({ type: 'positive', message: 'Feature under development' })
  // TODO: load message of saving post + notification of success/failure + close dialog
  // seamless.value = false
}
</script>

<style lang="scss" scoped></style>
