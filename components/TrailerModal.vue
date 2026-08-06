<script setup lang="ts">
// Bunny embed player for trailers. `trailerId` is a Bunny video GUID
// (movies.json `trailer_bunny_id`) — Vimeo trailers were retired in #20.
const props = defineProps<{
  open: boolean;
  trailerId: string | null;
}>();

const emit = defineEmits(['update:open']);

// Same Bunny Stream library as the server-side proxy (server/api/bunny/*)
const BUNNY_LIBRARY_ID = '425878';

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

const getPlayerUrl = (trailerId: string) => {
  if (!trailerId) return '';
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${trailerId}?autoplay=true&preload=true`;
};
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="bg-black rounded-lg overflow-hidden w-full max-w-5xl">
        <div class="aspect-video w-full">
          <iframe
            v-if="trailerId"
            :src="getPlayerUrl(trailerId)"
            class="w-full h-full"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <div class="p-4 flex justify-end">
          <UButton
            color="white"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="isOpen = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
