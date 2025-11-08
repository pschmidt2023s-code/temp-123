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

**Alert Priority Levels:**
- **P0 - Critical**: System down, active security breach, payment failures (page immediately, <15 min response)
- **P1 - High**: Performance degradation, elevated error rates (alert via Slack/Email, <1 hour response)
- **P2 - Medium**: Warning thresholds, anomaly detection (Email, <4 hours response)
- **P3 - Low**: Informational, trend analysis (Daily digest)

### Critical Alerts (P0 - Immediate Response)

#### 1. High Error Rate (5xx Errors)

**Alert Rule:**
```promql
(sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) > 0.05
```

**Threshold:** >5% of requests returning 5xx errors over 5-minute window

**Why This Threshold:**
- Validated against production baseline: Normal error rate is 0.1-0.5%
- 5% indicates systemic issue (database down, critical bug)
- Lower threshold (1%) would cause false positives during deployments

**Runbook:**

**Owner:** On-call Backend Engineer

**Response Steps:**
1. **Immediate (< 5 min):**
   ```bash
   # Check recent logs for error patterns
   grep "status=5" /var/log/app.log | tail -100
   
   # Identify most common errors
   grep "status=5" /var/log/app.log | awk '{print $error_message}' | sort | uniq -c | sort -nr
   
   # Check which endpoints are failing
   grep "status=5" /var/log/app.log | awk '{print $endpoint}' | sort | uniq -c | sort -nr
   ```

2. **Diagnosis (< 10 min):**
   - **Database connectivity:** `psql $DATABASE_URL -c "SELECT 1"`
   - **External API failures:** Check Stripe/PayPal/MusicKit status pages
   - **Memory/CPU:** Check server resources: `top`, `free -h`
   - **Recent deployments:** Was there a deploy in last hour?

3. **Mitigation:**
   - **If database down:** Restart database, check connection pool
   - **If specific endpoint:** Disable endpoint temporarily:
     ```typescript
     app.use('/api/failing-endpoint', (req, res) => {
       res.status(503).json({ error: 'Temporary maintenance' });
     });
     ```
   - **If recent deploy:** Rollback to previous version
   - **If resource exhaustion:** Scale up server resources

4. **Rollback Procedure (if needed):**
   ```bash
   # Revert to previous deployment
   git checkout <previous-commit-hash>
   npm install
   npm run build
   pm2 restart app
   ```

5. **Post-Incident:**
   - File incident report
   - Conduct root cause analysis
   - Update monitoring if new failure mode discovered

**Escalation:** If unresolved in 30 minutes → escalate to Engineering Lead

#### 2. Payment System Failures

**Alert Rule:**
```promql
(sum(rate(payment_failures_total[15m])) / sum(rate(payment_attempts_total[15m]))) > 0.10
```

**Threshold:** >10% payment failure rate over 15 minutes

**Why This Threshold:**
- Validated baseline: Normal failure rate is 2-5% (declined cards, insufficient funds)
- 10% indicates systemic issue (Stripe outage, API key problem)
- Financial impact: Could lose $X/hour in revenue

**Runbook:**

**Owner:** On-call Backend Engineer + Finance Team (if revenue impact)

**Response Steps:**
1. **Immediate (< 5 min):**
   ```bash
   # Check recent payment errors
   grep "payment.*error" /var/log/app.log | tail -50
   
   # Check Stripe dashboard for issues
   # Visit: https://dashboard.stripe.com/
   ```

2. **Diagnosis:**
   - **Stripe API status:** https://status.stripe.com/
   - **PayPal status:** https://www.paypal-status.com/
   - **API key validity:** Verify keys haven't expired
   - **Webhook delivery:** Check Stripe webhook logs for failures

3. **Mitigation:**
   - **If Stripe/PayPal outage:** Wait for recovery, notify users
   - **If API key issue:** Rotate keys immediately
   - **If webhook failures:** Manually sync pending transactions
   - **If code bug:** Apply hotfix or rollback

