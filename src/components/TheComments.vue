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
                    :data-test="childComment.text + '-fillEditReply'"
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
                      color="grey-6"
                      :data-test="childComment.text + '-submit-reply-edit'"
                      dense
                      :disable="!childComment.text"
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
                standout="bg-secondary text-white"
                v-model="reply.text"
              >
                <q-btn
                  color="grey-6"
                  :data-test="comment.text + '-submit-fill-add-reply'"
                  dense
                  :disable="!reply.text"
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
      class="bg-white fixed-bottom q-px-sm q-page-container z-fab"
      data-test="comment-main-box"
      dense
      label="Comment"
      lazy-rules
      required
      rounded
      standout="bg-secondary text-white"
      style="margin-bottom: 6.7rem"
      v-model="myComment.text"
    >
      <q-btn color="grey-6" dense :disable="!myComment.text" flat icon="send" round type="submit" />
    </q-input>
  </q-form>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useCommentStore, useErrorStore, useUserStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { computed, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  collection: { type: String, required: true },
  comments: { type: Array, required: true },
  data: { type: Object, required: true }
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
  userId.value = userStore.isAuthenticated ? userStore.getUserRef?.id : userStore.getUserIpHash
})

const likeIconClass = computed(() => {
  return (comment) => comment.likes?.some((like) => like === userId.value) || false
})

const dislikeIconClass = computed(() => {
  return (comment) => comment.dislikes?.some((dislike) => dislike === userId.value) || false
})

const replyCounter = (id) => {
  return props.comments.filter((comment) => comment.parentId === id).length
}

async function addComment() {
  await commentStore
    .addComment(props.collection, myComment, props.data)
    .then(() => {
      myComment.text = ''
      window.scrollTo(0, document.body.scrollHeight)
      $q.notify({ type: 'positive', message: 'Comment successfully submitted' })
    })
    .catch((error) => errorStore.throwError(error, 'Comment submission failed!'))
}

function likeComment(commentId) {
  commentStore.likeComment(props.collection, props.data.id, commentId)
}

function dislikeComment(commentId) {
  commentStore.dislikeComment(props.collection, props.data.id, commentId)
}

function editInput(commentId) {
  isEditing.value = !isEditing.value
  inputEdit.value = commentId
}

async function editComment(commentId, editedComment) {
  await commentStore
    .editComment(props.collection, props.data.id, commentId, editedComment, userId.value)
    .then(() => $q.notify({ type: 'info', message: 'Comment successfully edited!' }))
    .catch(() => errorStore.throwError(error, 'Failed to edit comment'))
    .finally(() => (isEditing.value = false))
}

async function deleteComment(commentParentId, commentId) {
  await commentStore
    .deleteComment(props.collection, props.data.id, commentId)
    .then(() => $q.notify({ type: 'positive', message: 'Comment successfully deleted' }))
    .catch((error) => errorStore.throwError(error, 'Failed to delete comment'))

  childComments.value = props.comments.filter((comment) => commentParentId === comment.parentId)
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

  childComments.value = props.comments.filter((comment) => comment.parentId === id)
}

async function addReply(commentId) {
  await commentStore
    .addReply(props.collection, props.data.id, reply)
    .then(() => {
      reply.text = ''
      $q.notify({ type: 'positive', message: 'Reply successfully submitted' })
    })
    .catch((error) => errorStore.throwError(error, 'Reply submission failed!'))

  childComments.value = props.comments.filter((comment) => comment.parentId === commentId)
}
</script>
