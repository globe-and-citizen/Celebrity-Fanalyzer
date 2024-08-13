<template>
  <div class="loading-spinner-overlay">
    <q-spinner color="primary" size="6em" :thickness="3" />
  </div>
</template>

<style scoped>
.loading-spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: none;
}
</style>
