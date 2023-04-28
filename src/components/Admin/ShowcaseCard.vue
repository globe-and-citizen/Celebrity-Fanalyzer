<template>
  <section class="text-center">
    <q-file class="hidden" multiple ref="artsFileRef" v-model="modelArts" @update:model-value="addArts" />
    <q-btn flat icon="add_circle_outline" label="Upload Art" rounded @click="onUploadArts" />
    <div class="items-center q-my-md q-pa-md rounded-borders row shadow-1">
      <div v-for="(art, index) in modelArts" class="artImg col-grow relative-position" :key="index">
        <q-img fit="contain" :src="art" style="max-height: 10rem" />
        <q-btn class="trashIcon" color="negative" icon="delete" round size="sm" @click="removeArt(art)" />
      </div>
    </div>

    <q-file class="hidden" multiple ref="artistFileRef" v-model="modelArtistPhoto" @update:model-value="addArtistPhoto" />
    <q-btn flat icon="add_circle_outline" label="Upload Artist Photo" rounded @click="onUploadArtist" />
    <div class="items-center no-wrap q-my-md q-pa-md rounded-borders row shadow-1">
      <q-img class="q-mr-md" fit="contain" :src="modelArtistPhoto[0]" style="max-height: 15rem; max-width: 50%" />
      <q-input autogrow class="col-grow" label="Artist info" v-model="modelArtistInfo" @update:model-value="addArtistInfo" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps(['arts', 'artist'])
const emit = defineEmits(['update:arts', 'update:artist'])

const artsFileRef = ref(null)
const artistFileRef = ref(null)
const modelArts = ref(props.arts)
const modelArtistInfo = ref(props.artist.info)
const modelArtistPhoto = ref([props.artist.photo])

function onUploadArts() {
  artsFileRef.value.pickFiles()
}

function onUploadArtist() {
  artistFileRef.value.pickFiles()
}

function addArtistPhoto(files) {
  modelArtistPhoto.value = []
  const reader = new FileReader()
  reader.readAsDataURL(files[0])
  reader.onload = () => modelArtistPhoto.value.push(reader.result)
  emit('update:artist', { ...props.artist, photo: files[0] })
}

function addArtistInfo() {
  emit('update:artist', { ...props.artist, info: modelArtistInfo.value })
}

function addArts(files) {
  modelArts.value = []
  for (const file of files) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => modelArts.value.push(reader.result)
  }
  emit('update:arts', files)
}

function removeArt(file) {
  if (file instanceof File) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const index = modelArts.value.indexOf(reader.result)
      modelArts.value.splice(index, 1)
    }
  } else {
    const index = modelArts.value.indexOf(file)
    modelArts.value.splice(index, 1)
  }
  emit('update:arts', modelArts.value)
}
</script>

<style lang="scss" scoped>
.trashIcon {
  position: absolute;
  right: 15px;
  top: -5px;
  visibility: hidden;
  z-index: 1;
}

.artImg:hover .trashIcon {
  visibility: visible;
}
</style>
