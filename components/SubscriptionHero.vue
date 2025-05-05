<script setup lang="ts">
const emit = defineEmits(['subscribe'])
defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const email = ref('')
const imagePath = useImagePath()

const handleSubscribe = () => {
  if (email.value) {
    emit('subscribe', email.value)
  }
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
        Descubre la esencia del cine africano
      </h1>
      
      <p class="text-xl text-neutral-200 mb-12 max-w-3xl">
        Sumérgete en nuestra colección premium de películas y series africanas: obras maestras galardonadas, historias culturales auténticas, producciones independientes y documentales cautivadores.
      </p>
      
      <div class="w-full max-w-xl mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <input
            v-model="email"
            type="email"
            placeholder="Tu correo electrónico"
            class="flex-1 py-4 px-6 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            @click="handleSubscribe"
            class="py-4 px-8 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-md transition-colors"
          >
            EXPLORAR AHORA
          </button>
        </div>
      </div>
      
      <p class="text-neutral-400">
        Accede a títulos africanos exclusivos. Sin compromisos, cancela cuando quieras.
      </p>
    </div>
  </section>
</template> 