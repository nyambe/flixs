<script setup lang="ts">
// app.vue
const { userSubscription } = useAuth();

const shouldShowNotification = computed(() => {
  return !userSubscription.value?.active;
});
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-canvas dark:bg-black text-black dark:text-white">
      <SiteNavigation />
      <SiteNotification v-if="shouldShowNotification" />
        
      <NuxtPage />
      <LazyPageFooter />
    </div>
  </UApp>
</template>

<style>
.backdrop-blur {
  backdrop-filter: blur(8px);
}
div {
  font-family: 'Montserrat', sans-serif;
}
</style>