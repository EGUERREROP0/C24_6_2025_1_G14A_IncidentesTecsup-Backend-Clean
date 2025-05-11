# Sistema de Gestión de Incidentes Tecsup - Backend

Este es el backend del sistema de gestión de incidentes desarrollado para Tecsup. El sistema permite gestionar incidentes técnicos, usuarios y recursos de manera eficiente.

## 🚀 Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript
- **TypeScript**: Superset tipado de JavaScript
- **Express**: Framework web para Node.js
- **Prisma**: ORM para la base de datos
- **PostgreSQL**: Sistema de gestión de base de datos
- **Docker**: Contenedorización de servicios
- **JWT**: Autenticación y autorización
- **Cloudinary**: Gestión de archivos multimedia

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- Docker y Docker Compose
- PostgreSQL
- npm o yarn

## 🔧 Instalación

1. Clonar el repositorio:

```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.template .env
```

Editar el archivo `.env` con tus configuraciones.

4. Iniciar la base de datos con Docker:

```bash
docker-compose up -d
```

5. Ejecutar migraciones de Prisma:
  5.1 Ejecutar ` npx prisma db pull ` para traer todo los cambios de las tablas de la base de datos y sincronizarlos con prisma
  5.2 Ejecutar ` npx prisma generate ` para generar los modelos de prisma
```bash
npx prisma db pull 
npx prisma generate

```

## 🏃‍♂️ Ejecución

- **Desarrollo**:

```bash
npm run dev
```

- **Producción**:

```bash
npm run build
npm start
```

## 📚 Estructura del Proyecto

```
├── src/                # Código fuente
├── prisma/            # Configuración y esquemas de Prisma
├── public/            # Archivos estáticos
├── postgres/          # Configuración de PostgreSQL
├── .env               # Variables de entorno
├── .env.template      # Plantilla de variables de entorno
├── docker-compose.yml # Configuración de Docker
└── package.json       # Dependencias y scripts
```

## 🔐 Variables de Entorno

Las principales variables de entorno incluyen:

- `PORT`: Puerto del servidor
- `DATABASE_URL`: URL de conexión a la base de datos
- `JWT_SECRET`: Secreto para JWT
- `CLOUDINARY_*`: Configuración de Cloudinary

## 📝 Endpoints Principales

- `/api/auth`: Autenticación de usuarios
- `/api/incidents`: Gestión de incidentes
- `/api/users`: Gestión de usuarios
- `/api/resources`: Gestión de recursos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## ✨ Características

- Autenticación JWT
- Gestión de usuarios y roles
- Sistema de incidentes
- Gestión de recursos
- Subida de archivos a Cloudinary
- API RESTful
- Documentación de endpoints
- Validación de datos
- Manejo de errores
