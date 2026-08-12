import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    watch: {
      // External USB media can briefly report EBUSY to Node's native watcher.
      // Static video assets do not need HMR, so keep them out of the watcher.
      usePolling: true,
      interval: 1000,
      binaryInterval: 2000,
      ignored: [
        '**/public/projects/**',
        '**/*.{mp4,mov,mkv,avi,webm,m4v}',
      ],
    },
  },
  plugins: [react()],
})
