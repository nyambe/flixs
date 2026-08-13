<script setup lang="ts">
// pages/paquetes.vue
const { t } = useI18n()

interface SponsorTier {
  id: string
  name: string
  icon: string
  description: string
  features: string[]
  recommended: boolean
}

const tiers = computed<SponsorTier[]>(() => [
  {
    id: 'bronce',
    name: t('Bronce'),
    icon: 'i-heroicons-shield-check',
    description: t('Colaboración inicial y presencia básica'),
    features: [
      t('Logo en créditos secundarios'),
      t('Mención en redes sociales'),
      t('Suscripciones premium para empleados (5)'),
    ],
    recommended: false,
  },
  {
    id: 'plata',
    name: t('Plata'),
    icon: 'i-heroicons-star',
    description: t('Mayor visibilidad y presencia en contenidos/campañas'),
    features: [
      t('Logo destacado en la web'),
      t('Presencia en spots de TV'),
      t('Patrocinio de una categoría de cine'),
      t('Suscripciones premium (20)'),
    ],
    recommended: true,
  },
  {
    id: 'oro',
    name: t('Oro'),
    icon: 'i-heroicons-trophy',
    description: t('Colaboración principal, con mayor protagonismo y asociación con el proyecto'),
    features: [
      t('Socio estratégico principal'),
      t('Logo en el Hero dinámico'),
      t('Patrocinio exclusivo de estrenos'),
      t('Eventos privados y alfombra roja'),
      t('Suscripciones corporativas ilimitadas'),
    ],
    recommended: false,
  },
])

useSeoMeta({
  title: 'Paquetes de Patrocinio - MOABA Cinema TV',
})
</script>

<template>
  <div class="bg-canvas dark:bg-obsidian text-black dark:text-white min-h-screen py-24 px-4">
    <div class="max-w-6xl mx-auto text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-heading font-bold mb-4">{{ t('Paquetes de Patrocinio') }}</h1>
      <p class="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
        {{ t('Únete a la misión de llevar el cine africano al mundo y obtén visibilidad exclusiva en nuestra plataforma.') }}
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
      <div
        v-for="tier in tiers"
        :key="tier.id"
        :class="[
          'rounded-2xl p-8 flex flex-col relative',
          tier.recommended
            ? 'bg-white dark:bg-neutral-900 border-2 border-brand md:-mt-4 md:mb-4'
            : 'bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800',
        ]"
      >
        <div
          v-if="tier.recommended"
          class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-brand-content text-xs font-semibold uppercase tracking-wide py-1 px-4 rounded-full"
        >
          {{ t('Recomendado') }}
        </div>

        <div class="flex items-center gap-2 mb-2 text-black dark:text-white">
          <UIcon :name="tier.icon" class="w-6 h-6 text-brand" />
          <h2 class="text-2xl font-heading font-semibold">{{ tier.name }}</h2>
        </div>
        <p class="mb-6 text-neutral-600 dark:text-neutral-400">
          {{ tier.description }}
        </p>

        <ul class="mb-8 flex-grow space-y-3">
          <li
            v-for="feature in tier.features"
            :key="feature"
            class="flex items-start gap-2 text-neutral-700 dark:text-neutral-300"
          >
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <span>{{ feature }}</span>
          </li>
        </ul>

        <UButton
          to="/contact"
          size="lg"
          class="w-full justify-center font-medium"
          :class="tier.recommended
            ? 'bg-brand text-brand-content hover:bg-brand-focus'
            : 'bg-transparent ring-1 ring-inset ring-neutral-400 dark:ring-neutral-600 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800'"
        >
          {{ t('Contactar para Patrocinio') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
