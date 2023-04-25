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
      <q-uploader accept="image/*" bordered flat label="Artist Photo" style="max-height: 16rem" @added="addArtistPhoto" />
      <q-input
        label="Artist info"
        outlined
        type="textarea"
        style="width: 20rem"
        :model-value="artist.info"
        @update:model-value="$emit('update:artist', { info: $event, photo: artist.photo })"
      />
    </div>
  </section>
</template>

<script setup>
const props = defineProps(['arts', 'artist'])
const emit = defineEmits(['update:arts', 'update:artist'])

function addArtistPhoto(file) {
  emit('update:artist', { ...props.artist, photo: file[0] })
}

function addArts(files) {
  emit('update:arts', files)
}

function removeArt(file) {
  const reader = new FileReader()
  reader.readAsDataURL(file[0])
  reader.onload = () => {
    const index = arts.value.indexOf(reader.result)
    emit('update:arts', [...props.arts.slice(0, index), ...props.arts.slice(index + 1)])
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
