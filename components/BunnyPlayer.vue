<script setup lang="ts">
import Hls from 'hls.js'

const props = defineProps<{
  playlistUrl: string
  autoplay?: boolean
  poster?: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const hls = ref<Hls | null>(null)
const isPlaying = ref(false)
const error = ref<string | null>(null)

onMounted(() => {
  if (!videoRef.value) return

  if (Hls.isSupported()) {
    hls.value = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    })

    hls.value.loadSource(props.playlistUrl)
    hls.value.attachMedia(videoRef.value)

    hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
      if (props.autoplay && videoRef.value) {
        videoRef.value.play().catch((e) => {
          console.log('Autoplay prevented:', e)
        })
      }
    })

    hls.value.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            error.value = 'Network error - retrying...'
            hls.value?.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            error.value = 'Media error - recovering...'
            hls.value?.recoverMediaError()
            break
          default:
            error.value = 'Fatal playback error'
            hls.value?.destroy()
            break
        }
      }
    })
  } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari native HLS support
    videoRef.value.src = props.playlistUrl
    if (props.autoplay) {
      videoRef.value.play().catch((e) => {
        console.log('Autoplay prevented:', e)
      })
    }
  } else {
    error.value = 'HLS is not supported in this browser'
  }
})

onUnmounted(() => {
  if (hls.value) {
    hls.value.destroy()
  }
})

const togglePlay = () => {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
  } else {
    videoRef.value.pause()
  }
}

const toggleFullscreen = () => {
  if (!videoRef.value) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    videoRef.value.requestFullscreen()
  }
}
</script>

<template>
  <div class="relative w-full h-full bg-black">
    <video
      ref="videoRef"
      class="w-full h-full"
      :poster="poster"
      controls
      playsinline
      @play="isPlaying = true"
      @pause="isPlaying = false"
    />

    <!-- Error overlay -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-black/80">
      <div class="text-center text-white">
        <p class="text-red-400 mb-2">{{ error }}</p>
        <button
          @click="error = null"
          class="px-4 py-2 bg-white/20 rounded hover:bg-white/30"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>
