<!-- pages/privacy.vue -->
<script setup lang="ts">
// No variables needed
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <h1 class="text-4xl font-bold mb-8">POLÍTICA DE PRIVACIDAD</h1>
    
    <div class="legal-content">
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">1. Introducción</h2>
        <p>En MOABA CINEMA TV, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos la información de nuestros usuarios, cumpliendo con el Reglamento General de Protección de Datos (GDPR).</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">2. Datos que Recopilamos</h2>
        <p class="mb-3">Recopilamos los siguientes datos personales:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Nombre y apellidos</li>
          <li>Correo electrónico</li>
          <li>Teléfono móvil</li>
          <li>Información de pago (procesada a través de terceros seguros)</li>
          <li>Dirección IP y datos de navegación</li>
        </ul>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">3. Finalidad del Tratamiento de Datos</h2>
        <p class="mb-3">Usamos tus datos para:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Gestionar tu cuenta y suscripción</li>
          <li>Procesar pagos y facturación</li>
          <li>Enviar comunicaciones sobre el servicio</li>
          <li>Mejorar la experiencia del usuario</li>
          <li>Enviar comunicaciones de actualizaciones de contenidos, eventos y estrenos relacionados con la plataforma MOABA CINEMA TV</li>
        </ul>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">4. Base Legal para el Tratamiento</h2>
        <p class="mb-3">Tratamos tus datos en base a:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Tu consentimiento expreso</li>
          <li>La necesidad de ejecutar el contrato de suscripción</li>
          <li>Cumplimiento de obligaciones legales</li>
        </ul>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">5. Derechos del Usuario</h2>
        <p class="mb-3">Bajo el GDPR, tienes derecho a:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Acceder, rectificar o eliminar tus datos personales</li>
          <li>Solicitar la portabilidad de tus datos</li>
          <li>Retirar tu consentimiento en cualquier momento</li>
          <li>Presentar una queja ante la autoridad de protección de datos</li>
        </ul>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">6. Seguridad y Retención de Datos</h2>
        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos. Solo conservamos tu información mientras sea necesario para los fines indicados.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">7. Transferencia de Datos a Terceros</h2>
        <p class="mb-3">Podemos compartir datos con:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Proveedores de pago seguros</li>
          <li>Servicios de hosting y almacenamiento</li>
          <li>Autoridades cuando la ley lo exija</li>
        </ul>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">8. Uso de Cookies</h2>
        <p>Utilizamos cookies para mejorar tu experiencia. Puedes gestionar tus preferencias en la configuración del navegador.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">9. Contacto</h2>
        <p>Para consultas sobre privacidad, contáctanos en: <a href="mailto:moabacinematv@gmail.com" class="text-brand hover:underline">moabacinematv@gmail.com</a>.</p>
      </section>
      
      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">10. Responsable del tratamiento de los datos</h2>
        <ul class="list-disc ml-6 space-y-2">
          <li>Titular: MONSUY SL.</li>
          <li>Domicilio: Calle Señores de Luzon, 3 - bj ct.28013, Madrid</li>
          <li>CIF/NIF/Número de identificación fiscal: B75341859</li>
          <li>Correo electrónico: moabacinematv@gmail.com</li>
          <li>Teléfono de contacto: +34 631 16 36 86</li>
        </ul>
      </section>
      
      <div class="mt-6 text-right text-sm text-neutral-500">
        <p>Fecha de última actualización: 28/03/2025</p>
      </div>
    </div>
    
    <div class="mt-12 flex justify-center space-x-4">
      <NuxtLink to="/legal" class="text-brand hover:underline">Aviso Legal</NuxtLink>
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