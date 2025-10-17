# Documentación API SyncNotes

## Índice
- Introducción
- URL Base
- Autenticación
- Flujo de Uso
- Endpoints
  - Autenticación
  - Usuarios
  - Salas
  - Tareas
  - Mensajes
  - Historial
- Códigos de Estado
- Ejemplos de Flujos Completos

## Introducción
SyncNotes es una API REST para gestionar notas colaborativas, tareas y comunicación en tiempo real entre equipos. Permite crear salas de trabajo, asignar tareas, ver mensajes y mantener un historial de cambios.

**Tecnologías:**
- Backend: Spring Boot + Java 21
- Base de datos: MongoDB
- Autenticación: JWT (JSON Web Tokens)
- Documentación: Swagger UI

## URL Base
- **Base URL:** http://localhost:8081/api
- **Swagger UI:** http://localhost:8081/swagger-ui.html

## Autenticación
La API usa JWT (JSON Web Tokens) para autenticación.

**Flujo de autenticación:**
1. El usuario realiza login con email y contraseña.
2. El servidor responde con un token JWT.
3. El cliente debe incluir este token en todas las peticiones protegidas.

**Cómo incluir el token:**
```
Authorization: Bearer <tu_token_jwt_aqui>
```

**Ejemplo de header completo:**
```
POST /api/rooms
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Flujo de Uso
Orden recomendado para usar la API:

1. **CREAR CUENTA** > POST /api/users/signup-user
2. **INICIAR SESIÓN** > POST /api/auth/login (Guardar el token JWT recibido)
3. **OBTENER MIS DATOS** (Opcional) > GET /api/auth/me
4. **CREAR UNA SALA** > POST /api/rooms
5. **VER MIS SALAS** > GET /api/rooms/my-rooms
6. **VER SALAS PÚBLICAS** > GET /api/rooms/public
7. **GESTIONAR MIEMBROS DE SALA** > POST /api/rooms/{roomId}/members (Añadir), PUT /api/rooms/{roomId}/members/{memberId}/role (Cambiar rol)
8. **CREAR TAREAS EN SALA** > POST /api/rooms/{roomId}/tasks
9. **VER TAREAS** > GET /api/rooms/{roomId}/tasks
10. **ACTUALIZAR/COMPLETAR TAREAS** > PUT /api/rooms/{roomId}/tasks/{taskId}
11. **VER MENSAJES DE SALA** > GET /api/rooms/{roomId}/messages
12. **VER HISTORIAL DE CAMBIOS** > GET /api/rooms/{roomId}/history

## Endpoints

### 1. Autenticación

#### 1.1. Iniciar Sesión
- **Endpoint:** POST /api/auth/login
- **Autenticación:** No requerida
- **Descripción:** Autentica un usuario y retorna un token JWT
- **Request:**
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }
  ```
