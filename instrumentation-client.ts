import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://12cb60f52840c57bf88089cfaa1ef923@o4510942178050048.ingest.us.sentry.io/4510942195089408",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
});
