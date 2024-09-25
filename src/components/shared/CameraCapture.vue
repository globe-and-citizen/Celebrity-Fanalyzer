<template>
  <q-card>
    <q-card-section class="row items-center">
      <div class="full-width column items-center justify-center">
        <div class="web-cam-taker relative-position">
          <video v-if="!is_taken" ref="camera" :width="width" :height="height" :style="{ borderRadius: '6px' }" autoplay />

          <canvas v-show="is_taken" id="photoTaken" ref="taken_image" :width="width" :height="height"></canvas>

          <div class="absolute-top" :class="{ 'bg-white': is_shooting }" />

          <q-spinner v-if="is_loading" color="grey-lighten-4" />
        </div>

        <q-btn v-if="is_granted" variant="outlined" rounded class="q-px-lg mt-5" color="primary" @click="takePhoto">
          {{ is_taken ? 'RETAKE' : 'CAPTURE' }}
        </q-btn>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancel" color="primary" v-close-popup />
      <q-btn :disable="!is_taken" flat label="Done" color="primary" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { shallowRef, ref, onBeforeUnmount, nextTick, onMounted } from 'vue'
import { requestAndGetUserMedia } from '../../utils/media'

const emit = defineEmits(['onCapture', 'onErrorCaptured'])

const props = defineProps({
  height: {
    type: Number,
    default: 337
  },
  width: {
    type: Number,
    default: 450
  },
  externalStream: {
    type: Object,
    default: null
  }
})

const is_taken = shallowRef(false)
const is_shooting = shallowRef(false)
const is_loading = shallowRef(false)
const is_granted = shallowRef(false)

const camera = ref(null)
const taken_image = ref(null)

onMounted(() => {
  intiateCameraWithPermissions()
})

onBeforeUnmount(() => {
  stopCameraStream()
})

async function intiateCameraWithPermissions() {
  is_loading.value = true

  if (props.externalStream) {
    setCameraStream(props.externalStream)
    is_granted.value = true
  } else {
    const { success, stream } = await requestAndGetUserMedia()
    if (success) {
      setCameraStream(stream)
    } else {
      emit('onErrorCaptured')
    }
    is_granted.value = success
  }
  is_loading.value = false
}

function setCameraStream(stream) {
  nextTick(() => {
    if (camera.value) {
      camera.value.srcObject = stream
    }
  })
}

function stopCameraStream() {
  const tracks = camera.value?.srcObject?.getTracks()

  tracks?.forEach?.((track) => {
    track.stop()
  })
}

function takePhoto() {
  if (!is_taken.value) {
    is_shooting.value = true

    const FLASH_TIMEOUT = 50

    setTimeout(() => {
      is_shooting.value = false
    }, FLASH_TIMEOUT)
    is_taken.value = true

    const context = taken_image.value.getContext('2d')
    context.drawImage(camera.value, 0, 0, 450, 337.5)

    taken_image.value.toBlob((blob) => {
      if (blob) {
        const fileName = `photo_${new Date().toISOString()}.png`
        const file = new File([blob], fileName, { type: blob.type })
        emit('onCapture', file)
      }
    }, 'image/png')

    stopCameraStream()
  } else {
    is_taken.value = false
    intiateCameraWithPermissions()
  }
}
</script>

<style scoped>
.web-cam-taker {
  position: relative;
}
.absolute-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  z-index: 10;
}
</style>
