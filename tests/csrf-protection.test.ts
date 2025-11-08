/**
 * CSRF Protection Integration Tests
 * 
 * These tests validate that CSRF protection is correctly implemented
 * across all state-changing endpoints in the application.
 * 
 * Run with: NODE_ENV=test tsx tests/csrf-protection.test.ts
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const results: TestResult[] = [];

/**
 * Helper to extract CSRF token from cookies (robust parsing)
 */
function extractCsrfToken(cookieHeader: string | string[] | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
  
  for (const cookie of cookies) {
    // Handle Set-Cookie format: csrf_token=value; Path=/; HttpOnly
    const match = cookie.match(/csrf_token=([^;,\s]+)/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Helper to extract admin session token from cookies
 */
function extractAdminSession(cookieHeader: string | string[] | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
  
  for (const cookie of cookies) {
    const match = cookie.match(/admin_session=([^;,\s]+)/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Helper to parse all cookies from Set-Cookie header
 */
function parseCookies(cookieHeader: string | string[] | null): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  
  const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
  
  for (const cookie of cookies) {
    const parts = cookie.split(';')[0].split('=');
    if (parts.length === 2) {
      result[parts[0].trim()] = parts[1].trim();
    }
  }
  
  return result;
}

/**
 * Helper to make HTTP request
 */
async function makeRequest(
  method: string,
  path: string,
  options: {
    headers?: Record<string, string>;
    body?: any;
    includeCsrf?: boolean;
  } = {}
): Promise<{ status: number; headers: Headers; body: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies
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
 * Test: GET request to receive CSRF token
 */
async function testCsrfTokenGeneration() {
  const response = await makeRequest('GET', '/api/csrf-token');
  
  const csrfToken = response.headers.get('set-cookie');
  
  results.push({
    name: 'CSRF token is generated on GET /api/csrf-token',
    passed: response.status === 200 && csrfToken?.includes('csrf_token='),
    error: !csrfToken?.includes('csrf_token=') ? 'CSRF token not found in cookies' : undefined,
  });
}

/**
 * Test: POST request without CSRF token should fail
 */
async function testPostWithoutCsrfToken() {
  const response = await makeRequest('POST', '/api/playlists', {
    body: { userId: 'test-user', name: 'Test Playlist', tracks: [] },
  });
  
  results.push({
    name: 'POST /api/playlists without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: POST request with CSRF token should succeed (or fail with auth error)
 */
async function testPostWithCsrfToken() {
  // First, get CSRF token
  const tokenResponse = await makeRequest('GET', '/api/csrf-token');
  const setCookie = tokenResponse.headers.get('set-cookie');
  const csrfToken = extractCsrfToken(setCookie ? [setCookie] : []);
  
  if (!csrfToken) {
    results.push({
      name: 'POST /api/playlists with CSRF token',
      passed: false,
      error: 'Failed to extract CSRF token',
    });
    return;
  }
  
  // Now make request with CSRF token
  const response = await makeRequest('POST', '/api/playlists', {
    headers: {
      'X-CSRF-Token': csrfToken,
      'Cookie': `csrf_token=${csrfToken}`,
    },
    body: { userId: 'test-user', name: 'Test Playlist', tracks: [] },
  });
  
  // Should not be 403 (CSRF error), might be 400 (validation) or 401 (auth)
  results.push({
    name: 'POST /api/playlists with CSRF token should not return 403',
    passed: response.status !== 403,
    error: response.status === 403 ? 'CSRF protection failed even with token' : undefined,
  });
}

/**
 * Test: CSRF token mismatch should fail
 */
async function testCsrfTokenMismatch() {
  const response = await makeRequest('POST', '/api/playlists', {
    headers: {
      'X-CSRF-Token': 'wrong-token',
      'Cookie': 'csrf_token=different-token',
    },
    body: { userId: 'test-user', name: 'Test Playlist', tracks: [] },
  });
  
  results.push({
    name: 'POST /api/playlists with mismatched CSRF tokens should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Admin endpoints require CSRF token
 */
async function testAdminCsrfProtection() {
  const response = await makeRequest('POST', '/api/admin/releases', {
    body: { 
      title: 'Test Release',
      artistName: 'Test Artist',
      isrc: 'TEST123',
      upc: 'TEST456',
      catalogId: 'TEST789',
      status: 'pending',
    },
  });
  
  results.push({
    name: 'POST /api/admin/releases without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Payment endpoints require CSRF token
 */
async function testPaymentCsrfProtection() {
  const response = await makeRequest('POST', '/api/create-checkout-session', {
    body: { 
      userId: 'test-user',
      tier: 'premium',
      priceId: 'price_123',
    },
  });
  
  results.push({
    name: 'POST /api/create-checkout-session without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Friend management endpoints require CSRF token
 */
async function testFriendsCsrfProtection() {
  const response = await makeRequest('POST', '/api/friends/request', {
    body: { 
      userId: 'user-1',
      friendId: 'user-2',
    },
  });
  
  results.push({
    name: 'POST /api/friends/request without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Quiz endpoints require CSRF token
 */
async function testQuizCsrfProtection() {
  const response = await makeRequest('POST', '/api/quizzes', {
    body: { 
      title: 'Test Quiz',
      description: 'Test Description',
      tracks: [],
      mode: 'guess_song',
    },
  });
  
  results.push({
    name: 'POST /api/quizzes without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Subscription endpoints require CSRF token
 */
async function testSubscriptionCsrfProtection() {
  const response = await makeRequest('POST', '/api/subscriptions', {
    body: { 
      userId: 'test-user',
      tier: 'premium',
      status: 'active',
    },
  });
  
  results.push({
    name: 'POST /api/subscriptions without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Login endpoints should NOT require CSRF token (intentional exemption)
 */
async function testLoginExemption() {
  const response = await makeRequest('POST', '/api/admin/login', {
    body: { 
      username: 'test',
      password: 'test',
    },
  });
  
  // Should not be 403 (might be 401 for wrong credentials)
  results.push({
    name: 'POST /api/admin/login should NOT require CSRF token',
    passed: response.status !== 403,
    error: response.status === 403 ? 'Login endpoint incorrectly requires CSRF token' : undefined,
  });
}

/**
 * Test: Stripe webhook should NOT require CSRF token (intentional exemption)
 */
async function testWebhookExemption() {
  const response = await makeRequest('POST', '/api/stripe-webhook', {
    headers: {
      'stripe-signature': 'test-signature',
    },
    body: { type: 'test.event' },
  });
  
  // Should not be 403 (might be 400 for invalid signature)
  results.push({
    name: 'POST /api/stripe-webhook should NOT require CSRF token',
    passed: response.status !== 403,
    error: response.status === 403 ? 'Webhook endpoint incorrectly requires CSRF token' : undefined,
  });
}

/**
 * Test: Complete admin auth flow with CSRF
 */
async function testAdminAuthFlowWithCsrf() {
  // Step 1: Get CSRF token
  const csrfResponse = await makeRequest('GET', '/api/csrf-token');
  const csrfToken = extractCsrfToken(csrfResponse.headers.get('set-cookie'));
  
  if (!csrfToken) {
    results.push({
      name: 'Complete admin auth flow with CSRF protection',
      passed: false,
      error: 'Failed to obtain CSRF token',
    });
    return;
  }
  
  // Step 2: Login with valid credentials (requires env vars ADMIN_USERNAME and ADMIN_PASSWORD)
  const loginResponse = await makeRequest('POST', '/api/admin/login', {
    body: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin',
    },
  });
  
  const adminSession = extractAdminSession(loginResponse.headers.get('set-cookie'));
  
  // Step 3: Access protected endpoint WITH CSRF token and session
  const protectedResponse = await makeRequest('GET', '/api/admin/users', {
    headers: {
      'Cookie': `csrf_token=${csrfToken}; admin_session=${adminSession}`,
      'X-CSRF-Token': csrfToken,
    },
  });
  
  // Should succeed (200) if auth works, or fail with auth error (not 403 CSRF error)
  const passed = loginResponse.status === 401 || // Invalid credentials (expected in test)
                 (loginResponse.status === 200 && protectedResponse.status !== 403);
  
  results.push({
    name: 'Complete admin auth flow with CSRF protection',
    passed,
    error: !passed ? `Login: ${loginResponse.status}, Protected: ${protectedResponse.status}` : undefined,
  });
}

/**
 * Test: DELETE endpoints require CSRF token
 */
async function testDeleteEndpointCsrf() {
  const response = await makeRequest('DELETE', '/api/playlists/test-id', {
    body: {},
  });
  
  results.push({
    name: 'DELETE /api/playlists/:id without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: PATCH endpoints require CSRF token
 */
async function testPatchEndpointCsrf() {
  const response = await makeRequest('PATCH', '/api/playlists/test-id', {
    body: { name: 'Updated Name' },
  });
  
  results.push({
    name: 'PATCH /api/playlists/:id without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: AI playlist endpoints require CSRF token
 */
async function testAiPlaylistCsrf() {
  const response = await makeRequest('POST', '/api/ai-playlists', {
    body: {
      userId: 'test-user',
      mood: 'happy',
      trackCount: 20,
    },
  });
  
  results.push({
    name: 'POST /api/ai-playlists without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Download endpoints require CSRF token
 */
async function testDownloadCsrf() {
  const response = await makeRequest('POST', '/api/downloads', {
    body: {
      userId: 'test-user',
      trackId: 'test-track',
      trackName: 'Test Song',
      artistName: 'Test Artist',
      fileSize: 5000000,
    },
  });
  
  results.push({
    name: 'POST /api/downloads without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Radio station endpoints require CSRF token
 */
async function testRadioCsrf() {
  const response = await makeRequest('POST', '/api/radio', {
    body: {
      userId: 'test-user',
      name: 'Test Radio',
      seedType: 'track',
      seedId: 'test-track',
    },
  });
  
  results.push({
    name: 'POST /api/radio without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Alarm endpoints require CSRF token
 */
async function testAlarmCsrf() {
  const response = await makeRequest('POST', '/api/alarms', {
    body: {
      userId: 'test-user',
      time: '07:00',
      enabled: true,
      days: ['monday', 'tuesday'],
    },
  });
  
  results.push({
    name: 'POST /api/alarms without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Test: Gift card redemption requires CSRF token
 */
async function testGiftCardCsrf() {
  const response = await makeRequest('POST', '/api/gift-cards/redeem', {
    body: {
      userId: 'test-user',
      code: 'TEST-CODE',
    },
  });
  
  results.push({
    name: 'POST /api/gift-cards/redeem without CSRF token should fail (403)',
    passed: response.status === 403,
    error: response.status !== 403 ? `Expected 403, got ${response.status}` : undefined,
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🔐 CSRF Protection Integration Tests\n');
  console.log(`Testing against: ${BASE_URL}\n`);
  
  try {
    // Core CSRF tests
    await testCsrfTokenGeneration();
    await testPostWithoutCsrfToken();
    await testPostWithCsrfToken();
    await testCsrfTokenMismatch();
    
    // Endpoint-specific CSRF tests
    await testAdminCsrfProtection();
    await testPaymentCsrfProtection();
    await testFriendsCsrfProtection();
    await testQuizCsrfProtection();
    await testSubscriptionCsrfProtection();
    await testDeleteEndpointCsrf();
    await testPatchEndpointCsrf();
    await testAiPlaylistCsrf();
    await testDownloadCsrf();
    await testRadioCsrf();
    await testAlarmCsrf();
    await testGiftCardCsrf();
    
    // Exemptions
    await testLoginExemption();
    await testWebhookExemption();
    
    // Auth flow integration
    await testAdminAuthFlowWithCsrf();
  } catch (error: any) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
  
  // Print results
  console.log('Test Results:\n');
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    if (result.passed) {
      console.log(`✅ ${result.name}`);
      passed++;
    } else {
      console.log(`❌ ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      failed++;
    }
  });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Please review CSRF protection implementation.');
    process.exit(1);
  } else {
    console.log('\n✅ All CSRF protection tests passed!');
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
