import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // A Vercel serve o projeto na raiz do domínio próprio
  // (https://saluttiempresarial.com.br/), diferente do GitHub Pages, que
  // exigia um subcaminho fixo. Com base: '/', os arquivos em dist/assets
  // são referenciados a partir da raiz, sem prefixo.
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
