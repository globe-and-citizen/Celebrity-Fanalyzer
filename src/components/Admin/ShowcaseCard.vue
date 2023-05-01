<template>
  <section class="text-center">
    <q-file class="hidden" multiple ref="artsFileRef" v-model="modelFileArt" @update:model-value="addArts" />
    <q-btn flat icon="add_circle_outline" label="Upload Art" rounded @click="onUploadArts" />
    <div class="items-center justify-around q-my-md q-pa-md rounded-borders row shadow-1">
      <q-spinner v-if="storageStore.isLoading && !modelArts.length" class="q-mx-auto" color="primary" size="3em" />
      <div v-for="(art, index) in modelArts" class="art-img q-ma-xs relative-position" :key="index">
        <q-img class="rounded-borders" fit="cover" :ratio="1" :src="art" style="width: 10rem" />
        <q-btn class="trash-icon" color="negative" icon="delete" round size="sm" @click="removeArt(art)" />
      </div>
    </div>

    <q-file class="hidden" multiple ref="artistFileRef" v-model="modelFileArtist" @update:model-value="addArtistPhoto" />
    <q-btn flat icon="add_circle_outline" label="Upload Artist Photo" rounded @click="onUploadArtist" />
    <div class="items-center no-wrap q-my-md q-pa-md rounded-borders row shadow-1">
      <q-spinner v-if="storageStore.isLoading && !modelArtistPhoto" class="q-mx-auto" color="primary" size="3em" style="width: 50%" />
      <q-img v-else class="artist-img q-mr-md rounded-borders" fit="contain" :src="modelArtistPhoto" spinner-color="primary" />
      <q-input autogrow class="col-grow" label="Artist info" v-model="modelArtistInfo" @update:model-value="addArtistInfo" />
    </div>
  </section>
</template>

<script setup>
import { useErrorStore, useStorageStore } from 'src/stores'
import { ref } from 'vue'

const props = defineProps(['arts', 'artist', 'date'])
const emit = defineEmits(['update:arts', 'update:artist'])

const errorStore = useErrorStore()
const storageStore = useStorageStore()

const artsFileRef = ref(null)
const artistFileRef = ref(null)
const modelArts = ref(props.arts)
const modelArtistInfo = ref(props.artist.info)
const modelArtistPhoto = ref(props.artist.photo)
const modelFileArt = ref(null)
const modelFileArtist = ref(null)

function onUploadArts() {
  artsFileRef.value.pickFiles()
}

function onUploadArtist() {
  artistFileRef.value.pickFiles()
}

async function addArts(files) {
  for (let index in files) {
    await storageStore
      .uploadFile(files[index], `${props.date}-art-${index}`)
      .then((url) => modelArts.value.push(url))
      .catch((error) => errorStore.throwError(error))
  }
  emit('update:arts', modelArts.value)
}

function removeArt(file) {
  const index = modelArts.value.indexOf(file)
  storageStore
    .deleteFile(`${props.date}-art-${index}`)
    .then(() => modelArts.value.splice(index, 1))
    .catch((error) => errorStore.throwError(error))
  emit('update:arts', modelArts.value)
}

async function addArtistPhoto(files) {
  modelArtistPhoto.value = ''
  await storageStore
    .uploadFile(files[0], `${props.date}-artist`)
    .then((url) => (modelArtistPhoto.value = url))
    .catch((error) => errorStore.throwError(error))
  emit('update:artist', { ...props.artist, photo: modelArtistPhoto.value[0] })
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
