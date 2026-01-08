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
- **Arquitectura:** MVC (Model-View-Controller)

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

## 📝 Propuesta de Diseño: Audit Log

### 1. Modelo de Datos
Se recomienda una tabla `audit_logs` independiente (o colección NoSQL) con la estructura:
- `id`, `tenant_id`, `entity_key`
- `action` (CREATE, UPDATE, DELETE)
- `actor_id` (quién hizo el cambio)
- `changes` (JSONB con valores old_value / new_value)
- `timestamp`

### 2. Estrategia (Asíncrona)
- Basada en eventos: el servicio principal emite un evento de dominio (ej. `SettingUpdated`) y un worker/subscriber independiente escribe en el log.
- **Beneficio:** Desacopla la auditoría de la lógica principal y evita latencia en la respuesta al usuario.

### 3. Escalabilidad
- **Partitioning:** Particionar la tabla de logs por fecha (ej. mensual).
- **Colas de Mensajes:** Uso de RabbitMQ/SQS para garantizar la persistencia de los eventos ante picos de tráfico.

---