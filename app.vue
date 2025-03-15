<script setup lang="ts">
// app.vue
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <SiteNotification>
      Limited time offer: Stream premium African movies for just 4.99€/month!
    </SiteNotification>
    
    <SiteNavigation />
    
    <NuxtPage />
    <LazyPageFooter />
  </div>
</template>

<style>
.backdrop-blur {
  backdrop-filter: blur(8px);
}
div {
  font-family: 'Montserrat', sans-serif;
}
</style>