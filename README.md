# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Dependency overrides

`package.json` `overrides` keep known vulnerabilities out of the dependency tree:

- `@genkit-ai/firebase` is replaced by `stubs/genkit-firebase-disabled`. It is an
  optional dependency of `@genkit-ai/core`, imported only when
  `ENABLE_FIREBASE_MONITORING=true`, which Nekan does not use. The real plugin
  pins OpenTelemetry 1.25 through `@genkit-ai/google-cloud` (no newer release),
  with the advisories GHSA-8988-4f7v-96qf, GHSA-45rx-2jwx-cxfr and
  GHSA-qqmp-wf37-98f9.
- `@genkit-ai/core` uses OpenTelemetry 2.x (`@opentelemetry/core` 2.12,
  `sdk-node` 0.223) instead of 1.25. Genkit uses only `NodeSDK`,
  `ExportResultCode`, `hrTimeToMilliseconds` and `suppressTracing`, which 2.x
  still has; flows and their trace spans were checked to work.

`@genkit-ai/core` and `genkit-cli` still need zod 3 (`z.ZodEffects`,
`z.function().args`), and zod 3 has no release with the fix for
GHSA-mrhx-c7xc-m3w5. Genkit validates flow input with ajv against the JSON
Schema it derives, not with zod, so request data does not reach zod 3; its
own `zod.parse` calls are in the reflection API of `genkit start`, a local
development server.
