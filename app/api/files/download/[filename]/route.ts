import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { getSecurePath } from '@/app/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = getSecurePath(filename);

    // Leer el archivo
    const fileBuffer = await readFile(filePath);

    // Obtener el tipo de contenido basado en la extensión
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

    // Retornar el archivo con headers apropiados
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    return NextResponse.json(
      { error: 'Archivo no encontrado' },
      { status: 404 }
    );
  }
}