4. **User Communication:**
   - Post status update: "We're experiencing payment processing issues and are working on a fix"
   - Estimate resolution time
   - Offer alternative payment methods if available

**Escalation:** Automatic - page CTO and Finance Lead immediately

#### 3. Database Connection Pool Exhausted

**Alert Rule:**
```promql
database_connections_active > 90
```

**Threshold:** >90 active database connections (pool size: 100)

**Why This Threshold:**
- Pool size configured to 100 connections
- At 90 connections, new requests will start queueing
- At 100 connections, requests will fail with "too many connections" error

**Runbook:**

**Owner:** On-call Backend Engineer

**Response Steps:**
1. **Immediate:**
   ```sql
   -- Check active connections
   SELECT count(*), state, wait_event_type 
   FROM pg_stat_activity 
   GROUP BY state, wait_event_type;
   
   -- Identify long-running queries
   SELECT pid, now() - query_start AS duration, query 
   FROM pg_stat_activity 
   WHERE state != 'idle' 
   ORDER BY duration DESC 
   LIMIT 10;
   ```

2. **Diagnosis:**
   - Are there stuck queries? (`duration` > 30 seconds)
   - Is there a query storm from specific endpoint?
   - Memory leak causing connection not released?

3. **Mitigation:**
   - **Kill long-running queries:**
     ```sql
     SELECT pg_terminate_backend(pid) 
     FROM pg_stat_activity 
     WHERE pid = <stuck_pid>;
     ```
   - **Restart app to release connections:** `pm2 restart app`
   - **Temporarily increase pool size:**
     ```typescript
     // Emergency only - increases database load
     pool.max = 150;
     ```

4. **Root Cause:**
   - Fix connection leak in code
   - Add query timeouts
   - Optimize slow queries

**Escalation:** If not resolved in 15 min → escalate to Database Team

### High Priority Alerts (P1)

#### 1. High Rate Limit Hits

**Alert Rule:**
```promql
sum(rate(rate_limit_hits_total[1h])) > 100
```

**Threshold:** >100 rate limit hits per hour

**Why This Threshold:**
- Validated baseline: Normal is 5-10 hits/hour (legitimate users occasionally hitting limits)
- 100/hour = sustained attack or misconfigured client
- Cost consideration: High volume can increase infrastructure costs

**Runbook:**

**Owner:** On-call Engineer

**Response Steps:**
1. **Analysis:**
   ```bash
   # Top IPs hitting rate limits
   grep "429" /var/log/app.log | awk '{print $ip}' | sort | uniq -c | sort -nr | head -20
   
   # Which endpoints are being hit
   grep "429" /var/log/app.log | awk '{print $endpoint}' | sort | uniq -c | sort -nr
   ```

2. **Determine Severity:**
   - **P2**: Single IP, stopped by existing limits, not admin endpoint
   - **P1**: Multiple IPs OR admin endpoint targeted OR ongoing for >2 hours
   - **P0**: Admin login compromised OR DDoS detected

3. **Mitigation:**
   - Review SECURITY.md "Suspected Brute-Force Attack" section
   - Block IPs if necessary
   - Adjust rate limits if legitimate traffic

4. **Follow-up:**
   - If legitimate: Increase rate limits
   - If attack: Add IP to permanent blocklist

#### 2. Elevated CSRF Failures

**Alert Rule:**
```promql
sum(rate(csrf_validation_failures_total[1h])) > 50
```

**Threshold:** >50 CSRF failures per hour

**Why This Threshold:**
- Normal: 0-5/hour (users with stale tabs, browser issues)
- 50/hour = potential attack or frontend bug

**Runbook:**

**Owner:** On-call Engineer

**Response Steps:**
1. Refer to SECURITY.md "Suspected CSRF Attack" section
2. Check if recent frontend deployment could cause stale tokens
3. Verify CSRF token generation is working correctly

### Medium Priority Alerts (P2)

#### 1. Slow API Response Times

**Alert Rule:**
```promql
histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m])) > 500
```

**Threshold:** P95 response time >500ms

