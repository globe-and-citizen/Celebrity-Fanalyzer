<template>
  <q-card>
    <q-card-section class="row items-baseline no-wrap">
      <h2 class="q-my-none text-h6">{{ id ? 'Edit Entry' : 'New Entry' }}</h2>
      <q-space />
      <q-btn flat round icon="close" v-close-popup data-test="close-button" />
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="onSubmit()">
        <q-stepper alternative-labels animated color="primary" header-nav v-model="step">
          <q-step icon="settings" :name="1" :title="id ? 'Edit Entry' : 'New Entry'">
            <q-select data-test="select-author" disable label="Author" v-model="entry.author" />
            <q-select
              behavior="menu"
              counter
              data-test="select-prompt"
              :disable="Boolean(entry.id) || isNavigatingFromPrompt"
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
            <q-input
              counter
              data-test="input-title"
              label="Title"
              maxlength="80"
              required
              v-model="entry.title"
              :disable="!entry.prompt"
              :hint="!entry.prompt ? 'Select prompt first' : !entry.title ? '*Title is required' : ''"
            />
            <q-field
              counter
              label="Description"
              maxlength="6000"
              v-model="entry.description"
              :hint="!entry.description ? '*Description is required' : ''"
              :rules="[(val) => val.length <= 6000 || 'Description cannot exceed 6000 characters']"
            >
              <template v-slot:control>
                <q-editor
                  class="q-mt-md"
                  data-test="input-description"
                  dense
                  flat
                  :maxlength="6000"
                  min-height="5rem"
                  ref="editorRef"
                  style="width: 100%"
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
                  @keydown="onKeyDown($event)"
                />
              </template>
            </q-field>

            <div class="row no-wrap">
              <div class="col-9">
                <q-file
                  accept=".jpg, image/*"
                  counter
                  data-test="file-image"
                  :disable="!entry.prompt"
                  :hint="!entry.prompt ? 'Select prompt first' : !entry.image ? '*Image is required. Max size is 2MB.' : ''"
                  label="Image"
                  :max-total-size="2097152"
                  use-chips
                  class="full-width"
                  :required="!id && !entry.image"
                  v-model="uploadedImage"
                  @rejected="onRejected()"
                  @update:model-value="uploadPhoto()"
                >
                  <template v-slot:append>
                    <q-icon name="image" />
                  </template>
                </q-file>
              </div>
              <div class="col-1 flex justify-center items-center"><p>OR</p></div>
              <q-btn
                :disable="!entry.prompt"
                color="primary"
                icon="add_a_photo"
                class="self-center col"
                label="Capture Image"
                @click="openCamera = true"
              ></q-btn>
            </div>
            <div class="text-center">
              <q-img v-if="entry.image" class="q-mt-md" :src="entry.image" fit="contain" style="max-height: 40vh; max-width: 80vw" />
            </div>
          </q-step>
          <q-step caption="Optional" :done="step > 2" icon="create_new_folder" :name="2" title="Artist Carousel">
            <ShowcaseCard
              collectionName="entry"
              :date="todayDate"
              v-model:arts="entry.showcase.arts"
              v-model:artist="entry.showcase.artist"
              @updateRecentUploads="updateRecentUploadsRef"
              @updateRecentArtistImage="updateRecentArtistImageRef"
            />
          </q-step>

          <template v-slot:navigation>
            <q-stepper-navigation class="flex justify-end q-gutter-md">
              <template v-if="promptStore.isLoading">
                <q-skeleton type="rect" class="q-mr-md" style="height: 40px; width: 100px" />
                <q-skeleton type="rect" class="q-mr-md" style="height: 40px; width: 120px" />
              </template>
              <template v-else>
                <q-btn
                  flat
                  rounded
                  label="Reset"
                  @click="resetEntry"
                  v-if="parsedEntry?.title"
                  :disable="promptStore.isLoading"
                  data-test="reset-button"
                />
                <q-btn
                  flat
                  rounded
                  label="Cancel"
                  @click="() => {}"
                  v-close-popup
                  :disable="promptStore.isLoading"
                  data-test="cancel-button"
                />
                <q-btn
                  color="primary"
                  data-test="button-submit"
                  :disable="!entry.title || !entry.description || !entry.prompt || !entry.image"
                  :label="id ? 'Save Edits' : 'Submit Entry'"
                  :loading="promptStore.isLoading || storageStore.isLoading"
                  rounded
                  type="submit"
                >
                  <q-tooltip
                    v-if="!entry.title || !entry.description || !entry.prompt || !entry.image"
                    class="text-center"
                    style="white-space: pre-line"
                  >
                    {{
                      !entry.title || !entry.description
                        ? 'Please make sure you have a title and description'
                        : !entry.prompt
                          ? 'Please select a prompt'
                          : !entry.image
                            ? 'Please select an image'
                            : 'Please make sure all fields are filled'
                    }}
                  </q-tooltip>
                </q-btn>
              </template>
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-form>
    </q-card-section>
  </q-card>
  <q-dialog v-model="openCamera" persistent>
    <CaptureCamera @onCapture="captureCamera" />
  </q-dialog>
  <q-dialog></q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed, onMounted, ref, toRaw, watch, watchEffect } from 'vue'
