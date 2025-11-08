import rateLimit from 'express-rate-limit';

// Strict rate limiting for authentication endpoints (login, 2FA)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Zu viele Anmeldeversuche. Bitte versuchen Sie es in 15 Minuten erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Moderate rate limiting for registration
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    error: 'Zu viele Registrierungsversuche. Bitte versuchen Sie es in einer Stunde erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payment attempts per window
  message: {
    error: 'Zu viele Zahlungsversuche. Bitte versuchen Sie es in 15 Minuten erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limiting for general API calls
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Zu viele Anfragen. Bitte verlangsamen Sie.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for GET requests to public endpoints
    return req.method === 'GET' && !req.url.startsWith('/api/admin');
  }
});

// Very strict rate limiting for admin login
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 attempts per window
  message: {
    error: 'Zu viele Admin-Anmeldeversuche. Bitte versuchen Sie es in 15 Minuten erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
