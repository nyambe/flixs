<script setup lang="ts">
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

// Cookie to track if notification was dismissed (30 days expiry)
const notificationDismissed = useCookie('notification-dismissed', {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  sameSite: 'lax'
})

// Routes where notification should NOT show
const excludedRoutes = ['/auth/login', '/auth/register', '/subscription/checkout']

// State
const isVisible = ref(false)
const showDelay = 10000 // 10 seconds

// Check if notification should be shown
const shouldShow = computed(() => {
  const currentPath = route.path
  const isExcluded = excludedRoutes.some(path => currentPath.includes(path))
  return !isExcluded && !notificationDismissed.value
})

// Show notification after delay
onMounted(() => {
  if (shouldShow.value) {
    setTimeout(() => {
      isVisible.value = true
    }, showDelay)
  }
})

// Watch route changes
watch(() => route.path, () => {
  if (!shouldShow.value) {
    isVisible.value = false
  }
})

const handleNotificationClick = () => {
  router.push(localePath('/subscription/plans'))
}

const closeNotification = (e: Event) => {
  e.stopPropagation()
  isVisible.value = false
  notificationDismissed.value = 'true' // Set cookie
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-full opacity-0"
  >
    <div
      v-if="isVisible"
      class="w-full bg-amber-400 text-black py-3 px-4 cursor-pointer shadow-lg"
      @click="handleNotificationClick"
    >
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-megaphone" class="h-5 w-5 flex-shrink-0" />
          <p class="text-sm md:text-base font-medium">
            {{ t('Limited time offer: Stream premium African movies for just 4.95€/month!') }}
          </p>
        </div>
        <UButton
          variant="ghost"
          color="black"
          icon="i-heroicons-x-mark"
          size="sm"
          class="ml-4 hover:bg-black/10"
          :aria-label="t('Close notification')"
          @click="closeNotification"
        />
      </div>
    </div>
  </Transition>
</template> 