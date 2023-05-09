<template>
  <q-card class="q-mt-none" :class="{ loading: promptStore.isLoading, 'not-loading': !promptStore.isLoading }">
    <q-form autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" @submit.prevent="onSubmit()">
      <q-stepper alternative-labels animated color="primary" header-nav ref="stepper" v-model="step">
        <q-step icon="settings" :name="1" :title="id ? 'Edit Prompt' : 'New Prompt'">
          <q-card-section>
            <div class="row items-baseline no-wrap">
              <h2 class="q-my-none text-h6">Competition</h2>
              <span>&nbsp; for &nbsp;</span>
              <q-input borderless dense :disable="Boolean(id)" readonly style="max-width: 5.5rem" v-model="prompt.date" data-test="date">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" data-test="date-picker">
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
                          <q-btn v-close-popup label="Close" color="primary" flat data-test="close" />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <q-select
              data-test="select-author"
              :disable="!userStore.isAdmin"
              label="Author"
              :options="authorOptions"
              v-model="prompt.author"
            />
            <q-input counter data-test="input-title" hide-hint label="Title" maxlength="80" required v-model="prompt.title" />
            <q-field counter label="Description" maxlength="400" v-model="prompt.description">
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
                  v-model="prompt.description"
                  @paste="onPaste($event)"
                />
              </template>
            </q-field>
            <q-file
              accept=".jpg, image/*"
              counter
              data-test="file-image"
              hide-hint
              hint="Max size is 1MB"
              label="Image"
              :max-total-size="1048487"
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
              data-test="select-categories"
              hide-dropdown-icon
              hide-hint
              hint="Click Enter ↵ to add a new category"
              input-debounce="0"
              label="Categories"
              multiple
              new-value-mode="add-unique"
              use-input
              use-chips
              :rules="[(val) => val?.length > 0 || 'Please select at least one category']"
              v-model="prompt.categories"
            />
            <div class="text-center">
              <q-img v-if="prompt.image" class="q-mt-md" :src="prompt.image" fit="contain" style="max-height: 40vh; max-width: 80vw" />
            </div>
          </q-card-section>
        </q-step>
        <q-step caption="Optional" :done="step > 2" icon="create_new_folder" :name="2" title="Artist Carousel">
          <ShowcaseCard
            collectionName="prompt"
            :date="prompt.date"
            v-model:arts="prompt.showcase.arts"
            v-model:artist="prompt.showcase.artist"
          />
        </q-step>
        <template v-slot:navigation>
          <q-stepper-navigation class="flex justify-end q-gutter-md">
            <q-btn flat rounded label="Cancel" v-close-popup />
            <q-btn
              color="primary"
              data-test="button-submit"
              :disable="!prompt.date || !prompt.title || !prompt.description || !prompt.categories?.length || !prompt.image"
              :label="id ? 'Save Edits' : 'Submit Prompt'"
              rounded
              type="submit"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-form>

    <q-inner-loading color="primary" :showing="promptStore.isLoading" />
  </q-card>
</template>

<script setup>
import { date, useQuasar } from 'quasar'
import ShowcaseCard from 'src/components/Admin/ShowcaseCard.vue'
import { useErrorStore, usePromptStore, useStorageStore, useUserStore } from 'src/stores'
import { onMounted, reactive, ref, watchEffect } from 'vue'

const emit = defineEmits(['hideDialog'])
const props = defineProps(['author', 'categories', 'created', 'date', 'description', 'id', 'image', 'showcase', 'slug', 'title'])

const $q = useQuasar()
const errorStore = useErrorStore()
const promptStore = usePromptStore()
const storageStore = useStorageStore()
const userStore = useUserStore()

const authorOptions = reactive([])
const dataKey = ref(Date.now())
const editorRef = ref(null)
const imageModel = ref([])
const prompt = reactive({
  description: '',
  image: '',
  showcase: { arts: [], artist: { info: '', photo: '' } },
  title: ''
})
const step = ref(1)

watchEffect(() => {
  if (props.id) {
    prompt.author = { label: props.author.displayName, value: props.author.uid }
    prompt.categories = props.categories
    prompt.date = props.date
    prompt.description = props.description
    prompt.id = props.id
    prompt.image = props.image
    prompt.showcase = props.showcase
    prompt.title = props.title
  } else {
    prompt.author = userStore.isAdminOrWriter ? { label: userStore.getUser.displayName, value: userStore.getUser.uid } : null
    prompt.categories = null
    prompt.date = date.formatDate(Date.now(), 'YYYY-MM')
  }
})

onMounted(() => {
  userStore.getAdminsAndWriters.forEach((user) => authorOptions.push({ label: user.displayName, value: user.uid }))
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
  prompt.slug = prompt.title.toLowerCase().replace(/[^0-9a-z]+/g, '-')

  if (!props.id && promptStore.getPrompts.find((p) => p.date === prompt.date)) {
    $q.notify({ type: 'negative', message: 'Choose another month for this prompt.' })
    return
  }

  if (Object.keys(imageModel.value).length) {
    promptStore
      .uploadImage(imageModel.value, prompt.date)
      .then((res) => (prompt.image = res))
      .catch((error) => errorStore.throwError(error))
  }

  if (props.id) {
    await promptStore
      .editPrompt(prompt)
      .then(() => $q.notify({ type: 'info', message: 'Prompt successfully edited' }))
      .catch((error) => errorStore.throwError(error, 'Prompt edit failed'))
  } else {
    await promptStore
      .addPrompt(prompt)
      .then(() => $q.notify({ type: 'positive', message: 'Prompt successfully submitted' }))
      .catch((error) => errorStore.throwError(error, 'Prompt submission failed'))
  }

  emit('hideDialog')
}
</script>
