interface EnvironmentConfig {
  resend?: {
    apiKey?: string
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

  // Resend is optional - only needed for newsletter feature
  const hasResend = !!config.resend?.apiKey

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

  // Log warnings for optional services
  if (!hasResend) {
    console.warn('⚠️  RESEND_API_KEY not configured - newsletter features will be disabled')
  }

  console.log('✅ Environment configuration validated successfully')

  return {
    resend: hasResend ? {
      apiKey: config.resend.apiKey
    } : undefined,
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