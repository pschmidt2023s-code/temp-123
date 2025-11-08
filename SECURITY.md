# GlassBeats Security Documentation

## Overview
This document outlines the security measures implemented in GlassBeats and provides operational guidelines for maintaining security in development and production environments.

## Implemented Security Features

### 1. HttpOnly Cookie Authentication

**Implementation:**
- Admin authentication uses secure HttpOnly cookies instead of localStorage
- Cookie configuration: `httpOnly: true`, `secure: true` (production), `sameSite: 'strict'`
- Session lifetime: 24 hours
- Automatic session validation via `requireAdminAuth` middleware

**Configuration:**
```typescript
// server/routes.ts
res.cookie('admin_session', sessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});
```

**Benefits:**
- Prevents XSS attacks by making session tokens inaccessible to JavaScript
- Prevents CSRF attacks via `sameSite: 'strict'`
- Automatic transmission with HTTP requests

**Operational Guidelines:**
- Never expose session tokens in logs or error messages
- Monitor session creation/validation failures in production
- Implement session rotation on privilege escalation
- Consider reducing session lifetime for high-security operations

### 2. CSRF Protection (Double-Submit Cookie Pattern)

**Implementation:**
- CSRF tokens generated for all requests via `generateCsrfToken` middleware
- Token stored in non-HttpOnly cookie (readable by JavaScript)
- Validation via `X-CSRF-Token` header on all state-changing requests
- **53 protected endpoints** across the application (30 admin + 23 user-facing)

**Complete List of Protected Endpoints:**

**Admin Routes (30 endpoints using `requireAdminAuthWithCsrf`):**
1. GET `/api/admin/check-session`
2. POST `/api/admin/logout`
3. GET `/api/admin/users`
4. PATCH `/api/admin/users/:id/subscription`
5. DELETE `/api/admin/users/:id`
6. POST `/api/admin/upload/cover`
7. POST `/api/admin/upload/audio`
8. GET `/api/admin/releases`
9. GET `/api/admin/releases/:id`
10. POST `/api/admin/releases`
11. PATCH `/api/admin/releases/:id`
12. DELETE `/api/admin/releases/:id`
13. GET `/api/admin/artist-links`
14. POST `/api/admin/artist-links`
15. DELETE `/api/admin/artist-links/:id`
16. GET `/api/admin/services`
17. POST `/api/admin/services`
18. PATCH `/api/admin/services/:id`
19. DELETE `/api/admin/services/:id`
20. POST `/api/admin/lyrics`
21. PATCH `/api/admin/lyrics/:id`
22. DELETE `/api/admin/lyrics/:id`
23. GET `/api/admin/lyrics/all`
24. GET `/api/admin/coupons`
25. POST `/api/admin/coupons`
26. PATCH `/api/admin/coupons/:id`
27. DELETE `/api/admin/coupons/:id`
28. GET `/api/admin/coupons/:id/usages`
29. POST `/api/admin/gift-cards`
30. GET `/api/admin/gift-cards`

**User-Facing Routes (23 endpoints using direct `validateCsrfToken`):**
1. POST `/api/playlists`
2. PATCH `/api/playlists/:id`
3. DELETE `/api/playlists/:id`
4. POST `/api/subscriptions`
5. PATCH `/api/subscriptions/:id`
6. POST `/api/subscriptions/:id/cancel`
7. POST `/api/create-checkout-session`
8. POST `/api/auth/2fa/setup`
9. POST `/api/auth/2fa/enable`
10. POST `/api/auth/2fa/disable`
11. POST `/api/auth/webauthn/register-options`
12. POST `/api/auth/webauthn/register-verify`
13. DELETE `/api/auth/webauthn/credentials/:id`
14. POST `/api/artist-register`
15. PATCH `/api/settings/:userId`
16. POST `/api/friends/request`
17. POST `/api/friends/:requestId/accept`
18. DELETE `/api/friends/:requestId/reject`
19. DELETE `/api/friends/:friendshipId`
20. POST `/api/ai-playlists`
21. DELETE `/api/ai-playlists/:id`
22. POST `/api/quizzes`
23. POST `/api/quizzes/:id/scores`

