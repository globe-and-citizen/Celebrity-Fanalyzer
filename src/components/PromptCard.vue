<template>
  <q-card>
    <q-card-section class="row items-center no-wrap">
      <h2 class="q-my-none text-h6">{{ id ? 'Edit Prompt' : 'New Prompt' }}</h2>
      <span>&nbsp; for &nbsp;</span>
      <!-- TODO: apply closest years dinamically -->
      <q-select behavior="menu" borderless dense :options="[2021, 2022, 2023]" v-model="prompt.date.year" />
      <q-select behavior="menu" borderless dense :options="monthsOfTheYear" v-model="prompt.date.month" />
      <q-space />
      <q-btn flat round icon="close" v-close-popup />
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="onSubmit()">
        <q-input counter hide-hint label="Title" maxlength="80" required v-model="prompt.title" />
        <q-field counter label="Description" maxlength="400" v-model="prompt.description">
          <template v-slot:control>
            <q-editor
              flat
              class="q-mt-md"
              min-height="5rem"
              :toolbar="[
                ['bold', 'italic', 'strike', 'underline'],
                ['quote', 'unordered', 'ordered'],
                ['undo', 'redo']
              ]"
              v-model="prompt.description"
            />
          </template>
        </q-field>
        <q-file
          accept=".jpg, image/*"
          counter
          hide-hint
          hint="Landscape images are better | Max size is 5MB"
          label="Image"
          :max-total-size="5242880"
          :required="!id"
          v-model="imageModel"
          @rejected="onRejected()"
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
          :rules="[(val) => val?.length > 0 || 'Please select at least one category']"
          v-model="prompt.categories"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-img v-if="prompt.image" class="q-mt-md" :src="prompt.image" />
        <q-btn
          class="full-width q-mt-xl"
          color="primary"
          :disable="
            !prompt.date.year || !prompt.date.month || !prompt.title || !prompt.description || !prompt.categories?.length || !prompt.image
          "
          :label="id ? 'Edit' : 'Save'"
          rounded
          type="submit"
        />
      </q-form>
    </q-card-section>
    <q-inner-loading color="primary" :showing="promptStore.isLoading" />
  </q-card>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { usePromptStore } from 'src/stores'
import { monthsOfTheYear, shortMonthDay } from 'src/utils/date'
import { reactive, ref, watchEffect } from 'vue'

const emit = defineEmits(['hideDialog'])
const props = defineProps(['author', 'categories', 'created', 'date', 'description', 'id', 'image', 'info', 'slug', 'title'])

const $q = useQuasar()
const promptStore = usePromptStore()

const categoryOptions = ref(['Trending', 'Lifestyle', 'Culture', 'Sports', 'Politics', 'Technology', 'Science', 'Health', 'Education'])
const imageModel = ref([])
const prompt = reactive({})

watchEffect(() => {
  if (props.id) {
    prompt.categories = props.categories
    prompt.date = props.date
    prompt.description = props.description
    prompt.id = props.id
    prompt.image = props.image
    prompt.title = props.title
  } else {
    prompt.categories = null
    prompt.date = { year: new Date().getFullYear(), month: monthsOfTheYear[new Date().getMonth()] }
    prompt.description = ''
    prompt.image = ''
    prompt.info = { dislikes: [], likes: [], shares: 0 }
    prompt.title = ''
  }
})

function uploadPhoto() {
  promptStore.uploadImage(imageModel.value).then((url) => (prompt.image = url))
}

function onRejected() {
  $q.notify({ type: 'negative', message: `Image did not pass validation constraints` })
}

async function onSubmit() {
  prompt.slug = `${shortMonthDay()}-${prompt.title}`.toLowerCase().replace(/[^0-9a-z]+/g, '-')

  if (props.id) {
    await promptStore
      .editPrompt(prompt)
      .then(() => $q.notify({ message: 'Prompt successfully edited' }))
      .catch(() => $q.notify({ message: 'Prompt edit failed' }))
  } else {
    await promptStore
      .addPrompt(prompt)
      .then(() => $q.notify({ message: 'Prompt successfully submitted' }))
      .catch(() => $q.notify({ message: 'Prompt submission failed' }))
  }

  emit('hideDialog')
}
</script>

<style scoped>
.q-img {
  max-height: 20rem;
  object-fit: cover;
}
</style>
