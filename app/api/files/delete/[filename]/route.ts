import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Verificar token de autenticación desde el header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
