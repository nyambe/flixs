<template>
  <div class="min-h-screen bg-white dark:bg-neutral p-6">
    <div class="max-w-6xl mx-auto">
      <header class="mb-12">
        <h1 class="text-4xl font-bold text-neutral-content dark:text-white mb-3">African Documentaries Color Showcase</h1>
        <p class="text-neutral dark:text-neutral-content text-lg mb-6">Exploring our brand's color palette and its applications</p>
        <button @click="toggleDarkMode" class="bg-brand text-brand-content px-4 py-2 rounded-md hover:bg-brand-focus transition-colors">
          Toggle Dark Mode
        </button>
      </header>

      <!-- Main Brand Colors Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-neutral dark:text-white mb-6">Main Brand Colors</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <!-- Brand Color -->
          <div class="rounded-lg overflow-hidden shadow-lg">
            <div class="h-32 bg-brand"></div>
            <div class="p-4 bg-white dark:bg-neutral-focus">
              <h3 class="font-semibold text-neutral dark:text-white">Brand</h3>
              <p class="text-sm text-neutral-focus dark:text-neutral-content">Primary brand color</p>
            </div>
          </div>
          
          <!-- Complementary Color -->
          <div class="rounded-lg overflow-hidden shadow-lg">
            <div class="h-32 bg-complementary"></div>
            <div class="p-4 bg-white dark:bg-neutral-focus">
              <h3 class="font-semibold text-neutral dark:text-white">Complementary</h3>
              <p class="text-sm text-neutral-focus dark:text-neutral-content">Secondary color</p>
            </div>
          </div>
          
          <!-- Accent Color -->
          <div class="rounded-lg overflow-hidden shadow-lg">
            <div class="h-32 bg-accent"></div>
            <div class="p-4 bg-white dark:bg-neutral-focus">
              <h3 class="font-semibold text-neutral dark:text-white">Accent</h3>
              <p class="text-sm text-neutral-focus dark:text-neutral-content">For highlights and emphasis</p>
            </div>
          </div>
          
          <!-- Neutral Color -->
          <div class="rounded-lg overflow-hidden shadow-lg">
            <div class="h-32 bg-neutral"></div>
            <div class="p-4 bg-white dark:bg-neutral-focus">
              <h3 class="font-semibold text-neutral dark:text-white">Neutral</h3>
              <p class="text-sm text-neutral-focus dark:text-neutral-content">Text and backgrounds</p>
            </div>
          </div>
          
          <!-- Support Color -->
          <div class="rounded-lg overflow-hidden shadow-lg">
            <div class="h-32 bg-support"></div>
            <div class="p-4 bg-white dark:bg-neutral-focus">
              <h3 class="font-semibold text-neutral dark:text-white">Support</h3>
              <p class="text-sm text-neutral-focus dark:text-neutral-content">Specialty highlights</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Text Elements Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-neutral dark:text-white mb-6">Text Elements</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Headings -->
          <div class="bg-white dark:bg-neutral-focus p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold text-neutral dark:text-white mb-4">Headings</h3>
            <h1 class="text-4xl font-bold text-brand-content mb-2">Heading 1</h1>
            <h2 class="text-3xl font-bold text-complementary-content mb-2">Heading 2</h2>
            <h3 class="text-2xl font-bold text-accent-content mb-2">Heading 3</h3>
            <h4 class="text-xl font-bold text-support-content mb-2">Heading 4</h4>
            <h5 class="text-lg font-bold text-neutral mb-2 dark:text-white">Heading 5</h5>
          </div>
          
          <!-- Paragraphs -->
          <div class="bg-white dark:bg-neutral-focus p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold text-neutral dark:text-white mb-4">Paragraphs</h3>
            <p class="text-neutral dark:text-neutral-content mb-4">
              Default paragraph text using the neutral color for maximum readability. This text should be easily readable on both light and dark backgrounds.
            </p>
            <p class="text-brand-content mb-4 font-medium">
              Emphasized text using brand-content color. This shows how our brand color can be used for important content.
            </p>
            <p class="text-complementary-content mb-4 font-medium">
              Secondary text using complementary-content color. Provides a nice alternative emphasis.
            </p>
          </div>
        </div>
      </section>

      <!-- UI Components Section -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-neutral dark:text-white mb-6">UI Components</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Buttons -->
          <div class="bg-white dark:bg-neutral-focus p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold text-neutral dark:text-white mb-4">Buttons</h3>
            <div class="flex flex-wrap gap-4">
              <button class="bg-brand text-brand-content px-4 py-2 rounded-md hover:bg-brand-focus transition-colors">
                Primary Button
              </button>
              <button class="bg-complementary text-complementary-content px-4 py-2 rounded-md hover:bg-complementary-focus transition-colors">
                Secondary Button
              </button>
              <button class="bg-accent text-accent-content px-4 py-2 rounded-md hover:bg-accent-focus transition-colors">
                Accent Button
              </button>
              <button class="bg-support text-support-content px-4 py-2 rounded-md hover:bg-support-focus transition-colors">
                Support Button
              </button>
              <button class="bg-white text-neutral border border-neutral px-4 py-2 rounded-md hover:bg-neutral hover:text-white transition-colors dark:bg-neutral dark:text-white dark:hover:bg-white dark:hover:text-neutral">
                Outlined Button
              </button>
            </div>
          </div>
          
          <!-- Cards -->
          <div class="bg-white dark:bg-neutral-focus p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold text-neutral dark:text-white mb-4">Cards</h3>
            
            <div class="bg-brand p-1 rounded-lg mb-4">
              <div class="bg-white dark:bg-neutral p-4 rounded-md">
                <h4 class="font-bold text-brand-content mb-2">Brand Card</h4>
                <p class="text-neutral dark:text-neutral-content text-sm">Card with brand color border</p>
              </div>
            </div>
            
            <div class="bg-complementary p-1 rounded-lg mb-4">
              <div class="bg-white dark:bg-neutral p-4 rounded-md">
                <h4 class="font-bold text-complementary-content mb-2">Complementary Card</h4>
                <p class="text-neutral dark:text-neutral-content text-sm">Card with complementary color border</p>
              </div>
            </div>
            
            <div class="bg-accent p-1 rounded-lg">
              <div class="bg-white dark:bg-neutral p-4 rounded-md">
                <h4 class="font-bold text-accent-content mb-2">Accent Card</h4>
                <p class="text-neutral dark:text-neutral-content text-sm">Card with accent color border</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dark Mode Specific Components -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-neutral dark:text-white mb-6">Dark Mode Specific Components</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Dark mode alert -->
          <div class="bg-neutral dark:bg-brand p-4 rounded-lg shadow-md">
            <h3 class="text-white dark:text-brand-content font-bold mb-2">Dark Mode Alert</h3>
            <p class="text-neutral-content dark:text-brand-content">This alert uses inverse colors in dark mode to stand out.</p>
          </div>
          
          <!-- Dark mode notification -->
          <div class="bg-support dark:bg-support p-4 rounded-lg shadow-md">
            <h3 class="text-support-content font-bold mb-2">Notification</h3>
            <p class="text-support-content">This notification uses the support color in both modes.</p>
          </div>
        </div>
      </section>

      <!-- Form Elements -->
      <section>
        <h2 class="text-2xl font-bold text-neutral dark:text-white mb-6">Form Elements</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Input fields -->
          <div class="bg-white dark:bg-neutral-focus p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold text-neutral dark:text-white mb-4">Input Fields</h3>
            
            <div class="mb-4">
              <label class="block text-neutral dark:text-white text-sm font-medium mb-2" for="username">
                Username
              </label>
              <input id="username" type="text" placeholder="Enter username" 
                class="w-full px-3 py-2 border border-neutral rounded-md focus:outline-none focus:ring-2 focus:ring-brand dark:bg-neutral dark:text-white dark:border-neutral-content">
            </div>
            
            <div class="mb-4">
              <label class="block text-neutral dark:text-white text-sm font-medium mb-2" for="password">
                Password
              </label>
              <input id="password" type="password" placeholder="Enter password" 
                class="w-full px-3 py-2 border border-neutral rounded-md focus:outline-none focus:ring-2 focus:ring-complementary dark:bg-neutral dark:text-white dark:border-neutral-content">
            </div>
            
            <div>
              <label class="flex items-center">
                <input type="checkbox" class="h-4 w-4 text-accent border-neutral rounded focus:ring-accent dark:border-neutral-content">
                <span class="ml-2 text-neutral dark:text-white">Remember me</span>
              </label>
            </div>
          </div>
          
          <!-- Selection elements -->
          <div class="bg-white dark:bg-neutral-focus p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold text-neutral dark:text-white mb-4">Selection Elements</h3>
            
            <div class="mb-4">
              <label class="block text-neutral dark:text-white text-sm font-medium mb-2" for="category">
                Documentary Category
              </label>
              <select id="category" 
                class="w-full px-3 py-2 border border-neutral rounded-md focus:outline-none focus:ring-2 focus:ring-accent dark:bg-neutral dark:text-white dark:border-neutral-content">
                <option>Wildlife</option>
                <option>Culture</option>
                <option>History</option>
                <option>Politics</option>
              </select>
            </div>
            
            <div>
              <label class="block text-neutral dark:text-white text-sm font-medium mb-2">
                Preferred Length
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="radio" name="length" class="h-4 w-4 text-brand border-neutral focus:ring-brand dark:border-neutral-content">
                  <span class="ml-2 text-neutral dark:text-white">Short (< 30 min)</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="length" class="h-4 w-4 text-brand border-neutral focus:ring-brand dark:border-neutral-content">
                  <span class="ml-2 text-neutral dark:text-white">Medium (30-60 min)</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="length" class="h-4 w-4 text-brand border-neutral focus:ring-brand dark:border-neutral-content">
                  <span class="ml-2 text-neutral dark:text-white">Long (> 60 min)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Check for system preference on initial load
onMounted(() => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});
</script>

<style>
/* Add any custom styles here if needed */
</style>