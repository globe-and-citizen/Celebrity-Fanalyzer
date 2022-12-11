<template>
  <section v-if="entryStore.isLoading" class="q-my-xl text-center">
    <q-spinner color="primary" size="3em" />
  </section>
  <q-page v-else>
    <q-tabs active-color="primary" dense indicator-color="transparent" v-model="tab">
      <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="entry" :ripple="false" />
      <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="arthrogram" :ripple="false" />
    </q-tabs>
    <q-tab-panels animated class="col-grow q-pa-md" swipeable v-model="tab">
      <q-tab-panel name="entry" class="bg-white">
        <q-img :ratio="21 / 9" :src="article?.image" spinner-color="primary" spinner-size="82px" />
        <div class="img-parallax"></div>
        <section class="q-pa-md">
          <h1 class="q-mt-none text-bold text-h5">{{ article.title }}</h1>
          <p class="text-body1" v-html="article.description"></p>
          <div class="q-mb-md">
            <q-badge v-for="(category, index) of article.categories" class="q-mx-xs" :key="index" rounded>
              {{ category }}
            </q-badge>
          </div>
          <q-btn flat rounded color="green" icon="sentiment_satisfied_alt" :label="article.info?.likes">
            <q-tooltip>Like</q-tooltip>
          </q-btn>
          <q-btn flat rounded color="red" icon="sentiment_very_dissatisfied" :label="article.info?.dislikes">
            <q-tooltip>Dislike</q-tooltip>
          </q-btn>
          <q-btn flat rounded icon="chat_bubble_outline" :label="article.info?.comments" @click="toggleComments()">
            <q-tooltip>Comments</q-tooltip>
          </q-btn>
          <q-btn flat rounded icon="share" :label="article.info?.shares">
            <q-tooltip>Share</q-tooltip>
          </q-btn>
        </section>
        <div class="bg-white" style="position: relative; z-index: 2">
          <q-separator />
          <TheComments :comments="comments" v-show="showComments" />
          <q-separator />
        </div>
      </q-tab-panel>
      <q-tab-panel name="arthrogram">
        <h1 class="text-h5">Content 2</h1>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import TheComments from 'src/components/TheComments.vue'
import { useEntryStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const tab  = ref('entry')
const router = useRouter()

const entryStore = useEntryStore()

const article = ref({})
const comments = ref([])
const showComments = ref(false)

onMounted(async () => {
  if (!entryStore.getEntries?.length) {
    await entryStore.fetchEntries() // TODO: Missing ID here
  }
  article.value = entryStore.getEntries.find((entry) => entry.slug === router.currentRoute.value.params.id)
})

function toggleComments() {
  showComments.value = !showComments.value
}
</script>
