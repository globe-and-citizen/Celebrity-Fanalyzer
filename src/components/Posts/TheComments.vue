<template>
  <TheHeader :subtitle="post?.title" title="Comments" />
  <q-page-container>
    <q-page :data-test="!commentStore.isLoading ? 'comment-loaded' : 'comment-loading'">
      <section v-if="commentStore.getComments.length" class="q-pa-md" style="margin-bottom: 6rem">
        <DisplayComment
          v-for="comment of commentStore.getComments.filter((element) => {
            return element.parentId === undefined && element.author
          })"
          :comment="comment"
          :collection-name="collectionName"
          :document-id="post.id"
          :key="comment.id"
        ></DisplayComment>
      </section>

      <div v-else class="q-mt-xl text-center">
        <q-icon class="q-my-md" color="secondary" name="comment" size="md" />
        <p class="text-h6">No Comments Yet</p>
        <p class="text-body1">Be the first to share what you think!</p>
      </div>

      <q-form greedy @submit.prevent="commentStore.haveToReply ? addReply(commentStore.getReplyTo) : addComment()">
        <q-input
          ref="inputField"
          class="bg-white fixed-bottom q-px-sm q-page-container z-fab"
          :data-test="commentStore.haveToReply ? commentText + '-fill-add-reply' : 'comment-main-box'"
          dense
          :label="commentStore.haveToReply ? 'Reply' : 'Comment'"
          lazy-rules
          :required="!commentStore.haveToReply"
          :name="commentStore.haveToReply ? commentId : ''"
          rounded
          standout="bg-secondary text-white"
          style="margin-bottom: 6.7rem"
          v-model="commentValue"
        >
          <div v-show="commentStore.haveToReply" class="replyTop">
            <p>
              Replying to
              <span class="text-bold">{{ getReplyAuthor() }}</span>
            </p>
            <q-btn @click="commentStore.setReplyTo('')" icon="close" round flat dense size="sm"></q-btn>
          </div>
          <q-btn
            :data-test="commentStore.haveToReply ? commentText + '-submit-fill-add-reply' : ''"
            color="grey-6"
            dense
            :disable="commentStore.haveToReply ? !reply.text : !myComment.text"
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
import TheHeader from 'src/components/shared/TheHeader.vue'
import DisplayComment from 'src/components/Posts/Comments/DisplayComment.vue'
import { useCommentStore, useErrorStore, useUserStore } from 'src/stores'
import { shortMonthDayTime } from 'src/utils/date'
import {computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, reactive, ref} from 'vue'
import { useRouter } from 'vue-router'
import { comment } from 'postcss'

const props = defineProps({
  collectionName: { type: String, required: true },
  post: { type: Object, required: true }
})

const $q = useQuasar()
const router = useRouter()
const commentStore = useCommentStore()
const errorStore = useErrorStore()
const userStore = useUserStore()

const commentId = ref('')
const commentText = ref('')
const displayName = ref('')
const expanded = ref(false)
const expandedReply = ref(false)
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

function getReplyAuthor() {
  if (commentStore.haveToReply) {
    const parentComment = commentStore.getCommentById(commentStore.getReplyTo)
    if (parentComment) {
      return parentComment.author.displayName ?parentComment.author.displayName : "Anonymous"
    }
  }
  return "Anonymous"
}

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
onUnmounted(()=>{
  commentStore.setReplyTo('')
})

// async function showReplies(id, text, name) {
//   if (commentId.value === id) {
//     expanded.value = false
//     commentId.value = ''
//     expandedReply.value = false
//     inputField.value.blur()
//     return
//   }
//   expanded.value = true
//   expandedReply.value = true
//   commentId.value = id
//   commentText.value = text
//   displayName.value = name
//   reply.parentId = id
//
//   await nextTick()
//   inputField.value.focus()
// }

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
