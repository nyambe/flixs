<script setup lang="ts">
// app.vue
const { userSubscription } = useAuth();
const route = useRoute();

const headerHeight = useHeaderHeight();
const notificationHeight = useNotificationHeight();
const isHomePage = computed(() => isHomeRouteName(route.name));

// La barra vive fixed por encima del header (no tapa el hero, solo lo
// empuja hacia abajo), así que ya puede mostrarse en cualquier página,
// incluidas home/Conócenos.
const shouldShowNotification = computed(() => !userSubscription.value?.active);

// Espacio reservado debajo del header fijo (para que el contenido no quede
// tapado): su propia altura siempre, más la de la barra de oferta cuando
// está visible encima de él. En home, el header flota transparente sobre
// el hero y no reserva espacio.
const spacerHeight = computed(() => (isHomePage.value ? 0 : headerHeight.value + notificationHeight.value));
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-canvas dark:bg-obsidian text-black dark:text-white">
      <SiteNotification v-if="shouldShowNotification" />
      <SiteNavigation />
      <div v-if="!isHomePage" :style="{ height: spacerHeight + 'px' }" />

      <NuxtPage />
      <LazyPageFooter />
    </div>
  </UApp>
</template>
