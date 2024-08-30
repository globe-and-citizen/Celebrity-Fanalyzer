/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const { configure } = require('quasar/wrappers')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })
module.exports = configure(function (ctx) {
  return {
    eslint: {
      warnings: true,
      errors: true
    },

    // App boot file (/src/boot)
    boot: ['tanstack-query'],

    // CSS to include
    css: ['app.css'],

    // Extras to include (like fonts, icons)
    extras: ['roboto-font', 'material-icons'],

    // Build configuration
    build: {
      sourceMap: false, // Disable source maps for production
      target: {
        browser: 'es2020', // Use modern ECMAScript for browser support
        node: 'node18' // Ensure compatibility with Node.js 18
      },
      vueRouterMode: 'history', // Use 'history' mode for Vue Router

      extendViteConf(viteConf) {
        viteConf.build.rollupOptions = {
          output: {
            manualChunks(id) {
              const chunks = [
                '@quasar/extras',
                'echarts',
                'firebase',
                'pinia',
                'quasar',
                'vue',
                'vue-echarts',
                'vue-router',
                '@ternakkode/layer8-interceptor'
              ]
              if (id.includes('/node_modules/')) {
                for (const chunkName of chunks) {
                  if (id.includes(chunkName)) {
                    return chunkName
                  }
                }
              }
            }
          }
        }
        viteConf.optimizeDeps = {
          include: ['@web3modal/ethers5'],
          esbuildOptions: {
            target: 'es2020', // Ensure the target environment supports all features
            define: {
              global: 'globalThis'
            },
            supported: {
              bigint: true
            }
          }
        }
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      open: false // Disable automatic browser opening
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {
        brand: {
          primary: '#e54757',
          secondary: '#5e6776',
          accent: '#9C27B0',

          dark: '#1d1d1d',
          'dark-page': '#121212',

          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037'
        },
        notify: {
          color: 'primary',
          position: 'top',
          progress: true,
          timeout: 2500
        }
      },

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['BottomSheet', 'LocalStorage', 'Notify', 'Loading']
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: ['slideInDown'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-sourcefiles
    sourceFiles: {
      pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
      pwaServiceWorker: 'src-pwa/custom-service-worker',
      pwaManifestFile: 'src-pwa/manifest.json'
      //   rootComponent: 'src/App.vue',
      //   router: 'src/router/index',
      //   store: 'src/store/index',
      //   registerServiceWorker: 'src-pwa/register-service-worker',
      //   serviceWorker: 'src-pwa/custom-service-worker',
      //   electronMain: 'src-electron/electron-main',
      //   electronPreload: 'src-electron/electron-preload'
    },

    // https://v2.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render' // keep this as last one
      ]
    },

    // https://v2.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'generateSW', // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        appId: 'celebrity-fanalyzer'
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ['my-content-script']

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    }
  }
})
