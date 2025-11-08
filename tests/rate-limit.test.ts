/**
 * Rate Limiting Integration Tests
 * 
 * These tests validate that rate limiting is correctly configured
 * across critical endpoints in the application.
 * 
 * Run with: NODE_ENV=test tsx tests/rate-limit.test.ts
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const results: TestResult[] = [];

/**
 * Helper to make HTTP request
 */
async function makeRequest(
  method: string,
  path: string,
  options: {
    headers?: Record<string, string>;
    body?: any;
  } = {}
): Promise<{ status: number; headers: Headers; body: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, fetchOptions);
    let body;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }

    return {
      status: response.status,
      headers: response.headers,
      body,
    };
  } catch (error: any) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

/**
 * Test: Admin login rate limiting (3 requests per 15 minutes)
 */
async function testAdminLoginRateLimit() {
  const requests: number[] = [];
  
  // Make 4 requests (limit is 3)
  for (let i = 0; i < 4; i++) {
    const response = await makeRequest('POST', '/api/admin/login', {
      body: { username: 'test', password: 'test' },
    });
    requests.push(response.status);
    
    // Small delay to avoid connection issues
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Fourth request should be rate limited (429)
  const isRateLimited = requests[3] === 429;
  
  results.push({
    name: 'Admin login rate limit (3 requests/15min)',
    passed: isRateLimited,
    error: !isRateLimited ? `Expected 429 on 4th request, got ${requests[3]}` : undefined,
    details: `Requests: ${requests.join(', ')}`,
  });
}

/**
 * Test: User registration rate limiting (3 requests per hour)
 */
async function testRegistrationRateLimit() {
  const requests: number[] = [];
  
  // Make 4 requests (limit is 3)
  for (let i = 0; i < 4; i++) {
    const response = await makeRequest('POST', '/api/register', {
      body: { 
        username: `testuser${i}`,
        email: `test${i}@example.com`,
        password: 'Test1234!',
      },
    });
    requests.push(response.status);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Fourth request should be rate limited (429)
  const isRateLimited = requests[3] === 429;
  
  results.push({
    name: 'User registration rate limit (3 requests/hour)',
    passed: isRateLimited,
    error: !isRateLimited ? `Expected 429 on 4th request, got ${requests[3]}` : undefined,
    details: `Requests: ${requests.join(', ')}`,
  });
}

/**
 * Test: Payment endpoint rate limiting (10 requests per 15 minutes)
 */
async function testPaymentRateLimit() {
  const requests: number[] = [];
  
  // Make 11 requests (limit is 10)
  for (let i = 0; i < 11; i++) {
    const response = await makeRequest('POST', '/api/create-checkout-session', {
      body: { 
        userId: 'test-user',
        tier: 'premium',
        priceId: 'price_123',
      },
    });
    requests.push(response.status);
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // 11th request should be rate limited (429)
  const isRateLimited = requests[10] === 429;
  
  results.push({
    name: 'Payment endpoint rate limit (10 requests/15min)',
    passed: isRateLimited,
    error: !isRateLimited ? `Expected 429 on 11th request, got ${requests[10]}` : undefined,
    details: `Last 3 requests: ${requests.slice(-3).join(', ')}`,
  });
}

/**
 * Test: General API rate limiting (100 requests per minute)
 */
async function testGeneralApiRateLimit() {
  const requests: number[] = [];
  
  // Make 102 requests (limit is 100)
  // Using a GET endpoint to avoid CSRF issues
  for (let i = 0; i < 102; i++) {
    const response = await makeRequest('GET', '/api/subscription-tiers');
    requests.push(response.status);
    
    // No delay - testing burst behavior
  }
  
  // 101st and 102nd requests should be rate limited (429)
  const successCount = requests.filter(s => s === 200).length;
  const rateLimitedCount = requests.filter(s => s === 429).length;
  
  results.push({
    name: 'General API rate limit (100 requests/minute)',
    passed: rateLimitedCount >= 2 && successCount <= 100,
    error: rateLimitedCount < 2 ? `Only ${rateLimitedCount} requests were rate limited` : undefined,
    details: `Success: ${successCount}, Rate limited: ${rateLimitedCount}`,
  });
}

/**
 * Test: Rate limit headers are present
 */
async function testRateLimitHeaders() {
  const response = await makeRequest('POST', '/api/admin/login', {
    body: { username: 'test', password: 'test' },
  });
  
  const hasLimitHeader = response.headers.has('ratelimit-limit') || 
                        response.headers.has('x-ratelimit-limit');
  const hasRemainingHeader = response.headers.has('ratelimit-remaining') || 
                            response.headers.has('x-ratelimit-remaining');
  
  results.push({
    name: 'Rate limit headers are present',
    passed: hasLimitHeader || hasRemainingHeader,
    error: !hasLimitHeader && !hasRemainingHeader ? 'No rate limit headers found' : undefined,
    details: `Headers: ${Array.from(response.headers.keys()).join(', ')}`,
  });
}

/**
 * Test: 429 response includes retry-after header
 */
async function testRetryAfterHeader() {
  // Trigger rate limit by making multiple requests
  const requests = [];
  for (let i = 0; i < 4; i++) {
    const response = await makeRequest('POST', '/api/admin/login', {
      body: { username: 'test', password: 'test' },
    });
    requests.push(response);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const rateLimitedResponse = requests.find(r => r.status === 429);
  
  if (!rateLimitedResponse) {
    results.push({
      name: '429 response includes retry-after header',
      passed: false,
      error: 'Could not trigger rate limit to test header',
    });
    return;
  }
  
  const hasRetryAfter = rateLimitedResponse.headers.has('retry-after') ||
                       rateLimitedResponse.headers.has('x-ratelimit-reset');
  
  results.push({
    name: '429 response includes retry-after header',
    passed: hasRetryAfter,
    error: !hasRetryAfter ? 'No retry-after header in 429 response' : undefined,
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('⏱️  Rate Limiting Integration Tests\n');
  console.log(`Testing against: ${BASE_URL}\n`);
  console.log('⚠️  Warning: These tests will trigger rate limits and may take a few minutes.\n');
  
  try {
    await testAdminLoginRateLimit();
    
    // Wait a bit before next test to avoid interference
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRegistrationRateLimit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPaymentRateLimit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGeneralApiRateLimit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRateLimitHeaders();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRetryAfterHeader();
  } catch (error: any) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
  
  // Print results
  console.log('\nTest Results:\n');
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    if (result.passed) {
      console.log(`✅ ${result.name}`);
      if (result.details) {
        console.log(`   ${result.details}`);
      }
      passed++;
    } else {
      console.log(`❌ ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`   ${result.details}`);
      }
      failed++;
    }
  });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Please review rate limiting configuration.');
    process.exit(1);
  } else {
    console.log('\n✅ All rate limiting tests passed!');
    process.exit(0);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runTests };
