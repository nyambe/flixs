<script setup lang="ts">
const isVisible = ref(true)

const closeNotification = () => {
  isVisible.value = false
}
</script>

<template>
  <div v-if="isVisible" class="w-full bg-brand text-brand-content py-2 px-4">
    <div class="container mx-auto flex items-center justify-between">
      <p class="text-sm md:text-base">
        <slot>Special offer: Get 20% off your first month subscription!</slot>
      </p>
      <UButton
      variant="ghost"
      color="black"
      icon="i-heroicons-x-mark"
      class="ml-4"
      aria-label="Close notification"
      @click="closeNotification"
      />
    </div>
  </div>
</template> 