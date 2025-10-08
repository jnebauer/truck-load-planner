import jwt from 'jsonwebtoken';

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REMEMBER_EXPIRES_IN = process.env.JWT_REMEMBER_EXPIRES_IN || '30d'; // 30 days for remember me

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'pm' | 'warehouse' | 'client_viewer';
  clientIds: string[];
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Generate JWT token
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, rememberMe: boolean = false): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN,
    issuer: 'trucker-app',
    audience: 'trucker-users'
  } as jwt.SignOptions);
}

// Generate refresh token (longer expiry)
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: '7d', // Refresh token valid for 7 days
      issuer: 'trucker-app',
      audience: 'trucker-users'
    } as jwt.SignOptions
  );
}

// Generate both access and refresh tokens
export function generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>, rememberMe: boolean = false): TokenPair {
  return {
    accessToken: generateToken(payload, rememberMe),
    refreshToken: generateRefreshToken(payload.userId)
  };
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'trucker-app',
      audience: 'trucker-users'
    } as jwt.VerifyOptions) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'trucker-app',
      audience: 'trucker-users'
    } as jwt.VerifyOptions) as { userId: string; type: string };
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    return { userId: decoded.userId };
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) return true;
    
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

// Get token expiry time
export function getTokenExpiry(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}
