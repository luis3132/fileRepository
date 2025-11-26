import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads');

    try {
      const files = await readdir(uploadsDir);

      const fileDetails = await Promise.all(
        files.map(async (filename) => {
          const filePath = join(uploadsDir, filename);
          const stats = await stat(filePath);

          return {
            name: filename,
            size: stats.size,
            uploadedAt: stats.mtime,
            downloadUrl: `/api/files/download/${encodeURIComponent(filename)}`
          };
        })
      );

      return NextResponse.json({ files: fileDetails });
    } catch (error) {
      console.error('Error al listar archivos:', error);
      return NextResponse.json({ files: [] });
    }
  } catch (error) {
    console.error('Error al listar archivos:', error);
    return NextResponse.json(
      { error: 'Error al listar archivos' },
      { status: 500 }
    );
  }
}
