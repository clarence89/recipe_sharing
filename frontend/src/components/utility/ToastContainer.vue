<template>
  <div class="toast toast-top toast-end z-50">
    <transition-group
      enter-active-class="transition duration-300"
      leave-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-4"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="alert shadow-lg"
        :class="t.type === 'error' ? 'alert-error' : t.type === 'info' ? 'alert-info' : 'alert-success'"
      >
        <span>{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from "../../utils/useToast.js"
const { toasts } = useToast()
</script>
