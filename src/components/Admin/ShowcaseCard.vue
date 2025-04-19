<template>
  <section class="text-center">
    <q-input
      autogrow
      class="col-grow q-pb-xl"
      hint="Max length 180 characters (optional)"
      label="Artist info"
      data-test="artist-info-input"
      v-model="modelArtistInfo"
      @update:model-value="addArtistInfo"
      maxlength="180"
    />
    <q-file
      class="hidden"
      ref="artistFileRef"
      v-model="modelFileArtist"
      @update:model-value="uploadArtistPhoto"
      :filter="checkFileSize"
      @rejected="onRejected"
      accept="image/*"
      data-test="upload-artist-photo"
    />
    <q-btn flat icon="add_circle_outline" label="Upload Artist Photo" rounded @click="onUploadArtist" />
    <div v-if="modelArtistPhoto" class="items-center no-wrap q-my-md q-pa-md rounded-borders col shadow-1">
      <q-img
        class="artist-img q-mr-md rounded-borders"
        fit="contain"
        :src="modelArtistPhoto"
        spinner-color="primary"
        data-test="author-image"
      />
    </div>

    <q-file
      class="hidden"
      ref="artsFileRef"
      v-model="modelFileArt"
      @update:model-value="uploadArts"
      :filter="checkFileSize"
      @rejected="onRejected"
      accept="image/*"
      multiple
      :max-files="10"
      data-test="upload-arts"
    />
    <q-btn flat icon="add_circle_outline" label="Upload Art" rounded @click="onUploadArts">
      <q-tooltip>Max 10 Images</q-tooltip>
    </q-btn>
    <div v-if="modelArts.length" class="items-center q-my-md q-pa-md rounded-borders row shadow-1">
      <div v-for="(art, index) in modelArts" class="art-img q-ma-xs relative-position" :key="index">
        <q-img class="rounded-borders" fit="cover" :ratio="1" :src="art.preview ?? art" style="width: 10rem" data-test="arts-images" />
        <q-btn class="trash-icon" color="negative" icon="delete" round size="sm" @click="removeArt(index)" data-test="remove-art-btn" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps(['arts', 'artist', 'collectionName', 'date', 'entryTitle'])
const emit = defineEmits(['update:arts', 'update:artist'])
const $q = useQuasar()
const artsFileRef = ref(null)
const artistFileRef = ref(null)
const modelArts = ref([])
const modelArtistInfo = ref(props.artist?.info || '')
const modelArtistPhoto = ref(props.artist?.preview || '')
const modelFileArt = ref(null)
const modelFileArtist = ref(null)

// File size validation
function checkFileSize(files) {
  return files.filter((file) => file.size <= 2097152)
}

// Notify on rejected files
function onRejected() {
  $q.notify({
    type: 'negative',
    message: `File size is too big. Max file size is 2MB.`
  })
}

// Trigger artist photo upload
function onUploadArtist() {
  artistFileRef.value?.pickFiles()
}

// Trigger arts upload
function onUploadArts() {
  artsFileRef.value?.pickFiles()
}

// Handle artist photo upload
async function uploadArtistPhoto(file) {
  if (!file) {
    if (modelArtistPhoto.value && modelArtistPhoto.value.startsWith('blob:')) {
      URL.revokeObjectURL(modelArtistPhoto.value)
    }
    modelArtistPhoto.value = ''
    modelFileArtist.value = null
    emit('update:artist', { info: modelArtistInfo.value, photo: '', file: null })
    return
  }

  if (file instanceof Blob) {
    if (modelArtistPhoto.value && modelArtistPhoto.value.startsWith('blob:')) {
      URL.revokeObjectURL(modelArtistPhoto.value)
    }
    modelFileArtist.value = file
    modelArtistPhoto.value = URL.createObjectURL(file)
    emit('update:artist', {
      info: modelArtistInfo.value,
      photo: modelArtistPhoto.value,
      file: modelFileArtist.value
    })
  }
}

// Handle arts upload
async function uploadArts(files) {
  const maxImages = 10
  const remainingImages = maxImages - modelArts.value.length

  if (!files || files.length === 0) return
  if (remainingImages <= 0) {
    $q.notify({ type: 'negative', message: `You can only upload ${maxImages} images` })
    return
  }
  const filesToPreview = Array.from(files).slice(0, remainingImages)

  filesToPreview.forEach((file) => {
    if (file instanceof Blob) {
      modelArts.value.push({ file: file, preview: URL.createObjectURL(file) })
    }
  })
  emit('update:arts', modelArts.value)
}

// Remove an art item
function removeArt(index) {
  const art = modelArts.value[index]
  if (art.preview?.startsWith('blob:')) {
    URL.revokeObjectURL(art.preview)
  }
  modelArts.value.splice(index, 1)
  emit('update:arts', modelArts.value)
}

// Update artist info
function addArtistInfo() {
  emit('update:artist', {
    info: modelArtistInfo.value,
    photo: modelArtistPhoto.value,
    file: modelFileArtist.value
  })
}

onMounted(async () => {
  if (props) {
    if (props.artist && props.artist.file instanceof Blob) {
      modelArtistPhoto.value = URL.createObjectURL(props.artist.file)
    }

    if (props.arts) {
      props.arts.forEach((art) => {
        if (art && art.file instanceof Blob) {
          art = { file: art.file, preview: URL.createObjectURL(art.file) }
          modelArts.value.push(art)
          return art
        } else {
          modelArts.value.push(art)
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.trash-icon {
  position: absolute;
  right: -5px;
  top: -5px;
  visibility: hidden;
  z-index: 1;
}

.art-img:hover .trash-icon {
  visibility: visible;
}

.artist-img {
  max-height: 12rem;
  max-width: 50%;
}
</style>
