<template>
  <q-card class="q-mt-none full-width" :class="{ loading: advertiseStore.isLoading, 'not-loading': !advertiseStore.isLoading }">
    <q-form autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" @submit.prevent="onSubmit()">
      <q-stepper alternative-labels animated color="primary" header-nav v-model="step">
        <q-step icon="settings" :name="1" :title="id ? 'Edit Advertise' : 'New Advertise'">
          <q-card-section>
            <q-input
              counter
              data-test="input-title"
              label="Title"
              maxlength="80"
              required
              v-model="advertise.title"
              :hint="!advertise.title ? '*Title is required' : ''"
            />
            <div class="q-py-md">
              <div class="flex items-center justify-between">
                <div>Select Add type :</div>
                <q-radio v-model="advertise.type" val="Banner" label="Banner" />
                <q-radio v-model="advertise.type" val="Text" label="Text" />
              </div>
            </div>
            <q-file
              v-if="advertise.type === 'Banner'"
              v-model="uploadedImage"
              counter
              class="q-mb-lg"
              data-test="file-image"
              :hint="!advertise.image ? '*Image is required. Max size is 2MB.' : fileErrorMessage"
              :label="advertise.type === 'Banner' ? 'Image' : 'Video'"
              :max-total-size="5242880"
              :required="!id"
              use-chips
              :accept="advertise.type === 'Banner' ? '.jpg, image/*' : '.mp4, .mkv'"
              @rejected="onRejected()"
              @update:model-value="uploadPhoto()"
            >
              <template v-slot:append>
                <q-icon :name="advertise.type === 'Banner' ? 'image' : 'videocam'" />
              </template>
            </q-file>
            <div v-if="advertise.type === 'Banner'" class="text-center">
              <q-img
                v-if="advertise.image"
                class="q-mt-md"
                fit="contain"
                style="max-height: 40vh; max-width: 80vw"
                :src="advertise.image"
              />
            </div>
            <q-field
              counter
              label="Description"
              maxlength="6000"
              v-model="advertise.content"
              :hint="!advertise.content ? '*Description is required' : ''"
              :rules="[(val) => val.length <= 6000 || 'Description cannot exceed 6000 characters']"
            >
              <template v-slot:control>
                <q-editor
                  class="q-mt-md"
                  data-test="input-description"
                  dense
                  flat
                  min-height="5rem"
                  ref="editorRef"
                  :max-length="6000"
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
                  v-model="advertise.content"
                  @paste="onPaste($event)"
                  @keydown="onKeyDown($event)"
                  style="word-break: break-all; overflow-wrap: break-word"
                />
              </template>
            </q-field>
            <q-input
              v-model="advertise.productLink"
              counter
              hide-hint
              class="q-mb-lg"
              label="Product URL"
              :rules="[(url) => (url ? isUrlValid(url) : true) || 'Please enter a valid url']"
            />
            <q-input
              v-model="advertise.publishDate"
              filled
              readonly
              mask="date"
              label="Publish date"
              :rules="['date']"
              @click="openDatePicker"
              :hint="!advertise.publishDate ? '*Publish Date is required' : ''"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy v-model="datePickerVisible" cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="advertise.publishDate" :options="(date) => date >= getCurrentDate()">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              v-model.number="advertise.duration"
              label="Duration(day's)"
              :hint="!advertise.duration ? '*Duration is required' : ''"
              class="q-mb-lg"
              type="number"
              :min="1"
              :rules="[(duration) => duration > 0 || 'Enter a positive number']"
            />
            <q-input
              v-if="!props.id"
              v-model="usdAmount"
              label="Price in USD"
              :hint="!usdAmount ? '*Minimum Price is required' : ''"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              :rules="[() => (usdAmount < 0.01 ? 'Minimum allowed budget is 3 USD' : true)]"
              @update:model-value="convertToMatic()"
            />
            <q-input
              v-if="!props.id"
              v-model="advertise.budget"
              readonly
              label="Budget In POL"
              class="q-mb-lg"
              :rules="[(budget) => (budget ? budget >= 0 : true || 'Enter a positive number')]"
            />
          </q-card-section>
        </q-step>
        <template v-slot:navigation>
          <q-stepper-navigation class="flex justify-end q-gutter-md">
            <q-btn flat rounded label="Reset" @click="resetAd" v-if="parsedAd?.title" data-test="reset-button" />
            <q-btn flat rounded label="Cancel" v-close-popup />
            <q-btn
              rounded
              type="submit"
              color="primary"
              data-test="button-submit"
              :disable="
                !advertise.title ||
                !advertise.content ||
                !advertise.duration ||
                !advertise.publishDate ||
                (advertise.type === 'Banner' && (fileError || (uploadedImage?.length <= 0 && advertise.contentURL.length <= 0)))
              "
              :label="id ? 'Save Edits' : 'Submit '"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-form>
  </q-card>
</template>

