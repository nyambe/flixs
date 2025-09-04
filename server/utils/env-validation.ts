interface EnvironmentConfig {
  resend: {
    apiKey: string
  }
  public: {
    baseUrl: string
  }
  firebase: {
    projectId: string
    clientEmail: string
    privateKey: string
  }
}

export function validateEnvironmentConfig(): EnvironmentConfig {
  const config = useRuntimeConfig()
  const errors: string[] = []

  // Validate Resend configuration
  if (!config.resend?.apiKey) {
    errors.push('RESEND_API_KEY is required')
  }

  // Validate Base URL
  if (!config.public?.baseUrl) {
    errors.push('BASE_URL is required')
  }

  // Validate Firebase configuration
  if (!config.firebase?.projectId) {
    errors.push('FIREBASE_PROJECT_ID is required')
  }

  if (!config.firebase?.clientEmail) {
    errors.push('FIREBASE_CLIENT_EMAIL is required')
  }

  if (!config.firebase?.privateKey) {
    errors.push('FIREBASE_PRIVATE_KEY is required')
  }

  // Log validation results
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:')
    errors.forEach(error => console.error(`  - ${error}`))
    throw createError({
      statusCode: 500,
      statusMessage: `Environment configuration error: ${errors.join(', ')}`
    })
  }

  console.log('✅ Environment configuration validated successfully')
  
  return {
    resend: {
      apiKey: config.resend.apiKey
    },
    public: {
      baseUrl: config.public.baseUrl
    },
    firebase: {
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey
    }
  }
}