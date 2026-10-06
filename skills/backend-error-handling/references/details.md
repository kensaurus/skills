# Error logging and checklist

Error reporting helper and the full error-handling checklist referenced from `SKILL.md`.

## Error Logging & Monitoring

```typescript
// lib/error-reporting.ts

export function reportError(error: Error, context?: Record<string, unknown>) {
  // Development: log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, context)
    return
  }
  
  // Production: send to monitoring service
  // Sentry example:
  // Sentry.captureException(error, { extra: context })
  
  // Or custom logging:
  fetch('/api/log-error', {
    method: 'POST',
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {}) // Don't throw on logging failure
}
```

## Error Handling Checklist

### Server Side
- [ ] All Server Actions return `ActionResult<T>`
- [ ] Zod validation with user-friendly messages
- [ ] Known errors caught and mapped
- [ ] Unknown errors logged, generic message returned
- [ ] No sensitive info in error messages

### Client Side
- [ ] Error boundaries at page level
- [ ] Global error boundary for catastrophic failures
- [ ] Form field errors displayed inline
- [ ] Global errors shown in alert/toast
- [ ] Loading states during async operations
- [ ] Retry buttons where appropriate

### API
- [ ] Consistent error response shape
- [ ] Appropriate HTTP status codes
- [ ] Validation errors include field details
- [ ] Rate limiting with 429 response
- [ ] No stack traces in production

### Monitoring
- [ ] Error logging configured
- [ ] Alerts for critical errors
- [ ] Error rates tracked
- [ ] User-facing errors monitored
