<template>
  <q-card>
    <q-card-section class="row items-baseline no-wrap">
      <h2 class="q-my-none text-h6">{{ id ? 'Edit Entry' : 'New Entry' }}</h2>
      <q-space />
      <q-btn flat round icon="close" v-close-popup />
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="onSubmit()">
        <q-select data-test="select-author" :disable="!userStore.isAdmin" label="Author" :options="authorOptions" v-model="entry.author" />
        <q-select
          behavior="menu"
          counter
          data-test="select-prompt"
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
        <q-input counter data-test="input-title" hide-hint label="Title" maxlength="80" required v-model="entry.title" />
        <q-field counter label="Description" maxlength="400" v-model="entry.description">
          <template v-slot:control>
            <q-editor
              class="q-mt-md"
              data-test="input-description"
              dense
              flat
              min-height="5rem"
              ref="editorRef"
              :toolbar="[
                [
                  {
                    icon: $q.iconSet.editor.align,
                    options: ['left', 'center', 'right', 'justify']
                  },
                  {
                    icon: $q.iconSet.editor.fontSize,
                    list: 'no-icons',
                    options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
                  },
                  {
                    icon: $q.iconSet.editor.formatting,
                    options: ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript', 'quote', 'unordered', 'ordered']
                  },
                  ['link']
                ],
                ['undo', 'redo']
              ]"
              v-model="entry.description"
              @paste="onPaste($event)"
            />
          </template>
        </q-field>
        <q-file
          accept=".jpg, image/*"
          counter
          data-test="file-image"
          :disable="!entry.prompt"
          :hint="!entry.prompt ? 'Select prompt first' : 'Max size is 2MB'"
          label="Image"
          :max-total-size="2097152"
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
          data-test="button-submit"
          :disable="!entry.title || !entry.description || !entry.prompt || !entry.image"
          :label="id ? 'Save Edits' : 'Submit Entry'"
          :loading="promptStore.isLoading || storageStore.isLoading"
          rounded
          type="submit"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useEntryStore, useErrorStore, usePromptStore, useStorageStore, useUserStore } from 'src/stores'
import { onMounted, reactive, ref } from 'vue'
import { uploadAndSetImage } from 'src/utils/imageConvertor'
import { useRouter } from 'vue-router'

const emit = defineEmits(['hideDialog', 'forward-update-entry'])
const props = defineProps(['author', 'created', 'description', 'id', 'image', 'prompt', 'slug', 'title', 'selectedPromptDate'])

const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const storageStore = useStorageStore()
const userStore = useUserStore()
const router = useRouter()
const { href } = router.currentRoute.value

const authorOptions = reactive([])
const editorRef = ref(null)
const entry = reactive({
  author: { label: userStore.getUser.displayName, value: userStore.getUser.uid },
  description: '',
  image: '',
  title: ''
})
const imageModel = ref([])
const promptOptions =
  promptStore.getPrompts
    ?.filter((prompt) => !prompt.hasWinner)
    .map((prompt) => ({ label: `${prompt.date} – ${prompt.title}`, value: prompt.date }))
    .reverse() || []

onMounted(() => {
  userStore.getAdminsAndEditors.forEach((user) => authorOptions.push({ label: user.displayName, value: user.uid }))

  if (props.id) {
    entry.author = { label: props.author?.displayName, value: props.author?.uid }
    entry.description = props.description
    entry.image = props.image
    entry.prompt = { label: `${props.prompt.date} – ${props.prompt.title}`, value: props.prompt.date }
    entry.title = props.title
  } else if (props.selectedPromptDate) {
    entry.prompt = promptOptions.find((prompt) => prompt.value === props.selectedPromptDate)
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

function onPaste(evt) {
  // Let inputs do their thing, so we don't break pasting of links.
  if (evt.target.nodeName === 'INPUT') return
  let text, onPasteStripFormattingIEPaste
  evt.preventDefault()
  evt.stopPropagation()
  if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
    text = evt.originalEvent.clipboardData.getData('text/plain')
    editorRef.value.runCmd('insertText', text)
  } else if (evt.clipboardData && evt.clipboardData.getData) {
    text = evt.clipboardData.getData('text/plain')
    editorRef.value.runCmd('insertText', text)
  } else if (window.clipboardData && window.clipboardData.getData) {
    if (!onPasteStripFormattingIEPaste) {
      onPasteStripFormattingIEPaste = true
      editorRef.value.runCmd('ms-pasteTextOnly', text)
    }
    onPasteStripFormattingIEPaste = false
  }
}

async function onSubmit() {
  entry.slug = `/${entry.prompt.value.replace(/\-/g, '/')}/${entry.title.toLowerCase().replace(/[^0-9a-z]+/g, '-')}`
  entry.id = props.id || `${entry.prompt?.value}T${Date.now()}`

  if (imageModel.value && Object.keys(imageModel.value).length !== 0) {
    entry.image = await uploadAndSetImage(imageModel.value, `images/entry-${entry.id}`)
  } else {
    entry.image = props.image
  }

  const action = props.id ? entryStore.editEntry : entryStore.addEntry
  const successMessage = props.id ? 'Entry successfully edited' : 'Entry successfully submitted'
  const failureMessage = props.id ? 'Entry edit failed' : 'Entry submission failed'

  try {
    await action(entry)
    if (props.id) {
      await entryStore.fetchUserRelatedEntries(userStore.getUserId)
    }
    if (href.includes('/admin') && !userStore.isEditorOrAbove) {
      await entryStore.fetchUserRelatedEntries(userStore.getUserId)
    } else {
      const updatedPrompt = await promptStore.fetchPromptById(entry.prompt.value)
      const updatedList = updatedPrompt.find((prompt) => prompt.id === entry.prompt.value).entries
      const res = await entryStore.fetchPromptsEntries(updatedList)
      const loadedPrompt = entryStore._loadedEntries.find((el) => el.promptId === entry.prompt.value)

      if (loadedPrompt) {
        const emptyList = !loadedPrompt.entries.length
        loadedPrompt.entries = res
        emptyList && (await promptStore.fetchPrompts())
      }
    }
    $q.notify({ type: 'positive', message: successMessage })
  } catch (e) {
    await errorStore.throwError(e, failureMessage)
  }
  emit('hideDialog',entry.slug)
}
</script>
