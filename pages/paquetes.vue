<script setup lang="ts">
// pages/paquetes.vue
const { t } = useI18n()
const localePath = useLocalePath()

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

interface SolidarityPackage {
  id: string
  name: string
  icon: string
  description: string
  ctaLabel: string
  tone: 'support' | 'accent' | 'neutral' | 'complementary' | 'brand'
}

// Tokens ya existentes en tailwind.css (--color-brand/complementary/accent/
// neutral/support): su tono cambia solo con .dark, así el acento y el fondo
// de cada tarjeta se adaptan a claro/oscuro sin lógica extra aquí.
const toneTextClass: Record<SolidarityPackage['tone'], string> = {
  support: 'text-support',
  accent: 'text-accent',
  neutral: 'text-neutral',
  complementary: 'text-complementary',
  brand: 'text-brand',
}
const toneWashClass: Record<SolidarityPackage['tone'], string> = {
  support: 'bg-support/10',
  accent: 'bg-accent/10',
  neutral: 'bg-neutral/10',
  complementary: 'bg-complementary/10',
  brand: 'bg-brand/10',
}

const solidarityPackages = computed<SolidarityPackage[]>(() => [
  {
    id: 'oceano',
    name: t('Océano'),
    icon: 'i-heroicons-lifebuoy',
    description: t('Protección del mar y medioambiente. Iniciativas enfocadas en la conservación de ecosistemas costeros y la lucha contra la contaminación plástica.'),
    ctaLabel: t('Contribuir'),
    tone: 'support',
  },
  {
    id: 'tierra',
    name: t('Tierra'),
    icon: 'i-heroicons-globe-americas',
    description: t('Naturaleza, territorio y comunidades. Apoyo directo a proyectos agrícolas sostenibles y preservación de tierras sagradas junto a comunidades locales.'),
    ctaLabel: t('Apoyar Proyecto'),
    tone: 'accent',
  },
  {
    id: 'agua',
    name: t('Agua'),
    icon: 'i-heroicons-cloud',
    description: t('Acceso al agua y conciencia medioambiental. Financiación de infraestructuras hídricas y educación sobre el uso responsable del recurso más vital.'),
    ctaLabel: t('Contribuir'),
    tone: 'neutral',
  },
  {
    id: 'aire',
    name: t('Aire'),
    icon: 'i-heroicons-sun',
    description: t('Salud ambiental, sostenibilidad y calidad de vida. Promoción de energías renovables y programas de reducción de emisiones en áreas urbanas.'),
    ctaLabel: t('Apoyar'),
    tone: 'complementary',
  },
  {
    id: 'ritmo',
    name: t('Ritmo'),
    icon: 'i-heroicons-musical-note',
    description: t('Cultura, música, arte y unión de las personas. Fomento de festivales locales, preservación de instrumentos tradicionales y apoyo a artistas emergentes.'),
    ctaLabel: t('Contribuir'),
    tone: 'brand',
  },
])

const solidarityTopRow = computed(() => solidarityPackages.value.slice(0, 2))
const solidarityBottomRow = computed(() => solidarityPackages.value.slice(2))

// Equalizer del panel "Ritmo": barras fijas, no depende de datos externos.
const rhythmBars = [
  { x: 40, y1: 110, opacity: 0.3 },
  { x: 80, y1: 70, opacity: 0.45 },
  { x: 120, y1: 40, opacity: 0.6 },
  { x: 160, y1: 90, opacity: 0.4 },
  { x: 200, y1: 20, opacity: 0.7 },
  { x: 240, y1: 90, opacity: 0.4 },
  { x: 280, y1: 40, opacity: 0.6 },
  { x: 320, y1: 70, opacity: 0.45 },
  { x: 360, y1: 110, opacity: 0.3 },
]

