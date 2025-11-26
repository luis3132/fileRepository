import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('Intento de inicio de sesión con usuario:', process.env.ADMIN_PASSWORD);

    if (username === adminUsername && password === adminPassword) {
      const cookieStore = await cookies();

      // Crear una sesión simple con timestamp de expiración
      const expiresAt = Date.now() + (4 * 60 * 60 * 1000); // 4 horas en milisegundos
      const sessionData = {
        username,
        expiresAt
      };
      const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

      cookieStore.set('session', sessionToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 4 * 60 * 60, // 4 horas en segundos
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

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
