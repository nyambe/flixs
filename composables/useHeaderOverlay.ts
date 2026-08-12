// Aproximación razonable de la altura del header (logo h-16 = 64px, sin
// padding vertical en <header>/<nav>) — se corrige de inmediato con
// ResizeObserver al montar SiteNavigation.vue, esto solo evita un salto
// visual mientras tanto.
const HEADER_HEIGHT_FALLBACK = 64

export const useHeaderHeight = () =>
  useState<number>('header-height', () => HEADER_HEIGHT_FALLBACK)

// Por defecto true: al cargar o navegar a una página nueva, el scroll
// arranca en 0, así que el hero (si existe) está visible.
export const useHeroVisible = () =>
  useState<boolean>('hero-visible', () => true)

// nuxt-i18n (strategy: 'prefix_except_default') nombra las rutas como
// "index" (locale por defecto, es) o "index___en" / "index___fr" para
// las demás. route.path no sirve porque cambia con el prefijo de idioma.
export const isHomeRouteName = (
  name: string | symbol | null | undefined
): boolean => {
  if (!name) return false
  return String(name).split('___')[0] === 'index'
}
