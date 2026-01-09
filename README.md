# API de Gestión de Configuraciones Multi-Tenant

Servicio backend RESTful para gestionar configuraciones de múltiples organizaciones (Tenants) de forma aislada, segura y escalable.

---

## Tabla de Contenidos
- [Tecnologías](#tecnologías)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [Pruebas (cURL)](#pruebas-curl)
- [Propuesta de Diseño: Audit Log](#propuesta-de-diseño-audit-log)

---

## 🚀 Tecnologías
- **Node.js** + **Express**
- **PostgreSQL** (Base de datos)
- **pg** (Cliente Postgres)
- **Arquitectura:** En Capas (Layered Architecture: Controller - Service - Repository)

---

## ⚙️ Instalación y Configuración

### Prerrequisitos
- Node.js y PostgreSQL instalados.

### Instalación de dependencias
```bash
npm install
```

### Configuración de Base de Datos
Ejecuta este script en tu cliente de PostgreSQL:
```sql
DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    is_immutable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Índice único compuesto para garantizar aislamiento y unicidad por tenant
CREATE UNIQUE INDEX idx_settings_tenant_key ON settings (tenant_id, key_name);
```

---

## 🔑 Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

| Variable     | Valor por defecto | Descripción                  |
|--------------|-------------------|------------------------------|
| PORT         | 3000              | Puerto del servidor          |
| DB_USER      | postgres          | Usuario de la base de datos  |
| DB_HOST      | localhost         | Host de la base de datos     |
| DB_NAME      | postgres          | Nombre de la base de datos   |
| DB_PASSWORD  | tu_contraseña     | Contraseña de la base de datos |
| DB_PORT      | 5432              | Puerto de PostgreSQL         |

Ejemplo:
```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=postgres
DB_PASSWORD=tu_contraseña_real
DB_PORT=5432
```

---

## ▶️ Ejecución
Para iniciar el servidor en modo desarrollo:
```bash
npm run dev
```
El servidor escuchará en: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Pruebas (Ejemplos cURL)
> Todas las peticiones requieren el header `x-tenant-id` para garantizar el aislamiento.

### Crear Configuración (POST)
```bash
curl -X POST http://localhost:3000/settings \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: empresa_a" \
  -d '{"key": "theme", "value": "dark", "is_immutable": false}'
```

### Obtener Configuraciones (GET)
```bash
curl -X GET http://localhost:3000/settings \
  -H "x-tenant-id: empresa_a"
```

### Actualizar Configuración (PUT)
```bash
curl -X PUT http://localhost:3000/settings/theme \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: empresa_a" \
  -d '{"value": "light"}'
```

### Eliminar Configuración (DELETE)
> Si `is_immutable` es `true`, la API retornará **403 Forbidden**.
```bash
curl -X DELETE http://localhost:3000/settings/theme \
  -H "x-tenant-id: empresa_a"
```

---
