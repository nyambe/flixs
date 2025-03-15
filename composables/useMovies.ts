// composables/useMovies.ts
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  vimeoId: string;
  genres: string[];
  releaseYear: number;
  duration: number;
}

export const useMovies = () => {
  const { $firebase } = useNuxtApp()
  const config = useRuntimeConfig()
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Get all movies
  const getMovies = async (): Promise<Movie[]> => {
    loading.value = true
    error.value = null
    
    try {
      const moviesCollection = collection($firebase.firestore, 'movies')
      const snapshot = await getDocs(moviesCollection)
      
      const movies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Movie[]
      
      return movies
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Get a single movie by ID
  const getMovie = async (id: string): Promise<Movie | null> => {
    loading.value = true
    error.value = null
    
    try {
      const movieDoc = await getDoc(doc($firebase.firestore, 'movies', id))
      
      if (movieDoc.exists()) {
        return {
          id: movieDoc.id,
          ...movieDoc.data()
        } as Movie
      }
      
      return null
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    error,
    getMovies,
    getMovie
  }
}