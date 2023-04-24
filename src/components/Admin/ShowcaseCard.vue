<template>
  <section class="flex justify-center">
    <q-uploader
      accept="image/*"
      bordered
      class="full-width"
      hide-upload-btn
      label="Arts"
      multiple
      flat
      style="max-height: 32rem"
      @added="addArts"
      @removed="removeArt"
    />

    <div class="flex q-gutter-md q-mt-md">
      <q-uploader accept="image/*" bordered flat label="Artist Photo" style="max-height: 16rem" />
      <q-input label="Artist info" outlined type="textarea" style="width: 20rem" v-model="artist" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const artist = ref('')
const arts = ref([])

function addArts(files) {
  for (const file of files) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => arts.value.push(reader.result)
  }
}

function removeArt(file) {
  const reader = new FileReader()
  reader.readAsDataURL(file[0])
  reader.onload = () => {
    const index = arts.value.indexOf(reader.result)
    arts.value.splice(index, 1)
  }
}
</script>

<style>
.q-uploader__list {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}
</style>
