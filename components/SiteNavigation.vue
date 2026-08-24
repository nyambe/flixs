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

// Overlay transparente sobre el hero del home (ver docs/superpowers/specs/2026-08-12-home-hero-100vh-header-transparente-design.md)
const route = useRoute();
const headerRef = ref<HTMLElement | null>(null);
const headerHeight = useHeaderHeight();
const heroVisible = useHeroVisible();

const isHomePage = computed(() => isHomeRouteName(route.name));
const headerMode = computed<'transparent' | 'solid'>(() =>
  isHomePage.value && heroVisible.value ? 'transparent' : 'solid'
);

const headerBgClass = computed(() =>
  headerMode.value === 'transparent'
    ? 'bg-transparent'
    : 'bg-canvas/70 dark:bg-obsidian/70 backdrop-blur-md'
);
// Texto/labels que hoy hardcodean "text-black dark:text-white": en modo
// transparente el header flota sobre una foto oscura, así que se fuerza
// blanco sin importar el theme claro/oscuro.
const headerTextClass = computed(() =>
  headerMode.value === 'transparent' ? 'text-white' : 'text-black dark:text-white'
);
// Botones ghost (color="neutral"): su clase por defecto es "text-default"
// (token de Nuxt UI, no hereda color del ancestro), hay que sobreescribirla.
const headerGhostClass = computed(() =>
  headerMode.value === 'transparent'
    ? 'text-white hover:bg-white/20'
    : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
);
// Botones outline (color="neutral"): su clase por defecto incluye
// "bg-default" (opaco) y "ring-accented" — en transparente se vuelven
// una caja sólida flotando si no se sobreescribe el fondo también.
const headerOutlineClass = computed(() =>
  headerMode.value === 'transparent'
    ? 'text-white bg-transparent ring-white/60 hover:bg-white/10'
    : ''
);
// Enlaces del menú sin marcar (no la página actual): Nuxt UI les pone
// "text-muted", que apunta al token --ui-text-muted — no hereda color del
// header como el resto de elementos, así que en modo transparente quedan
// oscuros sobre la foto del hero. Se sobreescribe la variable CSS solo
// mientras el header está transparente; el color del enlace activo
// (--ui-primary, el acento que ya combina con el logo) no se toca.
// La barra de oferta (SiteNotification) es fixed top-0 por encima del
// header — el header se desplaza hacia abajo su altura exacta mientras
// esté visible, para no quedar tapado ni solapado.
const notificationHeight = useNotificationHeight();
const headerCssVars = computed(() => ({
  top: `${notificationHeight.value}px`,
  ...(headerMode.value === 'transparent'
    ? { '--ui-text-muted': '#ffffff', '--ui-text-dimmed': 'rgba(255,255,255,0.7)' }
    : {}),
}));

// Logo según modo de color, siempre — independiente de si el header está
// transparente sobre el hero: amarillo en modo oscuro, naranja/terracota en
// modo claro (nunca cambia por estar sobre el hero, aunque el texto sí).
const logoSrc = computed(() =>
  colorMode.value === 'dark'
    ? '/logos/LOGO_MOABA_AMARILLO_TRANSPARENTE.png'
    : '/logos/LOGO_MOABA_NARANJA_TRANSPARENTE.png'
);

let headerResizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!headerRef.value) return;
  headerResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    // contentRect excluye padding/border — usamos el alto visual completo
    // (hoy da igual, el header no tiene padding vertical, pero así es correcto
    // si algún día se le agrega).
    if (entry) headerHeight.value = entry.target.getBoundingClientRect().height;
  });
  headerResizeObserver.observe(headerRef.value);
});

onUnmounted(() => {
  headerResizeObserver?.disconnect();
});

// Una sola foto de fondo por panel del mega-menú (no una por enlace) — con
// degradado oscuro encima, mismo tratamiento que el hero y los carteles de
// Conócenos. Nuxt UI no soporta este layout con su lista automática de
// `children`, así que el contenido de estos dos dropdowns se renderiza a
// mano vía los slots #movies-content y #cinema-content (ver template).
const imagePath = useImagePath();
const { getMovieById } = useMovieData();
const moviesMenuBackdrop = imagePath.backdrop(getMovieById(284952)?.backdrop_path ?? null, 'w780'); // Ureka
const cinemaMenuBackdrop = imagePath.backdrop(getMovieById(1438351)?.backdrop_path ?? null, 'w780'); // Orígenes

