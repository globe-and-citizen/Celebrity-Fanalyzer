<template>
  <q-card>
    <q-card-section class="row items-center no-wrap">
      <h2 class="q-my-none text-h6">{{ id ? 'Edit Prompt' : 'New Prompt' }}</h2>
      <span>&nbsp; for &nbsp;</span>
      <q-input borderless dense :disable="Boolean(id)" readonly style="max-width: 5.5rem" v-model="prompt.date">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                default-view="Months"
                emit-immediately
                :key="dataKey"
                mask="YYYY-MM"
                minimal
                v-model="prompt.date"
                years-in-month-view
                @update:model-value="onUpdateMonth"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
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
          hint="Max size is 5MB"
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
        <q-img v-if="prompt.image" class="q-mt-md" :src="prompt.image" fit="contain" />
        <q-btn
          class="full-width q-mt-xl"
          color="primary"
          :disable="!prompt.date || !prompt.title || !prompt.description || !prompt.categories?.length || !prompt.image"
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
import { date, useQuasar } from 'quasar'
import { usePromptStore } from 'src/stores'
import { reactive, ref, watchEffect } from 'vue'

const emit = defineEmits(['hideDialog'])
const props = defineProps(['author', 'categories', 'created', 'date', 'description', 'id', 'image', 'slug', 'title'])

const $q = useQuasar()
const promptStore = usePromptStore()

const categoryOptions = ref(['Trending', 'Lifestyle', 'Culture', 'Sports', 'Politics', 'Technology', 'Science', 'Health', 'Education'])
const dataKey = ref(Date.now())
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
    prompt.date = date.formatDate(Date.now(), 'YYYY-MM')
    prompt.description = ''
    prompt.image = ''
    prompt.title = ''
  }
})

function onUpdateMonth() {
  dataKey.value = Date.now()
}

function uploadPhoto() {
  prompt.image = ''
  const reader = new FileReader()
  reader.readAsDataURL(imageModel.value)
  reader.onload = () => (prompt.image = reader.result)
}

function onRejected() {
  $q.notify({ type: 'negative', message: 'Image did not pass validation constraints' })
}

async function onSubmit() {
  prompt.slug = prompt.title.toLowerCase().replace(/[^0-9a-z]+/g, '-')

  if (!props.id && promptStore.getPrompts.find((p) => p.date === prompt.date)) {
    $q.notify({ type: 'negative', message: 'Choose another month for this prompt.' })
    return
  }

  if (Object.keys(imageModel.value).length) {
    promptStore.uploadImage(imageModel.value, prompt.date)
  }

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
