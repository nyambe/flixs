<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { useI18n } from 'vue-i18n';
import { useColorMode } from '#imports';

// Initialize i18n
const { t, locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const localePath = useLocalePath();

// Initialize color mode
const colorMode = useColorMode();

// Logo según modo de color: amarillo sobre fondo oscuro (alto contraste),
// naranja/terracota sobre fondo claro (el amarillo pierde contraste en claro)
const logoSrc = computed(() =>
  colorMode.value === 'dark'
    ? '/logos/LOGO_MOABA_AMARILLO_TRANSPARENTE.png'
    : '/logos/LOGO_MOABA_NARANJA_TRANSPARENTE.png'
);

// Navigation items con estructura de Nuxt UI (UNavigationMenu) — mega-menú
// para Cine y Cinema Colonial, resto como links simples.
const navigationItems = computed(() => [
  { label: t('Home'), to: localePath('/') },
  {
    label: t('Movies'),
    to: localePath('/movies'),
    children: [
      { label: 'Ficción', type: 'label' as const },
      { label: 'Drama', to: localePath('/movies') },
      { label: 'Comedia', to: localePath('/movies') },
      { label: 'Misterio', to: localePath('/movies') },
      { label: 'Historia', to: localePath('/movies') },
      { label: 'Romance', to: localePath('/movies') },
      { label: 'Musical', to: localePath('/movies') },
      { label: 'Infantil', to: localePath('/movies') },
      { label: 'Guerras', to: localePath('/movies') },
      { label: 'Documental', type: 'label' as const },
      { label: 'Docu drama', to: localePath('/movies') },
      { label: 'Docu ficción', to: localePath('/movies') },
      { label: 'Histórico', to: localePath('/movies') },
      { label: 'Antropológico', to: localePath('/movies') },
      { label: 'Lo Real/Clásico', to: localePath('/movies') },
      { label: 'Doc. Musical', to: localePath('/movies') },
    ],
    ui: { childList: 'grid grid-cols-2 grid-flow-col grid-rows-9 gap-x-6' }
  },
  { label: t('TV Series'), to: localePath('/tv-series') },
  { label: t('TV Show'), to: localePath('/tv-show') },
  {
    label: t('Cinema Colonial'),
    to: localePath('/cinema-colonial'),
    children: [
      { label: 'Cine Etnográfico', to: localePath('/cinema-colonial') },
      { label: 'Cine Antropológico', to: localePath('/cinema-colonial') },
      { label: 'Cine de Explotación', to: localePath('/cinema-colonial') },
      { label: 'Cine de Independencia', to: localePath('/cinema-colonial') },
    ]
  },
  { label: t('Festivales'), to: localePath('/festivales') },
  { label: t('Otros Eventos'), to: localePath('/otros-eventos') },
]);

// Toggle color mode
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

// Auth state
const { currentUser, userSubscription, signOut } = useAuth();

console.log('currentUser', currentUser.value)

// Computed properties for dynamic display
const userDisplayName = computed(() =>
  currentUser.value ? currentUser.value.displayName || currentUser.value.email || 'User' : ''
);

const isSubscribed = computed(() => userSubscription.value?.active === true);

// Computed property for current locale display with fallback
const currentLocale = computed(() => locale.value || 'en');

// Available locales for the language switcher
const availableLocales = computed(() => {
  return locales.value.filter((i: any) => i.code !== locale.value);
});

// Get current locale name
const currentLocaleName = computed(() => {
  const current = locales.value.find((i: any) => i.code === locale.value);
  return current?.name || locale.value.toUpperCase();
});

// Language dropdown items using switchLocalePath
const languageItems = computed(() => [
  locales.value.map((loc: any) => ({
    label: loc.name,
    icon: locale.value === loc.code ? 'i-heroicons-check-circle' : 'i-heroicons-language',
    to: switchLocalePath(loc.code)
  }))
]);
</script>

<template>
  <header class="sticky top-0 w-full z-50 bg-canvas/70 dark:bg-obsidian/70 backdrop-blur-md">
    <nav class="w-full max-w-7xl mx-auto px-2 flex items-center justify-between gap-0">
      <NuxtLink :to="localePath('/')" class="shrink-0 text-2xl font-bold text-brand">
        <img :src="logoSrc" :alt="t('Moaba Cinema TV')" class="h-16 w-auto">
      </NuxtLink>

      <UNavigationMenu
        :items="navigationItems"
        orientation="horizontal"
        content-orientation="vertical"
        color="primary"
        highlight
        class="hidden md:flex shrink-0"
        :ui="{ root: 'gap-0', link: 'px-1', linkLabel: 'uppercase tracking-wide text-xs font-semibold' }"
      />

      <div class="flex items-center gap-1 shrink-0">
        <!-- Buscador, notificaciones (visuales por ahora, issues #40 y #42) y modo de color: agrupados -->
        <div class="flex items-center gap-0.5">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-heroicons-magnifying-glass"
            class="hover:bg-neutral-200 dark:hover:bg-neutral-800"
            :aria-label="t('Search')"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-heroicons-bell"
            class="hover:bg-neutral-200 dark:hover:bg-neutral-800"
            :aria-label="t('Notifications')"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="hover:bg-neutral-200 dark:hover:bg-neutral-800"
            :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
            @click="toggleColorMode"
            :aria-label="t('Toggle color mode')"
          />
        </div>

        <!-- Simple Language Switcher - Debug with buttons -->
        <div class="flex items-center gap-0.5">
          <UButton
            v-for="loc in locales"
            :key="loc.code"
            :to="switchLocalePath(loc.code)"
            color="white"
            :variant="locale === loc.code ? 'solid' : 'ghost'"
            size="sm"
            class="px-0.5 text-black dark:text-white"
          >
            {{ loc.code.toUpperCase() }}
          </UButton>
        </div>

        <UButton
          v-if="!isSubscribed"
          color="primary"
          size="sm"
          :label="t('Subscribe')"
          class="bg-brand text-brand-content hover:bg-brand-focus px-2.5"
          :to="localePath('/subscription/plans')"
        />
        <div v-if="currentUser" class="flex items-center gap-2">
          <span class="text-black dark:text-white">{{ userDisplayName }}</span>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-user-circle"
            :to="localePath('/auth/profile')"
            class="hover:bg-neutral-200 dark:hover:bg-neutral-800"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-right-on-rectangle"
            :label="t('Sign Out')"
            @click="() => { signOut(); }"
          />
        </div>
        <UButton
          v-else
          color="neutral"
          variant="outline"
          size="sm"
          class="px-2.5"
          :label="t('Sign In')"
          :to="localePath('/auth/login')"
        />
      </div>
    </nav>
  </header>
</template>