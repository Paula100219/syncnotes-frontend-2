# Documentación Completa del Proyecto SyncNotes

## Descripción General del Sistema
SyncNotes es una aplicación web colaborativa para la gestión de notas y tareas en equipos. Permite a los usuarios crear salas de trabajo, asignar tareas, gestionar miembros y mantener un historial de actividades. El sistema está dividido en un frontend desarrollado en React y un backend en Spring Boot con MongoDB, facilitando la colaboración en tiempo real y la organización de proyectos.

## Principales Funcionalidades
- **Autenticación**: Registro e inicio de sesión de usuarios con JWT.
- **Salas**: Creación de salas públicas o privadas para organizar proyectos.
- **Tareas**: Creación, asignación, actualización y eliminación de tareas dentro de salas.
- **Miembros**: Gestión de miembros en salas, con roles (Propietario, Administrador, Miembro, Lector).
- **Mensajes**: Comunicación dentro de salas (aunque no implementado en el frontend actual).
- **Historial**: Registro de cambios en salas, tareas y miembros.

## Arquitectura del Sistema

### Frontend (React)
- **Tecnologías**: React 19, Vite, TailwindCSS, Styled Components, React Router DOM.
- **Estructura**:
  - `src/pages/`: Páginas principales (Login, Register, Dashboard, RoomDetail, etc.).
  - `src/components/`: Componentes reutilizables (Navbar, AuthForm, Button, etc.).
  - `src/services/`: Lógica de API (api.js para llamadas al backend).
- **Características**: Interfaz oscura y moderna, responsiva, con animaciones y transiciones. Manejo de estado local y navegación protegida.

### Backend (Spring Boot con MongoDB)
- **Tecnologías**: Spring Boot, Java 21, MongoDB, JWT para autenticación.
- **Estructura**: API REST con endpoints para usuarios, salas, tareas, mensajes e historial.
- **Características**: Autenticación segura, gestión de roles, operaciones CRUD completas, documentación con Swagger UI.

## Flujo General entre Frontend y Backend
1. **Autenticación**: Usuario se registra o inicia sesión en el frontend, enviando datos al backend. Backend valida y retorna un token JWT.
2. **Navegación Protegida**: Frontend usa el token para acceder a rutas protegidas, verificando con `/api/auth/me`.
3. **Gestión de Salas**: Usuario crea salas, las lista, y accede a detalles. Backend maneja la lógica de permisos y roles.
4. **Tareas y Miembros**: Dentro de una sala, el frontend permite crear tareas, gestionar miembros y ver historial, sincronizando con el backend.
5. **Comunicación**: Todas las interacciones pasan por la API REST, con manejo de errores y estados de carga en el frontend.

## Tecnologías Utilizadas
- **Frontend**:
  - React: Biblioteca para interfaces de usuario.
  - Vite: Herramienta de desarrollo rápida.
  - TailwindCSS: Framework CSS utilitario.
  - Styled Components: Estilos CSS en JavaScript.
  - React Router DOM: Navegación entre páginas.
  - ESLint: Linting de código.
- **Backend**:
  - Spring Boot: Framework para aplicaciones Java.
  - MongoDB: Base de datos NoSQL.
  - JWT: Autenticación basada en tokens.
  - Swagger: Documentación de API.
- **Herramientas Generales**:
  - Git: Control de versiones.
  - Node.js: Entorno de ejecución para el frontend.
  - Java 21: Para el backend.

## Pasos para Ejecutar el Proyecto
### Prerrequisitos
- Node.js (versión 18 o superior).
- Java 21.
- MongoDB corriendo localmente o en la nube.
- Backend corriendo en `http://localhost:8081`.

### Instalación y Ejecución
1. **Clonar el repositorio**:
   ```
   git clone <url-del-repo>
   cd syncnotes-frontend-2
   ```

2. **Instalar dependencias del frontend**:
   ```
   npm install
   ```

3. **Configurar variables de entorno**:
   - Crear un archivo `.env` en la raíz con:
     ```
     VITE_API_BASE=http://localhost:8081
     ```

4. **Ejecutar el frontend**:
   ```
   npm run dev
   ```
   - Abre en `http://localhost:5173` (por defecto).

5. **Ejecutar el backend** (en otro terminal):
   - Asegúrate de que el backend esté configurado y corriendo en `http://localhost:8081`.
   - Consulta la documentación del backend para detalles.

6. **Acceder a la aplicación**:
   - Ve a `http://localhost:5173/login` para iniciar sesión.
   - Regístrate si es necesario, luego accede al dashboard.

### Comandos Útiles
- `npm run build`: Construir para producción.
- `npm run preview`: Vista previa del build.
- `npm run lint`: Revisar código con ESLint.

## Posibles Mejoras Futuras
- **Mensajes en Tiempo Real**: Implementar WebSockets para chat en vivo.
- **Notificaciones**: Sistema de notificaciones push para tareas y menciones.
- **Archivos Adjuntos**: Permitir subir archivos a tareas o mensajes.
- **Calendario**: Vista de calendario para fechas de vencimiento de tareas.
- **Internacionalización**: Soporte para múltiples idiomas.
- **Pruebas**: Añadir tests unitarios e integración (Jest, Cypress).
- **PWA**: Convertir en Progressive Web App para uso offline.
- **Análisis**: Integrar herramientas de analytics para uso de la app.
- **Seguridad**: Implementar 2FA y encriptación adicional.
- **UI/UX**: Mejoras en accesibilidad y diseño móvil.

### Notas
- El proyecto usa un backend separado para autenticación y datos.
