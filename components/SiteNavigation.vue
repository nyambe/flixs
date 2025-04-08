<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { useI18n } from 'vue-i18n';

// Initialize i18n
const { t, locale, availableLocales } = useI18n();

// Navigation items with i18n
const navigationItems = [
  { label: () => t('Home'), path: '/' },
  { label: () => t('Movies'), path: '/movies' },
  // Uncomment these as needed
  // { label: () => t('TV Shows'), path: '/shows' },
  // { label: () => t('New & Popular'), path: '/new' },
  // { label: () => t('My List'), path: '/my-list' },
];

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

// Language options with display names
const languageOptions = computed(() => {
  return availableLocales.map(code => ({
    value: code,
    label: getLanguageName(code)
  }));
});

// Get full language name from language code
function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    es: 'Español'
  };
  return names[code] || code.toUpperCase();
}

// Change language handler
function changeLanguage(newLocale: string) {
  locale.value = newLocale;
}
</script>

<template>
  <header class="sticky top-0 w-full z-50 bg-black/50 backdrop-blur">
    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="text-2xl font-bold text-brand">
        <img src="/logo.png" alt="Moaba Cinema TV" class="h-12">
      </NuxtLink>

      <div class="hidden md:flex items-center space-x-6">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="text-neutral-300 hover:text-white transition"
        >
          {{ item.label() }}
        </NuxtLink>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Elegant Language Switcher -->
        <UDropdownMenu :items="languageOptions">
          <UButton
            color="neutral"
            variant="ghost"
            class="hover:bg-neutral-800"
            trailing-icon="i-heroicons-language"
          >
            {{ getLanguageName(currentLocale) }}
          </UButton>
          
          <template #item="{ item }">
            <UDropdownMenuItem
              :active="item.value === currentLocale"
              @click="changeLanguage(item.value)"
            >
              {{ item.label }}
            </UDropdownMenuItem>
          </template>
        </UDropdownMenu>
        
        <UButton
          v-if="!isSubscribed"
          color="primary"
          :label="t('Subscribe')"
          class="bg-brand text-brand-content hover:bg-brand-focus"
          to="/subscription/plans"
        />
        <div v-if="currentUser" class="flex items-center space-x-4">
          <span class="text-white">{{ userDisplayName }}</span>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-user-circle"
            to="/auth/profile"
            class="hover:bg-neutral-800"
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
          to="/auth/login"
        />
      </div>
    </nav>
  </header>
</template>