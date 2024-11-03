<script setup>
import { date } from 'quasar'
import { computed, shallowRef, triggerRef, watch } from 'vue'

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const props = defineProps({
  mask: {
    type: String,
    default: 'YYYY/MM/DD'
  },
  options: {
    type: [Array, Function]
  }
})

const modelValue = defineModel({
  type: String
})

const currentDate = shallowRef(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())

function setCurrentDate() {
  if (modelValue.value) {
    currentDate.value = date.extractDate(modelValue.value, props.mask)
  } else {
    currentDate.value = new Date()
  }
}

function onClickLeft() {
  currentDate.value.setFullYear(currentDate.value.getFullYear() - 1)
  triggerRef(currentDate)
}

function onClickRight() {
  currentDate.value.setFullYear(currentDate.value.getFullYear() + 1)
  triggerRef(currentDate)
}

function createValue(idx) {
  const dateObj = new Date(currentDate.value)
  dateObj.setMonth(idx)
  return date.formatDate(dateObj, props.mask)
}

function onSelectMonth(idx) {
  modelValue.value = createValue(idx)
}

function isActive(idx) {
  const dateObj = date.extractDate(modelValue.value, props.mask)
  return dateObj.getFullYear() === currentDate.value.getFullYear() && dateObj.getMonth() === idx
}

function isDisabled(idx) {
  const value = createValue(idx)
  if (Array.isArray(props.options)) {
    return props.options.includes(value)
  } else if (typeof props.options === 'function') {
    return props.options(value)
  }
}

watch(modelValue, setCurrentDate, { immediate: true })
</script>

<template>
  <div class="q-date q-date--portrait q-date--portrait-minimal">
    <div class="q-date__main col column">
      <div class="q-date__content col relative-position">
        <div class="q-date__view q-date__months flex flex-center">
          <div class="row no-wrap full-width justify-between items-center">
            <q-btn icon="chevron_left" round flat size="sm" dense @click="onClickLeft" />
            <q-btn flat dense>{{ currentYear }}</q-btn>
            <q-btn icon="chevron_right" round flat size="sm" dense @click="onClickRight" />
          </div>

          <div class="q-date__months-item flex flex-center" v-for="(month, idx) in months" :key="month">
            <q-btn
              :flat="!isActive(idx)"
              :color="isActive(idx) ? 'primary' : isDisabled(idx) ? 'grey' : 'default'"
              :disable="isDisabled(idx)"
              @click="!isDisabled(idx) && onSelectMonth(idx)"
              :class="{ 'disabled-month': isDisabled(idx) }"
            >
              {{ month }}
            </q-btn>
          </div>
        </div>
      </div>

      <div class="q-date__actions">
        <slot />
      </div>
    </div>
  </div>
</template>

<style>
.disabled-month {
  opacity: 0.5;
}
</style>
