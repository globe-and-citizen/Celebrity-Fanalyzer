import {boot} from "quasar/wrappers";
import * as Sentry from "@sentry/vue";
import {BrowserTracing} from "@sentry/tracing";

export default boot(async ({app, router}) => {
  console.log("sentry loaded",  import.meta.env.VITE_SENTRY_DNS)
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DNS,
    // logErrors:true,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ["localhost", "my-site-url.com", /^\//],
      }),
    ],

    tracesSampleRate: 1.0,
  });
});
