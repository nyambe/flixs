<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const { t } = useI18n()

const panelRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

function close() {
  open.value = false
}

const { getAllMovies } = useMovieData()
const imagePath = useImagePath()
const localePath = useLocalePath()
const allMovies = getAllMovies()

const query = ref('')

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const results = computed(() => {
  const q = query.value.trim()
  if (!q) return []
  const normalizedQuery = normalize(q)
  return allMovies.filter(m => normalize(m.title).includes(normalizedQuery))
})

const activeIndex = ref(-1)

watch(query, () => {
  activeIndex.value = -1
})

function movieYear(movie: { release_date: string }) {
  return movie.release_date?.slice(0, 4) ?? ''
}

// Autofocus the input every time the overlay opens (Nuxt UI overlay
// pattern: wait a tick for the v-if'd DOM to mount before focusing).
// Reset query on close so reopening the modal starts clean.
watch(open, async (isOpen) => {
  if (!isOpen) {
    query.value = ''
    activeIndex.value = -1
    return
  }
  await nextTick()
  inputRef.value?.focus()
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
    return
  }
  if (!results.value.length) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
    scrollActiveIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const index = activeIndex.value === -1 ? 0 : activeIndex.value
    const movie = results.value[index]
    if (movie) {
      close()
      navigateTo(localePath(`/movie/${movie.id}`))
    }
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    panelRef.value
      ?.querySelector(`[data-result-index="${activeIndex.value}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[70] flex items-start justify-center pt-24 sm:pt-32 bg-black/60 backdrop-blur-sm"
    @click="close"
    @keydown="onKeydown"
  >
    <div
      ref="panelRef"
      class="w-full max-w-lg mx-4 rounded-lg bg-canvas dark:bg-obsidian text-black dark:text-white shadow-xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden"
      @click.stop
    >
      <div class="flex items-center gap-2 p-3 border-b border-neutral-200 dark:border-neutral-800">
        <UIcon name="i-heroicons-magnifying-glass" class="size-5 shrink-0 opacity-60" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          :placeholder="t('Search movies...')"
          class="flex-1 bg-transparent outline-none text-sm placeholder:opacity-50"
        >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark"
          :aria-label="t('Close search')"
          @click="close"
        />
      </div>

      <div v-if="query.trim()" class="max-h-80 overflow-y-auto">
        <NuxtLink
          v-for="(movie, index) in results"
          :key="movie.id"
          :to="localePath(`/movie/${movie.id}`)"
          :data-result-index="index"
          class="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/10 transition"
          :class="{ 'bg-brand/10': index === activeIndex }"
          @click="close"
        >
          <img
            :src="imagePath.poster(movie.poster_path, 'w154')"
            :alt="movie.title"
            class="w-10 h-14 object-cover rounded shrink-0"
          >
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">{{ movie.title }}</p>
            <p class="text-xs opacity-60">{{ movieYear(movie) }}</p>
          </div>
        </NuxtLink>
        <p v-if="results.length === 0" class="p-4 text-sm text-center opacity-60">
          {{ t('No movies found') }}
        </p>
      </div>
    </div>
  </div>
</template>
