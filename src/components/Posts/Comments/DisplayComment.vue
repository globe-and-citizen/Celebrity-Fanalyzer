<template>
  <q-list class="q-mb-md">
    <div style="border-left: black solid 1px; padding-left: 2%" @mouseover="actionButtons = true" @mouseleave="actionButtons = false">
      <q-item class="q-px-none">
        <q-item-section avatar>
          <q-avatar>
            <q-img v-if="comment.isAnonymous" src="/icons/anonymous.svg" />
            <q-img
              v-else
              class="cursor-pointer"
              :src="comment.author?.photoURL"
              @click="router.push(`/fan/${comment.author.username || comment.author.uid}`)"
            />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ comment.author?.displayName || 'Anonymous' }}</q-item-label>
          <q-item-label caption>{{ shortMonthDayTime(comment.created) }}</q-item-label>
        </q-item-section>
        <q-item-section v-if="(comment.author?.uid || comment.author) === userId" side>
          <q-btn-dropdown color="secondary" :data-test="comment.text + '-reply-button'" dense dropdown-icon="more_vert" flat rounded>
            <q-list>
              <q-item clickable data-test="comment-select-edit" v-close-popup @click="editInput(comment.id)">
                <q-item-section>Edit</q-item-section>
              </q-item>
              <q-item clickable data-test="comment-select-delete" v-close-popup @click="deleteComment(comment.id)">
                <q-item-section>Delete</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </q-item>
      <!-- Parent comment editing -->
      <q-form v-if="isEditing && comment.id === inputEdit" greedy @submit.prevent="editComment(comment.id, newComment)">
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
          v-model="newComment"
        >
          <q-btn data-test="submit-edited-comment" class="cursor-pointer" color="grey-6" flat icon="send" round type="submit" />
        </q-input>
      </q-form>

      <!-- Parent comment -->
      <div v-else class="q-py-xs text-body2" style="white-space: pre-line">
        <span v-if="comment.text.includes('@')">
          <span v-for="item of comment.text.split(' ')" :key="item">
            <span :class="item.includes('@') ? 'cursor-pointer text-bold' : ''">{{ item }}&nbsp;</span>
          </span>
        </span>
        <span v-else>{{ comment.text }}</span>
      </div>

      <!-- Parent Like, Dislike, Reply, Report buttons -->
      <Transition name="slide-fade">
        <div v-if="actionButtons" class="row">
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
            @click="commentStore.setReplyTo(comment.id)"
          >
            <q-tooltip anchor="bottom middle" self="center middle">Reply</q-tooltip>
          </q-btn>
          <q-btn :data-test="'report' + comment.text" flat icon="report" rounded size="0.75rem" @click="isReporting = true">
            <q-tooltip anchor="bottom middle" self="center middle">Reply</q-tooltip>
          </q-btn>
        </div>
      </Transition>
    </div>
    <div style="border-left: black solid 1px; padding-left: 2%">
      <DisplayComment
        v-for="item of commentStore.getCommentChildren(comment.id)"
        :document-id="documentId"
        :collection-name="collectionName"
        :key="item.id"
        :comment="item"
      ></DisplayComment>
    </div>
  </q-list>

  <q-dialog persistent v-model="isReporting">
    <q-card class="q-pa-sm" dark>
      <q-card-section>
        <p class="text-center text-subtitle2">You are about to report this comment:</p>
        <q class="text-italic">{{ comment.text.substring(0, 300) }}{{ comment.text.length > 300 ? '...' : '' }}</q>
        <p class="q-mb-none q-mt-md text-center text-subtitle2">
          Are you sure you want to report this comment?
          <br />
          The report will be reviewed by our team.
        </p>
      </q-card-section>
      <q-card-actions>
        <q-btn class="col-grow" color="negative" label="Cancel" outline v-close-popup />
        <q-btn class="col-grow" color="negative" label="Report" @click="reportComment(comment)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useCommentStore, useErrorStore, useReportStore, useUserStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const commentStore = useCommentStore()
const errorStore = useErrorStore()
const reportStore = useReportStore()

const props = defineProps({
  comment: { type: Object, required: true },
  collectionName: { type: String, required: true },
  documentId: { type: String, required: true }
})

const userId = ref('')
const inputEdit = ref('')
const isEditing = ref(false)
const isReporting = ref(false)
const newComment = ref(props.comment.text)
const actionButtons = ref(false)

const $q = useQuasar()
onMounted(async () => {
  await userStore.fetchUserIp()
  userId.value = userStore.isAuthenticated ? userStore.getUserRef?.id : userStore.getUserIpHash

  window.addEventListener('keydown', handleKeydown)
})

async function editComment(commentId, editedComment) {
  await commentStore
    .editComment(props.collectionName, props.documentId, commentId, editedComment, userId.value)
    .then(() => $q.notify({ type: 'info', message: 'Comment successfully edited!' }))
    .catch((error) => errorStore.throwError(error, 'Failed to edit comment'))
    .finally(() => (isEditing.value = false))
}

async function deleteComment(commentId) {
  await commentStore
    .deleteComment(props.collectionName, props.documentId, commentId)
    .then(() => $q.notify({ type: 'positive', message: 'Comment successfully deleted' }))
    .catch((error) => errorStore.throwError(error, 'Failed to delete comment'))

  // TODO Set all child comments parentId into the current comment Parent Id)
}

const likeIconClass = computed(() => {
  return (comment) => comment.likes?.some((like) => like === userId.value) || false
})

const dislikeIconClass = computed(() => {
  return (comment) => comment.dislikes?.some((dislike) => dislike === userId.value) || false
})

function likeComment(commentId) {
  commentStore.likeComment(props.collectionName, props.documentId, commentId)
}

function dislikeComment(commentId) {
  commentStore.dislikeComment(props.collectionName, props.documentId, commentId)
}

const replyCounter = (id) => {
  return commentStore.getComments ? commentStore.getComments.filter((comment) => comment.parentId === id).length : 0
}

function reportComment(comment) {
  reportStore
    .create(props.collectionName, props.documentId, comment)
    .then(() => $q.notify({ type: 'info', message: 'Thank you for helping us keep our community safe.' }))
  isReporting.value = false
}

function handleKeydown(event) {
  if (event.key === 'Escape' || event.key === 'Esc') {
    // expanded.value = false
    // commentId.value = ''
    // expandedReply.value = false
    // inputField.value.blur()
  }
}

function editInput(commentId) {
  isEditing.value = !isEditing.value
  inputEdit.value = commentId
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
