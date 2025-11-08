# GlassBeats Security Integration Tests

This directory contains automated integration tests for validating the security features implemented in GlassBeats.

## Test Suites

### 1. CSRF Protection Tests (`csrf-protection.test.ts`)

Validates that CSRF protection is correctly implemented across all state-changing endpoints.

**What it tests:**
- CSRF token generation
- POST/PATCH/DELETE requests without CSRF tokens are rejected (403)
- Requests with valid CSRF tokens are processed
- Token mismatch detection
- Admin endpoint protection
- Payment endpoint protection
- Social feature endpoint protection
- Intentional exemptions (login, webhooks)

**Run tests:**
```bash
# Ensure server is running on localhost:5000
npm run dev

# In another terminal:
tsx tests/csrf-protection.test.ts
```

**Expected results:**
- All 11 tests should pass
- CSRF-protected endpoints return 403 without valid tokens
- Login and webhook endpoints do not require CSRF tokens

### 2. Rate Limiting Tests (`rate-limit.test.ts`)

Validates that rate limiting is correctly configured for critical endpoints.

**What it tests:**
- Admin login rate limit (3 requests / 15 minutes)
- User registration rate limit (3 requests / hour)
- Payment endpoint rate limit (10 requests / 15 minutes)
- General API rate limit (100 requests / minute)
- Rate limit headers presence
- Retry-after headers in 429 responses

**Run tests:**
```bash
# Ensure server is running on localhost:5000
npm run dev

# In another terminal:
tsx tests/rate-limit.test.ts
```

**⚠️ Warning:** These tests will trigger rate limits and may take several minutes to complete.

**Expected results:**
- All 6 tests should pass
- 429 (Too Many Requests) responses after limits exceeded
- Rate limit headers present in responses

## Test Configuration

### Environment Variables

- `TEST_BASE_URL`: Base URL for the test server (default: `http://localhost:5000`)

Example:
```bash
TEST_BASE_URL=http://localhost:3000 tsx tests/csrf-protection.test.ts
```

## CI/CD Integration

These tests can be integrated into your CI/CD pipeline to ensure security features remain functional across deployments.

### GitHub Actions Example

```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Start server
        run: npm run dev &
        env:
          NODE_ENV: test
      
      - name: Wait for server
        run: npx wait-on http://localhost:5000 -t 30000
      
      - name: Run CSRF tests
        run: tsx tests/csrf-protection.test.ts
      
      - name: Run rate limit tests
        run: tsx tests/rate-limit.test.ts
```

## Adding New Tests

When adding new security features:

1. **Create a new test file** in this directory
2. **Follow the existing pattern** (TestResult interface, makeRequest helper)
3. **Test both positive and negative cases** (should pass, should fail)
4. **Update this README** with the new test suite

### Example Test Template

```typescript
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function testNewFeature() {
  const response = await makeRequest('POST', '/api/new-endpoint', {
    body: { data: 'test' },
  });
  
  results.push({
    name: 'New feature test description',
    passed: response.status === 200,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : undefined,
  });
}

async function runTests() {
  await testNewFeature();
  
  // Print results
  results.forEach(result => {
    console.log(result.passed ? '✅' : '❌', result.name);
    if (result.error) console.log('  ', result.error);
  });
}

runTests();
```

## Troubleshooting

### Tests fail with "ECONNREFUSED"
- Ensure the development server is running (`npm run dev`)
- Check that it's listening on the correct port (default: 5000)

### Rate limit tests fail intermittently
- Wait 15-60 minutes for rate limits to reset
- Run tests against a fresh server instance
- Check that `express-rate-limit` is configured correctly

### CSRF tests fail with unexpected status codes
- Verify CSRF middleware is applied to routes
- Check that frontend is sending `X-CSRF-Token` header
- Ensure cookies are enabled in test environment

## Best Practices

1. **Run tests before commits** - Catch security regressions early
2. **Test in isolation** - Each test should be independent
3. **Document expected behavior** - Make assertions clear
4. **Test edge cases** - Not just happy paths
5. **Keep tests fast** - Minimize delays and setup time
6. **Version control** - Commit test files with feature code

## Resources

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

**Last Updated:** November 8, 2025  
**Maintained By:** GlassBeats Security Team
