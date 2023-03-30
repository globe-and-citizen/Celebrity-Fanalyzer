import { BrowserTracing } from '@sentry/tracing'
import * as Sentry from '@sentry/vue'
import { boot } from 'quasar/wrappers'

export default boot(async ({ app, router }) => {
  if (process.env.VITE_SENTRY_ORG) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DNS,
      replaysOnErrorSampleRate: 1.0,
      // logErrors:true,
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
          tracingOrigins: ['localhost', 'my-site-url.com', /^\//]
        }),
        new Sentry.Replay()
      ],

      tracesSampleRate: 1.0
    })
  }
})
