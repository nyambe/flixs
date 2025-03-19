<!-- pages/conocenos.vue -->
<script setup lang="ts">
const features = [
  {
    title: 'Plataforma audiovisual',
    description: 'Especializada en cine y televisión africano de calidad',
    icon: 'i-heroicons-film'
  },
  {
    title: 'Laboratorio de producción',
    description: 'Creación y distribución de contenido audiovisual original',
    icon: 'i-heroicons-video-camera'
  },
  {
    title: 'Gestión cultural',
    description: 'Organización de eventos culturales y festivales de cine',
    icon: 'i-heroicons-ticket'
  },
  {
    title: 'Promoción del cine africano',
    description: 'Difusión de historias relacionadas con África en lengua española',
    icon: 'i-heroicons-globe-europe-africa'
  }
]
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-6xl">
    <div class="mb-16">
      <h1 class="text-4xl font-bold mb-8">Conoce Moaba Cinema TV</h1>
      
      <!-- Hero section with mission statement -->
      <div class="bg-neutral text-neutral-content p-8 rounded-lg mb-12">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="md:w-2/3">
            <h2 class="text-2xl font-semibold mb-4">Nuestra Misión</h2>
            <p class="text-lg mb-4">
              Plataforma audiovisual de cine y televisión africano. Es el laboratorio de producción, 
              distribución y comercialización audiovisual, Cine y Televisión; con experiencia en la 
              creación de eventos y gestión cultural.
            </p>
            <p class="text-lg">
              La raíz de producción cuya misión principal es hacer cine y promocionar el cine de África, 
              de historias relacionadas con ÁFRICA y los africanos en España y en lengua española.
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
      <h2 class="text-2xl font-bold mb-6">Nuestra Filosofía</h2>
      <div class="bg-complementary/10 p-8 rounded-lg">
        <p class="text-lg mb-4">
          En Moaba Cinema TV creemos en el poder del cine como puente cultural entre África y el mundo hispano. 
          A través del audiovisual, buscamos romper barreras, derribar estereotipos y 
          mostrar la riqueza cultural del continente africano.
        </p>
        <p class="text-lg">
          Trabajamos para crear un espacio donde las historias africanas puedan ser contadas 
          con autenticidad y respeto, llegando a nuevas audiencias a través del idioma español.
        </p>
      </div>
    </div>
    
    <!-- Call to action -->
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-6">¿Quieres colaborar con nosotros?</h2>
      <p class="text-lg mb-8 max-w-3xl mx-auto">
        Si tienes interés en el cine africano, quieres distribuir tu película o tienes una idea 
        para un proyecto audiovisual relacionado con África, nos encantaría escucharte.
      </p>
      <UButton 
        to="/contact" 
        color="brand"
        size="lg"
        class="font-medium text-lg px-8"
      >
        Contáctanos
      </UButton>
    </div>
  </div>
</template>