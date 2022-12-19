<template>
  <q-header class="shadow-1">
    <q-toolbar class="bg-white q-px-lg">
      <q-toolbar-title>
        <q-img src="~assets/logo.svg" width="1.7rem" />
        <span class="q-ml-sm inline row text-secondary">
          <b>Celebrity</b>
          Fanalyzer
        </span>
      </q-toolbar-title>
      <q-btn flat icon="notifications" round size="1rem" text-color="secondary" />
    </q-toolbar>
  </q-header>

  <q-page class="q-pa-md">
    <section class="text-center">
      <h2 class="q-my-sm text-h6">Welcome to Celebrity Fanalyzer!</h2>
      <RouterLink to="month">
        <p class="text-body1">Take a look at this month's competition!</p>
        <q-img :src="monthPrompt.image" spinner-color="primary" style="border: 3px solid #e54757; border-radius: 12px" />
      </RouterLink>
      <p class="q-my-md text-body1">
        Question of the Month:
        <br />
        <RouterLink to="month">
          {{ monthPrompt.title }}
        </RouterLink>
      </p>
      <article class="q-my-xl text-body1 text-left">
        <h3 class="text-bold text-h6">
          <i>“Celebrity Fanalyzer?”</i>
          &nbsp;
          <span>What’s This All About?</span>
        </h3>
        <p>
          Every month, the team at Celebrity Fanalyzer hosts an essay and art contest. Every month there is a Question-of-the-Month or
          Prompt that entrants must give there opinion about.
        </p>
        <p>Participants join the competition through the Freelancer web platform.</p>
        <p>
          The way the competition / site works is simple: Entrants must have a Freelancer account. No money is handled outside the
          Freelancer platform.
        </p>
        <ul>
          <li>The top 5 essays are chosen to be finalist. Each finalist receives $50.</li>
          <li>
            The criteria for winning the grand prize ($250) is an open formula published with each month’s question. For example: the entry
            with the most likes, shares, or comments, etc. wins. All voting occurs on www.CelebrityFanalyzer.com.
          </li>
          <li>Winners of the art competition are chosen by the team at Celebrity Fanalyzer.</li>
          <li>All submissions must be original work: essays and art.</li>
        </ul>
        <p>
          Every month a winner is chosen, paid, and then we do it again! The first and second week of the month are for writing. The third
          and fourth week are for voting. If you want to know more about the project, check out the page “
          <a href="#">Why?</a>
          ”
        </p>
      </article>
      <div>
        <h3 class="text-bold text-h5">Contact Us!</h3>
        <p class="text-left">
          Want to communicate with the team here at Celebrity Fanalyzer? Contact us through a message on our brand new Discord server: give
          an opinion, suggest a topic, give us some feedback – we would love to hear from you! Celebrity Fanalyzer is a work in progress. If
          you want to get involved shaping the future of the application, reach out to us. You can learn more about what we are doing by
          checking out the Road Map below.
        </p>
        <q-btn flat rounded icon="img:/icons/discord.svg" href="https://discord.gg/z4P3UrhhSH" size="xl" target="_blank">
          <q-tooltip anchor="bottom middle" self="center middle">Community on Discord</q-tooltip>
        </q-btn>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { usePromptStore } from 'src/stores'
import { onMounted, ref } from 'vue'

const promptStore = usePromptStore()

const monthPrompt = ref(promptStore.getMonthPrompt)

onMounted(async () => {
  await promptStore.fetchMonthPrompt()
  monthPrompt.value = promptStore.getMonthPrompt
})
</script>

<style scoped lang="scss">
a {
  text-decoration: none;
  transition: all 0.3s;

  &:visited {
    color: #e54757;
  }
}
</style>