// Navigation items con estructura de Nuxt UI (UNavigationMenu) — mega-menú
// para Cine y Cinema Colonial, resto como links simples.
const navigationItems = computed(() => [
  { label: t('Home'), to: localePath('/') },
  {
    label: t('Movies'),
    to: localePath('/movies'),
    slot: 'movies',
    children: [
      { label: 'Ficción', type: 'label' as const },
      { label: 'Drama', to: localePath('/proximamente') },
      { label: 'Comedia', to: localePath('/proximamente') },
      { label: 'Misterio', to: localePath('/proximamente') },
      { label: 'Historia', to: localePath('/proximamente') },
      { label: 'Romance', to: localePath('/proximamente') },
      { label: 'Musical', to: localePath('/proximamente') },
      { label: 'Infantil', to: localePath('/proximamente') },
      { label: 'Guerras', to: localePath('/proximamente') },
      { label: 'Documental', type: 'label' as const },
      { label: 'Docu drama', to: localePath('/proximamente') },
      { label: 'Docu ficción', to: localePath('/proximamente') },
      { label: 'Histórico', to: localePath('/proximamente') },
      { label: 'Antropológico', to: localePath('/proximamente') },
      { label: 'Lo Real/Clásico', to: localePath('/proximamente') },
      { label: 'Doc. Musical', to: localePath('/proximamente') },
    ],
  },
  { label: t('TV Series'), to: localePath('/tv-series') },
  { label: t('TV Show'), to: localePath('/tv-show') },
  {
    label: t('Cinema Colonial'),
    to: localePath('/cinema-colonial'),
    slot: 'cinema',
    children: [
      { label: 'Cine Etnográfico', to: localePath('/proximamente') },
      { label: 'Cine Antropológico', to: localePath('/proximamente') },
      { label: 'Cine de Explotación', to: localePath('/proximamente') },
      { label: 'Cine de Independencia', to: localePath('/proximamente') },
    ],
  },
  { label: t('Festivales'), to: localePath('/festivales') },
  { label: t('Otros Eventos'), to: localePath('/otros-eventos') },
  { label: t('Paquetes'), to: localePath('/paquetes') },
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

// Menú móvil (#39, versión mínima para poder publicar el rebrand): hamburguesa
// como trigger del USlideover (estado interno del componente; el cierre usa la
// función `close` que expone el slot #content). El refinado queda para #39.
// Enlaces de primer nivel para el panel móvil (sin children)
const mobileNavigationItems = computed(() =>
  navigationItems.value.map(({ label, to }) => ({ label, to }))
);
</script>

<template>
  <header
    ref="headerRef"
    :class="['fixed w-full z-50 transition-[top,background-color,color] duration-300', headerBgClass, headerTextClass]"
    :style="headerCssVars"
  >
    <nav class="w-full max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-0">
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
        :ui="{
          root: 'gap-0',
          link: 'px-1',
          linkLabel: 'uppercase tracking-wide text-xs font-semibold',
          viewport: 'ring-brand/20 shadow-xl',
          content: 'w-auto',
        }"
      >
        <template #movies-content="{ item }">
          <div class="relative w-[36rem] overflow-hidden rounded-md">
            <img :src="moviesMenuBackdrop" alt="" class="absolute inset-0 w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-canvas/75 dark:from-obsidian/80 via-canvas/60 dark:via-obsidian/60 to-canvas/40 dark:to-obsidian/40" />
            <div class="relative p-3 grid grid-cols-2 gap-x-6">
              <template v-for="child in item.children" :key="child.label">
                <p
                  v-if="child.type === 'label'"
                  class="col-span-full text-xs font-semibold uppercase tracking-wide text-brand mt-2 pt-2 mb-0.5 border-t border-current/10 first:mt-0 first:pt-0 first:border-t-0"
                >
                  {{ child.label }}
                </p>
                <NuxtLink
                  v-else
                  :to="child.to"
                  class="py-1 px-2 leading-tight rounded-md text-sm text-black/80 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
                >
                  {{ child.label }}
                </NuxtLink>
              </template>
            </div>
          </div>
        </template>

        <template #cinema-content="{ item }">
          <div class="relative w-72 overflow-hidden rounded-md">
            <img :src="cinemaMenuBackdrop" alt="" class="absolute inset-0 w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-canvas/75 dark:from-obsidian/80 via-canvas/60 dark:via-obsidian/60 to-canvas/40 dark:to-obsidian/40" />
            <div class="relative p-3 space-y-0.5">
              <NuxtLink
                v-for="child in item.children"
                :key="child.label"
                :to="child.to"
                class="block py-1 px-2 leading-tight rounded-md text-sm text-black/80 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                {{ child.label }}
              </NuxtLink>
            </div>
          </div>
        </template>
      </UNavigationMenu>

      <div class="flex items-center gap-1 shrink-0">
        <!-- Buscador, notificaciones (visuales por ahora, issues #40 y #42) y modo de color: agrupados -->
        <div class="flex items-center gap-0.5">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-heroicons-magnifying-glass"
            class="hidden sm:inline-flex"
            :class="headerGhostClass"
            :aria-label="t('Search')"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-heroicons-bell"
            class="hidden sm:inline-flex"
            :class="headerGhostClass"
            :aria-label="t('Notifications')"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            :class="headerGhostClass"
            :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
            @click="toggleColorMode"
            :aria-label="t('Toggle color mode')"
          />
        </div>

        <!-- Selector de idioma: agrupado en un único dropdown -->
        <UDropdownMenu
          :items="languageItems"
          :ui="{ content: 'ring-1 ring-brand/20 shadow-xl bg-canvas dark:bg-obsidian' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-heroicons-language"
            :class="headerGhostClass"
            :aria-label="t('Change language')"
          />
        </UDropdownMenu>

        <UButton
          v-if="!isSubscribed"
          color="primary"
          size="sm"
          :label="t('Subscribe')"
          class="hidden md:inline-flex bg-brand text-brand-content hover:bg-brand-focus px-2.5"
          :to="localePath('/subscription/plans')"
        />
        <div v-if="currentUser" class="hidden md:flex items-center gap-2">
          <span :class="headerTextClass">{{ userDisplayName }}</span>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-user-circle"
            :to="localePath('/auth/profile')"
            :class="headerGhostClass"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-right-on-rectangle"
            :label="t('Sign Out')"
            :class="headerOutlineClass"
            @click="() => { signOut(); }"
          />
        </div>
        <UButton
          v-else
          color="neutral"
          variant="outline"
          size="sm"
          class="hidden md:inline-flex px-2.5"
          :class="headerOutlineClass"
          :label="t('Sign In')"
          :to="localePath('/auth/login')"
        />

        <!-- Menú móvil (#39): el botón es el trigger del slideover (si se separa,
             el clic de apertura burbujea al document y la capa de click-fuera
             lo cierra en el acto) -->
        <USlideover side="right">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-heroicons-bars-3"
            class="md:hidden"
            :class="headerGhostClass"
            :aria-label="t('Open menu')"
          />
          <template #content="{ close }">
        <div class="h-full overflow-y-auto bg-canvas dark:bg-obsidian text-black dark:text-white p-6 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <img :src="logoSrc" :alt="t('Moaba Cinema TV')" class="h-10 w-auto">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              :aria-label="t('Close menu')"
              @click="close()"
            />
          </div>

          <nav class="flex flex-col gap-1">
            <NuxtLink
              v-for="item in mobileNavigationItems"
              :key="item.to"
              :to="item.to"
              class="py-3 px-2 text-lg font-medium rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800"
              @click="close()"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="mt-auto pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            <UButton
              v-if="!isSubscribed"
              color="primary"
              size="lg"
              block
              :label="t('Subscribe')"
              class="bg-brand text-brand-content hover:bg-brand-focus"
              :to="localePath('/subscription/plans')"
            />
            <template v-if="currentUser">
              <UButton
                color="neutral"
                variant="outline"
                size="lg"
                block
                icon="i-heroicons-user-circle"
                :label="userDisplayName"
                :to="localePath('/auth/profile')"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="lg"
                block
                icon="i-heroicons-arrow-right-on-rectangle"
                :label="t('Sign Out')"
                @click="() => { signOut(); close(); }"
              />
            </template>
            <UButton
              v-else
              color="neutral"
              variant="outline"
              size="lg"
              block
              :label="t('Sign In')"
              :to="localePath('/auth/login')"
            />
          </div>
        </div>
        </template>
        </USlideover>
      </div>
    </nav>
  </header>
</template>