import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { resolve } from 'path';

const UPLOADS_DIR = 'public/uploads';

export async function GET() {
  try {
    const uploadsDir = resolve(process.cwd(), UPLOADS_DIR);

    try {
      const files = await readdir(uploadsDir);

      const fileDetails = await Promise.all(
        files.map(async (filename) => {
          const filePath = resolve(uploadsDir, filename);
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
      return NextResponse.json({ files: [] });
    }
  } catch (error) {
    return NextResponse.json({ files: [] });
  }
}
