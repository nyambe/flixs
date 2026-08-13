<!-- pages/conocenos.vue -->
<script setup lang="ts">
const { t } = useI18n()

const features = computed(() => [
  {
    title: t('Audiovisual Platform'),
    description: t('Specialized in quality African film and television'),
    icon: 'i-heroicons-film'
  },
  {
    title: t('Production Laboratory'),
    description: t('Creation and distribution of original audiovisual content'),
    icon: 'i-heroicons-video-camera'
  },
  {
    title: t('Cultural Management'),
    description: t('Organization of cultural events and film festivals'),
    icon: 'i-heroicons-ticket'
  },
  {
    title: t('Promotion of African Cinema'),
    description: t('Dissemination of stories related to Africa in Spanish language'),
    icon: 'i-heroicons-globe-europe-africa'
  }
])

// Fotos reales del rodaje (spot "Simón Tavares Da Costa"), en public/images/.
// 12 horizontales para el slider del hero; 3 verticales usadas como
// "carteles de cine" (estilo póster MAMADÍ) de fondo en vez de iconos.
const photoPath = (n: number) =>
  `/images/${encodeURIComponent(`MOABA TV SPOT_ SIMON TAVARES DA COSTA_${n}.webp`)}`

// La 60 pasó a ser el cartel del club de lectura (más abajo) — se quita de
// la rotación del slideshow para no repetirla en la misma página.
const heroPhotos = [23, 27, 28, 31, 33, 35, 42, 44, 55, 57, 58]
const missionPhoto = photoPath(24)
const posterPhotos = [
  { src: photoPath(25), caption: t('Behind the lens, the essence of Africa'), objectPosition: 'object-top' },
  { src: photoPath(60), caption: t('Cinema born from community'), objectPosition: 'object-[center_65%]' },
]

// Slideshow automático a pantalla completa: cada foto tiene su propio
// momento en 100dvh, sin controles visibles. Respeta prefers-reduced-motion
// (se queda en la primera foto, sin animar, para quien lo pida).
const activeSlide = ref(0)
const slideDurationMs = 5000
let slideTimer: ReturnType<typeof setInterval> | null = null

// Mismo mecanismo que el hero del home (composables/useHeaderOverlay.ts):
// mientras este hero a pantalla completa está visible, se oculta el banner
// de suscripción (si no, aparece encima a los 10s y tapa la foto).
const heroVisible = useHeroVisible()
const heroSentinel = ref<HTMLElement | null>(null)
let heroObserver: IntersectionObserver | null = null

onMounted(() => {
  heroVisible.value = true
  if (heroSentinel.value) {
    heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible.value = entry.isIntersecting
      },
      { threshold: 0 }
    )
    heroObserver.observe(heroSentinel.value)
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  slideTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % heroPhotos.length
  }, slideDurationMs)
})

onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer)
  heroObserver?.disconnect()
})
</script>

<template>
  <div class="bg-canvas dark:bg-obsidian text-black dark:text-white">
    <!-- Hero: slideshow automático a pantalla completa, una foto a la vez -->
    <section class="relative w-full h-[100dvh] overflow-hidden">
      <img
        v-for="(n, i) in heroPhotos"
        :key="n"
        :src="photoPath(n)"
        :alt="t('About Moaba Cinema TV')"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
        :class="i === activeSlide ? 'opacity-100' : 'opacity-0'"
      >
      <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-obsidian/90 via-obsidian/10 to-transparent" />
      <h1 class="absolute bottom-8 left-6 md:left-12 text-4xl md:text-6xl font-heading font-bold text-white pointer-events-none">
        {{ t('About Moaba Cinema TV') }}
      </h1>
      <div ref="heroSentinel" class="absolute bottom-0 left-0 h-px w-full" />
    </section>

    <div class="container mx-auto px-4 py-12 max-w-6xl">
      <div class="mb-16">
        <!-- Misión: cartel de cine (foto vertical de fondo, estilo póster MAMADÍ) -->
        <div class="relative overflow-hidden rounded-lg mb-12 min-h-[24rem] flex items-end">
          <img :src="missionPhoto" :alt="t('Our Mission')" class="absolute inset-0 w-full h-full object-cover object-top">
          <div class="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-obsidian/70 to-obsidian/20" />
          <div class="relative p-8 md:p-10 text-white max-w-2xl">
            <h2 class="text-2xl font-heading font-semibold mb-4">{{ t('Our Mission') }}</h2>
            <p class="text-lg mb-4">
              {{ t('Audiovisual platform for African cinema and television. It is the production, distribution and commercialization laboratory for film and television, with experience in event creation and cultural management.') }}
            </p>
            <p class="text-lg">
              {{ t('The production root whose main mission is to make cinema and promote African cinema, stories related to AFRICA and Africans in Spain and in Spanish language.') }}
            </p>
          </div>
        </div>

        <!-- Features grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-brand transition"
          >
            <div class="flex items-start gap-4">
              <UIcon
                :name="feature.icon"
                class="w-8 h-8 text-brand"
              />
              <div>
                <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cartel 1: card con foto vertical, mismo tratamiento que "Nuestra Misión" -->
      <div class="relative overflow-hidden rounded-lg mb-16 min-h-[22rem] flex items-center justify-center">
        <img :src="posterPhotos[0].src" :alt="posterPhotos[0].caption" :class="['absolute inset-0 w-full h-full object-cover', posterPhotos[0].objectPosition]">
        <div class="absolute inset-0 bg-obsidian/50" />
        <p class="relative text-2xl md:text-4xl font-heading font-semibold text-white text-center px-6 max-w-3xl">
          {{ posterPhotos[0].caption }}
        </p>
      </div>

      <!-- Team or Philosophy section -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold mb-6">{{ t('Our Philosophy') }}</h2>
        <div class="bg-complementary/10 p-8 rounded-lg">
          <p class="text-lg mb-4">
            {{ t('At Moaba Cinema TV we believe in the power of cinema as a cultural bridge between Africa and the Hispanic world. Through audiovisual media, we seek to break barriers, tear down stereotypes and showcase the cultural richness of the African continent.') }}
          </p>
          <p class="text-lg">
            {{ t('We work to create a space where African stories can be told with authenticity and respect, reaching new audiences through the Spanish language.') }}
          </p>
        </div>
      </div>

      <!-- Cartel 2: card con foto vertical, mismo tratamiento que "Nuestra Misión" -->
      <div class="relative overflow-hidden rounded-lg mb-16 min-h-[22rem] flex items-center justify-center">
        <img :src="posterPhotos[1].src" :alt="posterPhotos[1].caption" :class="['absolute inset-0 w-full h-full object-cover', posterPhotos[1].objectPosition]">
        <div class="absolute inset-0 bg-obsidian/50" />
        <p class="relative text-2xl md:text-4xl font-heading font-semibold text-white text-center px-6 max-w-3xl">
          {{ posterPhotos[1].caption }}
        </p>
      </div>

      <!-- Call to action -->
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-6">{{ t('Want to collaborate with us?') }}</h2>
        <p class="text-lg mb-8 max-w-3xl mx-auto">
          {{ t('If you are interested in African cinema, want to distribute your film or have an idea for an audiovisual project related to Africa, we would love to hear from you.') }}
        </p>
        <UButton
          to="/contact"
          color="primary"
          size="lg"
          class="font-medium text-lg px-8 bg-brand hover:bg-brand-focus text-brand-content"
        >
          {{ t('Contact Us') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
