<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const token = route.query.token as string
const isLoading = ref(true)
const confirmationResult = ref<{
  success: boolean
  message: string
  email?: string
} | null>(null)

onMounted(async () => {
  if (!token) {
    confirmationResult.value = {
      success: false,
      message: 'Invalid confirmation link. Please check your email for the correct link.'
    }
    isLoading.value = false
    return
  }

  try {
    const { data } = await $fetch('/api/newsletter/confirm', {
      method: 'POST',
      body: { token }
    })
    
    confirmationResult.value = data as {
      success: boolean
      message: string
      email?: string
    }
  } catch (error: any) {
    confirmationResult.value = {
      success: false,
      message: error?.data?.message || 'Failed to confirm subscription. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
})

useSeoMeta({
  title: 'Confirmar Suscripción - MOABA Cinema TV',
  description: 'Confirma tu suscripción al newsletter de MOABA Cinema TV',
})
</script>

<template>
  <div class="min-h-screen bg-black text-white flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mb-4"></div>
        <p class="text-neutral-300">Confirmando tu suscripción...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="confirmationResult?.success" class="text-center">
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 class="text-2xl font-bold mb-4">¡Suscripción Confirmada!</h1>
        <p class="text-neutral-300 mb-6">{{ confirmationResult.message }}</p>
        
        <div class="space-y-4">
          <UButton
            size="lg"
            color="primary"
            class="w-full bg-amber-400 hover:bg-amber-500"
            label="Explorar MOABA"
            @click="router.push('/')"
          />
          
          <UButton
            size="lg"
            variant="outline"
            color="neutral"
            class="w-full"
            label="Ver Mi Perfil"
            @click="router.push('/auth/profile')"
          />
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center">
        <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h1 class="text-2xl font-bold mb-4">Error de Confirmación</h1>
        <p class="text-neutral-300 mb-6">{{ confirmationResult?.message }}</p>
        
        <div class="space-y-4">
          <UButton
            size="lg"
            color="primary"
            class="w-full bg-amber-400 hover:bg-amber-500"
            label="Volver al Inicio"
            @click="router.push('/')"
          />
          
          <UButton
            size="lg"
            variant="outline"
            color="neutral"
            class="w-full"
            label="Contactar Soporte"
            @click="router.push('/contact')"
          />
        </div>
      </div>
    </div>
  </div>
</template>