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
  
    return {
      featuredMovie: getFeaturedMovie(),
      popularMovies: africanFilms.items.slice(0, 8) // Get first 8 movies for the grid
    }
  }