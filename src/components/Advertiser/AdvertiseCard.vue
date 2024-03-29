<template>
  <q-card class="q-mt-none" :class="{ loading: advertiseStore.isLoading, 'not-loading': !advertiseStore.isLoading }">
    <q-form autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" @submit.prevent="onSubmit()">
      <q-stepper alternative-labels animated color="primary" header-nav ref="stepper" v-model="step">
        <q-step icon="settings" :name="1" :title="id ? 'Edit Advertise' : 'New Advertise'">
          <q-card-section>
            <!-- <q-select
              data-test="select-author"
              :label="advertise.author.label"
              :disable="true"
              v-model="advertise.author"
            /> -->
            <q-input counter data-test="input-title" hide-hint label="Title" maxlength="80" required v-model="advertise.title" />
            <q-field counter label="Description" maxlength="400" v-model="advertise.description">
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
                  v-model="advertise.description"
                  @paste="onPaste($event)"
                />
              </template>
            </q-field>
            <!-- <q-file
              accept=".jpg, image/*"
              counter
              data-test="file-image"
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
            </q-file> -->
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
              v-model="advertise.categories"
            />
            <div class="text-center">
              <q-img v-if="advertise.image" class="q-mt-md" :src="advertise.image" fit="contain" style="max-height: 40vh; max-width: 80vw" />
            </div>
          </q-card-section>
        </q-step>
        <template v-slot:navigation>
          <q-stepper-navigation class="flex justify-end q-gutter-md">
            <q-btn flat rounded label="Cancel" v-close-popup />
            <q-btn
              color="primary"
              data-test="button-submit"
              :disable="!advertise.date || !advertise.title || !advertise.description || !advertise.categories?.length || !advertise.image"
              :label="id ? 'Save Edits' : 'Submit '"
              :loading="advertiseStore.isLoading"
              rounded
              type="submit"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-form>
  </q-card>
</template>

<script setup>
import { useQuasar } from 'quasar'
import ShowcaseCard from 'src/components/Admin/ShowcaseCard.vue'
import { useErrorStore,  useStorageStore, useUserStore, useAdvertiseStore } from 'src/stores'
import { currentYearMonth } from 'src/utils/date'
import { onMounted, reactive, ref, watchEffect } from 'vue'

const emit = defineEmits(['hideDialog'])
const props = defineProps(['author', 'categories', 'created', 'date', 'description', 'id', 'image', 'showcase', 'slug', 'title'])

const $q = useQuasar()
const errorStore = useErrorStore()
const advertiseStore =useAdvertiseStore()
const storageStore = useStorageStore()
const userStore = useUserStore()
const dataKey = ref(Date.now())
const editorRef = ref(null)
const imageModel = ref([])
const advertise = reactive({
  description: '',
  image: '',
  showcase: { arts: [], artist: { info: '', photo: '' } },
  title: ''
})
const step = ref(1)

watchEffect(() => {
  if (props.id) {
    advertise.author = { label: props.author.displayName, value: props.author.uid }
    advertise.categories = props.categories
    advertise.date = props.date
    advertise.description = props.description
    advertise.id = props.id
    advertise.image = props.image
    advertise.showcase = props.showcase
    advertise.title = props.title
  } else {
    advertise.author = userStore.isWriterOrAbove ? { label: userStore.getUser.displayName, value: userStore.getUser.uid } : null
    advertise.categories = ["default"]
    advertise.date = currentYearMonth()
  }
})

function onUpdateMonth() {
  dataKey.value = Date.now()
}

function uploadPhoto() {
  advertise.image = ''
  const reader = new FileReader()
  reader.readAsDataURL(imageModel.value)
  reader.onload = () => (advertise.image = reader.result)
}

function onRejected() {
  $q.notify({ type: 'negative', message: 'File size is too big. Max file size is 5MB.' })
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
  advertise.slug = '/' + advertise.title.toLowerCase().replace(/[^0-9a-z]+/g, '-')


  // if (Object.keys(imageModel.value).length) {
  //   await storageStore
  //     .uploadFile(imageModel.value, `images/prompt-${advertise.date}`)
  //     .then((url) => (advertise.image = url))
  //     .catch((error) => errorStore.throwError(error))
  // }

  if (props.id) {
    await advertiseStore
      .editAdvertise(prompt)
      .then(() => $q.notify({ type: 'info', message: 'Prompt successfully edited' }))
      .catch((error) => errorStore.throwError(error, 'Prompt edit failed'))
  } else {
    await advertiseStore
      .addAdvertise(prompt)
      .then(() => $q.notify({ type: 'positive', message: 'Prompt successfully submitted' }))
      .catch((error) => errorStore.throwError(error, 'Prompt submission failed'))
  }

  emit('hideDialog')
}
</script>
