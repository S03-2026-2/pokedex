import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const { VITE_API_URL: target } = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react()],
    server: {
      proxy: target && /^https?:\/\//i.test(target) ? {
        '/collection-api': {
          target,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/collection-api/, ''),
        },
      } : undefined,
    },
  }
})
