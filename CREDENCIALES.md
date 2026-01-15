# Credenciales de Administrador

## Usuario Admin

Tienes que crear un archivo .env con las variables de entorno:
 - ADMIN_USERNAME: defines el usuario
 - ADMIN_PASSWORD: defines la contrasena

## Importante

- Estas credenciales están configuradas en el archivo `.env.local`
- Solo el usuario admin puede subir archivos
- Todos los usuarios pueden ver y descargar archivos sin autenticación

## Uso

1. **Página principal** (`/`): Ver y descargar archivos
2. **Panel de administración** (`/admin`): Iniciar sesión y subir archivos

## Seguridad

- Cambia la contraseña en el archivo `.env.local` antes de desplegar en producción
- Los archivos subidos se guardan en `public/uploads/`
- Las sesiones expiran después de 24 horas
