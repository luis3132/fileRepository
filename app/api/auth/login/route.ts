import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { generateToken } from '@/app/lib/security';

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b)) || a === b;
  } catch {
    return a === b;
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const attempts = loginAttempts.get(clientIP);
    const now = Date.now();

    if (attempts && attempts.count >= MAX_ATTEMPTS) {
      const lockoutRemaining = attempts.lastAttempt + LOCKOUT_TIME - now;
      if (lockoutRemaining > 0) {
        return NextResponse.json(
          { error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(lockoutRemaining / 60000)} minutos` },
          { status: 429 }
        );
      }
    }

    const { username, password } = await request.json();

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Usuario y contraseña requeridos' },
        { status: 400 }
      );
    }

    if (username.length > 100 || password.length > 100) {
      return NextResponse.json(
        { error: 'Credenciales demasiado largas' },
        { status: 400 }
      );
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('Credenciales de admin no configuradas en el servidor');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const usernameValid = secureCompare(username, adminUsername);
    const passwordValid = secureCompare(password, adminPassword);

    if (usernameValid && passwordValid) {
      loginAttempts.delete(clientIP);
      const token = generateToken(username);
      return NextResponse.json({ success: true, token });
    }

    const currentAttempts = attempts?.count || 0;
    loginAttempts.set(clientIP, { count: currentAttempts + 1, lastAttempt: now });

    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error en el servidor al iniciar sesión:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}