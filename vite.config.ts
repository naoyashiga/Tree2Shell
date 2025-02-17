import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Tree2Shell/', // リポジトリ名に合わせる
  plugins: [react(), tailwindcss()],
})
