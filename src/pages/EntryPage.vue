<template>
  <section v-if="entryStore.isLoading" class="q-my-xl text-center">
    <q-spinner color="primary" size="3em" />
  </section>
  <q-page v-else class="bg-white">
    <q-tabs active-color="primary" dense indicator-color="transparent" v-model="tab" class="fixed-bottom fixed-tab bg-white">
      <q-tab content-class="q-ml-auto q-pb-md" icon="fiber_manual_record" name="entry" :ripple="false" />
      <q-tab content-class="q-mr-auto q-pb-md" icon="fiber_manual_record" name="arthrogram" :ripple="false" />
    </q-tabs>
    <q-tab-panels animated class="col-grow q-pa-md" swipeable v-model="tab">
      <q-tab-panel name="entry" class="bg-white">
        <img :src="article?.image" alt="" class="parallax-image q-page-container" />
        <section class="q-pa-md bg-white parallax-content">
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
        <div class="bg-white q-mb-md" style="position: relative; z-index: 2">
          <q-separator />
          <TheComments :comments="comments" v-show="showComments" />
          <q-separator />
        </div>
      </q-tab-panel>
      <q-tab-panel name="arthrogram">
        <PromptAnthrogram :prompt="article"></PromptAnthrogram>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import TheComments from 'src/components/TheComments.vue'
import { useEntryStore } from 'src/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PromptAnthrogram from 'src/components/PromptAnthrogram.vue'

const tab = ref('entry')
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

<style scoped lang="scss">
.parallax {
  &-image {
    object-fit: cover;
    width: calc(100% - 64px);
    position: fixed;
    z-index: 1;
    @media (min-width: 610px) {
      width: calc(600px - 64px);
    }
  }
  &-content {
    margin-top: 100%;
    z-index: 2;
    position: relative;
  }
}

.fixed-tab {
  margin-bottom: 60px;
  z-index: 3;
  padding: 15px;
}
</style>
