<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  trailerId: string | null;
}>();

const emit = defineEmits(['update:open']);

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

const getPlayerUrl = (trailerId: string) => {
  if (!trailerId) return '';
  const baseUrl = `https://player.vimeo.com/video/${trailerId}`;
  return `${baseUrl}?autoplay=1&title=0&byline=0&portrait=0`;
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
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="isOpen = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template> 