import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const movieId = getRouterParam(event, 'id')
  
  if (!movieId) {
    throw createError({
      statusCode: 400,
      message: 'Movie ID is required'
    })
  }

  try {
    // Determine if this is a TV show or movie based on the data in your JSON
    // For demonstration purposes, we'll check both endpoints
    // In a production app, you might want to store the media_type in your JSON
    
    // Try fetching as a movie first
    const movieResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits`,
      {
        headers: {
          'Authorization': `Bearer ${config.tmdbToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    // If movie response is successful, process it
    if (movieResponse.ok) {
      const movieData = await movieResponse.json()
      
      // Extract directors
      const directors = movieData.credits.crew
        .filter(person => person.job === 'Director')
        .map(person => person.name)
        .join(', ')
      
      // Extract producers
      const producers = movieData.credits.crew
        .filter(person => person.job === 'Producer')
        .map(person => person.name)
        .join(', ')
      
      // Extract top cast (first 5)
      const cast = movieData.credits.cast
        .slice(0, 5)
        .map(person => person.name)
        .join(', ')
      
      return {
        runtime: movieData.runtime,
        director: directors,
        producer: producers,
        cast: cast
      }
    }
    
    // If not found as a movie, try as a TV show
    const tvResponse = await fetch(
      `https://api.themoviedb.org/3/tv/${movieId}?append_to_response=credits`,
      {
        headers: {
          'Authorization': `Bearer ${config.tmdbToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (tvResponse.ok) {
      const tvData = await tvResponse.json()
      
      // For TV shows, usually creators are listed as creators
      const directors = tvData.created_by
        ? tvData.created_by.map(person => person.name).join(', ')
        : tvData.credits.crew
            .filter(person => person.job === 'Director')
            .map(person => person.name)
            .join(', ')
      
      // Extract producers from crew
      const producers = tvData.credits.crew
        .filter(person => person.job === 'Producer' || person.job === 'Executive Producer')
        .map(person => person.name)
        .join(', ')
      
      // Extract top cast (first 5)
      const cast = tvData.credits.cast
        .slice(0, 5)
        .map(person => person.name)
        .join(', ')
      
      // For TV shows, runtime is usually per episode, so we'll use the first episode runtime
      const runtime = tvData.episode_run_time && tvData.episode_run_time.length > 0 
        ? tvData.episode_run_time[0] 
        : null
      
      return {
        runtime: runtime,
        director: directors,
        producer: producers,
        cast: cast
      }
    }
    
    // If neither endpoint worked, throw an error
    throw createError({
      statusCode: 404,
      message: 'Movie not found'
    })
    
  } catch (error) {
    console.error('Error fetching movie details:', error)
    throw createError({
      statusCode: 500,
      message: 'Error fetching movie details'
    })
  }
}) 