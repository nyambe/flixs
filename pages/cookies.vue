<!-- pages/cookies.vue -->
<script setup lang="ts">
// Current year for footer
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <h1 class="text-4xl font-bold mb-8">POLÍTICA DE COOKIES</h1>
    
    <div class="legal-content">
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">1. INTRODUCCIÓN</h2>
        <p>La presente Política de Cookies explica qué son las cookies, cómo las utilizamos en MOABACINEMATV.COM (en adelante, "la Plataforma") y cómo los usuarios pueden gestionarlas.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">2. ¿QUÉ SON LAS COOKIES?</h2>
        <p>Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario cuando visita un sitio web. Estas permiten recordar información sobre la navegación para mejorar la experiencia del usuario y ofrecer contenido personalizado.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">3. TIPOS DE COOKIES QUE UTILIZAMOS</h2>
        <p class="mb-3">Según su finalidad, la Plataforma utiliza los siguientes tipos de cookies:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del sitio web y la prestación del servicio.</li>
          <li><strong>Cookies de análisis:</strong> Recogen datos sobre el uso del sitio web para mejorar su rendimiento.</li>
          <li><strong>Cookies de personalización:</strong> Permiten recordar preferencias y configuraciones del usuario.</li>
          <li><strong>Cookies de publicidad:</strong> Utilizadas para mostrar anuncios relevantes según los intereses del usuario.</li>
          <li><strong>Cookies de terceros:</strong> Pertenecen a proveedores externos y se usan para integraciones con redes sociales, servicios de análisis y publicidad.</li>
        </ul>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">4. ¿CÓMO GESTIONAR Y DESACTIVAR LAS COOKIES?</h2>
        <p class="mb-3">El usuario puede configurar su navegador para aceptar, rechazar o eliminar cookies en cualquier momento. A continuación, se indican enlaces a la configuración de los principales navegadores:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li><strong>Google Chrome:</strong> <a href="https://support.google.com/chrome/answer/95647" target="_blank" class="text-brand hover:underline">Administrar cookies</a></li>
          <li><strong>Mozilla Firefox:</strong> <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" class="text-brand hover:underline">Administrar cookies</a></li>
          <li><strong>Microsoft Edge:</strong> <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" class="text-brand hover:underline">Administrar cookies</a></li>
          <li><strong>Safari:</strong> <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" class="text-brand hover:underline">Administrar cookies</a></li>
        </ul>
        <p class="mt-3">La desactivación de ciertas cookies puede afectar el funcionamiento de la Plataforma.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">5. COOKIES DE TERCEROS</h2>
        <p>Algunas cookies en nuestra Plataforma pueden ser gestionadas por terceros, como Google Analytics, Facebook o proveedores de publicidad. Se recomienda revisar sus políticas de privacidad para conocer más detalles sobre su uso.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">6. CAMBIOS EN LA POLÍTICA DE COOKIES</h2>
        <p>Nos reservamos el derecho de modificar esta Política de Cookies en cualquier momento. Los cambios serán publicados en esta página con su fecha de actualización.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">7. CONTACTO</h2>
        <p>Para cualquier duda sobre nuestra Política de Cookies, puede contactarnos en <a href="mailto:moabacinematv@gmail.com" class="text-brand hover:underline">moabacinematv@gmail.com</a>.</p>
      </section>
      
      <div class="mt-6 text-right text-sm text-neutral-500">
        <p>Fecha de última actualización: 15/03/2025</p>
      </div>
    </div>
    
    <div class="mt-12 flex justify-center space-x-4">
      <NuxtLink to="/legal" class="text-brand hover:underline">Aviso Legal</NuxtLink>
      <NuxtLink to="/privacy" class="text-brand hover:underline">Política de Privacidad</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.legal-content h2 {
  color: var(--p);
}
</style>