<template>
  <q-list>
    <div style="border-left: red solid 1px; padding-left:2%">
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
<!--      <div class="q-my-sm text-body2">-->
        {{ comment.text }}
      </div>
    </div>
  </q-list>
</template>

<script setup>

import {onMounted, ref} from "vue";
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
