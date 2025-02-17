// composables/useMovieData.ts
import type { Movie } from '~/types'

export const useMovieData = () => {
    // This will be replaced with actual TMDB API calls
    const featuredMovie: Movie = {
      id: 1,
      title: "Stranger Things",
      overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
      backdrop_path: "/sRQ4cxqhAP3MG5n1MyvfOiD1t6K.jpg",
      poster_path: "/53yLPoLX8c9nAGLfmnNdF01zrNc.jpg",
      vote_average: 8.6,
      release_date: "2016-07-15"
    }
  
    const popularMovies: Movie[] = [
      {
        id: 2,
        title: "The Crown",
        overview: "The gripping, decades-spanning inside story of Queen Elizabeth II and the Prime Ministers who shaped Britain's post-war destiny.",
        backdrop_path: "/yQYUhTAymvT1UCKdBOtTa962l7R.jpg",
        poster_path: "/AppWbz91CqEAQACoMdYWOtYV32W.jpg",
        vote_average: 8.3,
        release_date: "2016-11-04"
      },
      // Add more mock data...
    ]
  
    return {
      featuredMovie,
      popularMovies
    }
  }