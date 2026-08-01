// composables/useMovieData.ts
import type { TMDBList, TMDBMovie } from '~/types'

import movies from '~/jsons/movies.json'


export const useMovieData = () => {
    const africanFilms = movies as TMDBList
  
    // Get a random movie for the hero section
    const getFeaturedMovie = (): TMDBMovie => {
      const moviesWithBackdrops = africanFilms.items.filter(movie => movie.backdrop_path)
      const randomIndex = Math.floor(Math.random() * moviesWithBackdrops.length)
      return moviesWithBackdrops[randomIndex]
    }

    const getMovieById = (id: number): TMDBMovie | undefined => {
        return africanFilms.items.find(movie => movie.id === id)
    }

    const getAllMovies = (): TMDBMovie[] => {
        return africanFilms.items
    }

    const getPopularMovies = (): TMDBMovie[] => {
      const shuffled = [...africanFilms.items].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, 8)
    }
    
    // Computed once on the server and reused on the client via the Nuxt
    // payload, so hydration doesn't re-roll Math.random() and mismatch
    // the server-rendered movie/order.
    const featuredMovie = useState<TMDBMovie>('featuredMovie', getFeaturedMovie)
    const popularMovies = useState<TMDBMovie[]>('popularMovies', getPopularMovies)

    return {
        featuredMovie: featuredMovie.value,
        popularMovies: popularMovies.value,
        getMovieById,
        getAllMovies
    }
  }