import { useEntryStore, useErrorStore, usePromptStore, useUserStore, useStorageStore } from 'src/stores'

import { useRouter } from 'vue-router'
import CaptureCamera from '../shared/CameraCapture.vue'
import ShowcaseCard from 'components/Admin/ShowcaseCard.vue'
import { indexedDb } from 'src/utils/indexeddb'

const emit = defineEmits(['hideDialog'])
const props = defineProps([
  'author',
  'created',
  'description',
  'id',
  'image',
  'prompt',
  'slug',
  'title',
  'selectedPromptDate',
  'isNavigatingFromPrompt',
  'showcase'
])

const $q = useQuasar()
const entryStore = useEntryStore()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const userStore = useUserStore()
const step = ref(1)
const editorRef = ref(null)
const entry = ref({
  author: { label: userStore.getUser.displayName, value: userStore.getUser.uid },
  description: '',
  showcase: { arts: [], artist: { info: '', photo: '', file: null } },
  title: '',
  prompt: null,
  image: null,
  imageFile: null,
  imagePath: null
})
const uploadedImage = ref(null)
const openCamera = ref(false)
const todayDate = new Date().toISOString().replace(/[.:-]/g, '')
const recentUploadsRef = ref([])
const recentArtistImage = ref('')
const parsedEntry = ref(null)
const storageStore = useStorageStore()

const lastDescriptionNotificationTime = ref(0)

watch(
  () => entry.value.description,
  (newDescription) => {
    if (newDescription && newDescription.length > 6000) {
      entry.value.description = newDescription.substring(0, 6000)
    }
  },
  { immediate: true }
)

const promptOptions = computed(
  () =>
    promptStore._activePrompts
      ?.map((prompt) => ({
        label: `${prompt.date || prompt.publicationDate} – ${prompt.title}`,
        value: prompt.id,
        escrowId: prompt.escrowId,
        date: prompt.date || prompt.creationDate
      }))
      .reverse() || []
)

async function loadEntryFromDexie() {
  try {
    const entries = await indexedDb.entry.toArray()
    parsedEntry.value = entries[entries.length - 1] || null
  } catch (error) {
    console.error('Failed to load entries from Dexie:', error)
    parsedEntry.value = null
  }
}

onMounted(async () => {
  promptStore.activePromptsListener()
  await loadEntryFromDexie()
  if (parsedEntry.value && !props.id) {
    entry.value = {
      ...entry.value,
      ...parsedEntry.value,
      author: userStore.isAuthenticated ? { label: userStore.getUser.displayName, value: userStore.getUser.uid } : null
    }
    if (parsedEntry.value.imageFile instanceof Blob) {
      entry.value.image = URL.createObjectURL(parsedEntry.value.imageFile)
      uploadedImage.value = parsedEntry.value.imageFile
    }
  } else if (props.id) {
    entry.value = {
      ...props,
      author: { label: props.author.displayName, value: props.author.uid },
      prompt: { label: `${props.prompt.date || props.prompt.publicationDate} – ${props.prompt.title}`, value: props.prompt.id }
    }
  }
  await promptStore.activePromptsListener()
})

watchEffect(() => {
  if (props.isNavigatingFromPrompt && props.selectedPromptDate && promptOptions.value.length && !entry.value.prompt) {
    const selectedPrompt = promptOptions.value.find((prompt) => prompt.value === props.selectedPromptDate)
    if (selectedPrompt) {
      entry.value.prompt = selectedPrompt
    }
  }
})

function onRejected() {
  $q.notify({ type: 'negative', message: `Image did not pass validation constraints` })
}

function onPaste(evt) {
  // Let inputs do their thing, so we don't break pasting of links.
  if (evt.target.nodeName === 'INPUT') return
  let text, onPasteStripFormattingIEPaste
  evt.preventDefault()
  evt.stopPropagation()
  const currentLength = entry.value.description.length

  if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
    text = evt.originalEvent.clipboardData.getData('text/plain')
    if (currentLength + text.length > 6000) {
      showDescriptionNotification('Cannot paste: Would exceed 6000 character limit')
      return
    }
    editorRef.value.runCmd('insertText', text)
  } else if (evt.clipboardData && evt.clipboardData.getData) {
    text = evt.clipboardData.getData('text/plain')
    if (currentLength + text.length > 6000) {
      showDescriptionNotification('Cannot paste: Would exceed 6000 character limit')
      return
    }
    editorRef.value.runCmd('insertText', text)
  } else if (window.clipboardData && window.clipboardData.getData) {
    if (!onPasteStripFormattingIEPaste) {
      onPasteStripFormattingIEPaste = true
      editorRef.value.runCmd('ms-pasteTextOnly', text)
    }
    onPasteStripFormattingIEPaste = false
  }
}