- **Response exitoso (200):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWE...",
    "id": "65a3f2b1c8e4a12345678901",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "roles": ["USER"]
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "usuario@ejemplo.com",
      "password": "password123"
    }'
  ```

#### 1.2. Obtener Usuario Actual
- **Endpoint:** GET /api/auth/me
- **Autenticación:** Requerida (JWT)
- **Descripción:** Obtiene los datos del usuario autenticado
- **Request:** GET /api/auth/me
  ```
  Authorization: Bearer <tu_token>
  ```
- **Response exitoso (200):**
  ```json
  {
    "id": "65a3f2b1c8e4a12345678901",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X GET http://localhost:8080/api/auth/me \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..."
  ```

### 2. Usuarios

#### 2.1. Crear Cuenta (Registro)
- **Endpoint:** POST /api/users/signup-user
- **Autenticación:** No requerida
- **Descripción:** Registra un nuevo usuario en el sistema
- **Request:**
  ```json
  {
    "name": "María García",
    "email": "maria@ejemplo.com",
    "password": "password456"
  }
  ```
- **Response exitoso (201):**
  ```json
  {
    "id": "65a3f2b1c8e4a12345678902",
    "name": "María García",
    "email": "maria@ejemplo.com",
    "createdAt": "2024-01-15T11:00:00Z"
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X POST http://localhost:8080/api/users/signup-user \
    -H "Content-Type: application/json" \
    -d '{
      "name": "María García",
      "email": "maria@ejemplo.com",
      "password": "password456"
    }'
  ```

#### 2.2. Actualizar Usuario
- **Endpoint:** PUT /api/users/update-user/{id}
- **Autenticación:** Requerida (JWT)
- **Descripción:** Actualiza la información de un usuario
- **Request:**
  ```json
  {
    "name": "María García López",
    "email": "maria.garcia@ejemplo.com",
    "password": "newpassword789"
  }
  ```
  *Nota: Todos los campos son opcionales. Solo envía los que quieres actualizar.*
- **Response exitoso (200):**
  ```json
  {
    "id": "65a3f2b1c8e4a12345678902",
    "name": "María García López",
    "email": "maria.garcia@ejemplo.com",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X PUT http://localhost:8081/api/users/update-user/65a3f2b1c8e4a12345678902 \
    -H "Authorization: Bearer <tu_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "María García López"
    }'
  ```

#### 2.3. Eliminar Usuario
- **Endpoint:** DELETE /api/users/delete-user/{id}
- **Autenticación:** Requerida (JWT)
- **Descripción:** Elimina permanentemente un usuario
- **Response exitoso (200):**
  ```json
  {
    "mensaje": "Usuario eliminado exitosamente"
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X DELETE http://localhost:8080/api/users/delete-user/65a3f2b1c8e4a12345678902 \
    -H "Authorization: Bearer <tu_token>"
  ```

### 3. Salas

#### 3.1. Crear Sala
- **Endpoint:** POST /api/rooms
- **Autenticación:** Requerida (JWT)
- **Descripción:** Crea una nueva sala de trabajo
- **Request:**
  ```json
  {
    "name": "Proyecto Frontend",
    "description": "Sala para coordinar el desarrollo del frontend",
    "isPublic": true
  }
  ```
- **Response exitoso (200):**
  ```json
  {
    "id": "65a3f2b1c8e4a12345678903",
    "name": "Proyecto Frontend",
    "description": "Sala para coordinar el desarrollo del frontend",
    "isPublic": true,
    "createdAt": "2024-01-15T15:00:00Z",
    "ownerId": "65a3f2b1c8e4a12345678901",
    "members": [
      {
        "userId": "65a3f2b1c8e4a12345678901",
        "userName": "Juan Pérez",
        "role": "OWNER",
        "joinedAt": "2024-01-15T15:00:00Z"
      }
    ]
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X POST http://localhost:8080/api/rooms \
    -H "Authorization: Bearer <tu_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Proyecto Frontend",
      "description": "Sala para coordinar el desarrollo del frontend",
      "isPublic": true
    }'
  ```

#### 3.2. Obtener Salas Públicas
- **Endpoint:** GET /api/rooms/public
- **Autenticación:** Requerida (JWT)
- **Descripción:** Lista todas las salas públicas disponibles
- **Response exitoso (200):**
  ```json
  [
    {
      "id": "65a3f2b1c8e4a12345678903",
      "name": "Proyecto Frontend",
      "description": "Sala para coordinar el desarrollo del frontend",
      "isPublic": true,
      "createdAt": "2024-01-15T15:00:00Z",
      "members": [
        {
          "userId": "65a3f2b1c8e4a12345678901",
          "userName": "Juan Pérez",
          "role": "OWNER"
        }
      ]
    },
    {
      "id": "65a3f2b1c8e4a12345678904",
      "name": "Comunidad de Desarrolladores",
      "description": "Espacio para compartir conocimiento",
      "isPublic": true,
      "createdAt": "2024-01-14T10:00:00Z",
      "members": [...]
    }
  ]
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X GET http://localhost:8080/api/rooms/public \
    -H "Authorization: Bearer <tu_token>"
  ```

#### 3.3. Obtener Mis Salas
- **Endpoint:** GET /api/rooms/my-rooms
- **Autenticación:** Requerida (JWT)
- **Descripción:** Lista todas las salas donde el usuario es miembro
- **Response exitoso (200):**
  ```json
  [
    {
      "id": "65a3f2b1c8e4a12345678903",
      "name": "Proyecto Frontend",
      "description": "Sala para coordinar el desarrollo del frontend",
      "isPublic": true,
      "myRole": "OWNER",
      "createdAt": "2024-01-15T15:00:00Z",
      "members": [...]
    },
    {
      "id": "65a3f2b1c8e4a12345678905",
      "name": "Proyecto Backend",
      "description": "Desarrollo de la API REST",
      "isPublic": false,
      "myRole": "ADMIN",
      "createdAt": "2024-01-14T09:00:00Z",
      "members": [...]
    }
  ]
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X GET http://localhost:8080/api/rooms/my-rooms \
    -H "Authorization: Bearer <tu_token>"
  ```

#### 3.4. Obtener Detalle de Sala
- **Endpoint:** GET /api/rooms/{roomId}
- **Autenticación:** Requerida (JWT)
- **Descripción:** Obtiene información detallada de una sala específica
- **Response exitoso (200):**
  ```json
  {
    "id": "65a3f2b1c8e4a12345678903",
    "name": "Proyecto Frontend",
    "description": "Sala para coordinar el desarrollo del frontend",
    "isPublic": true,
    "createdAt": "2024-01-15T15:00:00Z",
    "ownerId": "65a3f2b1c8e4a12345678901",
    "members": [
      {
        "userId": "65a3f2b1c8e4a12345678901",
        "userName": "Juan Pérez",
        "userEmail": "usuario@ejemplo.com",
        "role": "OWNER",
        "joinedAt": "2024-01-15T15:00:00Z"
      },
      {
        "userId": "65a3f2b1c8e4a12345678902",
        "userName": "María García",
        "userEmail": "maria@ejemplo.com",
        "role": "ADMIN",
        "joinedAt": "2024-01-15T16:00:00Z"
      }
    ],
    "taskCount": 5,
    "messageCount": 23
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X GET http://localhost:8080/api/rooms/65a3f2b1c8e4a12345678903 \
    -H "Authorization: Bearer <tu_token>"
  ```

#### 3.5. Añadir Miembro a Sala
- **Endpoint:** POST /api/rooms/{roomId}/members
- **Autenticación:** Requerida (JWT)
- **Descripción:** Añade un nuevo miembro a la sala (requiere ser OWNER o ADMIN)
- **Request:**
  ```json
  {
    "email": "carlos@ejemplo.com",
    "role": "MEMBER"
  }
  ```
  *Roles disponibles: MEMBER - Miembro regular, ADMIN - Administrador (puede gestionar miembros), OWNER - Propietario (control total)*
- **Response exitoso (200):**
  ```json
  {
    "id": "65a3f2b1c8e4a12345678903",
    "name": "Proyecto Frontend",
    "members": [
      {
        "userId": "65a3f2b1c8e4a12345678901",
        "userName": "Juan Pérez",
        "role": "OWNER"
      },
      {
        "userId": "65a3f2b1c8e4a12345678906",
        "userName": "Carlos Rodríguez",
        "role": "MEMBER",
        "joinedAt": "2024-01-15T17:00:00Z"
      }
    ]
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X POST http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/members \
    -H "Authorization: Bearer <tu_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "carlos@ejemplo.com",
      "role": "MEMBER"
    }'
  ```

#### 3.6. Actualizar Rol de Miembro
- **Endpoint:** PUT /api/rooms/{roomId}/members/{memberId}/role
- **Autenticación:** Requerida (JWT)
- **Descripción:** Cambia el rol de un miembro (requiere ser OWNER)
- **Query Parameters:** role - Nuevo rol (MEMBER, ADMIN)
- **Response exitoso (200):**
  ```json
  {
    "id": "65a3f2b1c8e4a12345678903",
    "name": "Proyecto Frontend",
    "members": [
      {
        "userId": "65a3f2b1c8e4a12345678906",
        "userName": "Carlos Rodríguez",
        "role": "ADMIN"
      }
    ]
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X PUT "http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/members/65a3f2b1c8e4a12345678906/role?role=ADMIN" \
    -H "Authorization: Bearer <tu_token>"
  ```

#### 3.7. Eliminar Sala
- **Endpoint:** DELETE /api/rooms/{roomId}
- **Autenticación:** Requerida (JWT)
- **Descripción:** Elimina permanentemente una sala (solo OWNER)
- **Response exitoso (204):** No Content
- **Ejemplo con cURL:**
  ```bash
  curl -X DELETE http://localhost:8080/api/rooms/65a3f2b1c8e4a12345678903 \
    -H "Authorization: Bearer <tu_token>"
  ```

### 4. Tareas

#### 4.1. Crear Tarea
- **Endpoint:** POST /api/rooms/{roomId}/tasks
- **Autenticación:** Requerida (JWT)
- **Descripción:** Crea una nueva tarea en una sala
- **Request:**
  ```json
  {
    "title": "Implementar componente de login",
    "description": "Crear el formulario de autenticación con React",
    "priority": "HIGH",
    "dueDate": "2024-01-20T18:00:00Z",
    "assignedTo": "maria@ejemplo.com"
  }
  ```
  *Campos: title (requerido) - Título de la tarea, description (opcional) - Descripción detallada, priority (opcional) - HIGH, MEDIUM, LOW (default: MEDIUM), dueDate (opcional) - Fecha de vencimiento en ISO 8601, assignedTo (opcional) - Email del usuario asignado*
- **Response exitoso (200):**
  ```json
  {
    "id": "65a3f2b1c8e4a12345678910",
    "roomId": "65a3f2b1c8e4a12345678903",
    "title": "Implementar componente de login",
    "description": "Crear el formulario de autenticación con React",
    "priority": "HIGH",
    "completed": false,
    "dueDate": "2024-01-20T18:00:00Z",
    "createdBy": "65a3f2b1c8e4a12345678901",
    "createdByName": "Juan Pérez",
    "assignedTo": "65a3f2b1c8e4a12345678902",
    "assignedToName": "María García",
    "createdAt": "2024-01-15T18:00:00Z"
  }
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X POST http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/tasks \
    -H "Authorization: Bearer <tu_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Implementar componente de login",
      "description": "Crear el formulario de autenticación con React",
      "priority": "HIGH",
      "dueDate": "2024-01-20T18:00:00Z",
      "assignedTo": "maria@ejemplo.com"
    }'
  ```

#### 4.2. Obtener Tareas de Sala
- **Endpoint:** GET /api/rooms/{roomId}/tasks
- **Autenticación:** Requerida (JWT)
- **Descripción:** Lista todas las tareas de una sala
- **Query Parameters (opcionales):** completed - Filtrar por estado (true/false)
- **Response exitoso (200):**
  ```json
  [
    {
      "id": "65a3f2b1c8e4a12345678910",
      "roomId": "65a3f2b1c8e4a12345678903",
      "title": "Implementar componente de login",
      "description": "Crear el formulario de autenticación con React",
      "priority": "HIGH",
      "completed": false,
      "dueDate": "2024-01-20T18:00:00Z",
      "createdByName": "Juan Pérez",
      "assignedToName": "María García",
      "createdAt": "2024-01-15T18:00:00Z"
    },
    {
      "id": "65a3f2b1c8e4a12345678911",
      "title": "Configurar CI/CD",
      "description": "Pipeline de GitHub Actions",
      "priority": "MEDIUM",
      "completed": true,
      "completedAt": "2024-01-16T10:00:00Z",
      "createdByName": "Carlos Rodríguez",
      "createdAt": "2024-01-15T19:00:00Z"
    }
  ]
  ```
- **Ejemplos con cURL:**
  - Todas las tareas:
    ```bash
    curl -X GET http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/tasks \
      -H "Authorization: Bearer <tu_token>"
    ```
  - Solo tareas pendientes:
    ```bash
    curl -X GET "http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/tasks?completed=false" \
      -H "Authorization: Bearer <tu_token>"
    ```
  - Solo tareas completadas:
    ```bash
    curl -X GET "http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/tasks?completed=true" \
      -H "Authorization: Bearer <tu_token>"
    ```

#### 4.3. Actualizar Tarea
- **Endpoint:** PUT /api/rooms/{roomId}/tasks/{taskId}
- **Autenticación:** Requerida (JWT)
- **Descripción:** Actualiza los datos de una tarea
- **Request:**
  ```json
  {
    "title": "Implementar componente de login (ACTUALIZADO)",
    "description": "Agregar validación de formulario",
    "priority": "MEDIUM",
    "completed": true,
    "assignedTo": "carlos@ejemplo.com"
  }
  ```
  *Nota: Todos los campos son opcionales. Solo envía los que quieres actualizar.*
- **Response exitoso (200):**
  ```json
  {
    "id": "65a3f2b1c8e4a12345678910",
    "roomId": "65a3f2b1c8e4a12345678903",
    "title": "Implementar componente de login (ACTUALIZADO)",
    "description": "Agregar validación de formulario",
    "priority": "MEDIUM",
    "completed": true,
    "completedAt": "2024-01-16T14:30:00Z",
    "assignedToName": "Carlos Rodríguez",
    "updatedAt": "2024-01-16T14:30:00Z"
  }
  ```
- **Ejemplo con cURL (marcar como completada):**
  ```bash
  curl -X PUT http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/tasks/65a3f2b1c8e4a12345678910 \
    -H "Authorization: Bearer <tu_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "completed": true
    }'
  ```

#### 4.4. Eliminar Tarea
- **Endpoint:** DELETE /api/rooms/{roomId}/tasks/{taskId}
- **Autenticación:** Requerida (JWT)
- **Descripción:** Elimina una tarea
- **Response exitoso (204):** No Content
- **Ejemplo con cURL:**
  ```bash
  curl -X DELETE http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/tasks/65a3f2b1c8e4a12345678910 \
    -H "Authorization: Bearer <tu_token>"
  ```

### 5. Mensajes

#### 5.1. Obtener Mensajes de Sala
- **Endpoint:** GET /api/rooms/{roomId}/messages
- **Autenticación:** Requerida (JWT)
- **Descripción:** Lista todos los mensajes de una sala
- **Response exitoso (200):**
  ```json
  [
    {
      "id": "65a3f2b1c8e4a12345678920",
      "roomId": "65a3f2b1c8e4a12345678903",
      "senderId": "65a3f2b1c8e4a12345678901",
      "senderName": "Juan Pérez",
      "content": "¡Hola equipo! ¿Cómo van con el componente de login?",
      "timestamp": "2024-01-15T18:30:00Z",
      "type": "TEXT"
    },
    {
      "id": "65a3f2b1c8e4a12345678921",
      "roomId": "65a3f2b1c8e4a12345678903",
      "senderId": "65a3f2b1c8e4a12345678902",
      "senderName": "María García",
      "content": "Ya casi termino, solo falta la validación",
      "timestamp": "2024-01-15T18:35:00Z",
      "type": "TEXT"
    },
    {
      "id": "65a3f2b1c8e4a12345678922",
      "roomId": "65a3f2b1c8e4a12345678903",
      "senderId": "65a3f2b1c8e4a12345678901",
      "senderName": "Juan Pérez",
      "content": "Carlos se unió a la sala",
      "timestamp": "2024-01-15T17:00:00Z",
      "type": "SYSTEM"
    }
  ]
  ```
- **Ejemplo con cURL:**
  ```bash
  curl -X GET http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/messages \
    -H "Authorization: Bearer <tu_token>"
  ```
  *Nota: Los mensajes se ordenan por timestamp (más recientes primero o según configuración del backend).*

### 6. Historial

#### 6.1. Obtener Historial de Sala
- **Endpoint:** GET /api/rooms/{roomId}/history
- **Autenticación:** Requerida (JWT)
- **Descripción:** Obtiene el historial de cambios realizados en una sala
- **Response exitoso (200):**
  ```json
  [
    {
      "id": "65a3f2b1c8e4a12345678930",
      "roomId": "65a3f2b1c8e4a12345678903",
      "userId": "65a3f2b1c8e4a12345678901",
      "userName": "Juan Pérez",
      "action": "TASK_CREATED",
      "entityType": "TASK",
      "entityId": "65a3f2b1c8e4a12345678910",
      "description": "Creó la tarea: Implementar componente de login",
      "timestamp": "2024-01-15T18:00:00Z",
      "changes": {
        "title": "Implementar componente de login",
        "priority": "HIGH",
        "assignedTo": "María García"
      }
    },
    {
      "id": "65a3f2b1c8e4a12345678931",
      "roomId": "65a3f2b1c8e4a12345678903",
      "userId": "65a3f2b1c8e4a12345678902",
      "userName": "María García",
      "action": "TASK_COMPLETED",
      "entityType": "TASK",
      "entityId": "65a3f2b1c8e4a12345678910",
      "description": "Completó la tarea: Implementar componente de login",
      "timestamp": "2024-01-16T14:30:00Z",
      "changes": {
        "completed": true
      }
    },
    {
      "id": "65a3f2b1c8e4a12345678932",
      "roomId": "65a3f2b1c8e4a12345678903",
      "userId": "65a3f2b1c8e4a12345678901",
      "userName": "Juan Pérez",
      "action": "MEMBER_ADDED",
      "entityType": "MEMBER",
      "entityId": "65a3f2b1c8e4a12345678906",
      "description": "Añadió a Carlos Rodríguez como MEMBER",
      "timestamp": "2024-01-15T17:00:00Z",
      "changes": {
        "memberName": "Carlos Rodríguez",
        "role": "MEMBER"
      }
    }
  ]
  ```
  *Tipos de acciones: ROOM_CREATED - Sala creada, MEMBER_ADDED - Miembro añadido, MEMBER_REMOVED - Miembro eliminado, ROLE_CHANGED - Rol de miembro cambiado, TASK_CREATED - Tarea creada, TASK_UPDATED - Tarea actualizada, TASK_COMPLETED - Tarea completada, TASK_DELETED - Tarea eliminada*
- **Ejemplo con cURL:**
  ```bash
  curl -X GET http://localhost:8081/api/rooms/65a3f2b1c8e4a12345678903/history \
    -H "Authorization: Bearer <tu_token>"
  ```

## Códigos de Estado
- **Respuestas Exitosas**
  - 200 OK - Petición exitosa
  - 201 Created - Recurso creado exitosamente
  - 204 No Content - Operación exitosa sin contenido de respuesta
- **Errores del Cliente**
  - 400 Bad Request - Datos de entrada inválidos
  - 401 Unauthorized - Token JWT inválido o expirado
  - 403 Forbidden - No tienes permisos para esta acción
  - 404 Not Found - Recurso no encontrado
- **Errores del Servidor**
  - 500 Internal Server Error - Error interno del servidor

*Ejemplo de respuesta de error:*
```json
{
  "timestamp": "2024-01-15T18:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "El email ya está registrado",
  "path": "/api/users/signup-user"
}
```

## Ejemplos de Flujos Completos

### Flujo 1: Usuario Nuevo Completo
```bash
# 1. Crear cuenta
curl -X POST http://localhost:8080/api/users/signup-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro Sánchez",
    "email": "pedro@ejemplo.com",
    "password": "pass123"
  }'
# 2. Iniciar sesión

curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pedro@ejemplo.com",
    "password": "pass123"
  }'
