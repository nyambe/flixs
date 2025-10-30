<script setup lang="ts">
import type { TMDBMovie } from '~/types'

const { t } = useI18n()
const router = useRouter()
const { loading, error, createPressLink } = usePressLink()
const { getAllMovies } = useMovieData()

// Get all movies for selection
const movies = getAllMovies()

// Form data
const formData = ref({
  movieId: 0,
  recipientName: '',
  recipientEmail: '',
  organization: '',
  expirationDays: 14,
  password: '',
  notes: ''
})

// Selected movie (for getting video_id)
const selectedMovie = computed(() => {
  return movies.find(m => m.id === formData.value.movieId)
})

// Form validation
const isValid = computed(() => {
  return formData.value.movieId > 0 &&
         formData.value.recipientName.trim() !== '' &&
         formData.value.recipientEmail.trim() !== '' &&
         formData.value.expirationDays > 0 &&
         formData.value.expirationDays <= 90
})

// Calculate expiration timestamp
const expiresAt = computed(() => {
  const now = Date.now()
  const days = formData.value.expirationDays
  return now + (days * 24 * 60 * 60 * 1000)
})

// Submit form
const handleSubmit = async () => {
  if (!isValid.value || !selectedMovie.value?.video_id) {
    alert(t('press.invalidForm'))
    return
  }

  const result = await createPressLink({
    videoId: selectedMovie.value.video_id,
    movieId: formData.value.movieId,
    movieTitle: selectedMovie.value.title,
    recipientName: formData.value.recipientName,
    recipientEmail: formData.value.recipientEmail,
    organization: formData.value.organization || undefined,
    expiresAt: expiresAt.value,
    password: formData.value.password || undefined,
    notes: formData.value.notes || undefined
  })

  if (result) {
    alert(t('press.linkCreated'))
    router.push('/admin/press-links')
  }
}
</script>

<template>
  <div>
    <!-- Admin Navigation -->
    <AdminNav />

    <div class="px-6 py-8 max-w-3xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <NuxtLink
            to="/admin/press-links"
            class="text-gray-600 hover:text-gray-900"
          >
            ← {{ t('press.back') }}
          </NuxtLink>
        </div>
        <h1 class="text-2xl font-bold mb-2">{{ t('press.createLink') }}</h1>
        <p class="text-gray-600">{{ t('press.createDescription') }}</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{{ error }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6 space-y-6">
        <!-- Movie Selection -->
        <div>
          <label for="movie" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('press.selectMovie') }} *
          </label>
          <select
            id="movie"
            v-model.number="formData.movieId"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option :value="0">{{ t('press.selectMoviePlaceholder') }}</option>
            <option
              v-for="movie in movies"
              :key="movie.id"
              :value="movie.id"
              :disabled="!movie.video_id"
            >
              {{ movie.title }} {{ movie.video_id ? '' : '(No video)' }}
            </option>
          </select>
          <p v-if="selectedMovie && !selectedMovie.video_id" class="mt-1 text-sm text-red-600">
            {{ t('press.noVideoIdError') }}
          </p>
        </div>

        <!-- Recipient Name -->
        <div>
          <label for="recipientName" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('press.recipientName') }} *
          </label>
          <input
            id="recipientName"
            v-model="formData.recipientName"
            type="text"
            required
            :placeholder="t('press.recipientNamePlaceholder')"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>

        <!-- Recipient Email -->
        <div>
          <label for="recipientEmail" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('press.recipientEmail') }} *
          </label>
          <input
            id="recipientEmail"
            v-model="formData.recipientEmail"
            type="email"
            required
            :placeholder="t('press.recipientEmailPlaceholder')"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>

        <!-- Organization (Optional) -->
        <div>
          <label for="organization" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('press.organization') }}
          </label>
          <input
            id="organization"
            v-model="formData.organization"
            type="text"
            :placeholder="t('press.organizationPlaceholder')"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>

        <!-- Expiration Days -->
        <div>
          <label for="expirationDays" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('press.expirationDays') }} * (1-90 days)
          </label>
          <input
            id="expirationDays"
            v-model.number="formData.expirationDays"
            type="number"
            min="1"
            max="90"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
          <p class="mt-1 text-sm text-gray-500">
            {{ t('press.expiresOn') }}: {{ new Date(expiresAt).toLocaleDateString() }}
          </p>
        </div>

        <!-- Password (Optional) -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('press.password') }}
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="text"
            :placeholder="t('press.passwordPlaceholder')"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
          <p class="mt-1 text-sm text-gray-500">
            {{ t('press.passwordHelp') }}
          </p>
        </div>

        <!-- Notes (Optional) -->
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('press.notes') }}
          </label>
          <textarea
            id="notes"
            v-model="formData.notes"
            rows="3"
            :placeholder="t('press.notesPlaceholder')"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="loading || !isValid"
            class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span v-if="loading">{{ t('press.creating') }}...</span>
            <span v-else>{{ t('press.createLink') }}</span>
          </button>
          <NuxtLink
            to="/admin/press-links"
            class="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
          >
            {{ t('press.cancel') }}
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
