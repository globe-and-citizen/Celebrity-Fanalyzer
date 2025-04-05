<template>
  <section>
    <!-- Artist Info Section -->
    <div class="text-left q-mb-lg">
      <h6 class="text-weight-medium q-my-none">Upload your artist photo</h6>
      <p class="text-caption text-grey-7 q-mt-sm q-mb-md">This photo will be used as a separate carousel slide with your artist info</p>

      <div class="row q-col-gutter-md reverse-wrap aritst-wrapper">
        <!-- Artist Photo Upload -->
        <div class="col-12 col-md-4 col-lg-3">
          <div class="upload-placeholder cursor-pointer" @click="onUploadArtist" :class="{ 'has-image': modelArtistPhoto }">
            <template v-if="modelArtistPhoto">
              <q-img :src="modelArtistPhoto" fit="fill" style="height: 100%; width: 100%" />
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
        @update:model-value="addArtistPhoto"
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
        These images will be featured in the carousel to showcase your artwork. You can upload up to 5 images.
      </p>

      <div class="row q-col-gutter-md art-grid">
        <!-- Existing Art Images -->
        <template v-for="(art, index) in modelArts" :key="index">
          <div class="col-2">
            <div class="upload-placeholder has-image relative-position">
              <q-img :src="art" style="height: 100%; width: 100%" />
              <q-btn class="trash-icon" round flat dense icon="delete" @click="removeArt(art)" data-test="remove-art-btn" />
            </div>
          </div>
        </template>

        <!-- Add More Button -->
        <div class="col-2" v-if="modelArts.length < 5">
          <div class="upload-placeholder cursor-pointer" @click="onUploadArts">
            <div class="upload-icon-wrapper">
              <q-icon name="add" size="24px" color="grey-7" />
              <div class="text-caption text-grey-7 q-mt-sm">Add more</div>
            </div>
          </div>
        </div>
      </div>

      <q-file
        class="hidden"
        ref="artsFileRef"
        v-model="modelFileArt"
        @update:model-value="addArts"
        :filter="checkFileSize"
        @rejected="onRejected"
        accept="image/*"
        multiple
        :max-files="5"
        data-test="upload-arts"
      />
    </div>
  </section>
</template>

<script setup>
import { useErrorStore, useStorageStore } from 'src/stores'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { uploadAndSetImage } from 'src/utils/imageConvertor'
import { uid } from 'quasar'

const props = defineProps(['arts', 'artist', 'collectionName', 'date', 'entryTitle'])
const emit = defineEmits(['update:arts', 'update:artist', 'updateRecentUploads', 'updateRecentArtistImage'])

const errorStore = useErrorStore()
const storageStore = useStorageStore()

const artsFileRef = ref(null)
const artistFileRef = ref(null)
const modelArts = ref(props.arts || [])
const modelArtistInfo = ref(props.artist.info)
const modelArtistPhoto = ref(props.artist.photo)
const modelFileArt = ref(null)
const modelFileArtist = ref(null)
const $q = useQuasar()

function onUploadArts() {
  artsFileRef.value.pickFiles()
}

function onUploadArtist() {
  artistFileRef.value.pickFiles()
}

function checkFileSize(files) {
  return files.filter((file) => file.size > 2048)
}

function onRejected(rejectedEntries) {
  $q.notify({
    type: 'negative',
    message: `${rejectedEntries.length} file(s) did not pass validation constraints`
  })
}

async function addArts(files) {
  const maxImages = 5
  const remainingImages = maxImages - modelArts.value.length

  if (remainingImages <= 0) {
    $q.notify({ type: 'negative', message: `You can only upload ${maxImages} images` })
    await errorStore.throwError(`You can only upload ${maxImages} images`)
    return
  }

  const filesToUpload = files.slice(0, remainingImages)

  for (const index in filesToUpload) {
    const uploaded = await uploadAndSetImage(filesToUpload[index], `images/${props.collectionName}-${props.date}-${uid()}`)
    modelArts.value.push(uploaded)
    emit('updateRecentUploads', uploaded)
  }

  emit('update:arts', modelArts.value)

  if (filesToUpload.length < files.length) {
    $q.notify({
      type: 'negative',
      message: `${filesToUpload.length} file(s) were uploaded. You can upload maximum 5 images`
    })
  }
}

function removeArt(file) {
  const index = modelArts.value.indexOf(file)
  const imgId = file.match(/entry-[^?\/]+/)
  storageStore
    .deleteFile(`images/${imgId}`)
    .then(() => modelArts.value.splice(index, 1))
    .catch((error) => errorStore.throwError(error))
  emit('update:arts', modelArts.value)
}

async function addArtistPhoto(files) {
  modelArtistPhoto.value = ''
  modelArtistPhoto.value = await uploadAndSetImage(files, `images/${props.collectionName}-${props.date}-artist`)
  emit('update:artist', { ...props.artist, photo: modelArtistPhoto.value })
  emit('updateRecentArtistImage', modelArtistPhoto.value)
}

function addArtistInfo() {
  emit('update:artist', { ...props.artist, info: modelArtistInfo.value })
}
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
