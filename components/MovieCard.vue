<UButton
  size="sm"
  color="amber"
  icon="i-heroicons-play"
  class="bg-amber-400 hover:bg-amber-500"
  @click.stop="() => navigateTo(`/movie/${movie.id}`)"
/> 