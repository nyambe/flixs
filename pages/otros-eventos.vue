<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="container mx-auto px-4 py-24 max-w-2xl text-center">
    <h1 class="text-4xl font-heading font-bold mb-4">{{ t('Otros Eventos') }}</h1>
    <p class="text-lg text-neutral-500">{{ t('Coming soon') }}</p>
    <p class="mt-2 text-neutral-500">{{ t("We're working on this section. Check back soon.") }}</p>
    <NuxtLink :to="useLocalePath()('/')" class="inline-block mt-8 text-brand hover:underline">
      {{ t('Volver al Inicio') }}
    </NuxtLink>
  </div>
</template>
