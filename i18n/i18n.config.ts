export default defineI18nConfig(() => ({
    legacy: false,
    locale: 'en',
    locales: [
        {
          code: 'en',
          name: 'English'
        },
        {
          code: 'es',
          name: 'Español'
        },
        {
          code: 'fr',
          name: 'Français'
        }
      ],
    messages: {
      en: {
        welcome: 'Welcome',
        Home: 'Home',
        Movies: 'Movies',
        'TV Shows': 'TV Shows',
        'New & Popular': 'New & Popular',
        'My List': 'My List',
        Subscribe: 'Subscribe',
        'Sign In': 'Sign In',
        'Sign Out': 'Sign Out'
      },
      fr: {
        welcome: 'Bienvenue',
        Home: 'Accueil',
        Movies: 'Films',
        'TV Shows': 'Séries TV',
        'New & Popular': 'Nouveautés & Populaires',
        'My List': 'Ma Liste',
        Subscribe: 'S\'abonner',
        'Sign In': 'Se connecter',
        'Sign Out': 'Se déconnecter'
      },
      es: {
        welcome: 'Bienvenido',
        Home: 'Inicio',
        Movies: 'Películas',
        'TV Shows': 'Series',
        'New & Popular': 'Nuevos & Populares',
        'My List': 'Mi Lista',
        Subscribe: 'Suscribirse',
        'Sign In': 'Iniciar Sesión',
        'Sign Out': 'Cerrar Sesión'
      }
    }
  }))
  