<template>
  <article class="q-pt-md relative-position row">
    <div class="col-8">
      <div class="flex items-center">
        <q-skeleton type="circle" size="2rem"/>
        <q-skeleton type="rect" class="col-grow q-mb-none q-ml-sm"/>
      </div>
      <div>
        <q-skeleton type="text"/>
        <q-skeleton type="text"/>
        <q-skeleton type="text"/>
      </div>
    </div>
    <q-skeleton class="col-4" square/>
    <q-separator class="full-width q-mt-md"/>
  </article>
</template>
<script setup>
</script>
