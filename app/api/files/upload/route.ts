import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { resolve } from 'path';
import { validateToken, validateFilename } from '@/app/lib/security';

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const UPLOADS_DIR = 'public/uploads';

export const runtime = 'nodejs';
export const maxDuration = 600;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (!validateToken(token)) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo de 500MB' },
        { status: 400 }
      );
    }

    const safeFilename = validateFilename(file.name);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = resolve(process.cwd(), UPLOADS_DIR);
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error al crear el directorio de uploads:', error);
    }

    const filePath = resolve(uploadsDir, safeFilename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename: safeFilename,
      size: file.size
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al subir archivo:', message);
    
    if (message.includes('no permitida') || message.includes('inválido')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