# Respuesta: Guarda el token JWT
# 3. Obtener mis datos

curl -X GET http://localhost:8081/api/auth/me \
  -H "Authorization: Bearer <token>"

# 4. Crear una sala

curl -X POST http://localhost:8081/api/rooms \
  -H "Authorization: Bearer <tokenA>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Proyecto Equipo",
    "description": "Colaboración en equipo",
    "isPublic": true
  }'
# 2. Usuario A: Añadir Usuario B como ADMIN

curl -X POST http://localhost:8081/api/rooms/<roomId>/members \
  -H "Authorization: Bearer <tokenA>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuarioB@ejemplo.com",
    "role": "ADMIN"
  }'
# 3. Usuario B: Ver salas públicas

curl -X GET http://localhost:8081/api/rooms/public \
  -H "Authorization: Bearer <tokenB>"
# 4. Usuario B: Ver mis salas

curl -X GET http://localhost:8081/api/rooms/my-rooms \
  -H "Authorization: Bearer <tokenB>"

# 5. Usuario B: Crear tarea en la sala

curl -X POST http://localhost:8081/api/rooms/<roomId>/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Diseñar base de datos",
    "description": "Crear diagrama ER y normalización",
    "priority": "HIGH",
    "dueDate": "2024-01-25T23:59:59Z",
    "assignedTo": "maria@ejemplo.com"
  }'
