<script setup lang="ts">
import { useAdminUser } from '../../composables/useAdminUser';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  lastLogin: string | null;
  createdAt: string;
  subscription: {
    active: boolean;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    priceId?: string;
    currentPeriodEnd?: number;
    status?: string;
    cancelAtPeriodEnd?: boolean;
    updatedAt?: string;
  } | null;
}

// Add admin user composable
const { user: adminUser } = useAdminUser();

const users = ref<User[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');

// Get all users from Firestore
const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await $fetch<User[]>('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${await adminUser.value?.getIdToken()}`
      }
    });
    users.value = response;
  } catch (err) {
    console.error('Failed to fetch users:', err);
    error.value = 'Failed to load users. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Filtered users based on search
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.email.toLowerCase().includes(query) || 
    user.displayName?.toLowerCase().includes(query)
  );
});

// Format date
const formatDate = (timestamp: string | number | null) => {
  if (!timestamp) return 'Never';
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp * 1000) 
    : new Date(timestamp);
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get subscription status badge class
const getSubscriptionClass = (user: User) => {
  if (!user.subscription) return 'bg-gray-100 text-gray-800';
  
  if (user.subscription.active && user.subscription.status === 'active') {
    return 'bg-green-100 text-green-800';
  } else if (user.subscription.status === 'trialing') {
    return 'bg-blue-100 text-blue-800';
  } else if (user.subscription.status === 'past_due') {
    return 'bg-yellow-100 text-yellow-800';
  } else if (user.subscription.cancelAtPeriodEnd) {
    return 'bg-orange-100 text-orange-800';
  } else {
    return 'bg-red-100 text-red-800';
  }
};

// Get subscription status text
const getSubscriptionStatus = (user: User) => {
  if (!user.subscription) return 'No subscription';
  
  if (user.subscription.status === 'active') {
    return user.subscription.cancelAtPeriodEnd 
      ? 'Canceling' 
      : 'Active';
  }
  
  return user.subscription.status 
    ? user.subscription.status.charAt(0).toUpperCase() + user.subscription.status.slice(1)
    : 'Unknown';
};

// Show user details modal
const showUserDetails = (user: User) => {
 console.log(user);
};

// Load users on component mount
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div>
    <AdminNav />
    
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">User Management</h1>
        <p class="text-gray-600 mt-1">Manage user accounts and subscriptions</p>
      </div>
      
      <!-- Search Bar -->
      <div class="flex mb-6">
        <div class="relative flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <span class="absolute right-3 top-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
        <button 
          @click="fetchUsers"
          class="ml-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Loading users...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg">
        <p>{{ error }}</p>
      </div>
      
      <!-- Users Table -->
      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renews</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 relative">
                    <img 
                      v-if="user.photoURL" 
                      :src="user.photoURL" 
                      :alt="user.displayName || user.email" 
                      class="h-10 w-10 rounded-full object-cover"
                    >
                    <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-gray-500 font-medium text-sm">
                        {{ user.email.substring(0, 2).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.displayName || 'No name' }}
                    </div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.lastLogin) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', getSubscriptionClass(user)]">
                  {{ getSubscriptionStatus(user) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.subscription?.currentPeriodEnd ? formatDate(user.subscription.currentPeriodEnd) : 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a 
                  v-if="user.subscription?.stripeSubscriptionId"
                  :href="`https://dashboard.stripe.com/subscriptions/${user.subscription.stripeSubscriptionId}`"
                  target="_blank"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  View in Stripe
                </a>
                <button @click="showUserDetails(user)" class="text-gray-600 hover:text-gray-900">
                  Details
                </button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0" class="hover:bg-gray-50">
              <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                No users found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template> 