<script setup>
import { db } from 'src/firebase'
import { collection, doc } from 'firebase/firestore'
import { LocalStorage, useQuasar } from 'quasar'
import { useAdvertiseStore, useErrorStore, useStorageStore, useUserStore } from 'src/stores'
import { calculateEndDate, currentYearMonth, getCurrentDate } from 'src/utils/date'
import { onMounted, ref, watch, toRaw, nextTick } from 'vue'
import { contractCreateAdCampaign } from 'app/src/web3/adCampaignManager'
import { customWeb3modal } from 'app/src/web3/walletConnect'
import { fetchMaticRate } from 'app/src/web3/transfers.js'
import { indexedDb } from 'src/utils/indexeddb'

const emit = defineEmits(['hideDialog'])
const props = defineProps([
  'author',
  'date',
  'content',
  'id',
  'title',
  'productLink',
  'publishDate',
  'type',
  'content',
  'duration',
  'image',
  'status',
  'contentURL',
  'budget',
  'campaignCode'
])

const $q = useQuasar()
const errorStore = useErrorStore()
const advertiseStore = useAdvertiseStore()
const storageStore = useStorageStore()
const userStore = useUserStore()
const datePickerVisible = ref(false)
const fileErrorMessage = ref('')
const fileError = ref(false)
const usdAmount = ref(0)
const maticRate = ref(0)
const editorRef = ref(null)
const uploadedImage = ref(null)
const lastDescriptionNotificationTime = ref(0)
const parsedAd = ref(null)
const advertise = ref({
  content: '',
  title: '',
  productLink: '',
  contentURL: '',
  campaignCode: '',
  type: '',
  image: '',
  imageFile: '',
  imagePath: '',
  author: ''
})

const collectionRef = collection(db, 'advertises')
const docRef = doc(collectionRef)
function openDatePicker() {
  datePickerVisible.value = true
}

onMounted(async () => {
  if (!customWeb3modal.getAddress()) {
    customWeb3modal.open()
    emit('hideDialog')
  }
  const maticRateResult = await fetchMaticRate()
  if (maticRateResult?.success) {
    maticRate.value = maticRateResult.maticRate
  } else {
    $q.notify({ type: 'negative', message: 'Failed to fetch Pol rate' })
  }

  await loadPromptFromDexie()
  if (parsedAd.value && !props.id) {
    usdAmount.value = parsedAd.value.usdAmount
    advertise.value = {
      ...advertise.value,
      ...parsedAd.value,
      author: userStore.isAuthenticated ? { id: userStore.getUser.uid } : null,
      id: docRef.id
    }

    if (parsedAd.value.imageFile instanceof Blob) {
      advertise.value.image = URL.createObjectURL(parsedAd.value.imageFile)
      uploadedImage.value = parsedAd.value.imageFile
    }
  } else if (props.id) {
    advertise.value.author = props.author
    advertise.value.categories = props.categories
    advertise.value.date = props.date
    advertise.value.content = props.content
    advertise.value.id = props.id
    advertise.value.title = props.title
    advertise.value.image = props.image || ''
    advertise.value.productLink = props.productLink
    advertise.value.publishDate = props.publishDate
    advertise.value.type = props.type
    advertise.value.budget = props.budget
    advertise.value.duration = props.duration
    advertise.value.status = props.status
    advertise.value.contentURL = props.contentURL ?? ''
  } else {
    advertise.value = {
      ...advertise.value,
      author: userStore.isAuthenticated ? { uid: userStore.getUser.uid } : null,
      id: docRef.id
    }
  }
})

async function loadPromptFromDexie() {
  try {
    const ads = await indexedDb.ad.toArray()
    parsedAd.value = ads[ads.length - 1] || null
  } catch (error) {
    console.error('Failed to load entries from Dexie:', error)
    parsedAd.value = null
  }
}

const step = ref(1)

async function uploadPhoto() {
  if (!uploadedImage.value) {
    if (advertise.value.image && !advertise.value.imagePath) {
      URL.revokeObjectURL(advertise.value.image)
    }
    advertise.value.image = null
    advertise.value.imageFile = null
    return
  }

  if (uploadedImage.value instanceof Blob) {
    if (advertise.value.image && !advertise.value.imagePath) {
      URL.revokeObjectURL(advertise.value.image)
    }
    advertise.value.imageFile = uploadedImage.value
    advertise.value.image = URL.createObjectURL(advertise.value.imageFile)
    if (parsedAd.value) {
      parsedAd.value.image = URL.createObjectURL(advertise.value.imageFile)
    }
    // UPDATE INDEXEDDB IMAGE IF IT EXISTS
    if (parsedAd.value && parsedAd.value.id) {
      await indexedDb.ad.update(parsedAd.value.id, {
        image: advertise.value.image,
        imageFile: advertise.value.imageFile
      })

      parsedAd.value.image = advertise.value.image
      parsedAd.value.imageFile = advertise.value.imageFile
    }
  }
}

