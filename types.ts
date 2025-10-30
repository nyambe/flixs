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
    trailer_id?: string
    runtime?: number
    director?: string
    producer?: string
    cast?: string
  }
  
export interface TMDBList {
    created_by: string
    description: string
    id: number
    item_count: number
    items: TMDBMovie[]
    name: string
  }

// Press Link Types
export interface PressLinkView {
  timestamp: number
  ipAddress: string
  userAgent: string
  duration?: number
}

export interface PressLink {
  id: string
  token: string
  videoId: string
  movieId: number
  movieTitle: string

  // Sender info
  createdBy: string
  createdAt: number

  // Recipient info
  recipientEmail: string
  recipientName: string
  organization?: string

  // Access control
  expiresAt: number
  password?: string
  active: boolean

  // Analytics
  viewCount: number
  firstViewedAt?: number
  lastViewedAt?: number
  views: PressLinkView[]

  // Notes
  notes?: string
}

export interface CreatePressLinkInput {
  videoId: string
  movieId: number
  movieTitle: string
  recipientEmail: string
  recipientName: string
  organization?: string
  expiresAt: number
  password?: string
  notes?: string
}

export interface UpdatePressLinkInput {
  recipientEmail?: string
  recipientName?: string
  organization?: string
  expiresAt?: number
  password?: string
  active?: boolean
  notes?: string
}

export interface PressLinkValidation {
  valid: boolean
  expired?: boolean
  requiresPassword?: boolean
  movieTitle?: string
  movieId?: number
  videoId?: string
  message?: string
}

