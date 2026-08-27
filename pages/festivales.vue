<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

interface FestivalCard {
  id: string
  name: string
  icon: string
  tone: 'support' | 'accent' | 'neutral' | 'complementary' | 'brand'
  url: string
  external: boolean
  poster?: string
  film?: string
}

// Mismos festivales que el submenú "Festivales" del megamenú
// (components/SiteNavigation.vue) — no se inventan nombres nuevos aquí, se
// reutilizan los ya existentes ahí. El menú en sí no se toca desde esta página.
// Cada tarjeta enlaza a la web oficial verificada del festival (comprobada
// una por una, ninguna URL inventada). Yaoundé FilmLab no tiene web propia,
// enlaza a un artículo de Guinealia (indicado por Marga). MCTV. Cinema es la
// propia marca de la plataforma, no un festival externo, así que se queda
// enlazando dentro del sitio.
//
// `poster`: cartel real de una película ganadora/destacada en ese festival —
// verificado uno por uno (premio + año + festival), no inventado. La mayoría
// vía TMDB; "Cartago Film" usa Black Girl (1966), ganadora del Tanit d'or en
// la primera edición de JCC (indicada por Marga, verificada por año/premio).
// "MCTV. Cinema" no es un festival externo, es la propia marca de la
// plataforma — sin cartel de festival propio, se queda sin poster (el cartel
// de "Lámpara" que estaba aquí no correspondía; esa película va en la
// home, ver pages/index.vue).
const festivals = computed<FestivalCard[]>(() => [
  {
    id: 'fespaco', name: 'FESPACO', icon: 'i-heroicons-trophy', tone: 'brand',
    url: 'https://fespaco.bf/en/', external: true,
    poster: '/images/festivals/fespaco-poster.jpg', film: 'Ashkal (2022) — Étalon d\'or 2023',
  },
  {
    id: 'fcat', name: 'FCAT', icon: 'i-heroicons-film', tone: 'complementary',
    url: 'https://fcat.es/en/', external: true,
    poster: '/images/festivals/fcat-poster.jpg', film: 'Promised Sky (2025) — Mejor Largometraje',
  },
  {
    id: 'durban-filmart', name: 'Durban FilmArt', icon: 'i-heroicons-video-camera', tone: 'accent',
    url: 'https://durbanfilmmart.co.za/', external: true,
    poster: '/images/festivals/durban-poster.jpg', film: 'The Wound (2017)',
  },
  {
    id: 'miradas-doc', name: 'Miradas Doc', icon: 'i-heroicons-document-text', tone: 'neutral',
    url: 'https://www.miradasdoc.com/', external: true,
    poster: '/images/festivals/miradasdoc-poster.jpg', film: 'La Hojarasca (2024) — Mejor Película',
  },
  {
    id: 'yaounde-filmlab', name: 'Yaoundé FilmLab', icon: 'i-heroicons-beaker', tone: 'support',
    url: 'https://www.guinealia.com/tag/yaounde-film-lab', external: true,
    poster: '/images/festivals/yaounde-poster.jpg', film: 'Mboa Matanda (2023)',
  },
  {
    id: 'cartago-film', name: 'Cartago Film', icon: 'i-heroicons-film', tone: 'brand',
    url: 'https://www.jcctunisie.org/', external: true,
    poster: '/images/festivals/cartago-poster.jpg', film: 'Black Girl (1966) — Tanit d\'or, 1ª edición JCC',
  },
  {
    id: 'mctv-cinema', name: 'MCTV. Cinema', icon: 'i-heroicons-tv', tone: 'complementary',
    url: '/proximamente', external: false,
  },
])

// FESPACO como festival destacado del hero — el más reconocido de los 7, no
// una elección arbitraria. El resto de la maqueta (Highlights, ediciones con
// fechas concretas) no se reproduce: exigiría inventar noticias y fechas que
// no existen.
const featuredFestival = computed(() => festivals.value.find(f => f.id === 'fespaco')!)

// Emblema oficial real de FESPACO (30ª edición, fespaco.bf) — representa al
// festival en sí, no a una película asociada; por eso el hero usa esta imagen
// en vez del cartel de Ashkal que sí tiene sentido en la tarjeta del grid.
const fespacoEmblem = '/images/festivals/fespaco-emblem.jpg'

