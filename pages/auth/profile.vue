<!-- pages/auth/profile.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { currentUser } = useAuth();

const { $firebase } = useNuxtApp();

const name = ref<string>('');
const loading = ref<boolean>(false);
const error = ref<string>('');
const success = ref<string>('');

// Initialize the form with the current user's name
onMounted(() => {
  if (currentUser.value) {
    name.value = currentUser.value.displayName || '';
  } else {
    error.value = t('You must be signed in to edit your profile.');
  }
});

// Handle form submission
const handleSubmit = async () => {
  if (!currentUser.value) {
    error.value = t('You must be signed in to update your profile.');
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    // Update Firebase Authentication displayName
    await updateProfile(currentUser.value, { displayName: name.value });

    // Update Firestore
    await setDoc(
    doc($firebase.firestore, 'users', currentUser.value.uid),
      { name: name.value },
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
  <div class="max-w-md mx-auto mt-16 mb-20">
    <h1 class="text-3xl font-bold text-brand-content mb-6">{{ t('Edit Profile') }}</h1>

    <UAlert v-if="error" color="error" class="mb-4" :title="error" />
    <UAlert v-if="success" color="success" class="mb-4" :title="success" />

    <UCard v-if="currentUser" class="bg-neutral" >
      <UForm @submit="handleSubmit">
        <UFormItem :label="t('Name')" name="name" class="mb-4">
          <UInput
            v-model="name"
            type="text"
            placeholder="Your Name"
            required
            :disabled="loading"
          />
        </UFormItem>

        <div class="flex justify-between items-center">
          <UButton
            type="submit"
            color="primary"
            class="bg-brand text-brand-content hover:bg-brand-focus"
            :loading="loading"
            :disabled="loading"
          >
            {{ t('Save Changes') }}
          </UButton>

          <NuxtLink to="/movies" class="text-brand hover:underline">
            {{ t('Back to Movies') }}
          </NuxtLink>
        </div>
      </UForm>
    </UCard>

    <div v-else class="text-center">
      <p class="text-support-content mb-4">{{ t('Please sign in to edit your profile.') }}</p>
      <UButton
        color="white"
        variant="outline"
        to="/auth/login"
      >
        {{ t('Sign In') }}
      </UButton>
    </div>
  </div>
</template>