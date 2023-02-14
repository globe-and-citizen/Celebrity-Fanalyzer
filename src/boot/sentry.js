import { BrowserTracing } from '@sentry/tracing'
import * as Sentry from '@sentry/vue'
import { boot } from 'quasar/wrappers'

export default boot(async ({ app, router }) => {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DNS,
    // logErrors:true,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ['localhost', 'my-site-url.com', /^\//]
      })
    ],

    tracesSampleRate: 1.0
  })
})
