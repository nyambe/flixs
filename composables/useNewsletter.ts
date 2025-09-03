interface NewsletterSubscription {
  email: string
  source?: string
  privacyConsent: boolean
}

interface NewsletterResponse {
  success: boolean
  message: string
  alreadySubscribed?: boolean
  resent?: boolean
}

interface UnsubscribeResponse {
  success: boolean
  message: string
}

export const useNewsletter = () => {
  const isSubscribing = ref(false)
  const isUnsubscribing = ref(false)

  const subscribe = async (subscriptionData: NewsletterSubscription): Promise<NewsletterResponse> => {
    isSubscribing.value = true
    
    try {
      const response = await $fetch<NewsletterResponse>('/api/newsletter/subscribe', {
        method: 'POST',
        body: subscriptionData,
      })
      
      return response
    } catch (error: any) {
      console.error('Newsletter subscription error:', error)
      
      // Handle different error types
      if (error?.statusCode === 429) {
        throw new Error('Too many requests. Please try again in a few minutes.')
      }
      
      if (error?.statusCode === 400) {
        throw new Error(error?.data?.message || 'Please check your email address and try again.')
      }
      
      throw new Error('Failed to subscribe. Please try again later.')
    } finally {
      isSubscribing.value = false
    }
  }

  const unsubscribe = async (email: string): Promise<UnsubscribeResponse> => {
    isUnsubscribing.value = true
    
    try {
      const response = await $fetch<UnsubscribeResponse>('/api/newsletter/unsubscribe', {
        method: 'POST',
        body: { email },
      })
      
      return response
    } catch (error: any) {
      console.error('Newsletter unsubscribe error:', error)
      
      if (error?.statusCode === 404) {
        throw new Error('Email not found in our newsletter list.')
      }
      
      throw new Error('Failed to unsubscribe. Please try again later.')
    } finally {
      isUnsubscribing.value = false
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return {
    subscribe,
    unsubscribe,
    validateEmail,
    isSubscribing: readonly(isSubscribing),
    isUnsubscribing: readonly(isUnsubscribing),
  }
}