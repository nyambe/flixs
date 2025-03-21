// types.ts
export interface NavigationItem {
    label: string
    path: string
  }
  
export interface Movie {
    id: number
    title: string
    overview: string
    backdrop_path: string
    poster_path: string
    vote_average: number
    release_date: string
}

export interface TMDBMovie {
    id: number
    title: string
    original_title: string
    overview: string
    backdrop_path: string | null
    poster_path: string | null
    vote_average: number
    release_date: string
    popularity: number
    genre_ids: number[]
    media_type: string
    video_id?: string
  }
  
export interface TMDBList {
    created_by: string
    description: string
    id: number
    item_count: number
    items: TMDBMovie[]
    name: string
  }
  
