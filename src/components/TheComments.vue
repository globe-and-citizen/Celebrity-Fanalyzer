<template>
  <section v-if="comments.length" class="q-pa-md" style="margin-bottom: 4rem">
    <div v-for="comment of comments" class="q-mb-md" :key="comment.id">
      <div v-if="comment.parentId === undefined">
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
              <q-item clickable v-close-popup @click="deleteComment(1, comment.id)">
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
            autogrow
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
        <q-btn
          color="green"
          flat
          icon="sentiment_satisfied_alt"
          :label="comment.likes?.length || 0"
          rounded
          @click="likeComment(comment.id)"
        >
          <q-tooltip anchor="bottom middle" self="center middle">Like</q-tooltip>
        </q-btn>
        <q-btn
          color="red"
          flat
          icon="sentiment_very_dissatisfied"
          :label="comment.dislikes?.length || 0"
          rounded
          @click="dislikeComment(comment.id)"
        >
          <q-tooltip anchor="bottom middle" self="center middle">Dislike</q-tooltip>
        </q-btn>
        <q-btn flat icon="chat_bubble_outline" :label="replyCounter(comment.id)" rounded @click="showReplies(comment.id)">
          <q-tooltip anchor="bottom middle" self="center middle">Reply</q-tooltip>
        </q-btn>
        <q-slide-transition>
          <div class="q-px-md q-mt-md" v-show="expanded && comment.id === commentId">
            <div v-if="commentStore.isLoading" class="text-center">
              <q-spinner color="primary" size="3em" />
            </div>
            <q-form v-else greedy @submit.prevent="addReply(comment.id)">
              <!-- Started Child Comment section -->
              <div v-for="childComment of childComments" class="q-mb-md" :key="childComment.id">
                <div class="flex items-center">
                  <q-icon v-if="childComment.isAnonymous" name="person" size="1.5rem" />
                  <q-avatar v-else size="1.5rem">
                    <q-img :src="childComment.author.photoURL" />
                  </q-avatar>
                  <p class="row q-mb-none q-ml-sm">
                    <span class="text-body2 q-mr-sm">{{ childComment.author.displayName || 'Anonymous' }}</span>
                    <span class="text-caption text-secondary">{{ shortMonthDayTime(childComment.created) }}</span>
                  </p>
                  <q-space />
                  <q-btn-dropdown
                    v-if="(childComment.author?.uid || childComment.author) === userId"
                    color="secondary"
                    dense
                    dropdown-icon="more_vert"
                    flat
                    rounded
                  >
                    <q-list>
                      <q-item clickable v-close-popup @click="editInput(childComment.id)">
                        <q-item-section>
                          <q-item-label>Edit</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="deleteChildComment(comment.id, childComment.id)">
                        <q-item-section>
                          <q-item-label>Delete</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
                <q-form
                  v-if="isEditing && childComment.id === inputEdit"
                  greedy
                  @submit.prevent="editChildComment(childComment.id, childComment.text)"
                >
                  <q-input
                    autogrow
                    class="q-pb-none"
                    dense
                    label="Comment"
                    lazy-rules
                    required
                    rounded
                    :rules="[(val) => val.length > 1 || 'Please type at least 2 characters']"
                    standout="bg-secondary text-white"
                    v-model="childComment.text"
                  >
                    <q-btn class="cursor-pointer" color="grey-6" flat icon="send" round type="submit" />
                  </q-input>
                </q-form>
                <div v-else class="q-my-sm text-body2">
                  {{ childComment.text }}
                </div>
                <q-separator spaced />
              </div>
              <!-- Ended Child Comment Section -->
              <q-input
                autogrow
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
          </div>
        </q-slide-transition>
        <q-separator spaced />
      </div>
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
import { useCommentStore, useErrorStore, useUserStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  comments: { type: Array, required: true },
  entry: { type: Object, required: true }
})

