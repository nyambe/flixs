export default defineAppConfig({
  ui: {
    colors: {
      primary: 'amber'
    }
  },
  features: {
    // Toggle newsletter subscription feature on/off
    newsletter: {
      enabled: false, // Set to true to enable newsletter signup
      showOnHomepage: false // Show subscription hero on homepage for non-logged-in users
    }
  }
}) 