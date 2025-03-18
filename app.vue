<script setup lang="ts">
// app.vue
const { userSubscription } = useAuth();

const shouldShowNotification = computed(() => {
  return !userSubscription.value?.active;
});
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <SiteNavigation />
    <SiteNotification v-if="shouldShowNotification" />
    
    <NuxtPage />
    <LazyPageFooter />
  </div>
</template>

<style>
.backdrop-blur {
  backdrop-filter: blur(8px);
}
div {
  font-family: 'Montserrat', sans-serif;
}
</style>