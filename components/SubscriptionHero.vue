<script setup lang="ts">
const emit = defineEmits(['subscribe', 'skip'])
defineProps({
  movie: {
    type: Object,
    required: true
  }
})
const { t } = useI18n()
const email = ref('')
const privacyConsent = ref(false)
const emailError = ref('')
const subscriptionMessage = ref('')
const showSuccess = ref(false)
const imagePath = useImagePath()
const { subscribe, validateEmail, isSubscribing } = useNewsletter()

const handleSubscribe = async () => {
  emailError.value = ''
  subscriptionMessage.value = ''
  
  if (!email.value) {
    emailError.value = t('Por favor ingresa tu correo electrónico')
    return
  }
  
  if (!validateEmail(email.value)) {
    emailError.value = t('Por favor ingresa un correo electrónico válido')
    return
  }
  
  if (!privacyConsent.value) {
    emailError.value = t('Debes aceptar la política de privacidad para continuar')
    return
  }

  try {
    const response = await subscribe({
      email: email.value,
      source: 'subscription_hero',
      privacyConsent: privacyConsent.value
    })
    
    subscriptionMessage.value = response.message
    showSuccess.value = true
    
    if (response.success && !response.alreadySubscribed) {
      setTimeout(() => {
        emit('subscribe', email.value)
      }, 2000)
    }
  } catch (error: any) {
    emailError.value = error.message
  }
}

const handleSkip = () => {
  emit('skip')
}
</script>

<template>
  <section class="relative min-h-[80vh] overflow-hidden">
    <!-- Background with overlay -->
    <div class="absolute inset-0">
      <div class="w-full aspect-[16/9]">
        <img 
          :src="imagePath.backdrop(movie.backdrop_path)"
          :alt="movie.title"
          class="w-full h-full object-cover"
        >
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
    </div>

    <!-- Content -->
    <div class="flex flex-col items-center justify-center container mx-auto px-4 relative py-16 h-full text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        {{ t('Descubre la esencia del cine africano') }}
      </h1>
      
      <p class="text-xl text-neutral-200 mb-12 max-w-3xl">
        {{ t('Sumérgete en nuestra colección premium de películas y series africanas: obras maestras galardonadas, historias culturales auténticas, producciones independientes y documentales cautivadores.') }}
      </p>

      <!-- Success Message -->
      <div v-if="showSuccess" class="w-full max-w-xl mb-8 p-6 bg-green-900/20 border border-green-500/20 rounded-lg">
        <div class="flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-xl font-semibold text-green-400">{{ t('¡Perfecto!') }}</h3>
        </div>
        <p class="text-green-200">{{ subscriptionMessage }}</p>
        <p class="text-sm text-neutral-300 mt-2">{{ t('Redirigiendo...') }}</p>
      </div>

      <!-- Subscription Form -->
      <div v-else class="w-full max-w-xl mb-8">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <input
              v-model="email"
              type="email"
              :placeholder="t('Tu correo electrónico')"
              :class="[
                'flex-1 py-4 px-6 rounded-md bg-neutral-800 text-white border transition-colors',
                emailError ? 'border-red-500 focus:ring-red-400' : 'border-neutral-700 focus:ring-amber-400',
                'focus:outline-none focus:ring-2'
              ]"
            />
            <button
              @click="handleSubscribe"
              :disabled="isSubscribing"
              :class="[
                'py-4 px-8 font-bold rounded-md transition-colors',
                isSubscribing 
                  ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed' 
                  : 'bg-amber-400 hover:bg-amber-500 text-black'
              ]"
            >
              <span v-if="isSubscribing" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ t('Enviando...') }}
              </span>
              <span v-else>{{ t('Avísame') }}</span>
            </button>
          </div>

          <!-- Privacy Consent -->
          <div class="flex items-start gap-3 text-left">
            <input
              id="privacy-consent"
              v-model="privacyConsent"
              type="checkbox"
              class="mt-1 h-4 w-4 text-amber-400 bg-neutral-800 border-neutral-600 rounded focus:ring-amber-400 focus:ring-2"
            />
            <label for="privacy-consent" class="text-sm text-neutral-300 leading-relaxed">
              {{ t('Acepto recibir correos electrónicos de MOABA Cinema TV y he leído la') }}
              <NuxtLink to="/privacy" class="text-amber-400 hover:text-amber-300 underline">
                {{ t('política de privacidad') }}
              </NuxtLink>.
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="emailError" class="text-red-400 text-sm text-center">
            {{ emailError }}
          </div>
        </div>

        <!-- Skip Option -->
        <div class="mt-6">
          <button
            @click="handleSkip"
            class="text-neutral-400 hover:text-neutral-200 underline text-sm transition-colors"
          >
            {{ t('Saltar y continuar sin newsletter') }}
          </button>
        </div>
      </div>
      
      <p v-if="!showSuccess" class="text-neutral-400 text-center">
        {{ t('Accede a títulos africanos exclusivos. Sin compromisos, cancela cuando quieras.') }}
      </p>
    </div>
  </section>
</template> 