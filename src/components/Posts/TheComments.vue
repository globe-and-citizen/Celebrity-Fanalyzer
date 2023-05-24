<template>
  <TheHeader :subtitle="post?.title" title="Comments" />
  <q-page-container>
    <q-page :data-test="!commentStore.isLoading ? 'comment-loaded' : 'comment-loading'">
      <section v-if="comments.length" class="q-pa-md" style="margin-bottom: 4rem">
        <q-list v-for="comment of comments" dense :key="comment.id">
          <div v-if="comment.parentId === undefined && comment.author">
            <!-- Parent comment author info and edit delete dropdown items -->
            <q-item class="q-px-none">
              <q-item-section avatar>
                <q-avatar>
                  <q-img :src="comment.isAnonymous ? 'src/assets/anonymous.svg' : comment.author.photoURL" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ comment.author.displayName || 'Anonymous' }}</q-item-label>
                <q-item-label caption>{{ shortMonthDayTime(comment.created) }}</q-item-label>
              </q-item-section>
              <q-item-section v-if="(comment.author?.uid || comment.author) === userId" side>
                <q-btn-dropdown
                  color="secondary"
                  :data-test="comment.text + '-button-dropdown'"
                  dense
                  dropdown-icon="more_vert"
                  flat
                  rounded
                >
                  <q-list>
                    <q-item clickable data-test="comment-select-edit" v-close-popup @click="editInput(comment.id)">
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable data-test="comment-select-delete" v-close-popup @click="deleteComment(1, comment.id)">
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </q-item-section>
            </q-item>
            <!-- Parent comment editing -->
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
            <!-- Parent comment -->
            <div v-else class="q-my-sm text-body2">
              {{ comment.text }}
            </div>
            <!-- Parent Like, Dislike, Reply buttons -->
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
                icon="img:/icons/arrow-reply.svg"
                :label="replyCounter(comment.id)"
                rounded
                size="0.75rem"
                @click="showReplies(comment.id, comment.text, comment.author.displayName || 'Anonymous')"
              >
                <q-tooltip anchor="bottom middle" self="center middle">Reply</q-tooltip>
              </q-btn>
            </div>
            <!-- Child comment section, managing child-->
            <q-slide-transition>
              <div class="q-px-md q-mt-md" v-show="expanded && comment.id === commentId">
                <div v-if="commentStore.isLoading" class="text-center">
                  <q-spinner color="primary" size="3em" />
                </div>
                <div v-else>
                  <!-- Started Child Comment section -->
                  <div v-if="childComments.length <= 0" class="text-center">
                    <p class="text-h6">No Replies Yet</p>
                    <p class="text-body2">Be the first to share what you think!</p>
                  </div>
                  <div v-for="(childComment, index) of childComments" class="q-mb-md" :key="childComment.id">
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
                    <q-separator spaced v-if="index !== childComments.length - 1" />
                  </div>
                  <!-- Ended Child Comment Section -->
                </div>
              </div>
            </q-slide-transition>
            <q-separator spaced />
          </div>
        </q-list>
      </section>

      <div v-else class="q-mt-xl text-center">
        <q-icon class="q-my-md" color="secondary" name="comment" size="md" />
        <p class="text-h6">No Comments Yet</p>
        <p class="text-body1">Be the first to share what you think!</p>
      </div>

      <q-form greedy @submit.prevent="expandedReply ? addReply(commentId) : addComment()">
        <q-input
          ref="inputField"
          class="bg-white fixed-bottom q-px-sm q-page-container z-fab"
          :data-test="expandedReply ? commentText + '-fill-add-reply' : 'comment-main-box'"
          dense
          :label="expandedReply ? 'Reply' : 'Comment'"
          lazy-rules
          :required="!expandedReply"
          :name="expandedReply ? commentId : ''"
          rounded
          standout="bg-secondary text-white"
          style="margin-bottom: 6.7rem"
          v-model="commentValue"
        >
          <div v-show="expandedReply" class="replyTop">
            <p>
              Replying to
              <span class="text-bold">{{ displayName }}</span>
            </p>
            <q-btn @click="showReplies(commentId)" icon="close" round flat dense size="sm"></q-btn>
          </div>
          <q-btn
            :data-test="expandedReply ? commentText + '-submit-fill-add-reply' : ''"
            color="grey-6"
            dense
            :disable="expandedReply ? !reply.text : !myComment.text"
            flat
            icon="send"
            round
            type="submit"
          />
        </q-input>
      </q-form>
    </q-page>
  </q-page-container>
</template>