function showDescriptionNotification(message) {
  const now = Date.now()
  if (now - lastDescriptionNotificationTime.value > 1000) {
    $q.notify({
      type: 'warning',
      message: message,
      position: 'top',
      timeout: 2000
    })
    lastDescriptionNotificationTime.value = now
  }
}
function onKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'y')) {
    return
  }
  if (entry.value.description.length >= 6000) {
    if (!['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      showDescriptionNotification('Max 6000 characters reached')
    }
  }
}

async function onSubmit() {
  entry.value.title = entry.value.title.trim()
  const hasLoadedEntry = entryStore.checkPromptRelatedEntry(entry.value.prompt?.value)

  if (!hasLoadedEntry) {
    await entryStore.fetchEntryByPrompts(entry.value.prompt?.value)
  }

  const hasEntry = entryStore.hasEntry(entry.value.prompt?.value)

  if (!props.id && hasEntry) {
    $q.notify({
      type: 'info',
      message: 'You have already submitted an entry for this prompt. Please select another prompt'
    })
    return
  }

  const titleExists = entryStore.entryNameValidator(props.id, entry.value.prompt?.value, entry.value.title, !!props.id)
  if (titleExists) {
    $q.notify({ message: 'Entry with this title already exists. Please choose another title.', type: 'negative' })
    return
  }

  const date = props.id ? props.prompt.date || props.prompt.publicationDate : entry.value.prompt.date
  entry.value.slug = `/${date.replace(/\-/g, '/')}/${entry.value.title.toLowerCase().replace(/[^0-9a-z]+/g, '-')}`
  entry.value.id = props.id || `${entry.value.prompt?.value}T${Date.now()}`

  const action = props.id ? entryStore.editEntry : entryStore.addEntry
  const successMessage = props.id ? 'Entry successfully edited' : 'Entry successfully submitted'
  const failureMessage = props.id ? 'Entry edit failed' : 'Entry submission failed'

  try {
    // throw new Error('')
    await action(entry.value)

    if (props.id) {
      await entryStore.fetchUserRelatedEntries(userStore.getUserId)
    }

    $q.notify({ type: 'positive', message: successMessage })
    emit('hideDialog', entry.value.slug)
    indexedDb.entry?.clear()
  } catch (e) {
    const entryToSave = {
      author: toRaw(entry.value.author),
      description: entry.value.description,
      showcase: toRaw(entry.value.showcase),
      title: entry.value.title,
      prompt: toRaw(entry.value.prompt),
      imagePath: entry.value.imagePath,
      slug: entry.value.slug,
      id: entry.value.id
    }
    if (parsedEntry.value && parsedEntry.value.id) {
      await indexedDb.entry.update(parsedEntry.value.id, entryToSave)
    } else if (!props.id) {
      await indexedDb.entry.add({
        ...entryToSave,
        imageFile: entry.value.imageFile
      })
    }
    emit('hideDialog', entry.value.slug)

    parsedEntry.value = { ...entry }
    await errorStore.throwError(e, failureMessage)
  }
}

// ----- Image selection / uploading ----- \\
async function uploadPhoto() {
  if (!uploadedImage.value) {
    if (entry.value.image && !entry.value.imagePath) {
      URL.revokeObjectURL(entry.value.image)
    }
    entry.value.image = null
    entry.value.imageFile = null
    return
  }

  if (uploadedImage.value instanceof Blob) {
    if (entry.value.image && !entry.value.imagePath) {
      URL.revokeObjectURL(entry.value.image)
    }

    entry.value.imageFile = uploadedImage.value
    entry.value.image = URL.createObjectURL(entry.value.imageFile)
    if (parsedEntry.value) {
      parsedEntry.value.image = URL.createObjectURL(entry.value.imageFile)
    }
    // UPDATE INDEXEDDB IMAGE IF IT EXISTS
    if (parsedEntry.value && parsedEntry.value.id) {
      await indexedDb.entry.update(parsedEntry.value.id, {
        image: entry.value.image,
        imageFile: entry.value.imageFile
      })
      parsedEntry.value.image = entry.value.image
      parsedEntry.value.imageFile = entry.value.imageFile
    }
  }
}

function captureCamera(imageBlob) {
  uploadedImage.value = imageBlob
  uploadPhoto()
}

function updateRecentUploadsRef(updatedArts) {
  recentUploadsRef.value.push(updatedArts)
}

function updateRecentArtistImageRef(artistImage) {
  recentArtistImage.value = artistImage
}

function resetEntry() {
  indexedDb.entry?.clear()
  parsedEntry.value = null
  entry.value.author = userStore.isAuthenticated ? { label: userStore.getUser.displayName, value: userStore.getUser.uid } : null
  entry.value.description = ''
  entry.value.title = ''
  entry.value.image = null
  entry.value.prompt = null
  entry.value.showcase = { arts: [], artist: { info: '', photo: '', file: null } }
  if (entry.value.image && !entry.value.imagePath) {
    URL.revokeObjectURL(entry.value.image)
  }
  entry.value.image = null
  entry.value.imageFile = null
  uploadedImage.value = null

  $q.notify({ type: 'info', message: 'Entry has been reset.' })
}
</script>
