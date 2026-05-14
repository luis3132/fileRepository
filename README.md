# File Repository - Sistema de Gestión de Archivos

Servidor de gestión de archivos con autenticación para subir, listar, descargar y eliminar archivos.

## Requisitos

- Bun (recomendado) o Node.js 18+
- npm/yarn/pnpm

## Instalación

```bash
bun install
```

## Configuración

1. Copia el archivo de configuración de ejemplo:

```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales:

```env
ADMIN_USERNAME=tu_usuario
ADMIN_PASSWORD=tu_contraseña_segura
```

## Ejecutar

```bash
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/check` | Verificar token | No |
| GET | `/api/files/list` | Listar archivos | Sí |
| POST | `/api/files/upload` | Subir archivo | Sí |
| GET | `/api/files/download/:name` | Descargar archivo | Sí |
| DELETE | `/api/files/delete/:name` | Eliminar archivo | Sí |

## Roles

- **Público**: Ver y descargar archivos
- **Admin**: Subir, eliminar y listar archivos

## Medidas de Seguridad

- Rate limiting en login (5 intentos/15min)
- Tokens con expiración de 24h
- Validación de nombres de archivo (previene path traversal)
- Extensiones de archivo restringidas
- Cabeceras de seguridad (CSP, X-Frame-Options, etc.)
- Sanitización de datos en frontend

## Estructura

```
├── app/
│   ├── api/           # Endpoints de la API
│   ├── admin/         # Panel de administración
│   └── page.tsx       # Página principal
├── lib/
│   └── security.ts    # Utilidades de seguridad
└── public/
    └── uploads/       # Archivos subidos
```