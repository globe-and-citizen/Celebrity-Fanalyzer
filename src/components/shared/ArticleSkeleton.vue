<template>
  <article class="q-pt-md q-px-md relative-position row">
    <div class="col-8">
      <div class="flex items-center q-mb-sm">
        <q-skeleton type="QAvatar" size="2rem" />
        <q-skeleton type="rect" class="q-mb-none q-ml-sm" width="70%" />
      </div>
      <div>
        <q-skeleton type="text" width="80%" />
        <q-skeleton type="text" width="40%" />
        <q-skeleton type="text" width="40%" />
      </div>
    </div>
    <q-skeleton class="col-4" square style="aspect-ratio: 1; border-radius: 24px" />
    <q-separator class="full-width q-mt-md" />
  </article>
</template>
