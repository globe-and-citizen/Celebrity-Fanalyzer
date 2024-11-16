<template>
  <article class="q-pa-md relative-position row skeleton-card">
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
  </article>
</template>

<style scoped lang="scss">
.skeleton-card {
  min-width: 619px;
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);

  @media (max-width: 1440px) {
    min-width: 590px;
  }

  @media (min-width: 1024px) {
    min-width: 470px;
  }

  @media (max-width: 768px) {
    min-width: 361px;
  }

  @media (max-width: 425px) {
    min-width: 280px;
  }
}
</style>
