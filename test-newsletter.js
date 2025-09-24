// Test script for newsletter functionality
const testEmail = 'samuel.ebuka@gmail.com' // Use your verified email for testing
const testUrl = 'https://flixs.vercel.app/api/newsletter/subscribe'

const testData = {
  email: testEmail,
  source: 'test_script',
  privacyConsent: true
}

console.log('🧪 Testing newsletter subscription API...')
console.log('📍 URL:', testUrl)
console.log('📝 Test data:', testData)

fetch(testUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log(`📊 Response status: ${response.status}`)
  return response.json()
})
.then(data => {
  console.log('✅ Response data:', data)
})
.catch(error => {
  console.error('❌ Test failed:', error)
})