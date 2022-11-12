<template>
  <section class="q-pa-md">
    <div v-for="comment of comments" class="flex items-center" :key="comment.id">
      <q-avatar size="2.6rem">
        <q-img :src="comment.author.photoURL" />
      </q-avatar>
      <p class="column q-mb-none q-ml-sm">
        <span class="text-body1">{{ comment.author.displayName }}</span>
        <span class="text-body2 text-secondary">
          {{ comment.created.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
        </span>
      </p>
      <q-space />
      <q-btn-dropdown color="secondary" dense dropdown-icon="more_vert" flat rounded>
        <q-list>
          <q-item clickable v-close-popup @click.prevent="">
            <q-item-section>
              <q-item-label>Edit</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click.prevent="">
            <q-item-section>
              <q-item-label>Delete</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <div class="q-my-sm">
        {{ comment.text }}
      </div>
    </div>
    <q-separator />
    <q-input
      class="bg-white fixed-bottom q-px-sm z-top"
      color="white"
      dense
      label="Comment"
      rounded
      standout
      style="margin-bottom: 4rem"
      v-model="myComment"
      @keyup.enter="sendComment()"
    >
      <template v-slot:append>
        <q-icon name="send" @click="sendComment()" />
      </template>
    </q-input>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  comments: { type: Array, required: true }
})

const myComment = ref('')

function sendComment() {
  console.log(myComment.value)
  myComment.value = ''
}
</script>