Note: All admin routes use `requireAdminAuthWithCsrf` middleware which internally calls `validateCsrfToken`, while user-facing routes use `validateCsrfToken` directly. Total: 53 CSRF-protected endpoints.

**Intentional Exemptions:**
- `/api/admin/login` - No session exists pre-authentication
- `/api/register` - No session exists pre-registration
- `/api/stripe-webhook` - External service, no user session
- All GET requests (idempotent, no state changes)

**Frontend Integration:**
```typescript
// client/src/lib/queryClient.ts
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf_token='))
  ?.split('=')[1];

headers['X-CSRF-Token'] = csrfToken || '';
```

**Operational Guidelines:**
- Monitor CSRF validation failures (may indicate attack attempts)
- Ensure all new state-changing endpoints include `validateCsrfToken` middleware
- Never disable CSRF protection in production
- Token rotation: Currently automatic on every request; consider longer TTL if performance issues arise

**Testing CSRF Protection:**
```bash
# Valid request (should succeed)
curl -X POST https://your-domain.com/api/playlists \
  -H "Content-Type: application/json" \
  -H "Cookie: csrf_token=abc123" \
  -H "X-CSRF-Token: abc123" \
  -d '{"userId":"user1","name":"My Playlist"}'

# Invalid request (should fail with 403)
curl -X POST https://your-domain.com/api/playlists \
  -H "Content-Type: application/json" \
  -H "Cookie: csrf_token=abc123" \
  -d '{"userId":"user1","name":"My Playlist"}'
```

### 3. Rate Limiting

**Implementation:**
Rate limiters configured with `express-rate-limit` to prevent brute-force attacks and API abuse.

**Limiter Configurations:**

| Endpoint Type | Limit | Window | Identifier |
|--------------|-------|--------|-----------|
| Admin Login | 3 requests | 15 minutes | IP address |
| User Login | 5 requests | 15 minutes | IP address |
| Registration | 3 requests | 1 hour | IP address |
| 2FA Verification | 5 requests | 15 minutes | IP address |
| Payment | 10 requests | 15 minutes | IP address |
| General API | 100 requests | 1 minute | IP address |

**Operational Guidelines:**

1. **Monitor Rate Limit Hits:**
   - Track `429 Too Many Requests` responses in production logs
   - Investigate patterns: Single IP vs. distributed attack
   - Adjust limits based on legitimate usage patterns

2. **Adjust Limits:**
   ```typescript
   // server/rateLimiter.ts
   export const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5, // Increase if legitimate users are rate-limited
     message: 'Zu viele Login-Versuche, bitte versuche es später erneut.',
   });
   ```

3. **Whitelist Trusted IPs (if needed):**
   ```typescript
   const limiter = rateLimit({
     skip: (req) => {
       const trustedIPs = ['10.0.0.1', '192.168.1.1'];
       return trustedIPs.includes(req.ip);
     },
   });
   ```

4. **Production Metrics:**
   - Track average requests per user per minute
   - Monitor spike patterns (possible DDoS)
   - Set up alerts for sustained rate limit violations

### 4. Environment Variables & Secrets Management

