'use strict';

// @genkit-ai/core imports @genkit-ai/firebase only when
// ENABLE_FIREBASE_MONITORING=true, and logs a warning instead of failing when
// it cannot. Nekan does not use Firebase monitoring, so this stand-in keeps
// the old OpenTelemetry tree of the real plugin out of node_modules.
function enableFirebaseTelemetry() {
  throw new Error('Firebase monitoring is not available in Nekan (stubs/genkit-firebase-disabled).');
}

module.exports = { enableFirebaseTelemetry };
