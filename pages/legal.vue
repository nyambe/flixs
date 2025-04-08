<!-- pages/legal.vue -->
<script setup lang="ts">
// No variables needed
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <h1 class="text-4xl font-bold mb-8">AVISO LEGAL</h1>
    
    <div class="legal-content">      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">1. IDENTIFICACIÓN DEL TITULAR</h2>
        <p class="mb-4">En cumplimiento con la normativa vigente, se informa a los usuarios de la presente plataforma que el sitio web MOABACINEMATV.COM (en adelante, "la Plataforma") es operado por:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Titular: MONSUY SL.</li>
          <li>Domicilio: Calle Señores de Luzon, 3 - bj ct.28013, Madrid</li>
          <li>CIF/NIF/Número de identificación fiscal: B75341859</li>
          <li>Correo electrónico: moabacinematv@gmail.com</li>
          <li>Teléfono de contacto: +34 631 16 36 86</li>
        </ul>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">2. OBJETO</h2>
        <p>El presente Aviso Legal regula el acceso, uso y navegación de la Plataforma, así como las responsabilidades derivadas de la utilización de sus contenidos y servicios.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">3. CONDICIONES DE USO</h2>
        <p>El acceso y uso de la Plataforma implican la aceptación plena y sin reservas de las condiciones establecidas en el presente documento. El usuario se compromete a utilizar la Plataforma de forma lícita, evitando cualquier conducta que pueda dañar los derechos o intereses de terceros.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">4. PROPIEDAD INTELECTUAL E INDUSTRIAL</h2>
        <p>Todos los contenidos de la Plataforma, incluyendo, pero sin limitarse a, textos, imágenes, logotipos, vídeos, diseños y software, están protegidos por los derechos de propiedad intelectual e industrial del titular o de terceros autorizados. Queda prohibida su reproducción, distribución o modificación sin autorización expresa del titular.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">5. RESPONSABILIDADES Y LIMITACIÓN DE GARANTÍAS</h2>
        <p>El titular de la Plataforma no garantiza la disponibilidad continua de la misma ni la ausencia de errores en sus contenidos. No se hace responsable de los daños o perjuicios derivados del uso de la Plataforma o de la información contenida en ella.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">6. ENLACES A TERCEROS</h2>
        <p>La Plataforma puede contener enlaces a sitios web de terceros. El titular no se responsabiliza del contenido, políticas de privacidad o prácticas de dichos sitios.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">7. PROTECCIÓN DE DATOS PERSONALES</h2>
        <p>El tratamiento de los datos personales de los usuarios se regirá por la <NuxtLink to="/privacy" class="text-brand hover:underline">Política de Privacidad</NuxtLink> de la Plataforma.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">8. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</h2>
        <p>El presente Aviso Legal se regirá por la legislación aplicable en ESPAÑA. Cualquier disputa será resuelta ante los tribunales de MADRID, ESPAÑA.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">9. CONTACTO</h2>
        <p>Para cualquier consulta sobre este Aviso Legal, puede contactarnos en <a href="mailto:moabacinematv@gmail.com" class="text-brand hover:underline">moabacinematv@gmail.com</a>.</p>
      </section>
    </div>
    
    <div class="mt-12 flex justify-center space-x-4">
      <NuxtLink to="/privacy" class="text-brand hover:underline">Política de Privacidad</NuxtLink>
      <NuxtLink to="/cookies" class="text-brand hover:underline">Política de Cookies</NuxtLink>
      <NuxtLink to="/terms" class="text-brand hover:underline">Términos y Condiciones</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.legal-content h2 {
  color: var(--p);
}
</style>