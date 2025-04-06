// server/api/vimeo/admin/video/[id]/update.post.ts

interface UpdateVideoRequest {
  name?: string;
  description?: string;
  privacy?: {
    view: string;
    embed?: string;
    download?: boolean;
    add?: boolean;
    comments?: string;
    password?: string;
  };
  domains?: string[]; // Add domains for whitelist
}

export default defineEventHandler(async (event) => {
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
    // Get update data from request body
    const body = await readBody<UpdateVideoRequest>(event);
    
    // Prepare request data - only include fields that are provided
    const updateData: Record<string, unknown> = {};
    
    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    
    if (body.privacy) {
      // Check if trying to set password protection without a password
      if (body.privacy.view === 'password' && !body.privacy.password) {
        throw createError({
          statusCode: 400,
          message: 'Password is required when setting privacy to password-protected',
        });
      }
      
      updateData.privacy = body.privacy;
    }
    
    // Only make the API call if there's data to update
    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No update data provided',
      });
    }
    
    // First, update the basic video data
    const endpoint = `https://api.vimeo.com/videos/${videoId}`;
    
    await $fetch(endpoint, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
      body: updateData,
    });
    
    // Then, if domains are provided and privacy.embed is whitelist, update the domain whitelist
    if (body.domains && body.domains.length > 0 && body.privacy?.embed === 'whitelist') {
      // Second API call to update the domain whitelist
      const domainsEndpoint = `https://api.vimeo.com/videos/${videoId}/privacy/domains`;
      
      try {
        // Vimeo expects an array of domains in a specific format
        await $fetch(domainsEndpoint, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.vimeo.*+json;version=3.4',
          },
          body: { domains: body.domains },
        });
        console.log('Domains updated successfully:', body.domains);
      } catch (domainError) {
        console.error('Failed to update domains:', domainError);
        // Continue despite domain error - video was already updated
        return { 
          success: true, 
          message: 'Video updated but domain whitelist failed',
          domainsError: true
        };
      }
    }
    
    return { success: true, message: 'Video updated successfully' };
  } catch (error: unknown) {
    console.error('Vimeo API update error:', error);
    
    // Handle Vimeo API specific errors
    if (error && typeof error === 'object' && 'response' in error) {
      const errorResponse = error as { response: { status: number; data?: { error?: string } } };
      const statusCode = errorResponse.response.status;
      const errorMessage = errorResponse.response.data?.error || 'Failed to update video';
      
      throw createError({
        statusCode,
        message: errorMessage,
      });
    }
    
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to update video',
      data: error,
    });
  }
}); 