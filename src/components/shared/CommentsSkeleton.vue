<template>
  <div class="q-pa-md">
    <q-card flat style="max-width: 500px">
      <q-item>
        <q-item-section avatar>
          <q-skeleton type="QAvatar" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton type="text" height="40px" width="40%" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton type="text" height="20px" width="20%" />
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item>

        <q-item-section class="q-pl-sm">
          <q-skeleton height="100px" class="q-mb-sm" />

          <div class="row  no-wrap">
            <div class="row ">
              <q-icon name="thumb_up" color="grey-4" class="q-mr-sm" size="18px" />
              <q-skeleton type="text" width="30px" />
            </div>

            <div class="row q-px-lg ">
              <q-icon name="thumb_down" color="grey-4" class="q-mr-sm" size="18px" />
              <q-skeleton type="text" width="30px" />
            </div>

            <div class="row ">
              <q-icon name="reply" color="grey-4" class="q-mr-sm" size="18px" />
              <q-skeleton type="text" width="30px" />
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-card>
  </div>
</template>
