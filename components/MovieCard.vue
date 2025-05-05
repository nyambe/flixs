<UButton
  size="sm"
  color="primary"
  icon="i-heroicons-play"
  class="bg-amber-400 hover:bg-amber-500 text-black"
  @click.stop="() => navigateTo(`/movie/${movie.id}`)"
/> 