<script setup lang="ts">
// pages/subscription/plans.vue
const config = useRuntimeConfig()
const { currentUser } = useAuth()

if (currentUser.value) {
  navigateTo('/movies')
}

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  recommended: boolean
  description: string
  savings?: string
}

const plans = ref<Plan[]>([
  {
    id: config.public.stripe.basicPriceId,
    name: 'Basic',
    price: 0, // placeholder
    interval: 'month',
    description: 'Perfect for individual movie lovers',
    features: [
      'Access to all standard movies',
      'Watch on one device at a time',
      'HD quality streaming',
      'Cancel anytime'
    ],
    recommended: false
  },
  {
    id: config.public.stripe.premiumPriceId,
    name: 'Premium',
    price: 0, // placeholder
    interval: 'year',
    description: 'Best value for movie enthusiasts',
    features: [
      'Access to all movies including exclusives',
      'Watch on up to 4 devices at once',
      '4K Ultra HD streaming',
      'Offline downloads',
      '2 months free included'
    ],
    recommended: true,
    savings: 'Save 2 months'
  },
  {
    id: config.public.stripe.educationPriceId,
    name: 'Education',
    price: 0, // placeholder
    interval: 'year',
    description: 'Perfect for schools and educational institutions',
    features: [
      '20 user licenses included',
      'Access to all educational content',
      'Classroom viewing mode',
      'Educational resources',
      'Dedicated support',
      '20% yearly discount'
    ],
    recommended: false,
    savings: 'Save 20%'
  }
])

// Fetch the real Stripe prices and map them dynamically
async function fetchPrices() {
  const { data: prices } = await useFetch('/api/stripe/prices')

  if (!prices.value) {
    console.error('Failed to load prices')
    return
  }

  // Update each plan's price and interval dynamically
  plans.value = plans.value.map(plan => {
    const matchedPrice = prices.value?.find(p => p.id === plan.id)

    if (!matchedPrice) {
      console.warn(`Price ID ${plan.id} not found!`)
      return plan
    }

    return {
      ...plan,
      price: matchedPrice.unit_amount / 100, // convert cents to euros
      interval: matchedPrice.recurring.interval,
    }
  })
}

// Call the function on component load
await fetchPrices()

const selectPlan = async (priceId: string) => {
  navigateTo(`/subscription/checkout?plan=${priceId}`)
}
</script>

<template>
  <div class="bg-black min-h-screen py-16 px-4">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-center text-white mb-4">Choose Your Plan</h1>
      <p class="text-lg text-center text-gray-300 mb-12 max-w-2xl mx-auto">
        Get unlimited access to African cinema and support local filmmakers.
        Switch or cancel anytime.
      </p>
      
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div 
          v-for="plan in plans" 
          :key="plan.id"
          :class="[
            'rounded-2xl p-6 flex flex-col',
            plan.recommended 
              ? 'bg-brand bg-opacity-10 border-2 border-brand' 
              : 'bg-gray-900 border border-gray-800'
          ]"
        >
          <div 
            v-if="plan.recommended" 
            class="bg-brand text-brand-content font-medium py-1 px-4 rounded-full self-start mb-4"
          >
            Most Popular
          </div>
          
          <h2 class="text-2xl font-bold mb-2 text-white">{{ plan.name }}</h2>
          <p class="text-gray-400 mb-4">{{ plan.description }}</p>
          
          <div class="mb-4">
            <span class="text-4xl font-bold text-white">€{{ plan.price }}</span>
            <span class="text-gray-400">/{{ plan.interval }}</span>
            <div v-if="plan.savings" class="text-brand-hover mt-1 font-medium">
              {{ plan.savings }}
            </div>
          </div>
          
          <ul class="mb-8 flex-grow">
            <li 
              v-for="feature in plan.features" 
              :key="feature" 
              class="flex items-start mb-3 text-gray-300"
            >
              <span class="text-brand mr-2">✓</span>
              <span>{{ feature }}</span>
            </li>
          </ul>
          
          <UButton
            :class="!plan.recommended ? 'bg-brand text-brand-content hover:bg-brand-hover' : 'bg-gray-900 text-gray-300 hover:bg-gray-800'"
            :variant="plan.recommended ? 'solid' : 'outline'"
            class="w-full"
            size="lg"
            @click="selectPlan(plan.id)"
          >
            Get {{ plan.name }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>