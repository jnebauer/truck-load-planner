import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import { createClient } from './supabase/server';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
}

export async function authenticateUser(request: NextRequest): Promise<{ user: AuthenticatedUser | null; error: string | null }> {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No authorization header' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token
    const payload = verifyToken(token);
    if (!payload) {
      return { user: null, error: 'Invalid token' };
    }

    // Get user details from database to ensure they still exist and are active
    const supabase = await createClient();
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        status,
        role_id,
        roles!inner(name)
      `)
      .eq('id', payload.userId)
      .eq('status', 'active')
      .single();

    if (error || !user) {
      return { user: null, error: 'User not found or inactive' };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.roles?.name || 'client_viewer',
        full_name: user.full_name
      },
      error: null
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

export async function requireAdmin(request: NextRequest): Promise<{ user: AuthenticatedUser | null; error: string | null }> {
  const { user, error } = await authenticateUser(request);
  
  if (error || !user) {
    return { user: null, error: error || 'Authentication required' };
  }

  if (user.role !== 'admin') {
    return { user: null, error: 'Admin access required' };
  }

  return { user, error: null };
}
