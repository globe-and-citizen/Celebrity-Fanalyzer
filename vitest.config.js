import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import jsconfigPaths from 'vite-jsconfig-paths'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    testTimeout: 50000,
    hookTimeout: 100000,
    retry: 3,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html']
    },
    setupFiles: 'vitest/setup-file.js',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    deps: {
      inline: ['vue-echarts', 'echarts']
    }
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: 'src/quasar-variables.scss'
    }),
    jsconfigPaths(),
    viteCommonjs(['vue-echarts'])
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: ['@web3modal/ethers5'],
    esbuildOptions: {
      target: 'es2020', // Ensure the target environment supports all features
      define: {
        global: 'globalThis'
      },
      supported: { 
        bigint: true 
      },
    },
   
  },
  // babel: {
  //   plugins: [
  //     '@babel/plugin-syntax-bigint'
  //   ]
  // }
})
