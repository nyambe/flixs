<!-- components/Footer.vue -->
<script setup lang="ts">
interface FooterLink {
  label: string;
  path: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'MoabaTV',
    links: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Press', path: '/press' },
      { label: 'Blog', path: '/blog' }
    ]
  },
  {
    title: 'Help',
    links: [
      { label: 'FAQ', path: '/faq' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Legal Notices', path: '/legal' },
      { label: 'Privacy', path: '/privacy' }
    ]
  },
  {
    title: 'Watch',
    links: [
      { label: 'Movies', path: '/movies' },
      { label: 'Ways to Watch', path: '/ways-to-watch' },
      { label: 'Cookie Preferences', path: '/cookies' },
      { label: 'Speed Test', path: '/speed-test' }
    ]
  }
]

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-black/95 text-brand py-14 mt-auto w-full">
    <div class="container mx-auto px-4">
      <!-- Social Media Links -->
      <div class="flex space-x-6 mb-8">
        <a href="#" class="hover:text-white transition">
          <UIcon name="i-simple-icons-facebook" class="w-6 h-6" />
        </a>
        <a href="#" class="hover:text-white transition">
          <UIcon name="i-simple-icons-instagram" class="w-6 h-6" />
        </a>
        <a href="#" class="hover:text-white transition">
          <UIcon name="i-simple-icons-twitter" class="w-6 h-6" />
        </a>
        <a href="#" class="hover:text-white transition">
          <UIcon name="i-simple-icons-youtube" class="w-6 h-6" />
        </a>
      </div>

      <!-- Footer Links Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div v-for="section in footerSections" :key="section.title">
          <h3 class="text-sm font-semibold mb-4">{{ section.title }}</h3>
          <ul class="space-y-3">
            <li v-for="link in section.links" :key="link.path">
              <NuxtLink 
                :to="link.path" 
                class="text-sm hover:text-white transition"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-12 text-sm">
        <p>&copy; {{ currentYear }} MoabaTV. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>