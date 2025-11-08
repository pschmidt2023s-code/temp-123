# GlassBeats Monitoring & Observability Guide

## Overview

This document provides guidance on monitoring GlassBeats in production, with a focus on security-related metrics and rate limiting.

## Key Metrics to Monitor

### 1. Rate Limiting Metrics

**Why Monitor:**
- Detect potential DDoS attacks or API abuse
- Identify legitimate users being rate-limited (adjust limits if needed)
- Track usage patterns for capacity planning

**Metrics to Track:**

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `rate_limit_hits_total` | Total 429 responses by endpoint | >100/hour |
| `rate_limit_hits_by_ip` | 429 responses grouped by IP | >50/hour per IP |
| `rate_limit_admin_login` | Admin login 429s | >10/hour |
| `rate_limit_payment` | Payment endpoint 429s | >20/hour |
| `api_requests_total` | Total API requests | Baseline for comparison |

**Implementation:**

```typescript
// server/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';

const metrics = {
  rateLimitHits: new Map<string, number>(),
  ipRateLimits: new Map<string, number>(),
};

export function trackRateLimitHit(req: Request, res: Response, next: NextFunction) {
  if (res.statusCode === 429) {
    const endpoint = req.path;
    const ip = req.ip || 'unknown';
    
    // Track by endpoint
    metrics.rateLimitHits.set(endpoint, (metrics.rateLimitHits.get(endpoint) || 0) + 1);
    
    // Track by IP
    metrics.ipRateLimits.set(ip, (metrics.ipRateLimits.get(ip) || 0) + 1);
    
    // Log for external monitoring
    console.warn('[RATE_LIMIT]', {
      endpoint,
      ip,
      timestamp: new Date().toISOString(),
    });
  }
  next();
}

export function getMetrics() {
  return {
    rateLimitHits: Object.fromEntries(metrics.rateLimitHits),
    ipRateLimits: Object.fromEntries(metrics.ipRateLimits),
  };
}

// Endpoint to expose metrics
// GET /api/admin/metrics (protected by admin auth)
```

### 2. CSRF Protection Metrics

**Metrics to Track:**

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `csrf_validation_failures` | Failed CSRF validations | >50/hour |
| `csrf_failures_by_ip` | CSRF failures by IP | >10/hour per IP |
| `csrf_token_generation` | CSRF tokens generated | Track growth |

**What to Look For:**
- Sudden spikes in CSRF failures → Potential attack
- Single IP with many failures → Targeted attack attempt
- Pattern across multiple IPs → Distributed attack

### 3. Authentication Metrics

**Metrics to Track:**

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `failed_login_attempts` | Failed admin logins | >20/hour |
| `successful_logins` | Successful admin logins | Establish baseline |
| `session_invalidations` | Sessions invalidated | Spike detection |
| `2fa_failures` | Failed 2FA verifications | >10/hour |

### 4. Payment & Subscription Metrics

**Metrics to Track:**

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `payment_failures` | Failed payment attempts | >5% of total |
| `subscription_changes` | Tier changes | Spike detection |
| `coupon_usage` | Coupon redemptions | Anomaly detection |
| `refund_requests` | Payment refunds | >2% of transactions |

### 5. System Health Metrics

**Metrics to Track:**

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `http_response_time_p95` | 95th percentile response time | >500ms |
| `http_response_time_p99` | 99th percentile response time | >1000ms |
| `error_rate` | 5xx errors / total requests | >1% |
| `database_query_time` | Database query duration | >200ms |

## Monitoring Tools

### Recommended Stack

1. **Application Monitoring: Sentry**
   - Error tracking and performance monitoring
   - Real-user monitoring (RUM)
   - Free tier available

2. **Metrics: Prometheus + Grafana**
   - Time-series metrics storage
   - Flexible alerting
   - Beautiful dashboards

3. **Logging: Better Stack (formerly Logtail)**
   - Structured logging
   - Log aggregation
   - Real-time search

4. **Uptime Monitoring: UptimeRobot**
   - 5-minute interval checks
   - Email/SMS alerts
   - Free for up to 50 monitors

### Quick Setup: Sentry Integration

```typescript
// server/index.ts
import * as Sentry from "@sentry/node";

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% of transactions
  });
  
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// ... your routes ...

// Error handler (after all routes)
if (process.env.NODE_ENV === 'production') {
  app.use(Sentry.Handlers.errorHandler());
}
```

### Quick Setup: Prometheus Metrics

```bash
npm install prom-client
```

