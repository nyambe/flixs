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
  status: string;
  id?: string;
  thumbnail?: string;
}

interface VimeoResponse {
  data: VimeoVideo[];
  total: number;
  page: number;
  per_page: number;
}

export default defineEventHandler(async (): Promise<VimeoVideo[]> => {
  const runtimeConfig = useRuntimeConfig();
  const accessToken = runtimeConfig.vimeo.accessToken as string;
  const userId = runtimeConfig.vimeo.userId as string;

  if (!accessToken) {
    throw createError({
      statusCode: 500,
      message: 'Vimeo access token is missing in the configuration',
    });
  }

  if (!userId) {
    throw createError({
      statusCode: 500,
      message: 'Vimeo user ID is missing in the configuration',
    });
  }

  try {
    // Use the user ID to fetch videos from a specific account
    const endpoint = `https://api.vimeo.com/users/${userId}/videos`;
    
    const response = await $fetch<VimeoResponse>(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
      params: {
        per_page: 100, // Get more videos for admin view
        sort: 'date',
        fields: 'uri,name,description,duration,pictures,created_time,link,player_embed_url,privacy,status' // Include privacy and status
      },
    });

    // Process the videos to include additional useful properties
    return response.data.map(video => {
      // Extract the video ID from the URI
      const videoId = video.uri.split('/').pop() || '';
      
      // Find the best thumbnail (prefer medium size)
      const thumbnail = video.pictures.sizes.find(size => size.width === 640)?.link || 
                        video.pictures.sizes[video.pictures.sizes.length - 1]?.link;
      
      return {
        ...video,
        id: videoId,
        thumbnail,
      };
    });
  } catch (error) {
    console.error('Vimeo API error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch Vimeo videos',
      data: error,
    });
  }
}); 