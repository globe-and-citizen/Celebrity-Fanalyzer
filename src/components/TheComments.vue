<template>
  <section class="q-px-md">
    <div>posts will be here</div>

    <q-input dense label="Comment" rounded standout v-model="myComment">
      <template v-slot:append>
        <q-icon name="send" />
      </template>
    </q-input>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const myComment = ref('')
</script>

<style>
.q-input {
  padding-bottom: 1rem;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
