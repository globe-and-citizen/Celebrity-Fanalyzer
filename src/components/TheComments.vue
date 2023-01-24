<template>
  <section v-if="comments" class="q-pa-md" style="margin-bottom: 4rem">
    <div v-for="comment of comments" class="q-mb-md" :key="comment.id">
      <div class="flex items-center">
        <q-icon v-if="comment.isAnonymous" name="person" size="2rem" />
        <q-avatar v-else size="2rem">
          <q-img :src="comment.author.photoURL" />
        </q-avatar>
        <p class="column q-mb-none q-ml-sm">
          <span class="text-body2">{{ comment.author.displayName || 'Anonymous' }}</span>
          <span class="text-body2 text-secondary">
            {{ comment.created.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
          </span>
        </p>
        <q-space />
        <q-btn-dropdown
          v-if="(comment.author?.uid || comment.author) === userId"
          color="secondary"
          dense
          dropdown-icon="more_vert"
          flat
          rounded
        >
          <q-list>
            <q-item clickable v-close-popup @click="editInput(comment.id)">
              <q-item-section>
                <q-item-label>Edit</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="deleteComment(comment.id)">
              <q-item-section>
                <q-item-label>Delete</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <q-form v-if="isEditing && comment.id === inputEdit" greedy @submit.prevent="editComment(comment.id, comment.text)">
        <q-input
          class="bg-white q-px-sm q-page-container min-h-full"
          dense
          label="Comment"
          lazy-rules
          required
          rounded
          :rules="[(val) => val.length > 1 || 'Please type at least 2 characters']"
          standout="bg-secondary text-white"
          v-model="comment.text"
        >
          <q-btn class="cursor-pointer" color="grey-6" flat icon="send" round type="submit" />
        </q-input>
      </q-form>
      <div v-else class="q-my-sm text-body2">
        {{ comment.text }}
      </div>
      <q-separator />
    </div>

    <q-form greedy @submit.prevent="sendComment">
      <q-input
        class="bg-white fixed-bottom q-px-sm q-page-container"
        dense
        label="Comment"
        lazy-rules
        required
        rounded
        :rules="[(val) => val.length > 1 || 'Please type at least 2 characters']"
        standout="bg-secondary text-white"
        style="margin-bottom: 6.7rem"
        v-model="myComment.text"
      >
        <q-btn class="cursor-pointer" color="grey-6" flat icon="send" round type="submit" />
      </q-input>
    </q-form>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useCommentStore, useUserStore } from 'src/stores'
import { onMounted, reactive, ref } from 'vue'

const props = defineProps({
  comments: { type: Array, required: true },
  entry: { type: Object, required: true }
})

const $q = useQuasar()
const myComment = reactive({})
const commentStore = useCommentStore()
const userStore = useUserStore()

const userId = ref('')
const inputEdit = ref('')
const isEditing = ref(false)

onMounted(async () => {
  await userStore.fetchUserIp()
  userId.value = userStore.getUserRef?.id || userStore.getUserIpHash
})

async function sendComment() {
  await commentStore
    .addComment(myComment, props.entry)
    .then(() => {
      myComment.text = ''
      window.scrollTo(0, document.body.scrollHeight)
      $q.notify({ message: 'Comment successfully submitted' })
    })
    .catch(() => $q.notify({ message: 'Comment submission failed!' }))
}

function editInput(commentId) {
  isEditing.value = !isEditing.value
  inputEdit.value = commentId
}

async function editComment(editedComment, id) {
  await commentStore
    .editComment(editedComment, id, props.entry)
    .then(() => $q.notify({ message: 'Comment successfully edited!' }))
    .catch(() => $q.notify({ message: 'Failed to edit comment' }))
    .finally(() => (isEditing.value = false))
}

async function deleteComment(commentId) {
  await commentStore
    .deleteComment(props.entry.id, commentId, userId.value)
    .then(() => $q.notify({ message: 'Comment successfully deleted' }))
    .catch(() => $q.notify({ message: 'Failed to delete comment' }))
}
</script>
