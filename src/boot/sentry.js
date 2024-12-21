import * as Sentry from '@sentry/vue'

export default ({ app, router }) => {
  Sentry.init({
    app,
    dsn: 'https://fbf6f17dc1de5d78955f7e69a6a16d76@o4507662781382656.ingest.us.sentry.io/4507662784069632',
    integrations: [
      Sentry.browserTracingIntegration({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router)
      }),
      Sentry.replayIntegration()
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/feat-sentry\.celebrity-fanalyzer\.pages\.dev/],
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  })

  console.info('[Sentry] Initialized successfully')
}
