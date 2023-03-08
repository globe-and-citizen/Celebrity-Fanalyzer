<template>
  <h3 class="text-bold text-h5 text-secondary">Give us feedback!</h3>
  <q-input v-model="feedback.subject" label="Subject" />
  <q-input v-model="feedback.message" label="Message" type="textarea" />
  <q-btn class="full-width q-mt-lg" color="primary" label="Submit" padding="12px" rounded @click="submit" />
</template>

<script setup>
import { useErrorStore, useFeedbackStore } from 'app/src/stores'
import { useQuasar } from 'quasar'
import { reactive } from 'vue'

const $q = useQuasar()

const errorStore = useErrorStore()
const feedbackStore = useFeedbackStore()

const feedback = reactive({})

function submit() {
  feedbackStore
    .addFeedback(feedback)
    .then($q.notify({ type: 'info', message: 'Feedback submitted!' }))
    .catch((error) => errorStore.throwError(error, 'Error submitting feedback'))
}
</script>