// Mismos tokens de marca que Paquetes Solidarios (pages/paquetes.vue) — ya
// cambian de tono solo con .dark, sin lógica extra aquí.
const toneTextClass: Record<FestivalCard['tone'], string> = {
  support: 'text-support',
  accent: 'text-accent',
  neutral: 'text-neutral',
  complementary: 'text-complementary',
  brand: 'text-brand',
}
const toneWashClass: Record<FestivalCard['tone'], string> = {
  support: 'bg-support/10',
  accent: 'bg-accent/10',
  neutral: 'bg-neutral/10',
  complementary: 'bg-complementary/10',
  brand: 'bg-brand/10',
}

useSeoMeta({
  title: () => `${t('Festivales')} - MOABA Cinema TV`,
})
</script>

<template>
  <div class="bg-canvas dark:bg-obsidian text-black dark:text-white min-h-screen py-24 px-4">
    <!-- Hero del festival destacado: emblema oficial real de FESPACO (no un
         cartel de película, no una foto de stock, no una escena inventada). -->
    <div class="max-w-6xl mx-auto mb-16">
      <div class="grid md:grid-cols-2 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60">
        <div class="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
          <span class="inline-block self-start text-xs font-semibold uppercase tracking-wide bg-brand text-brand-content rounded-full px-3 py-1 mb-4">
            {{ t('Festival Destacado') }}
          </span>
          <h1 class="text-4xl md:text-5xl font-heading font-bold mb-4">{{ featuredFestival.name }}</h1>
          <p class="text-lg text-neutral-600 dark:text-neutral-300 max-w-md mb-6">
            {{ t('Uno de los festivales de cine africano más prestigiosos, con presencia destacada en el circuito internacional.') }}
          </p>

          <div class="flex flex-wrap gap-3">
            <UButton
              :to="featuredFestival.external ? featuredFestival.url : localePath(featuredFestival.url)"
              :target="featuredFestival.external ? '_blank' : undefined"
              :rel="featuredFestival.external ? 'noopener noreferrer' : undefined"
              size="lg"
              class="font-medium bg-brand text-brand-content hover:bg-brand-focus"
              icon="i-heroicons-arrow-top-right-on-square"
            >
              {{ t('Más Información') }}
            </UButton>
            <UButton
              to="#todos-los-festivales"
              size="lg"
              variant="outline"
              color="neutral"
              class="font-medium text-black dark:text-white ring-1 ring-inset ring-neutral-400 dark:ring-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              {{ t('Ver Festivales') }}
            </UButton>
          </div>
        </div>

        <div class="relative min-h-[280px] order-1 md:order-2">
          <img :src="fespacoEmblem" :alt="featuredFestival.name" class="absolute inset-0 w-full h-full object-cover">
        </div>
      </div>
    </div>

    <!-- Grid con los 7 festivales (incluye también el destacado arriba, para
         que la lista se lea completa). -->
    <div id="todos-los-festivales" class="max-w-6xl mx-auto text-center mb-16 scroll-mt-24">
      <h2 class="text-3xl md:text-4xl font-heading font-bold mb-4">{{ t('Todos los Festivales') }}</h2>
      <p class="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
        {{ t('Los festivales de cine africano que seguimos de cerca.') }}
      </p>
    </div>

    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4 max-w-6xl mx-auto">
      <NuxtLink
        v-for="festival in festivals"
        :key="festival.id"
        :to="festival.external ? festival.url : localePath(festival.url)"
        :target="festival.external ? '_blank' : undefined"
        :rel="festival.external ? 'noopener noreferrer' : undefined"
        class="group relative block aspect-[2/3] rounded-lg overflow-hidden"
      >
        <img
          v-if="festival.poster"
          :src="festival.poster"
          alt=""
          class="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105"
        >
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center"
          :class="[toneTextClass[festival.tone], toneWashClass[festival.tone]]"
        >
          <UIcon :name="festival.icon" class="w-10 h-10 opacity-25" />
        </div>

        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-6">
          <div class="flex items-center gap-1.5">
            <UIcon :name="festival.icon" class="w-3.5 h-3.5 shrink-0" :class="toneTextClass[festival.tone]" />
            <h2 class="text-white text-xs sm:text-sm font-semibold leading-tight truncate">{{ festival.name }}</h2>
          </div>
          <p v-if="festival.film" class="text-[10px] text-neutral-300 truncate mt-0.5 opacity-0 group-hover:opacity-100 transition">
            {{ festival.film }}
          </p>
        </div>

        <UIcon
          v-if="festival.external"
          name="i-heroicons-arrow-top-right-on-square"
          class="absolute top-2 right-2 w-3.5 h-3.5 text-white/70"
        />
      </NuxtLink>
    </div>
  </div>
</template>
