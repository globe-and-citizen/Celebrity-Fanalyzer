<template>
  <ManagePromptsEntries @openPromptDialog="openPromptDialog" />
</template>

<script setup>
import ManagePromptsEntries from 'src/components/Admin/ManagePromptsEntries.vue'
const emit = defineEmits(['openPromptDialog'])
function openPromptDialog(props) {
  emit('openPromptDialog', props)
}
</script>
