# Noise Fixes

Read the project's Sentry config file (detected in Step 0c). Locate the `ignoreErrors` array or `beforeSend` function.

**Universal noise patterns** (safe to add to any web project):

```javascript
// Browser/extension noise
/^Script error/,
"ResizeObserver loop",
"Non-Error promise rejection captured",
/vid_mate_check/,
/_avast_submit/,

// Network noise (external)
"Failed to fetch",
"Load failed",
"net::ERR_",
"AbortError",
"The operation was aborted",
"cancelled",

// Chunk loading (deployment race)
"ChunkLoadError",
"Loading chunk",
"Failed to fetch dynamically imported module",
```

**Framework-specific noise** (add only if the framework is detected):

React/Next.js:
```javascript
"Hydration failed",
"server rendered HTML didn't match",
"Minified React error #418",
"Minified React error #423",
"Minified React error #425",
```

HMR/Dev-only:
```javascript
"Fast Refresh",
"performing full reload",
"Parsing ecmascript source code failed",
```

Service Worker:
```javascript
"ServiceWorker",
"Failed to register a ServiceWorker",
```

**Noise validation**: classify as noise only when the message does not originate from app code, no app frames appear in the stacktrace, and no real user action can trigger it.
