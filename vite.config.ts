import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { viteSingleFile } from 'vite-plugin-singlefile'

// To load .env.local variables
const envVars = loadEnv('', process.cwd())

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: Number(envVars.VITE_APP_PORT || 3000),
    // open the browser
    open: true,
  },
  base: './',
  root: './src/source/',
  build: {
    outDir: '../../dist/target',
    assetsDir: './',
    sourcemap: true,
  },
  plugins: [
    react(),
    svgrPlugin(),
    ViteEjsPlugin(),
    viteSingleFile(),
  ],
  publicDir: './public',
})
