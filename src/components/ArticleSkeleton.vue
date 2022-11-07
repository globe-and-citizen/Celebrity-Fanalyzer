<template>
  <article class="q-pt-md relative-position row">
    <div class="col-8 q-pr-md">
      <div class="flex items-center q-mb-sm">
        <q-skeleton type="circle" size="2rem" />
        <q-skeleton type="rect" class="col-grow q-mb-none q-ml-sm" />
      </div>
      <div>
        <q-skeleton type="text" />
        <q-skeleton type="text" />
        <q-skeleton type="text" width="60%" />
      </div>
    </div>
    <q-skeleton class="col-4" style="border-radius: 24px" />
    <q-separator class="full-width q-mt-md" />
  </article>
</template>
