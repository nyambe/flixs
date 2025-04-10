<!-- pages/auth/profile.vue -->
<script setup lang="ts">
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const { t } = useI18n();
const { currentUser } = useAuth();
const { $firebase } = useNuxtApp();

const schema = z.object({
  name: z.string().min(1, t('Name is required'))
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: ''
});

const loading = ref<boolean>(false);
const error = ref<string>('');
const success = ref<string>('');

// Initialize the form with the current user's name
onMounted(() => {
  if (currentUser.value) {
    state.name = currentUser.value.displayName || '';
  } else {
    error.value = t('You must be signed in to edit your profile.');
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

    // Update Firestore
    await setDoc(
      doc($firebase.firestore, 'users', currentUser.value.uid),
      { name: event.data.name },
      { merge: true }
    );

    success.value = t('Profile updated successfully!');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('An unknown error occurred');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-16 mb-8">
    <UCard>
      <UCardTitle class="text-3xl font-bold">{{ t('Edit Profile') }}</UCardTitle>

      <UAlert v-if="error" color="error" class="mb-4" :title="error" />
      <UAlert v-if="success" color="success" class="mb-4" :title="success" />

      <template v-if="currentUser">
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
              placeholder="Your Name"
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
  </div>
</template>