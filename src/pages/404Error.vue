<template>
  <div class="page">
    <p class="text-body1 text-bold text-center">The page you are looking for does not exist.</p>
    <section class="error-container">
      <span><span>4</span></span>
      <span>0</span>
      <span><span>4</span></span>
    </section>
    <q-btn class="text-bold" color="primary" label="Go Home" rounded @click="onClick" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function onClick() {
  router.push('/')
}
</script>

<style scoped>
.page {
  background: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  height: 100vh;
  justify-content: center;
  padding: 0 15px;
  width: 100vw;
}
.error-container {
  font-family: 'Catamaran', sans-serif;
  font-size: 10rem;
  margin-bottom: 5rem;
  text-align: center;
}
.error-container > span {
  color: #ffb485;
  display: inline-block;
  line-height: 0.7;
  position: relative;
}
.error-container > span > span {
  display: inline-block;
  position: relative;
}
.error-container > span:nth-of-type(1) {
  color: #f0e395;
  perspective: 1000px;
  perspective-origin: 500% 50%;
}
.error-container > span:nth-of-type(1) > span {
  animation: easyoutelastic 8s infinite;
  transform: rotateX(0);
  transform-origin: 50% 100% 0px;
}

.error-container > span:nth-of-type(3) {
  color: #d15c95;
  perspective: none;
  perspective-origin: 50% 50%;
}
.error-container > span:nth-of-type(3) > span {
  animation: rotatedrop 8s infinite;
  transform: rotate(0deg);
  transform-origin: 100% 100% 0px;
}
@keyframes easyoutelastic {
  0% {
    transform: rotateX(0);
  }
  9% {
    transform: rotateX(210deg);
  }
  13% {
    transform: rotateX(150deg);
  }
  16% {
    transform: rotateX(200deg);
  }
  18% {
    transform: rotateX(170deg);
  }
  20% {
    transform: rotateX(180deg);
  }
  60% {
    transform: rotateX(180deg);
  }
  80% {
    transform: rotateX(0);
  }
  100% {
    transform: rotateX(0);
  }
}

@keyframes rotatedrop {
  0% {
    transform: rotate(0);
  }
  10% {
    transform: rotate(30deg);
  }
  15% {
    transform: rotate(90deg);
  }
  70% {
    transform: rotate(90deg);
  }
  80% {
    transform: rotate(0);
  }
  100% {
    transform: rotateX(0);
  }
}
</style>