# 2. Ver solo tareas pendientes

curl -X GET "http://localhost:8081/api/rooms/<roomId>/tasks?completed=false" \
  -H "Authorization: Bearer <token>"

# 3. Actualizar tarea (cambiar prioridad)
curl -X PUT http://localhost:8080/api/rooms/<roomId>/tasks/<taskId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "MEDIUM"
  }'
# 4. Marcar tarea como completada

curl -X PUT http://localhost:8081/api/rooms/<roomId>/tasks/<taskId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'

# 5. Ver solo tareas completadas
curl -X GET "http://localhost:8080/api/rooms/<roomId>/tasks?completed=true" \
  -H "Authorization: Bearer <token>"
```

## Notas Finales

### Buenas Prácticas
- Siempre incluye el token JWT en las peticiones autenticadas
- Valida los datos antes de enviarlos
- Maneja los errores apropiadamente en tu cliente
- Guarda el token de forma segura (localStorage en web, keychain en mobile)
- Refresca el token cuando sea necesario
- No expongas el token en URLs o logs

### Testing con Postman
Puedes importar esta API en Postman:
- Crea una nueva colección
- Configura una variable de entorno baseUrl = http://localhost:8081/api
- Configura una variable token para el JWT
- Usa {{baseUrl}} y {{token}} en tus requests

### Swagger UI
Para una documentación interactiva y probar los endpoints directamente:
http://localhost:8081/swagger-ui.html

## Códigos de Estado
- 200: OK
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Ejemplos de Flujos Completos
1. **Registro y Login:** Regístrate con POST /api/users/signup-user, luego login con POST /api/auth/login para obtener token.
2. **Crear Sala y Tarea:** Usa el token para POST /api/rooms, luego POST /api/rooms/{id}/tasks.
3. **Ver Datos:** GET /api/auth/me para obtener usuario, salas y tareas.