useSeoMeta({
  title: () => `${t('Paquetes de Patrocinio')} - MOABA Cinema TV`,
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
          :to="localePath('/contact')"
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

    <!-- Paquetes Solidarios: adaptado del mockup de Stitch (patrocinio por
         causa — océano/tierra/agua/aire/ritmo — en vez de por tier
         corporativo). Sin fotografía real disponible todavía: el fondo de
         cada tarjeta es una escena abstracta en SVG con los tokens de marca,
         pensada como placeholder integrado hasta tener las fotos definitivas. -->
    <div class="max-w-6xl mx-auto text-center mt-32 mb-16">
      <h2 class="text-4xl md:text-5xl font-heading font-bold mb-4">{{ t('Paquetes Solidarios') }}</h2>
      <p class="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
        {{ t('Más que un patrocinio comercial, estas son contribuciones directas a proyectos que generan un impacto real. Al apoyar nuestros Paquetes Solidarios, te unes a una red global dedicada a la preservación del patrimonio cultural, la protección del medio ambiente y el desarrollo comunitario a través del cine y el arte africano.') }}
      </p>
    </div>

    <div class="max-w-6xl mx-auto space-y-6">
      <div class="grid md:grid-cols-5 gap-6">
        <div
          v-for="pkg in solidarityTopRow"
          :key="pkg.id"
          :class="pkg.id === 'tierra' ? 'md:col-span-3' : 'md:col-span-2'"
          class="rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex flex-col"
        >
          <div class="flex items-center gap-2 p-6 pb-4">
            <span class="rounded-lg bg-black/5 dark:bg-white/10 p-2" :class="toneTextClass[pkg.tone]">
              <UIcon :name="pkg.icon" class="w-5 h-5" />
            </span>
            <h3 class="text-xl font-heading font-semibold">{{ pkg.name }}</h3>
          </div>

          <div class="relative h-48 mx-6 rounded-xl overflow-hidden" :class="[toneTextClass[pkg.tone], toneWashClass[pkg.tone]]">
            <svg v-if="pkg.id === 'oceano'" viewBox="0 0 400 160" class="absolute inset-0 w-full h-full" fill="none" stroke="currentColor">
              <circle cx="320" cy="40" r="18" stroke-width="1.5" opacity="0.6" />
              <path d="M0 90 Q 50 70 100 90 T 200 90 T 300 90 T 400 90" stroke-width="1.5" opacity="0.5" />
              <path d="M0 115 Q 50 95 100 115 T 200 115 T 300 115 T 400 115" stroke-width="1.5" opacity="0.35" />
              <path d="M0 140 Q 50 120 100 140 T 200 140 T 300 140 T 400 140" stroke-width="1.5" opacity="0.2" />
            </svg>
            <svg v-else-if="pkg.id === 'tierra'" viewBox="0 0 400 160" class="absolute inset-0 w-full h-full" fill="none" stroke="currentColor">
              <circle cx="330" cy="45" r="16" stroke-width="1.5" opacity="0.5" />
              <path d="M0 130 Q 60 90 130 120 T 260 110 T 400 130 V160 H0 Z" fill="currentColor" stroke="none" opacity="0.15" />
              <path d="M0 150 Q 80 115 160 140 T 320 130 T 400 150 V160 H0 Z" fill="currentColor" stroke="none" opacity="0.25" />
            </svg>
          </div>

          <div class="p-6 pt-4 flex flex-col flex-grow">
            <p class="mb-6 text-neutral-600 dark:text-neutral-400 flex-grow">{{ pkg.description }}</p>
            <UButton size="lg" class="w-full justify-center font-medium bg-brand text-brand-content hover:bg-brand-focus">
              {{ pkg.ctaLabel }}
            </UButton>
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="pkg in solidarityBottomRow"
          :key="pkg.id"
          class="rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex flex-col"
        >
          <div class="flex items-center gap-2 p-6 pb-4">
            <span class="rounded-lg bg-black/5 dark:bg-white/10 p-2" :class="toneTextClass[pkg.tone]">
              <UIcon :name="pkg.icon" class="w-5 h-5" />
            </span>
            <h3 class="text-xl font-heading font-semibold">{{ pkg.name }}</h3>
          </div>

          <div class="relative h-40 mx-6 rounded-xl overflow-hidden" :class="[toneTextClass[pkg.tone], toneWashClass[pkg.tone]]">
            <svg v-if="pkg.id === 'agua'" viewBox="0 0 400 160" class="absolute inset-0 w-full h-full" fill="none" stroke="currentColor">
              <path d="M-20 60 Q 20 40 60 60 T 140 60 T 220 60 T 300 60 T 380 60" stroke-width="1.5" opacity="0.5" />
              <path d="M-20 90 Q 20 70 60 90 T 140 90 T 220 90 T 300 90 T 380 90" stroke-width="1.5" opacity="0.4" />
              <path d="M-20 120 Q 20 100 60 120 T 140 120 T 220 120 T 300 120 T 380 120" stroke-width="1.5" opacity="0.3" />
            </svg>
            <svg v-else-if="pkg.id === 'aire'" viewBox="0 0 400 160" class="absolute inset-0 w-full h-full" fill="none" stroke="currentColor">
              <path d="M0 50 C 100 20, 150 80, 260 50 S 400 40, 400 40" stroke-width="1.5" opacity="0.5" />
              <path d="M0 90 C 120 60, 180 120, 280 90 S 400 80, 400 80" stroke-width="1.5" opacity="0.4" />
              <path d="M0 130 C 100 100, 200 150, 300 120 S 400 120, 400 120" stroke-width="1.5" opacity="0.3" />
            </svg>
            <svg v-else-if="pkg.id === 'ritmo'" viewBox="0 0 400 160" class="absolute inset-0 w-full h-full" stroke="currentColor">
              <line
                v-for="bar in rhythmBars"
                :key="bar.x"
                :x1="bar.x"
                :y1="bar.y1"
                :x2="bar.x"
                y2="150"
                stroke-width="8"
                stroke-linecap="round"
                :opacity="bar.opacity"
              />
            </svg>
          </div>

          <div class="p-6 pt-4 flex flex-col flex-grow">
            <p class="mb-6 text-neutral-600 dark:text-neutral-400 flex-grow">{{ pkg.description }}</p>
            <UButton size="lg" class="w-full justify-center font-medium bg-brand text-brand-content hover:bg-brand-focus">
              {{ pkg.ctaLabel }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
