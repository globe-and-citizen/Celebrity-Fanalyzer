<template>
  <q-card>
    <q-card-section class="row items-center">
      <div class="full-width column items-center justify-center">
        <div class="web-cam-taker relative-position">
          <video v-if="!is_taken" ref="videoRef" width="100%" height="100%" :style="{ borderRadius: '6px' }" autoplay />

          <canvas v-show="is_taken" id="photoTaken" ref="canvasRef" :style="{ borderRadius: '6px' }"></canvas>

          <div class="absolute-top" :class="{ 'bg-white': is_shooting }" />

          <q-spinner v-if="is_loading" color="grey-lighten-4" />
        </div>

        <q-btn v-if="is_granted" variant="outlined" rounded class="q-px-lg mt-5" color="primary" @click="takePhoto">
          {{ is_taken ? 'RETAKE' : 'CAPTURE' }}
        </q-btn>

        <q-select
          outlined
          v-model="selectedDevice"
          :options="devices"
          option-label="label"
          option-value="deviceId"
          class="q-mt-md"
          dense
          @update:modelValue="changeCameraStream"
        />
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="Cancel" color="primary" v-close-popup />
      <q-btn :disable="!is_taken" flat label="Done" color="primary" v-close-popup @click="submit" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { shallowRef, ref, onBeforeUnmount, nextTick, onMounted, triggerRef } from 'vue'
import { requestAndGetUserMedia } from '../../utils/media'

const emit = defineEmits(['onCapture', 'onErrorCaptured'])

const props = defineProps({
  externalStream: {
    type: Object,
    default: null
  }
})

const is_taken = shallowRef(false)
const is_shooting = shallowRef(false)
const is_loading = shallowRef(false)
const is_granted = shallowRef(false)
const devices = shallowRef([])
const selectedDevice = shallowRef()
const videoRef = ref(null)
const canvasRef = ref(null)
let capturedFile = null

onMounted(async () => {
  await getDevices()
  await intiateCameraWithPermissions()
})

onBeforeUnmount(() => {
  stopCameraStream()
})

async function getDevices() {
  const allDevices = await navigator.mediaDevices.enumerateDevices()
  devices.value = allDevices.filter((device) => device.kind === 'videoinput')
  selectedDevice.value = devices.value[0]
}

async function intiateCameraWithPermissions() {
  is_loading.value = true

  if (props.externalStream) {
    setCameraStream(props.externalStream)
    is_granted.value = true
  } else {
    const { success, stream } = await requestAndGetUserMedia({
      video: {
        deviceId: selectedDevice.value.deviceId
      }
    })
    if (success) {
      setCameraStream(stream)
    } else {
      emit('onErrorCaptured')
    }
    is_granted.value = success
  }
  is_loading.value = false
}

async function changeCameraStream(device) {
  stopCameraStream()
  const { success, stream } = await requestAndGetUserMedia({
    video: {
      deviceId: device.deviceId
    }
  })

  if (success) {
    setCameraStream(stream)
  } else {
    emit('onErrorCaptured')
  }
}

function setCameraStream(stream) {
  nextTick(() => {
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      triggerRef(videoRef)
    }
  })
}

function stopCameraStream() {
  const tracks = videoRef.value?.srcObject?.getTracks()

  tracks?.forEach?.((track) => {
    track.stop()
  })
}

function takePhoto() {
  if (!is_taken.value) {
    canvasRef.value.width = videoRef.value.offsetWidth
    canvasRef.value.height = videoRef.value.offsetHeight
    is_shooting.value = true

    const FLASH_TIMEOUT = 50

    setTimeout(() => {
      is_shooting.value = false
    }, FLASH_TIMEOUT)
    is_taken.value = true

    const context = canvasRef.value.getContext('2d')
    context.drawImage(videoRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height)

    canvasRef.value.toBlob((blob) => {
      if (blob) {
        const fileName = `photo_${new Date().toISOString()}.png`
        capturedFile = new File([blob], fileName, { type: blob.type })
      }
    }, 'image/png')

    stopCameraStream()
  } else {
    is_taken.value = false
    intiateCameraWithPermissions()
  }
}

function submit() {
  if (capturedFile) {
    emit('onCapture', capturedFile)
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
