import { useAuth } from "~/composables/useAuth"

// middleware/subscription.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
    if (import.meta.server) return // Skip on server side
    
    const { currentUser, userSubscription } = useAuth()
    console.log('subscription middleware', to, from, 'currentUser', currentUser.value, 'userSubscription', userSubscription.value)
    
    // If no user, redirect to login
    if (!currentUser.value) {
      return navigateTo('/auth/login')
    }
    
    // If user but no active subscription, redirect to plans
    if (!userSubscription.value?.active) {
      return navigateTo('/subscription/plans')
    }
  })