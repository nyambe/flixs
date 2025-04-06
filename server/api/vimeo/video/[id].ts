// server/api/vimeo/video/[id].ts

interface VimeoVideo {
  uri: string;
  name: string;
  description: string | null;
  duration: number;
  pictures: {
    sizes: { width: number; height: number; link: string }[];
  };
  created_time: string;
  link: string;
  player_embed_url: string;
  privacy: {
    view: string;
    embed: string;
    download: boolean;
    add: boolean;
    comments: string;
  };
  embed: {
    html: string;
    badges: {
      live: { streaming: boolean; archived: boolean };
      staff_pick: { normal: boolean; best_of_the_month: boolean };
      vod: boolean;
      weekend_challenge: boolean;
    };
  };
  status: string;
  id?: string;
  thumbnail?: string;
}

export default defineEventHandler(async (event): Promise<VimeoVideo | null> => {
  const runtimeConfig = useRuntimeConfig();
  const accessToken = runtimeConfig.vimeo.accessToken as string;
  
  if (!accessToken) {
    throw createError({
      statusCode: 500,
      message: 'Vimeo access token is missing in the configuration',
    });
  }
  
  // Get the video ID from the route parameter
  const videoId = event.context.params?.id;
  
  if (!videoId) {
    throw createError({
      statusCode: 400,
      message: 'Video ID is required',
    });
  }
  
  try {
    // Fetch a single video by its ID with all necessary fields
    const endpoint = `https://api.vimeo.com/videos/${videoId}`;
    
    const video = await $fetch<VimeoVideo>(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
      query: {
        fields: 'uri,name,description,duration,pictures,created_time,link,player_embed_url,privacy,embed,status'
      }
    });
    
    // Process the video to include additional useful properties
    const extractedVideoId = video.uri.split('/').pop() || '';
    
    // Find the best thumbnail (prefer medium size)
    const thumbnail = video.pictures.sizes.find(size => size.width === 640)?.link || 
                      video.pictures.sizes[video.pictures.sizes.length - 1]?.link;
    
    // For private videos, we'll use the embed.html which contains the necessary tokens
    if ((video.privacy.view === 'nobody' || video.privacy.embed === 'whitelist') && !video.embed?.html) {
      // If embed.html is missing for a private/whitelisted video, domain may not be whitelisted
      throw createError({
        statusCode: 403,
        message: 'This video cannot be played. Please ensure your domain is in the video\'s whitelist.',
      });
    }
    
    // If the video has embed HTML, extract the player URL
    if (video.embed?.html) {
      const srcMatch = video.embed.html.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        video.player_embed_url = srcMatch[1];
      }
    }
    
    return {
      ...video,
      id: extractedVideoId,
      thumbnail,
    };
  } catch (error) {
    console.error('Vimeo API error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch Vimeo video',
      data: error,
    });
  }
}); 