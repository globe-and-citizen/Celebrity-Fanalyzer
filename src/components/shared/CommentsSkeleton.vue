<template>
  <div class="q-pa-sm">
    <q-card flat >
      <q-item>
        <q-item-section avatar>
          <q-skeleton type="circle" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton type="text" height="20px" width="40%" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton type="text" height="15px" width="20%" />
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item>

        <q-item-section class="q-pl-sm">
          <q-skeleton type="text" height="20px"  />
          <q-skeleton type="text" height="20px"  />

          <div class="row  no-wrap q-mt-sm">
            <div class="row ">
              <q-icon name="thumb_up" color="grey-4" class="q-mr-sm" size="18px" />
              <q-skeleton type="text" width="20px" />
            </div>

            <div class="row q-px-lg ">
              <q-icon name="thumb_down" color="grey-4" class="q-mr-sm" size="18px" />
              <q-skeleton type="text" width="20px" />
            </div>

            <div class="row ">
              <q-icon name="reply" color="grey-4" class="q-mr-sm" size="18px" />
              <q-skeleton type="text" width="20px" />
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-card>
  </div>
</template>
