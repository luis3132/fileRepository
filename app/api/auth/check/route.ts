import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session?.value) {
      return NextResponse.json({ authenticated: false });
    }

    // Decodificar y validar la sesión
    try {
      const sessionData = JSON.parse(Buffer.from(session.value, 'base64').toString());

      // Verificar si la sesión ha expirado
      if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
        return NextResponse.json({ authenticated: true });
      }
    } catch (e) {
      console.error('Error al decodificar sesión:', e);
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return NextResponse.json({ authenticated: false });
  }
}
