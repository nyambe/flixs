<script setup lang="ts">
// pages/subscription/plans.vue
const config = useRuntimeConfig()
const { currentUser } = useAuth()

// Redirect if not logged in
if (currentUser.value) {
  navigateTo('/movies')
}

const plans = [
  {
    id: config.public.stripe.basicPriceId,
    name: 'Basic',
    price: 9.99,
    features: [
      'Access to all standard movies',
      'Watch on one device at a time',
      'HD quality streaming',
    ],
    recommended: false
  },
  {
    id: config.public.stripe.premiumPriceId,
    name: 'Premium',
    price: 14.99,
    features: [
      'Access to all movies including exclusives',
      'Watch on up to 4 devices at once',
      '4K Ultra HD streaming',
      'Offline downloads'
    ],
    recommended: true
  }
]

const selectPlan = async (priceId) => {
  // We'll implement this later with Stripe
  // For now, let's just redirect to a placeholder
  navigateTo('/subscription/checkout?plan=' + priceId)
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
    
    <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div 
        v-for="plan in plans" 
        :key="plan.id"
        :class="[
          'border rounded-xl p-6 flex flex-col',
          plan.recommended ? 'border-primary-500 shadow-lg' : 'border-gray-200'
        ]"
      >
        <div 
          v-if="plan.recommended" 
          class="bg-primary-500 text-white font-medium py-1 px-4 rounded-full self-start mb-4"
        >
          Recommended
        </div>
        
        <h2 class="text-2xl font-bold mb-2">{{ plan.name }}</h2>
        <div class="text-3xl font-bold mb-4">${{ plan.price }}<span class="text-lg font-normal">/month</span></div>
        
        <ul class="mb-6 flex-grow">
          <li v-for="feature in plan.features" :key="feature" class="flex items-start mb-2">
            <span class="text-green-500 mr-2">✓</span>
            <span>{{ feature }}</span>
          </li>
        </ul>
        
        <UButton
          color="primary"
          block
          :variant="plan.recommended ? 'solid' : 'soft'"
          @click="selectPlan(plan.id)"
        >
          Select {{ plan.name }}
        </UButton>
      </div>
    </div>
  </div>
</template>