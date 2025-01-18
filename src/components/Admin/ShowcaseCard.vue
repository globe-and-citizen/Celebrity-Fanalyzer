<template>
  <section class="text-center">
    <q-input
      autogrow
      class="col-grow q-pb-xl"
      hint="Max length 180 characters (optional)"
      label="Artist info"
      v-model="modelArtistInfo"
      @update:model-value="addArtistInfo"
      maxlength="180"
    />
    <q-file class="hidden" multiple ref="artistFileRef" v-model="modelFileArtist" @update:model-value="addArtistPhoto" />
    <q-btn flat icon="add_circle_outline" label="Upload Artist Photo" rounded @click="onUploadArtist" />
    <div v-if="modelArtistPhoto" class="items-center no-wrap q-my-md q-pa-md rounded-borders col shadow-1">
      <q-spinner v-if="storageStore.isLoading && !modelArtistPhoto" class="q-mx-auto" color="primary" size="3em" style="width: 50%" />
      <q-img v-else class="artist-img q-mr-md rounded-borders" fit="contain" :src="modelArtistPhoto" spinner-color="primary" />
    </div>

    <q-file class="hidden" multiple ref="artsFileRef" v-model="modelFileArt" @update:model-value="addArts" />
    <q-btn flat icon="add_circle_outline" label="Upload Art" rounded @click="onUploadArts" />
    <div v-if="modelArts.length" class="items-center justify-around q-my-md q-pa-md rounded-borders row shadow-1">
      <q-spinner v-if="storageStore.isLoading && !modelArts.length" class="q-mx-auto" color="primary" size="3em" />
      <div v-for="(art, index) in modelArts" class="art-img q-ma-xs relative-position" :key="index">
        <q-img class="rounded-borders" fit="cover" :ratio="1" :src="art" style="width: 10rem" />
        <q-btn class="trash-icon" color="negative" icon="delete" round size="sm" @click="removeArt(art)" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { useErrorStore, useStorageStore } from 'src/stores'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { uploadAndSetImage } from 'src/utils/imageConvertor'

const props = defineProps(['arts', 'artist', 'collectionName', 'date'])
const emit = defineEmits(['update:arts', 'update:artist'])

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

console.log(modelArts)

async function addArts(files) {
  const maxImages = 10

  if (modelArts.value.length >= maxImages) {
    $q.notify({ type: 'negative', message: `You can only upload ${maxImages} images` })
    await errorStore.throwError(`You can only upload ${maxImages} images`)
    return
  }

  for (const index in files) {
    const uploaded = await uploadAndSetImage(files[index], `images/${props.collectionName}-${props.date}-art-${index}`)
    modelArts.value.push(uploaded)
    console.log(uploaded)
  }
  emit('update:arts', modelArts.value)
}

function removeArt(file) {
  const artNum = file.match(/art-(\d+)/)[1]
  const index = modelArts.value.indexOf(file)
  storageStore
    .deleteFile(`images/${props.collectionName}-${props.date}-art-${artNum}`)
    .then(() => modelArts.value.splice(index, 1))
    .catch((error) => errorStore.throwError(error))
  emit('update:arts', modelArts.value)
}

async function addArtistPhoto(files) {
  modelArtistPhoto.value = ''
  await storageStore
    .uploadFile(files[0], `images/${props.collectionName}-${props.date}-artist`)
    .then((url) => (modelArtistPhoto.value = url))
    .catch((error) => errorStore.throwError(error))
  emit('update:artist', { ...props.artist, photo: modelArtistPhoto.value })
}

function addArtistInfo() {
  emit('update:artist', { ...props.artist, info: modelArtistInfo.value })
}
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
