/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          siem: {
            bg: '#0a0e17',       // En koyu arka plan
            sidebar: '#111827',  // Yan menü rengi
            card: '#1f2937',     // Panel/Kart rengi
            border: '#374151',   // Çizgiler
            accent: '#3b82f6',   // Ana Mavi (Vurgu)
            alert: '#ef4444',    // Kırmızı (Tehdit)
            success: '#10b981',  // Yeşil (Güvenli)
          }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }