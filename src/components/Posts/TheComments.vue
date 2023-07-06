<template>
  <TheHeader :subtitle="post?.title" title="Comments" />
  <q-page-container>
    <q-page :data-test="commentStore.isLoaded ? 'comment-loaded' : 'comment-loading'">
      <section v-if="commentStore.getComments?.length > 0" class="q-pa-md" style="margin-bottom: 6rem">
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

      <q-form greedy @submit.prevent="commentStore.haveToReply ? addReply() : addComment()">
        <q-input
          ref="inputField"
          class="bg-white fixed-bottom q-px-sm q-page-container z-fab"
          :data-test="commentStore.haveToReply ? 'fill-add-reply' : 'comment-main-box'"
          dense
          :label="commentStore.haveToReply ? 'Reply' : 'Comment'"
          lazy-rules
          :required="!commentStore.haveToReply"
          :name="commentStore.haveToReply ? commentId : ''"
          rounded
          standout="bg-secondary text-white"
          style="margin-bottom: 6.7rem"
          v-model="commentValue"
          @blur="isMention = false"
        >
          <q-list v-if="isMention" class="absolute bg-secondary rounded-borders text-caption" dark style="bottom: 40px">
            <q-item v-for="(commenter, index) in commenters" clickable :key="index" @click="mentionUser(commenter)">
              <q-item-section>{{ commenter.name }}</q-item-section>
            </q-item>
          </q-list>

          <div v-show="commentStore.haveToReply" class="replyTop">
            <p>
              Replying to
              <span class="text-bold">{{ getReplyAuthor() }}</span>
            </p>
            <q-btn @click="commentStore.setReplyTo('')" icon="close" round flat dense size="sm"></q-btn>
          </div>
          <q-btn
            color="grey-6"
            :data-test="commentStore.haveToReply ? 'submit-fill-add-reply' : ''"
            dense
            :disable="!commentValue"
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
import DisplayComment from 'src/components/Posts/Comments/DisplayComment.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import { useCommentStore, useErrorStore, useNotificationStore, useUserStore } from 'src/stores'
import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue'

const props = defineProps({
  collectionName: { type: String, required: true },
  post: { type: Object, required: true }
})

const $q = useQuasar()
const commentStore = useCommentStore()
const errorStore = useErrorStore()
const notificationStore = useNotificationStore()
const userStore = useUserStore()

const commentId = ref('')
const reply = reactive({})
const commentValue = ref('')
const inputField = ref()
const isMention = ref(false)
const mentionedUsers = ref([])

const commenters = computed(() => {
  return commentStore.getComments
    .map((comment) => ({ id: comment.author?.uid, name: comment.author?.displayName }))
    .filter((value, index, self) => value.id && value.name && self.findIndex((t) => t.id === value.id && t.name === value.name) === index)
})

watchEffect(() => {
  isMention.value = Boolean(
    userStore.getUser &&
      commentValue.value.endsWith('@') &&
      (commentValue.value[commentValue.value.length - 2] === ' ' || commentValue.value[commentValue.value.length - 2] === undefined)
  )
})

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(event) {
  if (event.key === 'Escape' || event.key === 'Esc') {
    inputField.value.blur()
  }
}

function mentionUser(mentioned) {
  commentValue.value = commentValue.value.slice(0, -1) + '@' + mentioned.name + ' '
  mentionedUsers.value.push(mentioned.id)
  isMention.value = false
  nextTick(() => {
    inputField.value.focus()
  })
}

function getReplyAuthor() {
  if (commentStore.haveToReply) {
    const parentComment = commentStore.getCommentById(commentStore.getReplyTo)
    if (parentComment) {
      return parentComment.author.displayName ? parentComment.author.displayName : 'Anonymous'
    }
  }
  return 'Anonymous'
}

async function addComment() {
  reply.parentId = commentStore.getReplyTo
  const comment = { text: commentValue.value }

  commentStore
    .addComment(props.collectionName, comment, props.post)
    .then(() => {
      notificationStore.create(props.post.subscribers, {
        collection: props.collectionName,
        link: '/' + props.post.id.replace(/-/g, '/'),
        message: 'New comment: ' + comment.text,
        type: 'comment'
      })
      notificationStore.create(mentionedUsers.value, {
        collection: props.collectionName,
        link: '/' + props.post.id.replace(/-/g, '/'),
        message: userStore.getUser.displayName + ' mentioned you: ' + comment.text,
        type: 'mention'
      })
    })
    .then(() => {
      window.scrollTo(0, document.body.scrollHeight)
      $q.notify({ type: 'positive', message: 'Comment successfully submitted' })
    })
    .catch((error) => errorStore.throwError(error, 'Comment submission failed!'))
    .finally(() => (commentValue.value = ''))
}

onUnmounted(() => {
  commentStore.setReplyTo('')
})

commentStore.$subscribe(() => {
  commentStore.haveToReply ? inputField.value.focus() : inputField.value.blur()
})

async function addReply() {
  const comment = { text: commentValue.value, parentId: commentStore.getReplyTo }
  commentStore
    .addReply(props.collectionName, props.post.id, comment)
    .then(() => {
      notificationStore.create(props.post.subscribers, {
        collection: props.collectionName,
        link: '/' + props.post.id.replace(/-/g, '/'),
        message: 'New comment: ' + comment.text,
        type: 'comment'
      })

      window.scrollTo(0, document.body.scrollHeight)
      $q.notify({ type: 'positive', message: 'Reply successfully submitted' })
    })
    .catch((error) => errorStore.throwError(error, 'Reply submission failed!'))

  commentValue.value = ''
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
