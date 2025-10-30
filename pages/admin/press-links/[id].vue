<script setup lang="ts">
import type { PressLink } from '~/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const {
  loading,
  error,
  getPressLink,
  updatePressLink,
  deletePressLink,
  formatExpirationDate,
  getLinkStatus
} = usePressLink()

const linkId = route.params.id as string
const link = ref<PressLink | null>(null)
const editMode = ref(false)

// Form data for editing
const formData = ref({
  recipientName: '',
  recipientEmail: '',
  organization: '',
  expirationDays: 14,
  password: '',
  active: true,
  notes: ''
})

// Fetch press link
const fetchLink = async () => {
  const result = await getPressLink(linkId)
  if (result) {
    link.value = result
    // Populate form data
    formData.value = {
      recipientName: result.recipientName,
      recipientEmail: result.recipientEmail,
      organization: result.organization || '',
      expirationDays: Math.ceil((result.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)),
      password: '',
      active: result.active,
      notes: result.notes || ''
    }
  }
}

// Copy link to clipboard
const copyLink = async () => {
  if (!link.value) return

  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || window.location.origin
  const url = `${baseUrl}/press/watch/${link.value.token}`

  try {
    await navigator.clipboard.writeText(url)
    alert(t('press.linkCopied'))
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

// Save changes
const handleSave = async () => {
  if (!link.value) return

  const expiresAt = Date.now() + (formData.value.expirationDays * 24 * 60 * 60 * 1000)

  const result = await updatePressLink(linkId, {
    recipientName: formData.value.recipientName,
    recipientEmail: formData.value.recipientEmail,
    organization: formData.value.organization || undefined,
    expiresAt,
    password: formData.value.password || undefined,
    active: formData.value.active,
    notes: formData.value.notes || undefined
  })

  if (result) {
    link.value = result.link
    editMode.value = false
    alert(t('press.updateSuccess'))
  }
}

// Delete link
const handleDelete = async () => {
  if (!confirm(t('press.confirmDelete'))) return

  const success = await deletePressLink(linkId)
  if (success) {
    router.push('/admin/press-links')
  }
}

// Get status badge class
const getStatusClass = computed(() => {
  if (!link.value) return 'bg-gray-100 text-gray-800'

  const status = getLinkStatus(link.value)
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
})

// Load link on mount
onMounted(() => {
  fetchLink()
})
</script>

<template>
  <div>
    <!-- Admin Navigation -->
    <AdminNav />

    <div class="px-6 py-8 max-w-5xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <NuxtLink
            to="/admin/press-links"
            class="text-gray-600 hover:text-gray-900"
          >
            ← {{ t('press.back') }}
          </NuxtLink>
        </div>
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold mb-2">{{ t('press.linkDetails') }}</h1>
            <p class="text-gray-600">{{ link?.movieTitle }}</p>
          </div>
          <span
            v-if="link"
            class="px-3 py-1 text-sm font-semibold rounded-full"
            :class="getStatusClass"
          >
            {{ t(`press.status${getLinkStatus(link).charAt(0).toUpperCase() + getLinkStatus(link).slice(1)}`) }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{{ error }}</p>
      </div>

      <!-- Link Details -->
      <div v-else-if="link" class="space-y-6">
        <!-- Link Info -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-lg font-semibold">{{ t('press.linkInformation') }}</h2>
            <button
              @click="copyLink"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {{ t('press.copyLink') }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">{{ t('press.created') }}:</span>
              <span class="ml-2 font-medium">{{ new Date(link.createdAt).toLocaleString() }}</span>
            </div>
            <div>
              <span class="text-gray-500">{{ t('press.createdBy') }}:</span>
              <span class="ml-2 font-medium">{{ link.createdBy }}</span>
            </div>
            <div>
              <span class="text-gray-500">{{ t('press.expires') }}:</span>
              <span class="ml-2 font-medium">{{ formatExpirationDate(link.expiresAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">{{ t('press.passwordProtected') }}:</span>
              <span class="ml-2 font-medium">{{ link.password ? t('common.yes') : t('common.no') }}</span>
            </div>
          </div>
        </div>

        <!-- Recipient Info -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-lg font-semibold">{{ t('press.recipientInformation') }}</h2>
            <button
              v-if="!editMode"
              @click="editMode = true"
              class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              {{ t('press.edit') }}
            </button>
          </div>

          <div v-if="!editMode" class="space-y-3 text-sm">
            <div>
              <span class="text-gray-500">{{ t('press.recipientName') }}:</span>
              <span class="ml-2 font-medium">{{ link.recipientName }}</span>
            </div>
            <div>
              <span class="text-gray-500">{{ t('press.recipientEmail') }}:</span>
              <span class="ml-2 font-medium">{{ link.recipientEmail }}</span>
            </div>
            <div v-if="link.organization">
              <span class="text-gray-500">{{ t('press.organization') }}:</span>
              <span class="ml-2 font-medium">{{ link.organization }}</span>
            </div>
            <div v-if="link.notes">
              <span class="text-gray-500">{{ t('press.notes') }}:</span>
              <p class="mt-1 text-gray-700">{{ link.notes }}</p>
            </div>
          </div>

          <!-- Edit Form -->
          <form v-else @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('press.recipientName') }}
              </label>
              <input
                v-model="formData.recipientName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('press.recipientEmail') }}
              </label>
              <input
                v-model="formData.recipientEmail"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('press.organization') }}
              </label>
              <input
                v-model="formData.organization"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('press.expirationDays') }}
              </label>
              <input
                v-model.number="formData.expirationDays"
                type="number"
                min="1"
                max="90"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('press.newPassword') }}
              </label>
              <input
                v-model="formData.password"
                type="text"
                :placeholder="t('press.leaveBlankToKeep')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
            </div>
            <div>
              <label class="flex items-center">
                <input
                  v-model="formData.active"
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 mr-2"
                >
                <span class="text-sm font-medium text-gray-700">{{ t('press.active') }}</span>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('press.notes') }}
              </label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              ></textarea>
            </div>
            <div class="flex gap-2">
              <button
                type="submit"
                :disabled="loading"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {{ t('press.saveChanges') }}
              </button>
              <button
                type="button"
                @click="editMode = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {{ t('press.cancel') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Analytics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4">{{ t('press.analytics') }}</h2>
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-3xl font-bold text-indigo-600">{{ link.viewCount }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ t('press.totalViews') }}</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-900">
                {{ link.firstViewedAt ? new Date(link.firstViewedAt).toLocaleDateString() : '-' }}
              </div>
              <div class="text-sm text-gray-600 mt-1">{{ t('press.firstViewed') }}</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-900">
                {{ link.lastViewedAt ? new Date(link.lastViewedAt).toLocaleDateString() : '-' }}
              </div>
              <div class="text-sm text-gray-600 mt-1">{{ t('press.lastViewed') }}</div>
            </div>
          </div>

          <!-- View History -->
          <div v-if="link.views.length > 0">
            <h3 class="text-sm font-semibold mb-3">{{ t('press.viewHistory') }}</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {{ t('press.timestamp') }}
                    </th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {{ t('press.ipAddress') }}
                    </th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {{ t('press.duration') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(view, index) in link.views" :key="index">
                    <td class="px-4 py-2 whitespace-nowrap">
                      {{ new Date(view.timestamp).toLocaleString() }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap font-mono text-xs">
                      {{ view.ipAddress }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap">
                      {{ view.duration ? `${Math.round(view.duration / 60)}m` : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-500">
            {{ t('press.noViews') }}
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <h2 class="text-lg font-semibold text-red-600 mb-4">{{ t('press.dangerZone') }}</h2>
          <button
            @click="handleDelete"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ t('press.deleteLink') }}
          </button>
          <p class="text-sm text-gray-600 mt-2">
            {{ t('press.deleteWarning') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
