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

// Navigation items with i18n
const navigationItems = [
  { label: () => t('Home'), path: '/' },
  { label: () => t('Movies'), path: '/movies' },
  // Uncomment these as needed
  // { label: () => t('TV Shows'), path: '/shows' },
  // { label: () => t('New & Popular'), path: '/new' },
  // { label: () => t('My List'), path: '/my-list' },
];

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
  <header class="sticky top-0 w-full z-50 bg-canvas/70 dark:bg-black/50 backdrop-blur">
    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
      <NuxtLink :to="localePath('/')" class="text-2xl font-bold text-amber-700 dark:text-brand">
        <img :src="logoSrc" :alt="t('Moaba Cinema TV')" class="h-12">
      </NuxtLink>

      <div class="hidden md:flex items-center space-x-6">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.path"
          :to="localePath(item.path)"
          class="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition"
        >
          {{ item.label() }}
        </NuxtLink>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Color Mode Toggle -->
        <UButton
          color="neutral"
          variant="ghost"
          class="hover:bg-neutral-200 dark:hover:bg-neutral-800"
          :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
          @click="toggleColorMode"
          :aria-label="t('Toggle color mode')"
        />

        <!-- Simple Language Switcher - Debug with buttons -->
        <div class="flex items-center gap-2">
          <UButton
            v-for="loc in locales"
            :key="loc.code"
            :to="switchLocalePath(loc.code)"
            color="white"
            :variant="locale === loc.code ? 'solid' : 'ghost'"
            size="sm"
            class="text-black dark:text-white"
          >
            {{ loc.code.toUpperCase() }}
          </UButton>
        </div>
        
        <UButton
          v-if="!isSubscribed"
          color="primary"
          :label="t('Subscribe')"
          class="bg-brand text-brand-content hover:bg-brand-focus"
          :to="localePath('/subscription/plans')"
        />
        <div v-if="currentUser" class="flex items-center space-x-4">
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
          :label="t('Sign In')"
          :to="localePath('/auth/login')"
        />
      </div>
    </nav>
  </header>
</template>