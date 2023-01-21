<template>
  <section class="q-pa-md" style="margin-bottom: 4rem">
    <div class="text-center text-h5 text-bold q-mb-md">Comments</div>
    <div v-for="comment of comments" class="q-mb-md" :key="comment.id">
      <div class="flex items-center">
        <q-avatar size="2rem">
          <q-img :src="comment.author.photoURL" />
        </q-avatar>
        <p class="column q-mb-none q-ml-sm">
          <span class="text-body2">{{ comment.author.displayName }}</span>
          <span class="text-body2 text-secondary">
            {{ comment.created.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
          </span>
        </p>
        <q-space />
        <q-btn-dropdown color="secondary" dense dropdown-icon="more_vert" flat rounded>
          <q-list>
            <q-item
              :disable="!userStore.isAuthenticated || userStore.getUserRef.id !== comment.author.uid"
              clickable
              v-close-popup
              @click="comment.editShow = !comment.editShow"
            >
              <q-item-section>
                <q-item-label>Edit</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="deleteComment(comment.id)">
              <q-item-section>
                <q-item-label>Delete</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <div v-show="!comment.editShow" class="q-my-sm text-body2">
        {{ comment.text }}
      </div>
      <q-input
        autogrow
        :id="comment.id"
        v-if="comment.editShow"
        class="bg-white q-px-sm q-page-container min-h-full"
        color="white"
        dense
        label="Comment"
        rounded
        standout="bg-secondary text-white"
        v-model="comment.text"
        @keyup.enter="editComment(comment.text, comment.id), (comment.editShow = !comment.editShow)"
      >
        <template v-slot:append>
          <q-icon
            class="cursor-pointer"
            name="send"
            @click="editComment(comment.text, comment.id), (comment.editShow = !comment.editShow)"
          />
        </template>
      </q-input>
      <q-separator />
    </div>
    <q-input
      class="bg-white fixed-bottom q-px-sm q-page-container"
      color="white"
      dense
      :disable="!userStore.isAuthenticated"
      label="Comment"
      rounded
      standout="bg-secondary text-white"
      style="margin-bottom: 6.7rem"
      v-model="myComment.text"
      @keyup.enter="sendComment()"
    >
      <template v-slot:append>
        <q-icon class="cursor-pointer" name="send" @click="sendComment()" />
      </template>
    </q-input>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useCommentStore, useUserStore } from 'src/stores'
import { reactive, ref } from 'vue'

const props = defineProps({
  comments: { type: Array, required: true },
  entry: { type: Object, required: true }
})

const $q = useQuasar()
const myComment = reactive({})
const userStore = useUserStore()
const commentStore = useCommentStore()

async function sendComment() {
  await commentStore
    .addComment(myComment, props.entry)
    .then(() => $q.notify({ message: 'Comment successfully submitted' }))
    .catch(() => $q.notify({ message: 'Comment submission failed!' }))
  this.myComment.text = ''
  window.scrollTo(0, document.body.scrollHeight)
}

async function deleteComment(commentId) {
  await commentStore
    .deleteComment(commentId, props.entry)
    .then(() => $q.notify({ message: 'Comment successfully deleted' }))
    .catch(() => $q.notify({ message: 'Comment submission failed!' }))
}

async function editComment(editedComment, id) {
  await commentStore
    .editComment(editedComment, id, props.entry)
    .then(() => $q.notify({ message: 'Comment successfully edited!' }))
    .catch(() => $q.notify({ message: 'Comment submission failed!' }))
}
</script>
