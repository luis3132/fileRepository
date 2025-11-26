import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session?.value) {
      return NextResponse.json(
        { error: 'No autorizado - No hay sesión' },
        { status: 401 }
      );
    }

    // Validar que la sesión no haya expirado
    try {
      const sessionData = JSON.parse(Buffer.from(session.value, 'base64').toString());
      if (!sessionData.expiresAt || Date.now() >= sessionData.expiresAt) {
        return NextResponse.json(
          { error: 'No autorizado - Sesión expirada' },
          { status: 401 }
        );
      }
    } catch (e) {
      console.error('Error al validar sesión:', e);
      return NextResponse.json(
        { error: 'No autorizado - Sesión inválida' },
        { status: 401 }
      );
    }

    const { filename } = await params;
    const filePath = join(process.cwd(), 'public', 'uploads', filename);

    // Eliminar el archivo
    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el archivo' },
      { status: 500 }
    );
  }
}
