import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

// Generate CSRF token and set it as a cookie
export function generateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Check if CSRF token already exists
  if (!req.cookies?.csrf_token) {
    const csrfToken = randomBytes(32).toString('hex');
    
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false, // Must be readable by JavaScript for client to send in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
  }
  
  next();
}

// Validate CSRF token (double-submit pattern)
export function validateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip validation for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'] as string;
  
  if (!cookieToken) {
    return res.status(403).json({ 
      error: 'CSRF token missing in cookie. Please refresh the page.' 
    });
  }
  
  if (!headerToken) {
    return res.status(403).json({ 
      error: 'CSRF token missing in header. Possible CSRF attack detected.' 
    });
  }
  
  // Double-submit pattern: compare cookie and header tokens
  if (cookieToken !== headerToken) {
    return res.status(403).json({ 
      error: 'CSRF token mismatch. Possible CSRF attack detected.' 
    });
  }
  
  next();
}