**Required Secrets:**
- `SESSION_SECRET`: Session cookie signing (generate with `openssl rand -hex 32`)
- `ADMIN_USERNAME`: Admin dashboard username
- `ADMIN_PASSWORD`: Admin dashboard password (bcrypt hashed)
- `STRIPE_SECRET_KEY`: Stripe payment processing
- `VITE_STRIPE_PUBLIC_KEY`: Stripe client-side key
- `PAYPAL_CLIENT_ID`: PayPal integration
- `PAYPAL_CLIENT_SECRET`: PayPal integration
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_MK_DEV_TOKEN`: Apple MusicKit developer token

**Best Practices:**
- Never commit secrets to version control
- Use Replit Secrets or environment variable management
- Rotate secrets quarterly or after suspected compromise
- Use different secrets for development/staging/production
- Minimum password requirements: 16 characters, bcrypt rounds: 10

### 5. Input Validation

**Implementation:**
All request bodies validated using Zod schemas from `drizzle-zod`.

**Example:**
```typescript
app.post('/api/playlists', validateCsrfToken, async (req, res) => {
  const result = insertPlaylistSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Invalid playlist data', 
      details: result.error 
    });
  }
  // Process validated data
});
```

**Operational Guidelines:**
- Never trust user input
- Validate on both client and server
- Sanitize HTML/SQL inputs
- Use parameterized queries (Drizzle ORM handles this)

## Security Checklist for New Features

When adding new features, ensure:

- [ ] State-changing endpoints include `validateCsrfToken` middleware
- [ ] Appropriate rate limiter applied (auth, payment, or general)
- [ ] Input validation with Zod schemas
- [ ] Sensitive data not logged or exposed in error messages
- [ ] Authentication/authorization checks where appropriate
- [ ] HTTPS enforced in production (`secure: true` for cookies)
- [ ] Secrets managed via environment variables
- [ ] No hardcoded credentials or API keys

## Incident Response Procedures

**General Response Protocol:**
1. **Detect**: Automated monitoring or manual detection
2. **Assess**: Determine severity and scope
3. **Contain**: Prevent further damage
4. **Eradicate**: Remove threat
5. **Recover**: Restore normal operations
6. **Document**: Record incident details and lessons learned

### Incident Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **P0 - Critical** | Active attack, data breach, system down | Immediate (< 15 min) | CTO, Security Lead |
| **P1 - High** | Security vulnerability exploited, service degradation | < 1 hour | Security Team Lead |
| **P2 - Medium** | Suspicious activity detected, potential vulnerability | < 4 hours | On-call Engineer |
| **P3 - Low** | Minor security concern, false positive likely | < 24 hours | Regular review |

### Suspected CSRF Attack (P1)

**Detection Indicators:**
- Multiple CSRF validation failures from same IP
- CSRF errors on login/registration (should be exempt)
- Sudden spike in 403 errors across protected endpoints

**Response Steps:**
1. **Immediate (< 15 min):**
   - Check logs: `grep "CSRF" /var/log/app.log | tail -100`
   - Identify source IPs: `grep "CSRF token mismatch" /var/log/app.log | awk '{print $X}' | sort | uniq -c | sort -nr`
   - Count affected endpoints: `grep "CSRF" /var/log/app.log | awk '{print $Y}' | sort | uniq -c`

2. **Assessment (< 30 min):**
   - Determine if attack is targeted (single endpoint) or broad (multiple endpoints)
   - Check if traffic is from single IP, IP range, or distributed
   - Review if any CSRF validations were bypassed (critical if yes)

3. **Containment (< 1 hour):**
   - If single IP: Block via firewall or middleware
   ```typescript
   const blockedIPs = new Set(['x.x.x.x']);
   app.use((req, res, next) => {
     if (blockedIPs.has(req.ip)) return res.status(403).end();
     next();
   });
   ```
   - If distributed: Enable stricter rate limiting temporarily
   - If bypass suspected: Immediately escalate to P0, disable affected endpoints

4. **Eradication:**
   - Verify all 53 protected endpoints have `validateCsrfToken` middleware
   - Review recent code changes for accidental CSRF protection removal
   - If compromise suspected: Rotate `SESSION_SECRET` (forces re-login)

5. **Recovery:**
   - Monitor for 24 hours post-incident
   - Document attack patterns for future detection

6. **Follow-up:**
   - Update WAF rules if applicable
   - Add specific monitoring for detected attack patterns

**Escalation:** If > 100 CSRF failures/hour OR any successful bypass detected → escalate to P0

### Suspected Brute-Force Attack (P1-P2)

**Detection Indicators:**
- High volume of 429 responses from single IP
- Multiple failed login attempts from same IP
- Credential stuffing patterns (same username, different passwords)

**Response Steps:**
1. **Immediate:**
   - Check rate limiter logs: `grep "429" /var/log/app.log | tail -100`
   - Identify targeted endpoint: `grep "429" /var/log/app.log | awk '{print $endpoint}' | sort | uniq -c`
   - Extract attacker IPs: `grep "429" /var/log/app.log | awk '{print $ip}' | sort | uniq -c | sort -nr | head -20`

2. **Assessment:**
   - **P2**: Single IP, <50 attempts/hour, stopped by rate limits
   - **P1**: Multiple IPs (distributed attack), >100 attempts/hour, ongoing

3. **Containment:**
   - For single IP attack:
     ```bash
     # Block specific IP
     iptables -A INPUT -s x.x.x.x -j DROP
     ```
   - For distributed attack:
     - Reduce rate limits temporarily (admin login: 3→1, regular: 100→20)
     - Enable CAPTCHA on login endpoints (requires code deployment)
     - Consider enabling DDoS protection (Cloudflare, AWS Shield)

4. **Eradication:**
   - Review targeted accounts: Are they admin accounts? High-value users?
   - Check if any attempts were successful: `grep "Login successful" /var/log/app.log`
   - If successful logins detected: Force password reset for affected accounts

5. **Recovery:**
   - Gradually restore normal rate limits after attack ceases
   - Monitor for 48 hours for resumed attacks

**Escalation:** If admin account compromised → escalate to P0

### Session Hijacking Suspected (P0)

**Detection Indicators:**
- Session used from multiple IPs simultaneously
- Geographic anomalies (session in US, then China within minutes)
- Admin actions from unexpected IP addresses
- User reports of unauthorized actions

**Response Steps:**
1. **Immediate (< 5 min):**
   - Invalidate ALL active admin sessions:
     ```typescript
     // Emergency session clear
     await storage.clearAllAdminSessions();
     ```
   - Disable admin routes temporarily (if severe):
     ```typescript
     app.use('/api/admin', (req, res) => {
       res.status(503).json({ error: 'Maintenance mode' });
     });
     ```

2. **Assessment (< 15 min):**
   - Review session creation logs for suspicious patterns
   - Check if `SESSION_SECRET` was exposed (code commits, logs)
   - Identify which admin accounts were potentially compromised
   - Audit recent admin actions: `SELECT * FROM audit_log WHERE timestamp > NOW() - INTERVAL '24 hours'`

3. **Containment (< 30 min):**
   - Rotate `SESSION_SECRET` immediately
   - Force all admins to re-authenticate
   - Enable 2FA requirement for all admin accounts (if not already)
   - Review and potentially revert recent admin changes

4. **Eradication:**
   - Review application code for session handling vulnerabilities
   - Check for XSS vulnerabilities that could steal cookies
   - Verify `httpOnly`, `secure`, `sameSite` flags on cookies
   - Audit recent deployments for security regressions

5. **Recovery:**
   - Re-enable admin routes with enhanced monitoring
   - Require all admins to change passwords
   - Implement session IP binding (optional, may affect mobile users)

6. **Post-Incident:**
   - Conduct full security audit
   - Review admin access logs for unauthorized changes
   - Notify affected parties if data was accessed

**Escalation:** Automatic P0, notify CTO and Security Lead immediately

### Database Breach (P0)

**Detection Indicators:**
- Unauthorized database access detected
- SQL injection attempts in logs
- Database connection from unexpected IP
- Data exfiltration detected (large queries)
- User data appeared on dark web/public forums

**Response Steps:**
1. **Immediate (< 5 min):**
   - **DO NOT** shut down database (may destroy forensic evidence)
   - Revoke compromised database credentials
   - Enable database query logging (if not already enabled)
   - Block unauthorized IPs at firewall level

2. **Assessment (< 30 min):**
   - Determine breach vector: SQL injection? Credential leak? Insider threat?
   - Identify accessed tables/data: `SELECT * FROM pg_stat_statements ORDER BY total_time DESC`
   - Estimate number of affected users
   - Check for data modification (UPDATE/DELETE queries)

3. **Containment (< 1 hour):**
   - Rotate all database credentials
   - Update firewall rules to whitelist only application servers
   - Enable read-only mode if data modification detected
   - Take database snapshot for forensic analysis

4. **Eradication:**
   - Patch SQL injection vulnerabilities immediately
   - Review all raw SQL queries in codebase
   - Ensure all queries use parameterization (Drizzle ORM does this automatically)
   - Conduct penetration testing to find additional vulnerabilities

5. **Recovery:**
   - Restore from backup if data was corrupted
   - Verify data integrity post-breach
   - Re-enable write access after vulnerabilities patched

6. **Legal/Compliance (< 72 hours):**
   - Notify affected users (GDPR requires within 72 hours)
   - File breach report with relevant authorities
   - Offer credit monitoring if payment data exposed
   - Prepare public statement if necessary

**Escalation:** Automatic P0, notify CTO, Legal, and PR teams immediately

### Payment System Compromise (P0)

**Detection Indicators:**
- Unauthorized transactions
- Webhook signature validation failures
- Unexpected refunds or chargebacks
- Stripe/PayPal security alerts

**Response Steps:**
1. **Immediate:**
   - Disable payment endpoints: `app.use('/api/create-checkout-session', (req, res) => res.status(503).end());`
   - Contact Stripe/PayPal support
   - Preserve all logs and webhook payloads

2. **Assessment:**
   - Review recent transactions for anomalies
   - Check webhook signature validation logic
   - Verify API keys haven't been exposed

3. **Containment:**
   - Rotate Stripe/PayPal API keys
   - Review and potentially reverse fraudulent transactions
   - Enable additional fraud detection rules

4. **Recovery:**
   - Re-enable payments after vulnerabilities fixed
   - Enhanced monitoring on payment flows

**Escalation:** Automatic P0, notify CTO, Finance, and payment provider

## Production Deployment Security

### Pre-Deployment Checklist
- [ ] All secrets configured in production environment
- [ ] `NODE_ENV=production` set
- [ ] HTTPS/TLS certificates configured
- [ ] Database backups enabled
- [ ] Monitoring and logging enabled
- [ ] Rate limits tested and tuned
- [ ] Admin credentials strong and unique
- [ ] CORS properly configured (if applicable)
- [ ] CSP headers configured (if applicable)

### Post-Deployment Monitoring
- Monitor rate limit violations
- Track CSRF validation failures
- Monitor failed authentication attempts
- Track session creation/invalidation
- Monitor payment processing errors
- Track API response times
- Monitor database query performance

## Security Audit Schedule

| Task | Frequency | Responsibility |
|------|-----------|---------------|
| Dependency updates | Weekly | DevOps |
| Security patches | Immediately | DevOps |
| Rate limit review | Monthly | Backend Team |
| Session secret rotation | Quarterly | Security Team |
| Access log review | Weekly | Security Team |
| Penetration testing | Annually | External Auditor |
| Code security review | Per release | Development Team |

## Contact & Reporting

For security vulnerabilities or concerns:
- Email: security@glassbeats.com (replace with actual contact)
- Do not publicly disclose vulnerabilities
- Expected response time: 24-48 hours
- Coordinated disclosure period: 90 days

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

**Last Updated:** November 8, 2025  
**Document Version:** 1.0  
**Maintained By:** GlassBeats Security Team
