<!-- pages/auth/profile.vue -->
<script setup lang="ts">
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const { t } = useI18n();
const { currentUser } = useAuth();
const { $firebase } = useNuxtApp();

const schema = z.object({
  name: z.string().min(1, t('Name is required')),
  email: z.string().email(t('Invalid email address')).optional(),
  birthDate: z.string().optional(),
  phoneNumber: z.string().optional()
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: '',
  email: '',
  birthDate: '',
  phoneNumber: ''
});

const loading = ref<boolean>(false);
const error = ref<string>('');
const success = ref<string>('');
const subscriptionType = ref<string>('');
const subscriptionStatus = ref<string>('');
const subscriptionExpiry = ref<string>('');
const showSubscriptionModal = ref<boolean>(false);

// Initialize the form with the current user's data
onMounted(async () => {
  loading.value = true;
  if (currentUser.value) {
    state.name = currentUser.value.displayName || '';
    state.email = currentUser.value.email || '';
    
    // Fetch additional user data from Firestore
    try {
      const userDoc = await getDoc(doc($firebase.firestore, 'users', currentUser.value.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        state.birthDate = userData.birthDate || '';
        state.phoneNumber = userData.phoneNumber || '';
        subscriptionType.value = userData.subscriptionType || 'Basic';
        subscriptionStatus.value = userData.subscriptionStatus || 'Active';
        subscriptionExpiry.value = userData.subscriptionExpiry || '';
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      loading.value = false;
    }
  } else {
    error.value = t('You must be signed in to edit your profile.');
    loading.value = false;
  }
});

// Handle form submission
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (!currentUser.value) {
    error.value = t('You must be signed in to update your profile.');
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    // Update Firebase Authentication displayName
    await updateProfile(currentUser.value, { displayName: event.data.name });

    // Update Firestore with all user data
    await setDoc(
      doc($firebase.firestore, 'users', currentUser.value.uid),
      { 
        name: event.data.name,
        birthDate: event.data.birthDate,
        phoneNumber: event.data.phoneNumber,
        email: state.email, // Keep existing email from auth
      },
      { merge: true }
    );

    success.value = t('Profile updated successfully!');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('An unknown error occurred');
  } finally {
    loading.value = false;
  }
};

const openSubscriptionModal = () => {
  showSubscriptionModal.value = true;
};

const changeSubscription = async (newType: string) => {
  if (!currentUser.value) return;
  
  loading.value = true;
  error.value = '';
  success.value = '';
  
  try {
    // In a real application, this would connect to a payment processor
    // For now, we'll just update the subscription type in Firestore
    await setDoc(
      doc($firebase.firestore, 'users', currentUser.value.uid),
      { 
        subscriptionType: newType,
        subscriptionStatus: 'Active',
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      },
      { merge: true }
    );
    
    subscriptionType.value = newType;
    subscriptionStatus.value = 'Active';
    subscriptionExpiry.value = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
    showSubscriptionModal.value = false;
    success.value = t('Subscription updated successfully!');
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('An unknown error occurred');
    console.error('Error updating subscription:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-xl mx-auto mt-16 mb-8">
    <UCard>
      <template #header>
        <h1 class="text-3xl font-bold">{{ t('Edit Profile') }}</h1>
      </template>

      <UAlert v-if="error" color="error" class="mb-4" :title="error" />
      <UAlert v-if="success" color="success" class="mb-4" :title="success" />

      <template v-if="currentUser">
        <!-- Subscription Information Section -->
        <div class="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 class="text-xl font-semibold mb-3">{{ t('Subscription Information') }}</h3>
          <div class="grid gap-2">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{ t('Type') }}:</span>
              <span class="font-medium">{{ subscriptionType }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{ t('Status') }}:</span>
              <span class="font-medium">{{ subscriptionStatus }}</span>
            </div>
            <div v-if="subscriptionExpiry" class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{ t('Expiry Date') }}:</span>
              <span class="font-medium">{{ subscriptionExpiry }}</span>
            </div>
            <div class="mt-3">
              <UButton
                color="primary"
                variant="outline"
                size="sm"
                @click="openSubscriptionModal"
              >
                {{ t('Change Subscription') }}
              </UButton>
            </div>
          </div>
        </div>

        <UForm 
          :schema="schema" 
          :state="state" 
          @submit="onSubmit"
          class="space-y-4"
        >
          <UFormField 
            :label="t('Name')" 
            name="name"
          >
            <UInput
              v-model="state.name"
              type="text"
              :placeholder="t('Your Name')"
              :disabled="loading"
            />
          </UFormField>

          <UFormField 
            :label="t('Email')" 
            name="email"
          >
            <UInput
              v-model="state.email"
              type="email"
              placeholder="your.email@example.com"
              disabled
            />
            <template #description>
              <span class="text-sm text-gray-500">{{ t('Email cannot be changed') }}</span>
            </template>
          </UFormField>

          <UFormField 
            :label="t('Date of Birth')" 
            name="birthDate"
          >
            <UInput
              v-model="state.birthDate"
              type="date"
              :disabled="loading"
            />
          </UFormField>

          <UFormField 
            :label="t('Phone Number')" 
            name="phoneNumber"
          >
            <UInput
              v-model="state.phoneNumber"
              type="tel"
              placeholder="+34 123 456 789"
              :disabled="loading"
            />
          </UFormField>

          <div class="flex justify-between items-center pt-4">
            <UButton
              type="submit"
              color="primary"
              :loading="loading"
              :disabled="loading"
            >
              {{ t('Save Changes') }}
            </UButton>

            <NuxtLink to="/movies" class="text-(--ui-primary) hover:underline">
              {{ t('Back to Movies') }}
            </NuxtLink>
          </div>
        </UForm>
      </template>

      <template v-else>
        <div class="text-center py-6">
          <p class="text-(--ui-text-muted) mb-4">{{ t('Please sign in to edit your profile.') }}</p>
          <UButton
            color="primary"
            to="/auth/login"
          >
            {{ t('Sign In') }}
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Subscription Change Modal -->
    <UModal v-model="showSubscriptionModal">
      <UCard>
        <template #header>
          <h2 class="text-xl font-bold">{{ t('Change Subscription') }}</h2>
        </template>
        
        <div class="p-4 grid gap-4">
          <UButton
            block
            color="primary"
            @click="changeSubscription('Basic')"
            :loading="loading && subscriptionType === 'Basic'"
            :disabled="loading || subscriptionType === 'Basic'"
          >
            {{ t('Basic') }} - 4.99€/{{ t('month') }}
          </UButton>
          
          <UButton
            block
            color="primary"
            @click="changeSubscription('Premium')"
            :loading="loading && subscriptionType === 'Premium'"
            :disabled="loading || subscriptionType === 'Premium'"
          >
            {{ t('Premium') }} - 9.99€/{{ t('month') }}
          </UButton>
          
          <UButton
            block
            color="primary"
            @click="changeSubscription('Family')"
            :loading="loading && subscriptionType === 'Family'"
            :disabled="loading || subscriptionType === 'Family'"
          >
            {{ t('Family') }} - 14.99€/{{ t('month') }}
          </UButton>
        </div>
        
        <template #footer>
          <div class="flex justify-end">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showSubscriptionModal = false"
            >
              {{ t('Cancel') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>