<template>
  <section class="flex justify-center">
    <q-uploader accept="image/*" bordered class="full-width" multiple flat style="max-height: 32rem" />
  </section>
</template>

<script setup></script>

<style>
.q-uploader__list {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}
</style>
