<template>
  <TheHeader :subtitle="post?.title" title="Comments" />
  <q-page-container>
    <q-page :data-test="commentStore.isLoaded ? 'comment-loaded' : 'comment-loading'">
      <section v-if="commentStore.isInitialLoading">
        <CommentsSkeleton />
        <CommentsSkeleton />
        <CommentsSkeleton />
        <CommentsSkeleton />
      </section>
      <section v-else-if="commentStore.getComments?.length" class="q-pa-md" style="margin-bottom: 6rem">
        <DisplayComment
          v-for="comment of comments"
          :collection-name="collectionName"
          :comment="comment"
          :document-id="post.id"
          :key="comment.id"
        />
      </section>

      <div v-else class="q-mt-xl text-center">
        <q-icon class="q-my-md" color="secondary" name="comment" size="md" />
        <p class="text-h6">No Comments Yet</p>
        <p class="text-body1">Be the first to share what you think!</p>
      </div>

      <q-form v-if="!commentStore.isInitialLoading" greedy @submit.prevent="commentStore.haveToReply ? addReply() : addComment()">
        <div class="fixed-bottom q-px-sm q-page-container position-relative">
          <q-input
            class="bg-white z-fab"
            :data-test="commentStore.haveToReply ? 'fill-add-reply' : 'comment-main-box'"
            dense
            :label="commentStore.haveToReply ? 'Reply' : 'Comment'"
            lazy-rules
            :name="commentStore.haveToReply ? commentId : ''"
            ref="inputField"
            :required="!commentStore.haveToReply"
            rounded
            standout="bg-secondary text-white"
            style="margin-bottom: 7rem"
            v-model="commentValue"
            @blur="isMention = false"
            @keydown.escape="inputField.blur()"
          >
            <q-list v-if="isMention" class="absolute bg-secondary rounded-borders text-caption" dark style="bottom: 40px">
              <q-item v-for="(commenter, index) in commenters" clickable :key="index" @click="mentionUser(commenter)">
                <q-item-section>{{ commenter.name }}</q-item-section>
              </q-item>
            </q-list>

            <div v-if="commentStore.haveToReply" class="replyTop">
              <p>
                Replying to
                <span class="text-bold">{{ getReplyAuthor() }}</span>
              </p>
              <q-btn dense flat icon="close" round size="sm" @click="commentStore.setReplyTo('')" />
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
            >
              <q-tooltip v-if="commentValue">Send</q-tooltip>
            </q-btn>
          </q-input>
          <q-btn
            v-if="commentStore.getComments?.length >= 10"
            class="analysis-btn"
            :loading="statsStore.isLoading"
            :disable="statsStore.isLoading"
            color="primary"
            @click="analyzeComments"
            @click.stop.prevent
            label="Sentiment analysis"
          />
        </div>
      </q-form>
    </q-page>
  </q-page-container>
</template>

<script setup>
import { Notify, useQuasar } from 'quasar'
import DisplayComment from 'src/components/Posts/Comments/DisplayComment.vue'
import TheHeader from 'src/components/shared/TheHeader.vue'
import CommentsSkeleton from 'src/components/shared/CommentsSkeleton.vue'
import { useCommentStore, useErrorStore, useNotificationStore, useStatStore, useUserStore } from 'src/stores'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue'

const props = defineProps({
  collectionName: { type: String, required: true },
  post: { type: Object, required: true }
})

const $q = useQuasar()
const commentStore = useCommentStore()
const errorStore = useErrorStore()
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const statsStore = useStatStore()

const commentId = ref('')
const commentValue = ref('')
const inputField = ref()
const isMention = ref(false)
const mentionedUsers = ref([])
const commentsMessages = ref([])
const reply = reactive({})
const comments = computed(() => {
  return commentStore.getComments?.filter((comment) => !comment.parentId && comment.author)
})

const commenters = computed(() => {
  return commentStore.getComments
    .map((comment) => ({ id: comment.author?.uid, name: comment.author?.displayName }))
    .filter((value, index, self) => value.id && value.name && self.findIndex((t) => t.id === value.id && t.name === value.name) === index)
})

watch(comments, () => {
  commentsMessages.value = comments.value?.map((comment) => comment.text)
})

watchEffect(() => {
  isMention.value = Boolean(
    userStore.getUser &&
      commentValue.value.endsWith('@') &&
      (commentValue.value[commentValue.value.length - 2] === ' ' || commentValue.value[commentValue.value.length - 2] === undefined)
  )
})

function mentionUser(mentioned) {
  commentValue.value = commentValue.value.slice(0, -1) + '@' + mentioned.name.split(' ')[0] + ' '
  mentionedUsers.value.push(mentioned.id)
  isMention.value = false
  nextTick(() => {
    inputField.value.focus()
  })
}

function getReplyAuthor() {
  if (commentStore.haveToReply) {
    const parentComment = commentStore.getCommentById(commentStore.getReplyTo)
    return parentComment?.author?.displayName || 'Anonymous'
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
        slug: props.post.slug,
        message: 'New comment: ' + comment.text,
        type: 'comment'
      })
      notificationStore.create(mentionedUsers.value, {
        collection: props.collectionName,
        link: '/' + props.post.id.replace(/-/g, '/'),
        slug: props.post.slug,
        message: userStore.getUser.displayName + ' mentioned you: ' + comment.text,
        type: 'mention'
      })
    })
    .then(() => {
      window.scrollTo(0, document.body.scrollHeight)
      $q.notify({ type: 'positive', message: 'Comment successfully submitted' })
    })
    .catch((error) => errorStore.throwError(error, 'Comment submission failed!'))
    .finally(() => {
      commentValue.value = ''
    })
}

async function analyzeComments() {
  await statsStore.getCommentsAnalysis(props.post?.id, commentsMessages.value).then(() => {
    Notify.create({
      message: `Users comments analyzed. Overall users' sentiment based on their comments is: ${statsStore.getSentiment}`,
      color: 'primary',
      multiLine: true,
      timeout: 0,
      avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
      actions: [
        {
          label: 'Close',
          color: 'yellow',
          handler: () => {}
        }
      ]
    })
  })
}

watchEffect(async () => {
  await commentStore.fetchComments(props.collectionName, props.post.id)
})

onUnmounted(() => {
  commentStore.setReplyTo('')
  if (commentStore._unSubscribe) {
    commentStore._unSubscribe()
  }
})

commentStore.$subscribe(() => {
  commentStore.haveToReply ? inputField.value.focus() : inputField.value?.blur()
})

async function addReply() {
  const comment = { text: commentValue.value, parentId: commentStore.getReplyTo }
  commentStore
    .addReply(props.collectionName, props.post.id, comment)
    .then(() => {
      notificationStore.create(props.post.subscribers, {
        collection: props.collectionName,
        link: '/' + props.post.id.replace(/-/g, '/'),
        slug: props.post.slug,
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

onMounted(async () => {
  if (commentStore.getCommentsCount) {
    await commentStore.fetchComments(props.collectionName, props.post?.id)
  }
})
</script>

<style scoped>
.replyTop {
  background-color: #5e6775;
  border-radius: 10px;
  color: white;
  display: flex;
  font-size: 12px;
  height: 30px;
  justify-content: space-between;
  padding: 5px 10px;
  position: absolute;
  top: -30px;
  width: 100%;
}
.analysis-btn {
  position: absolute;
  bottom: 115px;
  right: -180px;

  @media (max-width: 1024px) {
    bottom: 160px;
    right: 10px;
  }

  @media (max-width: 425px) {
    bottom: 145px;
    right: 10px;
  }
}
</style>
