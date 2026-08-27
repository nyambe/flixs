<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const { t } = useI18n()

const panelRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

function close() {
  open.value = false
}

// Autofocus the input every time the overlay opens (Nuxt UI overlay
// pattern: wait a tick for the v-if'd DOM to mount before focusing).
watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  inputRef.value?.focus()
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
  }
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
    </div>
  </div>
</template>
