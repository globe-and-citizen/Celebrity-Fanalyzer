<template>
  <section v-if="comments.length" class="q-pa-md" style="margin-bottom: 4rem">
    <div v-for="comment of comments" class="q-mb-md" :key="comment.id">
      <div class="flex items-center">
        <q-icon v-if="comment.isAnonymous" name="person" size="2rem" />
        <q-avatar v-else size="2rem">
          <q-img :src="comment.author.photoURL" />
        </q-avatar>
        <p class="column q-mb-none q-ml-sm">
          <span class="text-body2">{{ comment.author.displayName || 'Anonymous' }}</span>
          <span class="text-body2 text-secondary">
            {{ shortMonthDayTime(comment.created) }}
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
          class="q-px-sm"
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
      <q-btn flat icon="chat_bubble_outline" round size="md" @click="replyInput(comment.id)">
        <q-tooltip>Reply</q-tooltip>
      </q-btn>
      <q-slide-transition>
        <q-form v-if="isReplying && comment.id === reply.parentId" greedy @submit.prevent="addReply(comment.id)">
          <q-input
            class="q-px-sm"
            dense
            label="Reply"
            lazy-rules
            :name="comment.id"
            rounded
            :rules="[(val) => val.length > 1 || 'Please type at least 2 characters']"
            standout="bg-secondary text-white"
            v-model="reply.text"
          >
            <q-btn class="cursor-pointer" color="grey-6" flat icon="send" round type="submit" />
          </q-input>
        </q-form>
      </q-slide-transition>
      <q-separator spaced />
    </div>
  </section>
  <q-form greedy @submit.prevent="addComment">
    <q-input
      class="bg-white fixed-bottom q-px-sm q-page-container z-fab"
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
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useCommentStore, useUserStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { onMounted, reactive, ref } from 'vue'

const props = defineProps({
  comments: { type: Array, required: true },
  entry: { type: Object, required: true }
})

const $q = useQuasar()
const commentStore = useCommentStore()
const userStore = useUserStore()

const inputEdit = ref('')
const isEditing = ref(false)
const isReplying = ref(false)
const myComment = reactive({})
const reply = reactive({})
const userId = ref('')

onMounted(async () => {
  await userStore.fetchUserIp()
  userId.value = userStore.getUserRef?.id || userStore.getUserIpHash

  // TODO: After receiving all comments, we need to organized the replies. Use parentId to know which reply belongs to which comment.
})

async function addComment() {
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

async function editComment(commentId, editedComment) {
  await commentStore
    .editComment(props.entry.id, commentId, editedComment, userId.value)
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

function replyInput(parentId) {
  isReplying.value = !isReplying.value
  reply.parentId = parentId
}

async function addReply(commentId) {
  await commentStore
    .addReply(props.entry.id, commentId, reply)
    .then(() => {
      reply.text = ''
      $q.notify({ message: 'Reply successfully submitted' })
      window.scrollTo(0, document.body.scrollHeight)
    })
    .catch((err) => $q.notify({ message: 'Reply submission failed!' + err }))
}
//Reply submission failed!FirebaseError: [code=invalid-argument]: Function setDoc() called with invalid data. Unsupported field value: a custom SubmitEvent object (found in field parentId in document entries/2022-08T1674307890920/comments/1674593638715-r3C28i2x4RUuqn2jrt69A5K6RcC3)
</script>
