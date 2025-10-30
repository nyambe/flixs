<!-- pages/conocenos.vue -->
<script setup lang="ts">
const { t } = useI18n()

const features = computed(() => [
  {
    title: t('Audiovisual Platform'),
    description: t('Specialized in quality African film and television'),
    icon: 'i-heroicons-film'
  },
  {
    title: t('Production Laboratory'),
    description: t('Creation and distribution of original audiovisual content'),
    icon: 'i-heroicons-video-camera'
  },
  {
    title: t('Cultural Management'),
    description: t('Organization of cultural events and film festivals'),
    icon: 'i-heroicons-ticket'
  },
  {
    title: t('Promotion of African Cinema'),
    description: t('Dissemination of stories related to Africa in Spanish language'),
    icon: 'i-heroicons-globe-europe-africa'
  }
])
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-6xl">
    <div class="mb-16">
      <h1 class="text-4xl font-bold mb-8">{{ t('About Moaba Cinema TV') }}</h1>
      
      <!-- Hero section with mission statement -->
      <div class="bg-neutral text-neutral-content p-8 rounded-lg mb-12">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="md:w-2/3">
            <h2 class="text-2xl font-semibold mb-4">{{ t('Our Mission') }}</h2>
            <p class="text-lg mb-4">
              {{ t('Audiovisual platform for African cinema and television. It is the production, distribution and commercialization laboratory for film and television, with experience in event creation and cultural management.') }}
            </p>
            <p class="text-lg">
              {{ t('The production root whose main mission is to make cinema and promote African cinema, stories related to AFRICA and Africans in Spain and in Spanish language.') }}
            </p>
          </div>
          <div class="md:w-1/3 flex justify-center">
            <!-- Placeholder for an image or icon - replace with your actual image -->
            <UIcon 
              name="i-heroicons-film" 
              class="w-32 h-32 text-brand"
            />
          </div>
        </div>
      </div>
      
      <!-- Features grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="p-6 border border-neutral-200 rounded-lg hover:border-brand transition"
        >
          <div class="flex items-start gap-4">
            <UIcon 
              :name="feature.icon" 
              class="w-8 h-8 text-brand"
            />
            <div>
              <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Team or Philosophy section -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold mb-6">{{ t('Our Philosophy') }}</h2>
      <div class="bg-complementary/10 p-8 rounded-lg">
        <p class="text-lg mb-4">
          {{ t('At Moaba Cinema TV we believe in the power of cinema as a cultural bridge between Africa and the Hispanic world. Through audiovisual media, we seek to break barriers, tear down stereotypes and showcase the cultural richness of the African continent.') }}
        </p>
        <p class="text-lg">
          {{ t('We work to create a space where African stories can be told with authenticity and respect, reaching new audiences through the Spanish language.') }}
        </p>
      </div>
    </div>
    
    <!-- Call to action -->
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-6">{{ t('Want to collaborate with us?') }}</h2>
      <p class="text-lg mb-8 max-w-3xl mx-auto">
        {{ t('If you are interested in African cinema, want to distribute your film or have an idea for an audiovisual project related to Africa, we would love to hear from you.') }}
      </p>
      <UButton
        to="/contact"
        color="brand"
        size="lg"
        class="font-medium text-lg px-8"
      >
        {{ t('Contact Us') }}
      </UButton>
    </div>
  </div>
</template>