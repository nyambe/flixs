<script setup lang="ts">
interface StripePlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
  trialPeriodDays: number | null;
  active: boolean;
}

interface APISettings {
  vimeo: {
    accessTokenMasked: string;
    userId: string;
  };
  stripe: {
    publicKeyMasked: string;
    webhookUrl: string;
  };
}

const plans = ref<StripePlan[]>([]);
const apiSettings = ref<APISettings | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Fetch plans and settings
const fetchSettings = async () => {
  loading.value = true;
  error.value = null;
  successMessage.value = null;
  
  try {
    const response = await $fetch<{ plans: StripePlan[], apiSettings: APISettings }>('/api/admin/settings');
    plans.value = response.plans;
    apiSettings.value = response.apiSettings;
  } catch (err) {
    console.error('Failed to fetch settings:', err);
    error.value = 'Failed to load settings. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  }).format(amount / 100);
};

// Copy webhook URL to clipboard
const copyWebhookUrl = () => {
  if (!apiSettings.value) return;
  
  navigator.clipboard.writeText(apiSettings.value.stripe.webhookUrl)
    .then(() => {
      successMessage.value = 'Webhook URL copied to clipboard';
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);
    })
    .catch(err => {
      console.error('Failed to copy:', err);
      error.value = 'Failed to copy to clipboard';
    });
};

// Load settings on mount
onMounted(() => {
  fetchSettings();
});
</script>

<template>
  <div>
    <AdminNav />
    
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Settings</h1>
        <p class="text-gray-600 mt-1">Manage API integrations and subscription plans</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Loading settings...</p>
      </div>
      
      <!-- Error Message -->
      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{{ error }}</p>
      </div>
      
      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
        <p>{{ successMessage }}</p>
      </div>
      
      <div v-if="!loading && !error" class="space-y-8">
        <!-- API Settings Section -->
        <div v-if="apiSettings" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold">API Settings</h2>
          </div>
          
          <div class="p-6 space-y-6">
            <!-- Vimeo Settings -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium">Vimeo Integration</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">API Token</label>
                  <div class="flex items-center">
                    <input
                      type="text"
                      readonly
                      :value="apiSettings.vimeo.accessTokenMasked"
                      class="bg-gray-100 rounded-md py-2 px-3 text-gray-700 w-full"
                    />
                    <a
                      href="https://developer.vimeo.com/apps"
                      target="_blank"
                      class="ml-3 text-blue-600 hover:text-blue-800"
                    >
                      Manage
                    </a>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <div class="flex items-center">
                    <input
                      type="text"
                      readonly
                      :value="apiSettings.vimeo.userId"
                      class="bg-gray-100 rounded-md py-2 px-3 text-gray-700 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Stripe Settings -->
            <div class="space-y-4 pt-4 border-t border-gray-200">
              <h3 class="text-lg font-medium">Stripe Integration</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
                  <div class="flex items-center">
                    <input
                      type="text"
                      readonly
                      :value="apiSettings.stripe.publicKeyMasked"
                      class="bg-gray-100 rounded-md py-2 px-3 text-gray-700 w-full"
                    />
                    <a
                      href="https://dashboard.stripe.com/apikeys"
                      target="_blank"
                      class="ml-3 text-blue-600 hover:text-blue-800"
                    >
                      Manage
                    </a>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                  <div class="flex items-center">
                    <input
                      type="text"
                      readonly
                      :value="apiSettings.stripe.webhookUrl"
                      class="bg-gray-100 rounded-md py-2 px-3 text-gray-700 w-full"
                    />
                    <button
                      @click="copyWebhookUrl"
                      class="ml-3 text-blue-600 hover:text-blue-800"
                    >
                      Copy
                    </button>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    Use this URL in your Stripe Dashboard when setting up webhooks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Subscription Plans Section -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold">Subscription Plans</h2>
          </div>
          
          <div class="p-6">
            <!-- Plans Table -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="plan in plans" :key="plan.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ plan.name }}</div>
                      <div class="text-xs text-gray-500">ID: {{ plan.id }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatCurrency(plan.amount, plan.currency) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ plan.interval }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ plan.trialPeriodDays ? `${plan.trialPeriodDays} days` : 'None' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[
                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                        plan.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]">
                        {{ plan.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a 
                        :href="`https://dashboard.stripe.com/products/${plan.id}`" 
                        target="_blank"
                        class="text-blue-600 hover:text-blue-900"
                      >
                        View in Stripe
                      </a>
                    </td>
                  </tr>
                  
                  <tr v-if="plans.length === 0">
                    <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No subscription plans found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="mt-6 flex justify-between">
              <p class="text-sm text-gray-500">
                Manage subscription plans directly in your Stripe Dashboard
              </p>
              
              <a 
                href="https://dashboard.stripe.com/products" 
                target="_blank"
                class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Manage in Stripe
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 