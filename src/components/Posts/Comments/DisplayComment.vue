<template>
  <q-list>
    <div style="border-left: black solid 1px; padding-left:2%; margin-bottom: 15px">
      <q-item class="q-px-none">
        <q-item-section avatar>
          <q-avatar>
            <q-img v-if="comment.isAnonymous" src="/icons/anonymous.svg" />
            <q-img
              v-else
              class="cursor-pointer"
              :src="comment.author.photoURL"
              @click="router.push(`/fan/${comment.author.username || comment.author.uid}`)"
            />
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
              <q-item clickable data-test="comment-select-delete" v-close-popup @click="deleteComment( comment.id)">
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
          @click="replyTo(comment.id)"
        >
          <q-tooltip anchor="bottom middle" self="center middle">Reply</q-tooltip>
        </q-btn>
      </div>
      <DisplayComment v-for="item of commentStore.getCommentChildren(comment.id)" :document-id="documentId" :collection-name="collectionName" :key="item.id" :comment="item"></DisplayComment>

    </div>
  </q-list>
</template>

<script setup>

import {computed, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {shortMonthDayTime} from "src/utils/date";
import {useCommentStore, useErrorStore, useUserStore} from "src/stores";
import {useQuasar} from "quasar";

const router = useRouter()
const userStore = useUserStore()
const commentStore = useCommentStore()
const errorStore = useErrorStore()


const props = defineProps({
  comment: { type: Object, required: true },
  collectionName: { type: String, required: true },
  documentId: { type: String, required: true },
})

const userId = ref('')
const inputEdit = ref('')
const isEditing = ref(false)
const newComment=ref(props.comment.text)

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

  // Set all child comments parentId into the current comment Parent Id
  // childComments.value = comments.value.filter((comment) => commentParentId === comment.parentId)
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
  return commentStore.getComments.filter((comment) => comment.parentId === id).length
}

const replyTo= (commentId)=>{
  commentStore.setReplyTo(commentId)
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

// const { comment } = props
</script>

<style scoped></style>
