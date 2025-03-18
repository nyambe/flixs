// server/api/vimeo-videos.ts

interface VimeoVideo {
  uri: string;
  name: string;
  description: string | null;
  duration: number;
  pictures: {
    sizes: { width: number; height: number; link: string }[];
  };
  created_time: string;
}

interface VimeoResponse {
  data: VimeoVideo[];
  total: number;
  page: number;
  per_page: number;
}

export default defineEventHandler(async (): Promise<VimeoVideo[]> => {
  const runtimeConfig = useRuntimeConfig();
  const clientId = runtimeConfig.vimeo.clientId as string;
  const accessToken = runtimeConfig.vimeo.accessToken as string;

  if (!clientId || !accessToken) {
    throw createError({
      statusCode: 500,
      message: 'Vimeo credentials are missing in the configuration',
    });
  }

  try {
    const response = await $fetch<VimeoResponse>('https://api.vimeo.com/me/videos', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
    });

    return response.data; // Return the array of videos
  } catch (error) {
    console.error('Vimeo API error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch Vimeo videos',
      data: error,
    });
  }
});