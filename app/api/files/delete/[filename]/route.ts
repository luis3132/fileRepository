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

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
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