function onRejected() {
  $q.notify({ type: 'negative', message: 'File size is too big. Max file size is 5MB.' })
  fileErrorMessage.value = 'Max file size is 5MB.'
  fileError.value = true
}

function isUrlValid(userInput = '') {
  const res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)
  return res !== null
}

async function createAdCampaign(payload) {
  return await contractCreateAdCampaign(payload)
}
function convertToMatic() {
  if (maticRate.value && usdAmount.value && maticRate.value) {
    advertise.value.budget = (usdAmount.value / maticRate.value).toFixed(6)
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

  if (advertise.value.content.length >= 6000) {
    if (!['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      showDescriptionNotification('Max 6000 characters reached')
    }
  }
}

function onPaste(evt) {
  if (evt.target.nodeName === 'INPUT') return
  let text, onPasteStripFormattingIEPaste
  evt.preventDefault()
  evt.stopPropagation()

  const currentLength = advertise.value.content.length

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

watch(
  () => advertise.value.content,
  (newContent) => {
    if (newContent && newContent.length > 6000) {
      advertise.value.content = newContent.substring(0, 6000)
    }
  },
  { immediate: true }
)

async function onSubmit() {
  try {
    if (!advertise.value.budget) advertise.value.budget = 0

    $q.loading.show()
    advertise.value.endDate = calculateEndDate(advertise.value.publishDate, advertise.value.duration)
    if (advertise.value.type === 'Text') advertise.value.contentURL = ''
    // if (Object.keys(contentModel.value).length && advertise.value.type === 'Banner') {
    //   await storageStore
    //     .uploadFile(contentModel.value, `advertise/content-${advertise.value.id}`)
    //     .then((url) => (advertise.value.contentURL = url))
    //     .catch((error) => errorStore.throwError(error))
    // }

    if (props.id) {
      if (props.type === 'Banner' && advertise.value.type === 'Text') {
        const imagePath = `advertise/content-${advertise.value.id}`
        storageStore.deleteFile(imagePath).catch((error) => console.log(error))
        advertise.value.contentURL = ''
      }
      await advertiseStore
        .editAdvertise(advertise.value)
        .then(() => $q.notify({ type: 'info', message: 'Advertise successfully edited' }))
        .catch((error) => {
          errorStore.throwError(error, 'Advertise edit failed')
        })
        .finally(() => $q.loading.hide())
    } else {
      const result = await createAdCampaign({ budgetInMatic: advertise.value.budget })
      if (result.status.includes('success')) {
        advertise.value.campaignCode = result.events[0].args.campaignCode
        // throw new Error('')
        await advertiseStore
          .addAdvertise(advertise.value)
          .then(() => {
            $q.notify({ type: 'positive', message: 'Advertise successfully submitted' })
            emit('hideDialog')
          })
          .catch((error) => {
            saveDraftAd()
            errorStore.throwError(error, 'Advertise submission failed')
          })
          .finally(() => {
            resetAd()
            $q.loading.hide()
          })
      } else {
        $q.notify({ message: result?.error?.message, type: 'negative' })
        $q.loading.hide()
        await saveDraftAd()
      }
    }
    emit('hideDialog')
  } catch (error) {
    $q.notify({ message: 'Advertise submission failed', type: 'negative' })
    await errorStore.throwError(error, 'Advertise submission failed')
    await saveDraftAd()
    emit('hideDialog')
    $q.loading.hide()
  }
  emit('hideDialog')
}

async function saveDraftAd() {
  const adToSave = {
    content: toRaw(advertise.value.content),
    usdAmount: toRaw(usdAmount.value),
    title: toRaw(advertise.value.title),
    publishDate: toRaw(advertise.value.publishDate),
    campaignCode: toRaw(advertise.value.campaignCode),
    contentURL: toRaw(advertise.value.contentURL),
    duration: toRaw(advertise.value.duration),
    endDate: toRaw(advertise.value.endDate),
    image: toRaw(advertise.value.image),
    imageFile: toRaw(advertise.value.imageFile),
    productLink: toRaw(advertise.value.productLink),
    type: toRaw(advertise.value.type),
    budget: toRaw(advertise.value.budget),
    author: toRaw(advertise.value.author),
    id: docRef.id,
    date: currentYearMonth()
  }

  if (parsedAd.value && parsedAd.value.id) {
    await indexedDb.ad.update(parsedAd.value.id, adToSave)
  } else {
    await indexedDb.ad.add(adToSave)
  }
}

function resetAd() {
  indexedDb.ad?.clear()
  const clearedAd = {
    content: '',
    usdAmount: '',
    title: '',
    publishDate: '',
    campaignCode: '',
    contentURL: '',
    duration: '',
    endDate: '',
    image: null,
    imageFile: null,
    productLink: '',
    type: '',
    budget: '',
    author: ''
  }
  usdAmount.value = 0
  advertise.value = { ...clearedAd }
  uploadedImage.value = null
  parsedAd.value = null

  nextTick(() => {
    $q.notify({ type: 'info', message: 'Advertisement has been reset.' })
  })
}
</script>
