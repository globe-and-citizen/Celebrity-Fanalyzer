<template>
  <section class="text-center">
    <q-file class="hidden" multiple ref="artsFileRef" v-model="modelArts" @update:model-value="addArts" />
    <q-btn flat icon="add_circle_outline" label="Upload Arts" rounded @click="onUploadArts" />
    <div class="items-center q-my-md q-pa-md rounded-borders row shadow-1">
      <div v-for="(art, index) in modelArts" class="artImg col-grow relative-position" :key="index">
        <q-img fit="contain" :src="art" style="max-height: 10rem" />
        <q-btn class="trashIcon" color="negative" icon="delete" round size="sm" @click="removeArt" />
      </div>
    </div>

    <q-file class="hidden" multiple ref="artistFileRef" v-model="modelArtist" @update:model-value="addArtistPhoto" />
    <q-btn flat icon="add_circle_outline" label="Upload Artist Photo" rounded @click="onUploadArtist" />
    <div class="flex q-gutter-md q-mt-md q-pa-md rounded-borders shadow-1">
      <q-img class="col-6" :src="artist.photo" width="12rem" />
      <q-input
        label="Artist info"
        style="width: 20rem"
        type="textarea"
        :model-value="artist.info"
        @update:model-value="$emit('update:artist', { info: $event, photo: artist.photo })"
      />
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
const modelArtist = ref(null) // TODO: handle with artist.photo

function onUploadArts() {
  artsFileRef.value.pickFiles()
}

function onUploadArtist() {
  artistFileRef.value.pickFiles()
}

function addArtistPhoto(files) {
  modelArtist.value = []
  const reader = new FileReader()
  reader.readAsDataURL(files[0])
  reader.onload = () => modelArtist.value.push(reader.result)
  emit('update:artist', { ...props.artist, photo: files[0] })
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
  // TODO: Develop a better way to remove arts
  const reader = new FileReader()
  reader.readAsDataURL(file[0])
  reader.onload = () => {
    const index = arts.value.indexOf(reader.result)
    emit('update:arts', [...props.arts.slice(0, index), ...props.arts.slice(index + 1)])
  }
}
</script>

<style lang="scss" scoped>
.artImg {
  transition: all 0.3s ease-in-out;
}
.trashIcon {
  position: absolute;
  right: 15px;
  top: -5px;
  visibility: hidden;
  z-index: 1000;
}

.artImg:hover .trashIcon {
  visibility: visible;
  z-index: 1;
}
</style>
