<template>
  <h3 class="text-bold text-h5 text-secondary">Give us feedback!</h3>
  <q-form class="q-gutter-y-md" greedy @submit="onSubmit">
    <q-input data-test="subject-input" label="Subject" required v-model="feedback.subject" />
    <q-input data-test="message-input" label="Message" required type="textarea" v-model="feedback.message" />
    <q-btn
      class="full-width"
      color="primary"
      data-test="submit-button"
      label="Submit"
      :loading="feedbackStore.isLoading"
      padding="12px"
      rounded
      type="submit"
    />
  </q-form>
</template>

<script setup>
import { useErrorStore, useFeedbackStore } from 'app/src/stores'
import { useQuasar } from 'quasar'
import { reactive } from 'vue'

const $q = useQuasar()

const errorStore = useErrorStore()
const feedbackStore = useFeedbackStore()

const feedback = reactive({})

function onSubmit() {
  feedbackStore
    .addFeedback(feedback)
    .then(() => {
      $q.notify({ message: 'Feedback submitted!', type: 'positive' })
      feedback.subject = ''
      feedback.message = ''
    })
    .catch((error) => errorStore.throwError(error, 'Error submitting feedback'))
}
</script>
