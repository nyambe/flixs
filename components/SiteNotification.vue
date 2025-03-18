<script setup lang="ts">
const isVisible = ref(true)
const router = useRouter()

const handleNotificationClick = () => {
  router.push('/subscription/plans')
}

const closeNotification = (e: Event) => {
  e.stopPropagation() // Prevent triggering the parent click handler
  isVisible.value = false
}
</script>

<template>
  <div 
    v-if="isVisible" 
    class="w-full bg-brand text-brand-content py-2 px-4 cursor-pointer"
    @click="handleNotificationClick"
  >
    <div class="container mx-auto flex items-center justify-between">
      <p class="text-sm md:text-base">
        <slot>Limited time offer: Stream premium African movies for just 4.95€/month!</slot>
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