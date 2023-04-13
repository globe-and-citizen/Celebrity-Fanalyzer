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
            :data-test="comment.text + '-button-dropdown'"
            dense
            dropdown-icon="more_vert"
            flat
            rounded
          >
            <q-list>
              <q-item data-test="comment-select-edit" clickable v-close-popup @click="editInput(comment.id)">
                <q-item-section>
                  <q-item-label>Edit</q-item-label>
                </q-item-section>
              </q-item>
              <q-item data-test="comment-select-delete" clickable v-close-popup @click="deleteComment(1, comment.id)">
                <q-item-section>
                  <q-item-label>Delete</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
        <q-form v-if="isEditing && comment.id === inputEdit" greedy @submit.prevent="editComment(comment.id, comment.text)">
          <q-input
            :data-test="comment.text + '-comment-edit'"
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
            <q-btn data-test="submit-edited-comment" class="cursor-pointer" color="grey-6" flat icon="send" round type="submit" />
          </q-input>
        </q-form>
        <div v-else class="q-my-sm text-body2">
          {{ comment.text }}
        </div>
        <div class="row">
          <q-btn
            :data-test="'like' + comment.text"
            flat
            :icon="likeIconClass(comment) ? 'img:/icons/thumbs-up-bolder.svg' : 'img:/icons/thumbs-up.svg'"
            :label="comment.likes?.length || 0"
            rounded
            size="0.75rem"
            @click="likeComment(comment.id)"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Like</q-tooltip>
          </q-btn>
          <q-btn
            :data-test="'dislike' + comment.text"
            flat
            :icon="dislikeIconClass(comment) ? 'img:/icons/thumbs-down-bolder.svg' : 'img:/icons/thumbs-down.svg'"
            :label="comment.dislikes?.length || 0"
            rounded
            size="0.75rem"
            @click="dislikeComment(comment.id)"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Dislike</q-tooltip>
          </q-btn>
          <q-btn
            :data-test="comment.text + '-add-reply'"
            flat
            icon="chat_bubble_outline"
            :label="replyCounter(comment.id)"
            rounded
            size="0.75rem"
            @click="showReplies(comment.id)"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Reply</q-tooltip>
          </q-btn>
        </div>
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
                  <q-avatar v-else size="1rem">
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
                    :data-test="childComment.text + '-open-reply-edit-delete'"
                  >
                    <q-list>
                      <q-item
                        :data-test="childComment.text + '-open-reply-edit'"
                        clickable
                        v-close-popup
                        @click="editInput(childComment.id)"
                      >
                        <q-item-section>
                          <q-item-label>Edit</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        :data-test="childComment.text + '-open-reply-delete'"
                        clickable
                        v-close-popup
                        @click="deleteComment(comment.id, childComment.id)"
                      >
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
                  @submit.prevent="editComment(childComment.id, childComment.text)"
                >
                  <q-input
                    :data-test="childComment.text + 'fillEditReply'"
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
                    <q-btn
                      :data-test="childComment.text + '-submit-reply-edit'"
                      class="cursor-pointer"
                      id="replyInput"
                      color="grey-6"
                      flat
                      icon="send"
                      round
                      type="submit"
                    />
                  </q-input>
                </q-form>
                <div v-else class="q-my-sm text-body2">
                  {{ childComment.text }}
                </div>
                <q-separator spaced />
              </div>
              <!-- Ended Child Comment Section -->
              <q-input
                :data-test="comment.text + '-fill-add-reply'"
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
                <q-btn
                  :data-test="comment.text + '-submit-fill-add-reply'"
                  class="cursor-pointer"
                  color="grey-6"
                  flat
                  icon="send"
                  round
                  type="submit"
                />
              </q-input>
            </q-form>
          </div>
        </q-slide-transition>
        <q-separator spaced />
      </div>
    </div>
  </section>

  <div v-else class="q-mt-xl text-center">
    <q-icon class="q-my-md" color="secondary" name="comment" size="md" />
    <p class="text-h6">No Comments Yet</p>
    <p class="text-body1">Be the first to share what you think!</p>
  </div>

  <q-form greedy @submit.prevent="addComment">
    <q-input
      data-test="comment-entry-box"
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
      <q-btn data-test="submit-comment" class="cursor-pointer" color="grey-6" flat icon="send" round type="submit" />
    </q-input>
  </q-form>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useCommentStore, useErrorStore, useUserStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { computed, onMounted, reactive, ref } from 'vue'

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
const user = ref('')
const userId = ref('')

onMounted(async () => {
  await userStore.fetchUserIp()
  userId.value = userStore.getUserRef?.id || userStore.getUserIpHash

  user.value = userStore.getUserRef || userStore.getUserIpHash
})

const likeIconClass = computed(() => {
  return (comment) => {
    return comment.likes ? comment.likes.map((item) => item.id).includes(user.value.id) : false
  }
})

const dislikeIconClass = computed(() => {
  return (comment) => {
    return comment.dislikes ? comment.dislikes.some((dislike) => dislike.id === user.value.id) : false
  }
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
      $q.notify({ type: 'positive', message: 'Comment successfully submitted' })
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
    .then(() => $q.notify({ type: 'info', message: 'Comment successfully edited!' }))
    .catch(() => errorStore.throwError(error, 'Failed to edit comment'))
    .finally(() => (isEditing.value = false))
}

async function deleteComment(commentParentId, commentId) {
  await commentStore
    .deleteComment(props.entry.id, commentId)
    .then(() => $q.notify({ type: 'negative', message: 'Comment successfully deleted' }))
    .catch((error) => errorStore.throwError(error, 'Failed to delete comment'))

  childComments.value = []
  for (const comment of props.comments) {
    if (commentParentId === comment.parentId) {
      childComments.value.push(comment)
    } else {
      continue
    }
  }
}

async function replyInput(parentId) {
  reply.parentId = parentId
}

async function showReplies(id) {
  childComments.value = []
  if (commentId.value === id) {
    expanded.value = false
    commentId.value = ''
    return
  }
  expanded.value = true
  commentId.value = id

  reply.parentId = id

  for (const comment of props.comments) {
    if (id === comment.parentId) {
      childComments.value.push(comment)
    } else {
      continue
    }
  }
}

async function addReply(commentId) {
  await commentStore
    .addReply(props.entry.id, commentId, reply)
    .then(() => {
      reply.text = ''
      $q.notify({ type: 'positive', message: 'Reply successfully submitted' })
    })
    .catch((error) => errorStore.throwError(error, 'Reply submission failed!'))

  childComments.value = []
  for (const comment of props.comments) {
    if (commentId === comment.parentId) {
      childComments.value.push(comment)
    } else {
      continue
    }
  }
}
</script>

<style scoped>
.bolder-icon-default {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 32;
}

.bolder-icon {
  font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 32;
}

.warning-icon {
  font-size: 28px;
  height: 32px;
  width: 32px;
}
</style>
