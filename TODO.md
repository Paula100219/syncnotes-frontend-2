# Plan de Implementación Visual de Login y Registro

## Información Recopilada
- Proyecto React con Vite y TailwindCSS.
- Archivos existentes: Login.jsx, Register.jsx con lógica de formularios y conexiones al backend.
- Necesidad de rediseño visual con dark mode, minimalismo y animaciones.
- Mantener intacta la lógica de estado, manejo de formularios y conexiones al backend.

## Plan Detallado
- [x] Instalar styled-components.
- [x] Crear componente Navbar con variantes para login y register.
- [x] Crear componentes estilizados para inputs y botones con animaciones.
- [x] Crear componente AuthForm para el formulario central.
- [x] Actualizar Login.jsx con nuevo diseño visual.
- [x] Actualizar Register.jsx con nuevo diseño visual.
- [x] Implementar animaciones de transición entre pantallas.
- [ ] Probar responsividad y animaciones.

## Archivos a Editar
- src/pages/Login.jsx
- src/pages/Register.jsx
- Crear: src/components/Navbar.jsx
- Crear: src/components/AuthForm.jsx
- Crear: src/components/StyledInput.jsx
- Crear: src/components/StyledButton.jsx

## Pasos de Seguimiento
- [ ] Verificar cambios en archivos.
- [ ] Confirmar con usuario para modificaciones adicionales.

## Documentación del Proyecto

### Descripción General
SyncNotes es una aplicación web para tomar notas, construida con React y Vite. Incluye páginas para iniciar sesión, registrarse y una página principal. Usa estilos modernos con Tailwind CSS y componentes estilizados para una interfaz oscura y elegante.

### Librerías Usadas
- **React**: Base de la interfaz de usuario, permite crear componentes reutilizables.
- **React DOM**: Maneja la renderización en el navegador.
- **React Router DOM**: Navegación entre páginas.
- **Styled Components**: Estilos CSS en JavaScript para componentes elegantes.
- **Tailwind CSS**: Sistema de clases para diseños rápidos y responsivos.
- **Vite**: Herramienta de desarrollo rápida.
- **ESLint**: Revisión de código para mantenerlo limpio.

### Archivos Principales
- **TODO.md**: Portada del proyecto, explica qué es y cómo usarlo.
- **package.json**: Lista de ingredientes (librerías) necesarias.
- **index.html**: Página base que carga la app.
- **src/main.jsx**: Punto de inicio de React.
- **src/App.jsx**: Mapa de rutas (login, registro, inicio).
- **src/pages/Home.jsx**: Página principal después de login.
- **src/pages/Login.jsx**: Página de entrada con formulario.
- **src/pages/Register.jsx**: Página de registro con formulario.
- **src/pages/Login.css**: Estilos oscuros para login y registro.
- **src/components/Navbar.jsx**: Barra de navegación con logo y botones.
- **src/components/AuthForm.jsx**: Formulario reutilizable para login y registro.
- **src/components/Button.jsx, FormInput.jsx, StyledButton.jsx, StyledInput.jsx**: Componentes para botones e inputs.
- **src/services/api.js**: Funciones para conectarse al servidor (login, registro).

### Lógica de Login y Register
- **Login**: Recoge usuario y contraseña, envía al servidor, si ok guarda token y va a /home.
- **Register**: Recoge nombre, usuario y contraseña, crea cuenta, muestra mensaje y va a login.

### Notas
- El proyecto usa un backend separado para autenticación y datos.
