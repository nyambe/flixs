<!-- pages/contact.vue -->
<script setup lang="ts">
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const message = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  
  // Form validation
  if (!firstName.value || !lastName.value || !email.value || !message.value) {
    error.value = 'Por favor, complete todos los campos.'
    loading.value = false
    return
  }
  
  try {
    // Here you would typically make an API call to submit the form
    // Replace with your actual submission logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reset form on success
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    message.value = ''
    success.value = true
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      success.value = false
    }, 5000)
  } catch (err) {
    error.value = 'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-6xl">
    <h1 class="text-4xl font-bold mb-12">Contact</h1>
    
    <div class="flex flex-col md:flex-row gap-12">
      <!-- Contact Form -->
      <div class="w-full md:w-2/3">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="firstName" class="block text-sm font-medium mb-1">First name</label>
              <UInput
                id="firstName"
                v-model="firstName"
                placeholder="Jane"
                class="w-full"
                size="lg"
              />
            </div>
            
            <div>
              <label for="lastName" class="block text-sm font-medium mb-1">Last name</label>
              <UInput
                id="lastName"
                v-model="lastName"
                placeholder="Smitherton"
                class="w-full"
                size="lg"
              />
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium mb-1">Email address</label>
            <UInput
              id="email"
              v-model="email"
              type="email"
              placeholder="email@jansfakedomain.net"
              class="w-full"
              size="lg"
            />
          </div>
          
          <div>
            <label for="message" class="block text-sm font-medium mb-1">Your message</label>
            <UTextarea
              id="message"
              v-model="message"
              placeholder="Enter your question or message"
              class="w-full"
              size="lg"
              :rows="6"
            />
          </div>
          
          <div class="mt-10">
            <UButton
              type="submit"
              block
              size="lg"
              color="primary"
              class="bg-brand text-brand-content hover:bg-brand-hover"
              :loading="loading"
            >
              Submit
            </UButton>
          </div>
          
          <!-- Success and Error messages -->
          <UAlert
            v-if="success"
            color="success"
            variant="soft"
            icon="i-heroicons-check-circle"
            title="Mensaje enviado"
            description="Gracias por contactarnos. Nos pondremos en contacto contigo pronto."
            class="mt-4"
          />
          
          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            :title="error"
            class="mt-4"
          />
        </form>
      </div>
      
      <!-- Contact Information -->
      <div class="w-full md:w-1/3 space-y-6">
        <div class="flex items-start space-x-4">
          <UIcon name="i-heroicons-envelope" class="w-6 h-6 mt-1 flex-shrink-0" />
          <div>
            <a 
              href="mailto:info@moabacinematv.cc" 
              class="text-lg hover:text-brand transition"
            >
              info@moabacinematv.com
            </a>
          </div>
        </div>
        
        <div class="flex items-start space-x-4">
          <UIcon name="i-heroicons-phone" class="w-6 h-6 mt-1 flex-shrink-0" />
          <div>
            <a 
              href="tel:+34631163686" 
              class="text-lg hover:text-brand transition"
            >
              +34 631 16 36 86
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>