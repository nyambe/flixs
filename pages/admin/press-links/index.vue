<script setup lang="ts">
import type { PressLink } from '~/types'

const { t } = useI18n()
const {
  loading,
  error,
  getPressLinks,
  deletePressLink,
  formatExpirationDate,
  getLinkStatus
} = usePressLink()

const links = ref<PressLink[]>([])
const filterStatus = ref<'active' | 'expired' | 'inactive' | 'all'>('all')
const searchQuery = ref('')

// Fetch press links
const fetchLinks = async () => {
  const result = await getPressLinks(filterStatus.value)
  links.value = result
}

// Filtered links based on search
const filteredLinks = computed(() => {
  if (!searchQuery.value) return links.value

  const query = searchQuery.value.toLowerCase()
  return links.value.filter(link =>
    link.movieTitle.toLowerCase().includes(query) ||
    link.recipientName.toLowerCase().includes(query) ||
    link.recipientEmail.toLowerCase().includes(query) ||
    link.organization?.toLowerCase().includes(query)
  )
})

// Copy link to clipboard
const copyLink = async (token: string) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || window.location.origin
  const url = `${baseUrl}/press/watch/${token}`

  try {
    await navigator.clipboard.writeText(url)
    alert(t('press.linkCopied'))
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

// Delete a press link
const handleDelete = async (id: string) => {
  if (!confirm(t('press.confirmDelete'))) return

  const success = await deletePressLink(id)
  if (success) {
    await fetchLinks()
  }
}

// Get status badge class
const getStatusClass = (link: PressLink) => {
  const status = getLinkStatus(link)
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Load links on mount
onMounted(() => {
  fetchLinks()
})

// Reload when filter changes
watch(filterStatus, () => {
  fetchLinks()
})
</script>

<template>
  <div>
    <!-- Admin Navigation -->
    <AdminNav />

    <div class="px-6 py-8">
      <!-- Page Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold mb-2">{{ t('press.title') }}</h1>
          <p class="text-gray-600">{{ t('press.description') }}</p>
        </div>
        <NuxtLink
          to="/admin/press-links/create"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
        >
          {{ t('press.createLink') }}
        </NuxtLink>
      </div>

      <!-- Filters and Search -->
      <div class="mb-6 flex gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('press.searchPlaceholder')"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>
        <select
          v-model="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">{{ t('press.filterAll') }}</option>
          <option value="active">{{ t('press.filterActive') }}</option>
          <option value="expired">{{ t('press.filterExpired') }}</option>
          <option value="inactive">{{ t('press.filterInactive') }}</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{{ error }}</p>
      </div>

      <!-- Links Table -->
      <div v-else class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('press.movie') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('press.recipient') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('press.created') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('press.expires') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('press.views') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('press.status') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('press.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="link in filteredLinks" :key="link.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ link.movieTitle }}</div>
                <div class="text-sm text-gray-500">ID: {{ link.movieId }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ link.recipientName }}</div>
                <div class="text-sm text-gray-500">{{ link.recipientEmail }}</div>
                <div v-if="link.organization" class="text-sm text-gray-400">{{ link.organization }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(link.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatExpirationDate(link.expiresAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ link.viewCount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getStatusClass(link)"
                >
                  {{ t(`press.status${getLinkStatus(link).charAt(0).toUpperCase() + getLinkStatus(link).slice(1)}`) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="copyLink(link.token)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    {{ t('press.copy') }}
                  </button>
                  <NuxtLink
                    :to="`/admin/press-links/${link.id}`"
                    class="text-green-600 hover:text-green-900"
                  >
                    {{ t('press.view') }}
                  </NuxtLink>
                  <button
                    @click="handleDelete(link.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    {{ t('press.delete') }}
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredLinks.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                {{ t('press.noLinks') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
