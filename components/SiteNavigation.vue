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
// Se renderizan ambas imágenes y se alternan con las clases `dark:` de
// Tailwind (en vez de un computed sobre colorMode.value) porque el módulo
// de color-mode marca <html> con la clase .dark/.light de forma síncrona
// antes del primer paint; ligar el logo a esa clase evita el parpadeo que
// había al depender de colorMode.value, que solo se resuelve tras la
// hidratación.
const logoLight = '/logos/LOGO_MOABA_NARANJA_TRANSPARENTE.png';
const logoDark = '/logos/LOGO_MOABA_AMARILLO_TRANSPARENTE.png';

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
const tvSeriesMenuBackdrop = imagePath.backdrop(getMovieById(1438361)?.backdrop_path ?? null, 'w780'); // MAMADÍ
const tvShowMenuBackdrop = imagePath.backdrop(getMovieById(444272)?.backdrop_path ?? null, 'w780'); // Feguibox

// Navigation items con estructura de Nuxt UI (UNavigationMenu) — mega-menú
// para Cine y Cinema Colonial, resto como links simples.
const navigationItems = computed(() => [
  { label: t('Home'), to: localePath('/') },
  {
    label: t('Movies'),
    to: localePath('/movies'),
    slot: 'movies',
    backdrop: moviesMenuBackdrop,
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
  {
    label: t('TV Series'),
    to: localePath('/tv-series'),
    slot: 'category',
    backdrop: tvSeriesMenuBackdrop,
    children: [
      { label: 'Aventura', to: localePath('/proximamente') },
      { label: 'Investigación', to: localePath('/proximamente') },
      { label: 'Historia', to: localePath('/proximamente') },
      { label: 'Infantil', to: localePath('/proximamente') },
      { label: 'Comedia', to: localePath('/proximamente') },
      { label: 'Terror', to: localePath('/proximamente') },
      { label: 'Thriller', to: localePath('/proximamente') },
      { label: 'Reportajes', to: localePath('/proximamente') },
    ],
  },
  {
    label: t('TV Show'),
    to: localePath('/tv-show'),
    slot: 'category',
    backdrop: tvShowMenuBackdrop,
    children: [
      { label: 'Reality shows', to: localePath('/proximamente') },
      { label: 'Conciertos', to: localePath('/proximamente') },
      { label: 'Monólogos', to: localePath('/proximamente') },
      { label: 'Magacines', to: localePath('/proximamente') },
      { label: 'Concurso', to: localePath('/proximamente') },
      { label: 'Encuestas', to: localePath('/proximamente') },
      { label: 'Podcast', to: localePath('/proximamente') },
      { label: 'Cuentos/oralidad', to: localePath('/proximamente') },
    ],
  },
  {
    label: t('Cinema Colonial'),
    to: localePath('/cinema-colonial'),
    slot: 'cinema',
    backdrop: cinemaMenuBackdrop,
    children: [
      { label: 'Cine Etnográfico', to: localePath('/proximamente') },
      { label: 'Cine Antropológico', to: localePath('/proximamente') },
      { label: 'Cine de Explotación', to: localePath('/proximamente') },
      { label: 'Cine de Independencia', to: localePath('/proximamente') },
    ],
  },
  {
    label: t('Festivales'),
    to: localePath('/festivales'),
    slot: 'category',
    backdrop: moviesMenuBackdrop,
    children: [
      { label: 'FESPACO', to: localePath('/proximamente') },
      { label: 'FCAT', to: localePath('/proximamente') },
      { label: 'Durban FilmArt', to: localePath('/proximamente') },
      { label: 'Miradas Doc', to: localePath('/proximamente') },
      { label: 'Yaoundé FilmLab', to: localePath('/proximamente') },
      { label: 'Cartago Film', to: localePath('/proximamente') },
      { label: 'MCTV. Cinema', to: localePath('/proximamente') },
    ],
  },
  {
    label: t('Otros Eventos'),
    to: localePath('/otros-eventos'),
    slot: 'category',
    backdrop: cinemaMenuBackdrop,
    children: [
      { label: 'Estrenos', to: localePath('/proximamente') },
      { label: 'Lanzamientos', to: localePath('/proximamente') },
      { label: 'Recaudación de fondo', to: localePath('/proximamente') },
      { label: 'Conferencias/Charlas', to: localePath('/proximamente') },
      { label: 'Intercambio', to: localePath('/proximamente') },
      { label: 'Promoción de Marca', to: localePath('/proximamente') },
      { label: 'Conciertos', to: localePath('/proximamente') },
    ],
  },
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

// Entre 1024 y 1280px la fila no tiene sitio para Subscribe + Sign In (o
// Perfil + Cerrar sesión) como botones de texto sin apretar el resto del
// header — se agrupan en este único dropdown de cuenta (mismo patrón que
// el selector de idioma). A partir de xl (1280px) se muestran expandidos.
const accountMenuItems = computed(() => {
  const items: { label: string; icon: string; to?: string; onSelect?: () => void }[] = [];
  if (!isSubscribed.value) {
    items.push({ label: t('Subscribe'), icon: 'i-heroicons-sparkles', to: localePath('/subscription/plans') });
  }
  if (currentUser.value) {
    items.push({ label: t('Profile'), icon: 'i-heroicons-user-circle', to: localePath('/auth/profile') });
    items.push({ label: t('Sign Out'), icon: 'i-heroicons-arrow-right-on-rectangle', onSelect: () => signOut() });
  } else {
    items.push({ label: t('Sign In'), icon: 'i-heroicons-arrow-right-on-rectangle', to: localePath('/auth/login') });
  }
  return [items];
});

// Menú móvil (#39): hamburguesa como trigger del USlideover (estado interno
// del componente; el cierre usa la función `close` que expone el slot
// #content). Reutiliza navigationItems tal cual (mismos children/backdrop
// que los mega-menús de escritorio) en un acordeón — solo una sección
// abierta a la vez, para que el panel no crezca sin control con 6 grupos.
const expandedMobileItem = ref<string | null>(null);
const toggleMobileSubmenu = (label: string) => {
  expandedMobileItem.value = expandedMobileItem.value === label ? null : label;
};

// Buscador (#40): trigger del modal de búsqueda
const isSearchOpen = ref(false);
</script>

<template>
  <header
    ref="headerRef"
    :class="['fixed w-full z-50 transition-[top,background-color,color] duration-300', headerBgClass, headerTextClass]"
    :style="headerCssVars"
  >
    <nav class="w-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-0">
      <NuxtLink :to="localePath('/')" class="shrink-0 text-2xl font-bold text-brand">
        <img :src="logoLight" :alt="t('Moaba Cinema TV')" class="h-16 w-auto block dark:hidden">
        <img :src="logoDark" :alt="t('Moaba Cinema TV')" class="h-16 w-auto hidden dark:block">
      </NuxtLink>

      <UNavigationMenu
        :items="navigationItems"
        orientation="horizontal"
        content-orientation="vertical"
        color="primary"
        highlight
        class="hidden min-[1150px]:flex shrink-0"
        :ui="{
          root: 'gap-0',
          list: 'gap-1',
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

        <template #category-content="{ item }">
          <div class="relative w-72 overflow-hidden rounded-md">
            <img :src="item.backdrop" alt="" class="absolute inset-0 w-full h-full object-cover">
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
            :class="headerGhostClass"
            :aria-label="t('Search')"
            @click="isSearchOpen = true"
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

        <!-- Entre lg y xl no cabe Subscribe + Sign In (o Perfil + Cerrar
             sesión) como botones de texto sin apretar el resto del header:
             un único dropdown de cuenta cubre ese hueco (ver accountMenuItems). -->
        <UDropdownMenu
          :items="accountMenuItems"
          :ui="{ content: 'ring-1 ring-brand/20 shadow-xl bg-canvas dark:bg-obsidian' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-heroicons-user-circle"
            class="hidden min-[1150px]:inline-flex xl:hidden"
            :class="headerGhostClass"
            :aria-label="t('Account')"
          />
        </UDropdownMenu>

        <UButton
          v-if="!isSubscribed"
          color="primary"
          size="sm"
          :label="t('Subscribe')"
          class="hidden xl:inline-flex bg-brand text-brand-content hover:bg-brand-focus px-2.5"
          :to="localePath('/subscription/plans')"
        />
        <div v-if="currentUser" class="hidden xl:flex items-center gap-2">
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
          class="hidden xl:inline-flex px-2.5"
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
            class="min-[1150px]:hidden"
            :class="headerGhostClass"
            :aria-label="t('Open menu')"
          />
          <template #content="{ close }">
        <div class="h-full bg-canvas dark:bg-obsidian text-black dark:text-white flex flex-col">
          <div class="flex items-center justify-between p-6 pb-0 mb-6 shrink-0">
            <img :src="logoLight" :alt="t('Moaba Cinema TV')" class="h-10 w-auto block dark:hidden">
            <img :src="logoDark" :alt="t('Moaba Cinema TV')" class="h-10 w-auto hidden dark:block">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              :aria-label="t('Close menu')"
              @click="close()"
            />
          </div>

          <nav class="flex-1 min-h-0 overflow-y-auto px-6 pb-4 flex flex-col gap-1">
            <div v-for="item in navigationItems" :key="item.label">
              <div class="flex items-center rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800">
                <NuxtLink
                  :to="item.to"
                  class="flex-1 py-3 px-2 text-lg font-medium active:scale-[0.98] transition-transform motion-reduce:transition-none"
                  @click="close()"
                >
                  {{ item.label }}
                </NuxtLink>
                <button
                  v-if="item.children"
                  type="button"
                  class="p-3 active:scale-90 transition-transform motion-reduce:transition-none"
                  :aria-label="expandedMobileItem === item.label ? t('Collapse') : t('Expand')"
                  :aria-expanded="expandedMobileItem === item.label"
                  @click="toggleMobileSubmenu(item.label)"
                >
                  <UIcon
                    name="i-heroicons-chevron-down"
                    class="size-5 transition-transform duration-200 ease-out motion-reduce:transition-none"
                    :class="{ 'rotate-180': expandedMobileItem === item.label }"
                  />
                </button>
              </div>

              <div
                v-if="item.children"
                class="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
                :style="{ gridTemplateRows: expandedMobileItem === item.label ? '1fr' : '0fr' }"
              >
                <div class="overflow-hidden">
                  <div class="relative mt-1 mb-2 rounded-md overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                    <div
                      class="bg-canvas dark:bg-obsidian py-2"
                      :class="item.slot === 'movies' ? 'grid grid-cols-2 gap-x-2 px-2' : 'px-1'"
                    >
                      <template v-for="child in item.children" :key="child.label">
                        <p
                          v-if="child.type === 'label'"
                          :class="['text-xs font-semibold uppercase tracking-wide text-brand pt-3 pb-1 first:pt-2', item.slot === 'movies' ? 'col-span-full px-2' : 'px-3']"
                        >
                          {{ child.label }}
                        </p>
                        <NuxtLink
                          v-else
                          :to="child.to"
                          class="block py-2.5 px-3 text-base leading-tight rounded-md hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-[background-color,transform] motion-reduce:transition-none"
                          @click="close()"
                        >
                          {{ child.label }}
                        </NuxtLink>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div class="shrink-0 p-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
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
  <SiteSearchModal v-model:open="isSearchOpen" />
</template>