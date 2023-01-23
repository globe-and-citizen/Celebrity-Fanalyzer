<template>
  <q-card>
    <q-card-section class="row items-center no-wrap">
      <h2 class="q-my-none text-h6">{{ id ? 'Edit Entry' : 'New Entry' }}</h2>
      <q-space />
      <q-btn flat round icon="close" v-close-popup />
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="onSubmit()">
        <q-select
          behavior="menu"
          counter
          :disable="Boolean(entry.image)"
          :hint="entry.image ? 'Image is attached to this prompt' : ''"
          label="Prompt"
          :options="promptOptions"
          use-chips
          :rules="[(val) => val || 'Please select the related prompt']"
          v-model="entry.prompt"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input counter hide-hint label="Title" maxlength="80" required v-model="entry.title" />
        <q-field counter label="Description" maxlength="400" v-model="entry.description">
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
              v-model="entry.description"
            />
          </template>
        </q-field>
        <q-file
          accept=".jpg, image/*"
          counter
          :disable="!entry.prompt"
          :hint="!entry.prompt ? 'Select prompt first' : 'Max size is 5MB'"
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
        <div class="text-center">
          <q-img v-if="entry.image" class="q-mt-md" :src="entry.image" fit="contain" style="max-height: 40vh; max-width: 80vw" />
        </div>
        <q-btn
          class="full-width q-mt-xl"
          color="primary"
          :disable="!entry.title || !entry.description || !entry.prompt || !entry.image"
          :label="id ? 'Edit' : 'Save'"
          rounded
          type="submit"
        />
      </q-form>
    </q-card-section>
    <q-inner-loading color="primary" :showing="entryStore.isLoading" />
  </q-card>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useEntryStore, usePromptStore } from 'src/stores'
import { reactive, ref, watchEffect } from 'vue'

const emit = defineEmits(['hideDialog'])
const props = defineProps(['author', 'created', 'description', 'id', 'image', 'prompt', 'slug', 'title'])

const $q = useQuasar()
const entryStore = useEntryStore()
const promptStore = usePromptStore()

const entry = reactive({})
const imageModel = ref([])
const promptOptions = promptStore.getPrompts.map((prompt) => ({ label: `${prompt.date} – ${prompt.title}`, value: prompt.date })).reverse()

watchEffect(() => {
  if (props.id) {
    entry.description = props.description
    entry.id = props.id
    entry.image = props.image
    entry.prompt = { label: `${props.prompt.date} – ${props.prompt.title}`, value: props.prompt.date }
    entry.title = props.title
  } else {
    entry.description = ''
    entry.id = `${entry.prompt?.value}T${Date.now()}` // 2022-11T1670535123715
    entry.image = ''
    entry.title = ''
  }
})

function uploadPhoto() {
  entry.image = ''
  const reader = new FileReader()
  reader.readAsDataURL(imageModel.value)
  reader.onload = () => (entry.image = reader.result)
}

function onRejected() {
  $q.notify({ type: 'negative', message: `Image did not pass validation constraints` })
}

async function onSubmit() {
  entry.slug = `/${entry.prompt.value.replace(/\-/g, '/')}/${entry.title.toLowerCase().replace(/[^0-9a-z]+/g, '-')}`

  if (Object.keys(imageModel.value).length) {
    entryStore.uploadImage(imageModel.value, entry.id)
  }

  if (props.id) {
    await entryStore
      .editEntry(entry)
      .then(() => $q.notify({ message: 'Entry successfully edited' }))
      .catch(() => $q.notify({ message: 'Entry edit failed' }))
  } else {
    await entryStore
      .addEntry(entry)
      .then(() => $q.notify({ message: 'Entry successfully submitted' }))
      .catch(() => $q.notify({ message: 'Entry submission failed' }))
  }

  emit('hideDialog')
}
</script>
