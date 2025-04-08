<!-- components/Footer.vue -->
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();

interface FooterLink {
  label: string;
  path: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  icon: string;
  url: string;
}

const socialLinks: SocialLink[] = [
  { 
    name: 'Facebook', 
    icon: 'i-simple-icons-facebook', 
    url: 'https://www.facebook.com/moabacinematv' 
  },
  { 
    name: 'YouTube', 
    icon: 'i-simple-icons-youtube', 
    url: 'https://www.youtube.com/@MOABACINEMATV' 
  },
  { 
    name: 'Instagram', 
    icon: 'i-simple-icons-instagram', 
    url: 'https://www.instagram.com/moabacinematv/' 
  },
  {
    name: 'X',
    icon: 'i-simple-icons-x',
    url: 'https://x.com/moabacinematv'
  }
]

// Convert to a computed property that will re-evaluate when i18n is ready
const footerSections = computed<FooterSection[]>(() => [
  {
    title: t('WHAT TO WATCH'),
    links: [
      { label: t('Movies'), path: '/movies' },
      { label: t('Series'), path: '/movies' }
    ]
  },
  {
    title: t('MOABA CINEMA'),
    links: [
      { label: t('Contact'), path: '/contact' },
      { label: t('About Us'), path: '/about' }
    ]
  },
  {
    title: t('HELP'),
    links: [
      { label: t('Legal Notice'), path: '/legal' },
      { label: t('Cookie Policy'), path: '/cookies' },
      { label: t('Privacy Policy'), path: '/privacy' },
      { label: t('Terms and Conditions'), path: '/terms' }
    ]
  }
]);

const currentYear = new Date().getFullYear();
const copyright = computed(() => `© ${currentYear} MoabaTV. ${t('All rights reserved')}.`);
</script>

<template>
  <footer class="bg-black text-neutral-content py-14 mt-auto w-full">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between">
        <!-- Brand and Social Media -->
        <div class="mb-8 md:mb-0">
          <div class="text-brand font-bold text-lg md:text-xl mb-6">MOABA CINEMA TV</div>
          <!-- Social Media Links -->
          <div class="flex space-x-6">
            <a 
              v-for="social in socialLinks" 
              :key="social.name" 
              :href="social.url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="hover:text-brand transition text-md"
              :aria-label="social.name"
            >
              <UIcon :name="social.icon" class="w-6 h-6" />
            </a>
          </div>
        </div>

        <!-- Footer Sections -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
          <div v-for="section in footerSections" :key="section.title">
            <h3 class="text-sm font-semibold text-brand mb-4">{{ section.title }}</h3>
            <ul class="space-y-3">
              <li v-for="link in section.links" :key="link.path">
                <NuxtLink 
                  :to="link.path" 
                  class="text-sm hover:text-brand transition"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      
      <!-- Copyright -->
      <div class="mt-6 text-sm text-brand-focus">
        <p>{{ copyright }}</p>
      </div>
    </div>
  </footer>
</template>