// composables/useImagePath.ts
export const useImagePath = () => {
    const baseUrl = 'https://image.tmdb.org/t/p'
    
    // Default fallback images - you can replace these URLs with your actual fallback images
    const fallbacks = {
      backdrop: 'https://placehold.co/1920x1080/232323/969696.png?text=No+Backdrop+Available',
      poster: 'https://placehold.co/500x750/232323/969696.png?text=No+Poster+Available'
    }
    
    return {
      backdrop: (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'original') => 
        path ? `${baseUrl}/${size}${path}` : fallbacks.backdrop,
      poster: (path: string | null, size: 'w154' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') => 
        path ? `${baseUrl}/${size}${path}` : fallbacks.poster
    }
  }