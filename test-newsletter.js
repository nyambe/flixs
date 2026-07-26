// Test script for newsletter functionality
// Targets local/staging by default — never production, to avoid writing test data into real systems.
// Override with TEST_NEWSLETTER_BASE_URL if you need to point at a staging deployment.
const baseUrl = process.env.TEST_NEWSLETTER_BASE_URL || 'http://localhost:3000'

if (baseUrl.includes('flixs.vercel.app') || baseUrl.includes('flixs-git-main-sebukas-projects.vercel.app')) {
  console.error('❌ Refusing to run against production. Use TEST_NEWSLETTER_BASE_URL to target local or staging instead.')
  process.exit(1)
}

const testEmail = process.env.TEST_NEWSLETTER_EMAIL || 'test@example.com'
const testUrl = `${baseUrl}/api/newsletter/subscribe`

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