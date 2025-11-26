import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';

// Configuración para permitir archivos grandes (hasta 500MB)
export const runtime = 'nodejs';
export const maxDuration = 600; // 10 minutos de timeout

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Leer el archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear el directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error al crear el directorio de uploads:', error);
    }

    // Guardar el archivo
    const filePath = join(uploadsDir, file.name);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
