<!-- pages/subscription/success.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { currentUser, userSubscription } = useAuth();
const route = useRoute();
const router = useRouter();

const sessionId = route.query.session_id as string;
const error = ref<string>('');
const loading = ref<boolean>(true);

onMounted(async () => {
  if (!sessionId) {
    error.value = t('Missing session ID.');
    loading.value = false;
    return;
  }

  if (!currentUser.value && !sessionId) {
    error.value = t('You must be signed in to view this page.');
    loading.value = false;
    return;
  }

  try {
    // Verify the session and update Firestore
    const response = await $fetch<{ success: boolean }>('/api/stripe/verify', {
      method: 'POST',
      body: { sessionId },
    });

    if (response.success) {
      // Update local state (userSubscription)
      userSubscription.value = { active: true };
    } else {
      error.value = t('Failed to verify payment.');
    }
  } catch (err) {
    error.value = t('An error occurred while verifying your payment.');
    console.error('Error verifying session:', err);
  } finally {
    loading.value = false;
  }
});

const goToMovies = () => {
  router.push('/movies');
};
</script>

<template>
  <div class="max-w-md mx-auto mt-16 mb-20">
    <h1 v-if="!error" class="text-3xl font-bold text-brand-focus mb-6">{{ t('Payment Successful') }}</h1>

    <UAlert v-if="error" color="red" class="mb-4" :title="error" />

    <UCard class="bg-neutral">
      <div v-if="loading" class="text-center">
        <USpinner color="brand" />
        <p class="text-neutral-content mt-2">{{ t('Verifying your payment...') }}</p>
      </div>
      <div v-else-if="!error" class="space-y-4">
        <p class="text-brand-focus">
          {{ t('Thank you for your subscription! Your plan is now active.') }}
        </p>
      </div>
      <template #footer>
        <UButton
          color="brand"
          variant="solid"
          class="w-full bg-brand text-brand-content hover:bg-brand-focus"
          :disabled="loading"
          @click="goToMovies"
        >
          {{ t('Go to Movies') }}
        </UButton>
      </template>
    </UCard>
  </div>
</template>