<script setup>
import { useQuasar } from 'quasar'
import TheHeader from 'src/components/TheHeader.vue'
import { useCommentStore, useErrorStore, useUserStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  collectionName: { type: String, required: true },
  post: { type: Object, required: true }
})

const $q = useQuasar()
const commentStore = useCommentStore()
const errorStore = useErrorStore()
const userStore = useUserStore()

const childComments = ref([])
const commentId = ref('')
const commentText = ref('')
const comments = ref(commentStore.getComments)
const displayName = ref('')
const expanded = ref(false)
const expandedReply = ref(false)
const inputEdit = ref('')
const isEditing = ref(false)
const myComment = reactive({})
const reply = reactive({})
const userId = ref('')
const inputField = ref()

onMounted(async () => {
  await userStore.fetchUserIp()
  userId.value = userStore.isAuthenticated ? userStore.getUserRef?.id : userStore.getUserIpHash

  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(event) {
  if (event.key === 'Escape' || event.key === 'Esc') {
    expanded.value = false
    commentId.value = ''
    expandedReply.value = false
    inputField.value.blur()
  }
}

commentStore.$subscribe((_mutation, state) => {
  comments.value = state._comments
})

const likeIconClass = computed(() => {
  return (comment) => comment.likes?.some((like) => like === userId.value) || false
})

const dislikeIconClass = computed(() => {
  return (comment) => comment.dislikes?.some((dislike) => dislike === userId.value) || false
})

const commentValue = computed({
  get() {
    return expanded.value ? reply.text : myComment.text
  },
  set(value) {
    if (expanded.value) {
      reply.text = value
    } else {
      myComment.text = value
    }
  }
})

const replyCounter = (id) => {
  return comments.value.filter((comment) => comment.parentId === id).length
}

async function addComment() {
  await commentStore
    .addComment(props.collectionName, myComment, props.post)
    .then(() => {
      myComment.text = ''
      window.scrollTo(0, document.body.scrollHeight)
      $q.notify({ type: 'positive', message: 'Comment successfully submitted' })
    })
    .catch((error) => errorStore.throwError(error, 'Comment submission failed!'))
}

function likeComment(commentId) {
  commentStore.likeComment(props.collectionName, props.post.id, commentId)
}

function dislikeComment(commentId) {
  commentStore.dislikeComment(props.collectionName, props.post.id, commentId)
}

function editInput(commentId) {
  isEditing.value = !isEditing.value
  inputEdit.value = commentId
}

async function editComment(commentId, editedComment) {
  await commentStore
    .editComment(props.collectionName, props.post.id, commentId, editedComment, userId.value)
    .then(() => $q.notify({ type: 'info', message: 'Comment successfully edited!' }))
    .catch(() => errorStore.throwError(error, 'Failed to edit comment'))
    .finally(() => (isEditing.value = false))
}

async function deleteComment(commentParentId, commentId) {
  await commentStore
    .deleteComment(props.collectionName, props.post.id, commentId)
    .then(() => $q.notify({ type: 'positive', message: 'Comment successfully deleted' }))
    .catch((error) => errorStore.throwError(error, 'Failed to delete comment'))

  childComments.value = comments.value.filter((comment) => commentParentId === comment.parentId)
}

async function showReplies(id, text, name) {
  childComments.value = []
  if (commentId.value === id) {
    expanded.value = false
    commentId.value = ''
    expandedReply.value = false
    inputField.value.blur()
    childComments.value = comments.value.filter((comment) => comment.parentId === id)
    return
  }
  expanded.value = true
  expandedReply.value = true
  commentId.value = id
  commentText.value = text
  displayName.value = name
  reply.parentId = id

  childComments.value = comments.value.filter((comment) => comment.parentId === id)

  await nextTick()
  inputField.value.focus()
}

async function addReply(commentId) {
  await commentStore
    .addReply(props.collectionName, props.post.id, reply)
    .then(() => {
      reply.text = ''
      $q.notify({ type: 'positive', message: 'Reply successfully submitted' })
      expandedReply.value = false
    })
    .catch((error) => errorStore.throwError(error, 'Reply submission failed!'))
  await nextTick()
  inputField.value.blur()

  childComments.value = comments.value.filter((comment) => comment.parentId === commentId)
}
</script>

<style scoped>
.replyTop {
  position: absolute;
  display: flex;
  width: 100%;
  border-radius: 10px 10px 10px 10px;
  height: 30px;
  top: -30px;
  padding: 5px 10px;
  color: white;
  font-size: 12px;
  justify-content: space-between;
  background-color: #5e6775;
}
</style>
