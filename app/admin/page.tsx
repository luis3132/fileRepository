'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
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

      if (response.ok) {
        setAuthenticated(true);
        setUsername('');
        setPassword('');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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
      const response = await fetch('/api/files/list');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/files/delete/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recargar la lista de archivos
        fetchFiles();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar el archivo');
      }
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      alert('Error al eliminar el archivo');
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Recargar la lista de archivos
        fetchFiles();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al subir el archivo');
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Inicio de Sesión - Admin
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium"
              >
                Iniciar Sesión
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                Volver a inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <div className="space-x-4">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver archivos
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Subir Archivo</h2>

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar archivo
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  file:cursor-pointer cursor-pointer"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Archivo seleccionado: <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {uploadSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
                Archivo subido exitosamente
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Subiendo...' : 'Subir Archivo'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Archivos Subidos</h2>

          {loadingFiles ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando archivos...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay archivos subidos</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamaño
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {file.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <a
                          href={file.downloadUrl}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Descargar
                        </a>
                        <button
                          onClick={() => handleDelete(file.name)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
