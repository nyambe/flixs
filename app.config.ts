export default defineAppConfig({
  ui: {
    colors: {
      // 'orange' es la paleta base de Tailwind más cercana a Terracota (#ea6b1e);
      // el valor exacto lo fija --ui-primary en tailwind.css, apuntando a --color-brand.
      primary: 'orange'
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