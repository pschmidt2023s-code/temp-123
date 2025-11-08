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
- **54 protected endpoints** across the application

**Protected Endpoint Categories:**
- Admin routes (31): Releases, artists, coupons, lyrics, services, user management
- Subscription management (3): Create, update, cancel
- Playlist operations (3): Create, update, delete
- User settings (1): Profile updates
- Payment flows (2): Checkout, coupon validation
- Social features (7): Friends, Live Rooms, AI playlists
- WebAuthn/2FA (6): Setup, enable, disable, credential management
- Content features (10): Quizzes, downloads, radio stations, alarms, etc.

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

### Suspected CSRF Attack
1. Check logs for CSRF validation failures: `grep "CSRF" /var/log/app.log`
2. Identify source IP addresses
3. Temporarily block suspicious IPs if pattern detected
4. Verify all endpoints have CSRF protection
5. Rotate CSRF token generation secret if compromise suspected

### Suspected Brute-Force Attack
1. Check rate limiter logs: `grep "429" /var/log/app.log`
2. Identify targeted endpoints and source IPs
3. Temporarily reduce rate limits for affected endpoints
4. Consider IP-based blocking for persistent attackers
5. Monitor for distributed attacks (multiple IPs)

### Session Hijacking Suspected
1. Invalidate all active sessions: Clear `adminSessions` storage
2. Force all users to re-login
3. Rotate `SESSION_SECRET` environment variable
4. Review access logs for suspicious activity
5. Enable additional monitoring on admin routes

### Database Breach
1. Immediately revoke database credentials
2. Audit all database queries in logs
3. Check for SQL injection attempts
4. Review all ORM queries for potential vulnerabilities
5. Notify affected users if data exposed

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
