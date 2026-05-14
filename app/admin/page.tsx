'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Input,
  Form,
  Table,
  Loading,
  Modal,
  InfoAlert,
  ThemeToggle,
  AlertaAdvertencia,
  AlertaExito,
  AlertaError,
} from 'neogestify-ui-components';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

interface FileInfo {
  name: string;
  size: number;
  uploadedAt: string;
  downloadUrl: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const router = useRouter();
  const modalRef = useRef<{ handleClose: () => void } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchFiles();
    }
  }, [authenticated]);

  const checkAuth = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      setAuthenticated(!!token);
    } catch (err) {
      console.error('Error al verificar autenticación:', err);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        if (typeof window !== 'undefined') localStorage.setItem('authToken', data.token);
        setAuthenticated(true);
        setUsername('');
        setPassword('');
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al iniciar sesión');
    }
  };

  const handleLogout = async () => {
    AlertaAdvertencia(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      async () => {
        if (typeof window !== 'undefined') localStorage.removeItem('authToken');
        setAuthenticated(false);
        router.push('/');
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const response = await fetch('/api/files/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Error al cargar archivos:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const sanitizeFilename = (name: string): string => {
    return name.replace(/[<>\"'&]/g, '');
  };

  const handleDelete = async (filename: string) => {
    AlertaAdvertencia(
      'Eliminar archivo',
      `¿Estás seguro de eliminar "${sanitizeFilename(filename)}"?`,
      async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
          const response = await fetch(`/api/files/delete/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            AlertaExito('Eliminado', 'Archivo eliminado correctamente');
            fetchFiles();
          } else {
            const data = await response.json();
            AlertaError('Error', data.error || 'Error al eliminar el archivo');
          }
        } catch (err) {
          console.error('Error al eliminar el archivo:', err);
          AlertaError('Error', 'Error al eliminar el archivo');
        }
      }
    );
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setUploadSuccess(false);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        AlertaExito('Éxito', 'Archivo subido correctamente');
        fetchFiles();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al subir el archivo');
      }
    } catch (err) {
      console.error('Error al subir el archivo:', err);
      setError('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loading />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Inicio de Sesión - Admin
            </h1>

            <Form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Usuario"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
              />

              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />

              {error && (
                <InfoAlert title="Error" text={error} />
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={false}
                className="w-full"
              >
                Iniciar Sesión
              </Button>
            </Form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Volver a inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tableHeaders = ['Nombre', 'Tamaño', 'Fecha', 'Acciones'];
  const tableRows = files.map((file) => [
    sanitizeFilename(file.name),
    formatFileSize(file.size),
    formatDate(file.uploadedAt),
    <div key={file.name} className="flex gap-2">
      <a
        href={file.downloadUrl}
        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
      >
        Descargar
      </a>
      <button
        onClick={() => handleDelete(file.name)}
        className="text-red-600 dark:text-red-400 hover:underline text-sm"
      >
        Eliminar
      </button>
    </div>,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-3 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
            Panel de Administración
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline text-center text-sm sm:text-base py-2 sm:py-0"
            >
              Ver archivos
            </Link>
            <ClientOnly>
              <ThemeToggle />
            </ClientOnly>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="text-sm"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Subir Archivo
          </h2>

          <Form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Seleccionar archivo
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4
                  file:rounded file:border-0
                  file:text-xs sm:file:text-sm file:font-medium
                  file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-800
                  file:cursor-pointer cursor-pointer"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Archivo: <span className="font-medium break-all">{sanitizeFilename(selectedFile.name)}</span>
                </p>
              )}
            </div>

            {error && (
              <InfoAlert title="Error" text={error} />
            )}

            {uploadSuccess && (
              <InfoAlert title="Éxito" text="Archivo subido exitosamente" />
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={uploading}
              loadingText="Subiendo..."
              disabled={!selectedFile}
              className="w-full"
            >
              Subir Archivo
            </Button>
          </Form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Archivos Subidos
          </h2>

          {loadingFiles ? (
            <div className="text-center py-8">
              <Loading />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No hay archivos subidos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                columns={tableHeaders}
                rows={tableRows}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}