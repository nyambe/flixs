<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const email = ref((route.query.email as string) || '')
const emailError = ref('')
const unsubscribeMessage = ref('')
const showSuccess = ref(false)
const { unsubscribe, validateEmail, isUnsubscribing } = useNewsletter()

const handleUnsubscribe = async () => {
  emailError.value = ''
  unsubscribeMessage.value = ''
  
  if (!email.value) {
    emailError.value = 'Por favor ingresa tu correo electrónico'
    return
  }
  
  if (!validateEmail(email.value)) {
    emailError.value = 'Por favor ingresa un correo electrónico válido'
    return
  }

  try {
    const response = await unsubscribe(email.value)
    unsubscribeMessage.value = response.message
    showSuccess.value = true
  } catch (error: any) {
    emailError.value = error.message
  }
}

useSeoMeta({
  title: 'Cancelar Suscripción - MOABA Cinema TV',
  description: 'Cancela tu suscripción al newsletter de MOABA Cinema TV',
})
</script>

<template>
  <div class="min-h-screen bg-black text-white flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Success State -->
      <div v-if="showSuccess" class="text-center">
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 class="text-2xl font-bold mb-4">Suscripción Cancelada</h1>
        <p class="text-neutral-300 mb-6">{{ unsubscribeMessage }}</p>
        
        <div class="space-y-4">
          <UButton
            size="lg"
            color="primary"
            class="w-full bg-amber-400 hover:bg-amber-500"
            label="Volver al Inicio"
            @click="router.push('/')"
          />
        </div>
        
        <p class="text-sm text-neutral-400 mt-6">
          Si cambias de opinión, siempre puedes volver a suscribirte desde nuestra página principal.
        </p>
      </div>

      <!-- Unsubscribe Form -->
      <div v-else class="text-center">
        <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </div>
        
        <h1 class="text-2xl font-bold mb-4">Cancelar Suscripción</h1>
        <p class="text-neutral-300 mb-8">
          Lamentamos verte partir. Ingresa tu correo electrónico para cancelar tu suscripción al newsletter.
        </p>
        
        <div class="space-y-4">
          <input
            v-model="email"
            type="email"
            placeholder="Tu correo electrónico"
            :class="[
              'w-full py-4 px-6 rounded-md bg-neutral-800 text-white border transition-colors',
              emailError ? 'border-red-500 focus:ring-red-400' : 'border-neutral-700 focus:ring-amber-400',
              'focus:outline-none focus:ring-2'
            ]"
          />
          
          <UButton
            size="lg"
            color="error"
            class="w-full"
            :loading="isUnsubscribing"
            :label="isUnsubscribing ? 'Cancelando...' : 'Cancelar Suscripción'"
            @click="handleUnsubscribe"
          />
          
          <div v-if="emailError" class="text-red-400 text-sm">
            {{ emailError }}
          </div>
        </div>
        
        <div class="mt-8 pt-6 border-t border-neutral-800">
          <p class="text-sm text-neutral-400 mb-4">
            ¿No querías cancelar tu suscripción?
          </p>
          <UButton
            size="sm"
            variant="outline"
            color="neutral"
            label="Volver al Inicio"
            @click="router.push('/')"
          />
        </div>
      </div>
    </div>
  </div>
</template>