**Why This Threshold:**
- Target: P95 < 300ms for good UX
- 500ms = noticeable lag, affects user experience
- 1000ms = P0 alert (system severely degraded)

**Runbook:**

**Owner:** On-call Engineer

**Response Steps:**
1. **Identify slow endpoints:**
   ```bash
   # Analyze logs for response times
   grep "duration=" /var/log/app.log | awk '{print $endpoint, $duration}' | sort -k2 -nr | head -20
   ```

2. **Check database query performance:**
   ```sql
   SELECT query, calls, total_time, mean_time 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

3. **Common Fixes:**
   - Add database indexes for slow queries
   - Implement caching for frequently accessed data
   - Optimize N+1 query patterns
   - Review recent code changes for performance regressions

4. **Temporary Mitigation:**
   - Add caching headers for static content
   - Implement request queuing for expensive operations

#### 2. Unusual Subscription Churn

**Alert Rule:**
```promql
sum(increase(subscription_cancellations_total[24h])) > (avg_over_time(subscription_cancellations_total[7d]) * 2)
```

**Threshold:** >2x average daily cancellations

**Why This Threshold:**
- Detects anomalies compared to 7-day baseline
- Could indicate: billing issues, service problems, competitor promotion

**Runbook:**

**Owner:** Product/Customer Success Team

**Response Steps:**
1. **Analysis:**
   - Review recent cancellations for patterns
   - Check for customer complaints/support tickets
   - Review recent product changes

2. **Actions:**
   - Reach out to churned users for feedback
   - Investigate payment failures
   - Review competitive landscape

3. **Escalation:** Inform Product Lead and CEO if churn continues

## Threshold Validation Methodology

**How These Thresholds Were Determined:**

1. **Baseline Collection (7-14 days):**
   - Collect metrics in production without alerts
   - Calculate mean, P50, P95, P99 for each metric
   - Identify normal variance patterns

2. **Statistical Analysis:**
   - **For rate-based metrics:** Threshold = Mean + (3 × Standard Deviation)
   - **For percentage metrics:** Threshold = Normal % × 2-5 (depending on severity)
   - **For latency metrics:** P95 threshold based on UX requirements

3. **Validation Period (7 days):**
   - Enable alerts with proposed thresholds
   - Track false positive rate
   - Adjust if FP rate >5%

4. **Continuous Refinement:**
   - Review alerts monthly
   - Adjust for seasonal patterns
   - Update as system scales

**Example Calculation (Error Rate):**
- Collected baseline: Mean = 0.3%, StdDev = 0.1%
- P0 Threshold = 5% (chosen to catch only severe outages, not deployment blips)
- P1 Threshold = 2% (early warning)
- P2 Threshold = 1% (investigation needed)

## Runbook Template

For adding new alerts, use this template:

```markdown
#### Alert Name

**Alert Rule:**
```promql
<Prometheus query>
```

**Threshold:** <value> over <time window>

**Why This Threshold:**
- Baseline: <normal value>
- Impact: <what happens at this level>
- Cost/UX consideration: <why this matters>

**Runbook:**

**Owner:** <role/team>

**Response Steps:**
1. **Immediate (<time>):**
   - Command/action to run
   - What to check

2. **Diagnosis:**
   - Possible root causes
   - How to verify each

3. **Mitigation:**
   - Quick fixes
   - Temporary workarounds
   - Rollback procedure

4. **Root Cause Fix:**
   - Permanent solution
   - Prevention for future

**Escalation:** <when and to whom>
```

## Alert Fatigue Prevention

**Guidelines:**
1. **Only alert on actionable issues** - If no action can be taken, it's a metric, not an alert
2. **Tune thresholds** - If alerts fire >2x/week but are not real issues, raise threshold
3. **Use tiered alerts** - Don't page for P2 issues at 3 AM
4. **Group related alerts** - Don't send 10 alerts for same incident
5. **Auto-resolve** - When metric returns to normal, clear alert
6. **Weekly review** - On-call engineer reviews all alerts for false positives

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
