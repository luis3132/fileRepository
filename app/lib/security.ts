import { normalize, isAbsolute, resolve } from 'path';

const UPLOADS_DIR = 'public/uploads';

export function validateFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Nombre de archivo inválido');
  }

  const normalized = normalize(filename);
  
  if (normalized.includes('..') || isAbsolute(normalized)) {
    throw new Error('Ruta no permitida');
  }

  const allowedExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'doc', 'docx', 
    'xls', 'xlsx', 'zip', 'rar', 'webp', 'svg', 'mp4', 'webm', 'mp3'
  ];
  
  const ext = normalized.split('.').pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    throw new Error('Extensión de archivo no permitida');
  }

  const dangerousNames = ['.htaccess', '.htpasswd', '.env', '.git', '.gitignore'];
  if (dangerousNames.some(d => normalized.toLowerCase().includes(d))) {
    throw new Error('Nombre de archivo no permitido');
  }

  return normalized;
}

export function getSecurePath(filename: string): string {
  const safeName = validateFilename(filename);
  const uploadsDir = resolve(process.cwd(), UPLOADS_DIR);
  const filePath = resolve(uploadsDir, safeName);

  if (!filePath.startsWith(uploadsDir)) {
    throw new Error('Acceso denegado');
  }

  return filePath;
}

export function validateToken(token: string | null): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, timestamp] = decoded.split(':');
    
    if (!username || !timestamp) {
      return false;
    }

    const tokenAge = Date.now() - parseInt(timestamp, 10);
    const TOKEN_VALIDITY = 24 * 60 * 60 * 1000;
    
    if (isNaN(parseInt(timestamp, 10)) || tokenAge > TOKEN_VALIDITY) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function generateToken(username: string): string {
  return Buffer.from(`${username}:${Date.now()}`).toString('base64');
}