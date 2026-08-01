<UButton
  size="sm"
  color="primary"
  icon="i-heroicons-play"
  class="bg-brand hover:bg-brand-focus text-brand-content"
  @click.stop="() => navigateTo(`/movie/${movie.id}`)"
/> 