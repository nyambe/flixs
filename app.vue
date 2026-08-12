<script setup lang="ts">
// app.vue
const { userSubscription } = useAuth();
const route = useRoute();

const headerHeight = useHeaderHeight();
const heroVisible = useHeroVisible();
const isHomePage = computed(() => isHomeRouteName(route.name));

const shouldShowNotification = computed(() => {
  const hasNoActiveSubscription = !userSubscription.value?.active;
  const hiddenForHomeHero = isHomePage.value && heroVisible.value;
  return hasNoActiveSubscription && !hiddenForHomeHero;
});
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-canvas dark:bg-obsidian text-black dark:text-white">
      <SiteNavigation />
      <div v-if="!isHomePage" :style="{ height: headerHeight + 'px' }" />
      <SiteNotification v-if="shouldShowNotification" />

      <NuxtPage />
      <LazyPageFooter />
    </div>
  </UApp>
</template>
