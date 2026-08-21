export default defineAppConfig({
  ui: {
    colors: {
      // 'orange' es la paleta base de Tailwind más cercana a Terracota (#ea6b1e);
      // el valor exacto lo fija --ui-primary en tailwind.css, apuntando a --color-brand.
      primary: 'orange',
      // Nuxt UI usa 'slate' (azulado) por defecto para fondos/bordes neutros
      // (paneles de dropdown, rings, etc.) — no coincide con nuestro obsidian
      // neutro. 'neutral' es la familia de grises de Tailwind sin sesgo de tono.
      neutral: 'neutral'
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