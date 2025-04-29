<template>
  <section>
    <!-- Artist Info Section -->
    <div class="text-left q-mb-lg">
      <h6 class="text-weight-medium q-my-none">Upload your artist photo</h6>
      <p class="text-caption text-grey-7 q-mt-sm q-mb-md">This photo will be used as a separate carousel slide with your artist info</p>

      <div class="row q-col-gutter-md reverse-wrap aritst-wrapper">
        <!-- Artist Photo Upload -->
        <div class="col-12 col-md-4 col-lg-3">
          <div
            class="upload-placeholder cursor-pointer relative-position"
            @click="onUploadArtist"
            :class="{ 'has-image': modelArtistPhoto }"
          >
            <template v-if="modelArtistPhoto">
              <q-img :src="modelArtistPhoto" fit="contain" style="height: 100%; width: 100%" />
              <q-btn class="trash-icon" round flat dense icon="delete" @click.stop="removeArtistPhoto" data-test="remove-art-btn" />
            </template>
            <template v-else>
              <div class="upload-icon-wrapper">
                <q-icon name="add_photo_alternate" size="24px" color="grey-7" />
              </div>
            </template>
          </div>
        </div>

        <!-- Artist Info Input -->
        <div class="col-12 col-md-8 col-lg-9">
          <q-input
            autogrow
            class="artist-info-input"
            :hint="!modelArtistInfo ? 'Max length 180 characters' : ''"
            label="Artist info (optional)"
            data-test="artist-info-input"
            stack-label
            v-model.trim="modelArtistInfo"
            @update:model-value="addArtistInfo"
            maxlength="180"
          />
        </div>
      </div>

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
    </div>

    <!-- Artwork Upload Section -->
    <div class="text-left q-mt-xl">
      <h6 class="text-weight-medium q-my-none">Upload your art</h6>
      <p class="text-caption text-grey-7 q-mt-sm q-mb-md">
        These images will be featured in the carousel to showcase your artwork. You can upload up to 10 images.
      </p>

      <div class="row q-col-gutter-md art-grid">
        <!-- Existing Art Images -->
        <template v-for="(art, index) in modelArts" :key="index">
          <div class="col-2">
            <div class="upload-placeholder has-image relative-position">
              <q-img :src="art.preview ?? art" style="height: 100%; width: 100%" />
              <q-btn class="trash-icon" round flat dense icon="delete" @click="removeArt(index)" data-test="remove-art-btn" />
            </div>
          </div>
        </template>

        <!-- Add More Button -->
        <div class="col-2" v-if="modelArts.length < 10">
          <div class="upload-placeholder cursor-pointer" @click="onUploadArts">
            <div class="upload-icon-wrapper">
              <q-icon name="add" size="24px" color="grey-7" />
              <div class="text-caption text-grey-7 q-mt-sm">{{ modelArts.length === 0 ? 'Add your arts' : 'Add More' }}</div>
            </div>
          </div>
        </div>
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
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps(['arts', 'artist', 'collectionName', 'date', 'entryTitle'])
const emit = defineEmits(['update:arts', 'update:artist', 'update:artsToRemove', 'update:artistImageToRemove'])
const $q = useQuasar()
const artsFileRef = ref(null)
const artistFileRef = ref(null)
const modelArts = ref([])
const modelArtistInfo = ref(props.artist?.info || '')
const modelArtistPhoto = ref(props.artist?.preview || '')
const modelFileArt = ref(null)
const modelFileArtist = ref(null)
const artsToRemove = ref([])
const artistImageUrlToRemove = ref('')
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

  if (art?.preview?.startsWith('https://') || (typeof art === 'string' && art.startsWith('https://'))) {
    artsToRemove.value.push(art.preview ?? art)
    emit('update:artsToRemove', [...artsToRemove.value])
  }

  modelArts.value.splice(index, 1)
  emit('update:arts', modelArts.value)
}

function removeArtistPhoto() {
  if (modelArtistPhoto.value && modelArtistPhoto.value.startsWith('blob:')) {
    URL.revokeObjectURL(modelArtistPhoto.value)
  } else if (
    modelArtistPhoto?.value.startsWith('https://') ||
    (typeof modelArtistPhoto?.value === 'string' && modelArtistPhoto?.value('https://'))
  ) {
    artistImageUrlToRemove.value = modelArtistPhoto.value
    emit('update:artistImageToRemove', artistImageUrlToRemove.value)
  }

  modelArtistPhoto.value = ''
  modelFileArtist.value = null
  emit('update:artist', { info: modelArtistInfo.value, photo: '', file: null })
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
.upload-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--q-primary);
    background-color: #f5f5f5;
  }

  &.has-image {
    border-style: solid;
    border-color: #e0e0e0;

    &:hover {
      .trash-icon {
        opacity: 1;
        visibility: visible;
      }
    }
  }
}

.upload-icon-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.trash-icon {
  position: absolute;
  right: 5px;
  top: 5px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1;
  color: var(--q-primary);

  &:hover {
    background: var(--q-primary);
    color: white;
  }
}

.artist-info-input {
  height: 50%;

  :deep(.q-field__control) {
    height: 50%;
    min-height: 120px;
  }
}

.art-grid {
  .col-2 {
    width: 20%;
  }

  .upload-placeholder {
    height: 200px;
  }
}

// Responsive adjustments
@media (max-width: 850px) {
  .aritst-wrapper {
    flex-direction: column-reverse;
  }
  .upload-placeholder {
    height: 180px;
  }

  .art-grid {
    .col-2 {
      width: 50%;
    }
  }
}

@media (max-width: 599px) {
}
</style>
