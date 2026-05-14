'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Table,
  Loading,
  ThemeToggle,
} from 'neogestify-ui-components';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

interface FileInfo {
  name: string;
  size: number;
  uploadedAt: string;
  downloadUrl: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files/list');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const sanitizeFilename = (name: string): string => {
    return name.replace(/[<>\"'&]/g, '');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const tableHeaders = ['Nombre', 'Tamaño', 'Fecha', 'Acción'];
  const tableRows = files.map((file) => [
    sanitizeFilename(file.name),
    formatFileSize(file.size),
    formatDate(file.uploadedAt),
    <a
      key={file.name}
      href={file.downloadUrl}
      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
    >
      Descargar
    </a>,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left w-full sm:w-auto">
            Archivos Disponibles
          </h1>
          <div className="flex items-center justify-center sm:justify-end gap-4">
            <ClientOnly>
              <ThemeToggle />
            </ClientOnly>
            <Link href="/admin">
              <Button variant="primary" className="text-sm">
                Administración
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loading />
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No hay archivos disponibles</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <Table
                columns={tableHeaders}
                rows={tableRows}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}