```typescript
// server/metrics.ts
import { register, Counter, Histogram } from 'prom-client';

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
});

export const rateLimitHits = new Counter({
  name: 'rate_limit_hits_total',
  help: 'Total rate limit hits',
  labelNames: ['endpoint'],
});

export const csrfFailures = new Counter({
  name: 'csrf_validation_failures_total',
  help: 'Total CSRF validation failures',
  labelNames: ['endpoint'],
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

## Alert Configuration

### Critical Alerts (Immediate Response)

1. **High Rate Limit Hits**
   - Threshold: >100 per hour on any endpoint
   - Action: Investigate logs, check for DDoS

2. **CSRF Attack Pattern**
   - Threshold: >50 failures per hour
   - Action: Review IP addresses, consider IP blocking

3. **Failed Admin Logins**
   - Threshold: >20 per hour
   - Action: Check for brute-force attempts, verify admin credentials

4. **High Error Rate**
   - Threshold: >5% 5xx errors
   - Action: Check application logs, database connectivity

5. **Payment System Down**
   - Threshold: >50% payment failures
   - Action: Check Stripe/PayPal integration, verify API keys

### Warning Alerts (Review Within Hours)

1. **Elevated Rate Limiting**
   - Threshold: >50 per hour
   - Action: Review usage patterns, consider adjusting limits

2. **Slow Response Times**
   - Threshold: P95 >500ms
   - Action: Investigate slow queries, optimize code

3. **Database Performance**
   - Threshold: Query time >200ms
   - Action: Review slow queries, add indexes

## Logging Best Practices

### Structured Logging

```typescript
// server/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'glassbeats-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Usage
logger.info('User login', { userId: 'user-123', ip: req.ip });
logger.warn('Rate limit hit', { endpoint: '/api/login', ip: req.ip });
logger.error('Database error', { error: err.message, stack: err.stack });
```

### What to Log

**DO Log:**
- Authentication events (login, logout, failures)
- Rate limit hits
- CSRF validation failures
- Payment transactions
- Admin actions (CRUD operations)
- System errors and warnings

**DON'T Log:**
- Passwords (plain or hashed)
- Session tokens or CSRF tokens
- Credit card numbers
- Personal identifiable information (PII) without consent
- Full request bodies (may contain sensitive data)

## Dashboard Examples

### Grafana Dashboard: Security Overview

**Panels:**
1. Rate Limit Hits (Time series)
2. CSRF Failures (Time series)
3. Failed Logins (Time series)
4. Top IPs by Request Count (Table)
5. HTTP Status Code Distribution (Pie chart)
6. Response Time P95/P99 (Time series)

### Grafana Dashboard: Business Metrics

**Panels:**
1. New Subscriptions (Time series)
2. Payment Success Rate (Gauge)
3. Active Users (Graph)
4. Revenue by Tier (Stacked area)
5. Churn Rate (Single stat)

## Incident Response Runbook

### DDoS Attack Detected

1. **Identify Source:**
   ```bash
   grep "429" /var/log/app.log | awk '{print $4}' | sort | uniq -c | sort -nr | head -20
   ```

2. **Temporary IP Block:**
   ```typescript
   // server/middleware/ipblock.ts
   const blockedIPs = new Set(['x.x.x.x', 'y.y.y.y']);
   
   app.use((req, res, next) => {
     if (blockedIPs.has(req.ip)) {
       return res.status(403).json({ error: 'Forbidden' });
     }
     next();
   });
   ```

3. **Reduce Rate Limits:**
   ```typescript
   export const emergencyLimiter = rateLimit({
     windowMs: 1 * 60 * 1000,
     max: 10, // Very restrictive
   });
   ```

4. **Enable CloudFlare Protection** (if available)

### CSRF Attack Pattern

1. **Review Logs:**
   ```bash
   grep "CSRF" /var/log/app.log | tail -100
   ```

2. **Check Affected Endpoints:**
   - Verify middleware is applied
   - Check token generation

3. **Verify Frontend:**
   - CSRF token in cookies
   - X-CSRF-Token header sent

### Database Issues

1. **Check Connection:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

2. **Review Slow Queries:**
   ```sql
   SELECT query, calls, total_time, mean_time 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

3. **Check Connections:**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

## Performance Optimization

### Database Optimization

1. **Add Indexes:**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
   CREATE INDEX idx_playlists_user_id ON playlists(user_id);
   ```

2. **Query Optimization:**
   - Use `EXPLAIN ANALYZE` to understand query plans
   - Avoid N+1 queries (use joins or batch fetches)
   - Paginate large result sets

### API Optimization

1. **Caching:**
   ```typescript
   import Redis from 'ioredis';
   const redis = new Redis(process.env.REDIS_URL);
   
   // Cache subscription tiers
   app.get('/api/subscription-tiers', async (req, res) => {
     const cached = await redis.get('tiers');
     if (cached) return res.json(JSON.parse(cached));
     
     const tiers = SUBSCRIPTION_TIERS;
     await redis.set('tiers', JSON.stringify(tiers), 'EX', 3600);
     res.json(tiers);
   });
   ```

2. **Compression:**
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

## Resources

- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Sentry Documentation](https://docs.sentry.io/)
- [Winston Logging](https://github.com/winstonjs/winston)

---

**Last Updated:** November 8, 2025  
**Maintained By:** GlassBeats DevOps Team