const $q = useQuasar()
const commentStore = useCommentStore()
const errorStore = useErrorStore()
const userStore = useUserStore()

const childComments = ref([])
const commentId = ref('')
const expanded = ref(false)
const inputEdit = ref('')
const isEditing = ref(false)
const myComment = reactive({})
const reply = reactive({})
const userId = ref('')

onMounted(async () => {
  await userStore.fetchUserIp()
  userId.value = userStore.getUserRef?.id || userStore.getUserIpHash
})

const replyCounter = (id) => {
  let count = 0
  for (const comment of props.comments) {
    if (id === comment.parentId) {
      count++
    }
  }
  return count
}

async function addComment() {
  await commentStore
    .addComment(myComment, props.entry)
    .then(() => {
      myComment.text = ''
      window.scrollTo(0, document.body.scrollHeight)
      $q.notify({ message: 'Comment successfully submitted' })
    })
    .catch((error) => errorStore.throwError(error, 'Comment submission failed!'))
}

function likeComment(commentId) {
  commentStore.likeComment(props.entry.id, commentId)
}

function dislikeComment(commentId) {
  commentStore.dislikeComment(props.entry.id, commentId)
}

function editInput(commentId) {
  isEditing.value = !isEditing.value
  inputEdit.value = commentId
}

async function editComment(commentId, editedComment) {
  await commentStore
    .editComment(props.entry.id, commentId, editedComment, userId.value)
    .then(() => $q.notify({ message: 'Comment successfully edited!' }))
    .catch(() => errorStore.throwError(error, 'Failed to edit comment'))
    .finally(() => (isEditing.value = false))
}

async function editChildComment(commentId, editedComment) {
  await commentStore
    .editChildComment(props.entry.id, commentId, editedComment, userId.value)
    .then(() => $q.notify({ message: 'Comment successfully edited!' }))
    .catch(() => errorStore.throwError(error, 'Failed to edit comment'))
    .finally(() => (isEditing.value = false))
}

async function deleteComment(commentParentId, commentId) {
  await commentStore
    .deleteComment(props.entry.id, commentId, userId.value)
    .then(() => $q.notify({ message: 'Comment successfully deleted' }))
    .catch((error) => errorStore.throwError(error, 'Failed to delete comment'))

  await commentStore.fetchCommentsByparentId(router.currentRoute.value.href, commentParentId)
  childComments.value = commentStore.getChildComments
}

async function deleteChildComment(commentParentId, commentId) {
  await commentStore
    .deleteChildComment(props.entry.id, commentId, userId.value)
    .then(() => $q.notify({ message: 'Comment successfully deleted' }))
    .catch(() => errorStore.throwError(error, 'Failed to delete comment'))

  await commentStore.fetchCommentsByparentId(router.currentRoute.value.href, commentParentId)
  childComments.value = commentStore.getChildComments
}

async function replyInput(parentId) {
  reply.parentId = parentId
}

async function showReplies(id) {
  childComments.value = [];
  if (commentId.value === id) {
    expanded.value = false
    commentId.value = ''
    return
  }
  expanded.value = true
  commentId.value = id

  reply.parentId = id

  for(const comment of props.comments) {
      if(id === comment.parentId) {
        childComments.value.push(comment)
      } else {
        continue
      }
  }

  // await commentStore.fetchCommentsByparentId(router.currentRoute.value.href, id)
  // childComments.value = commentStore.getChildComments
}

async function addReply(commentId) {
  await commentStore
    .addReply(props.entry.id, commentId, reply)
    .then(() => {
      reply.text = ''
      $q.notify({ message: 'Reply successfully submitted' })
    })
    .catch((error) => errorStore.throwError(error, 'Reply submission failed!'))
  window.scrollTo(0, document.body.scrollHeight)

  await commentStore.fetchCommentsByparentId(router.currentRoute.value.href, commentId)
  childComments.value = commentStore.getChildComments
}
</script>
