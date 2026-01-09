## 📝 Propuesta de Diseño: Audit Log

### 1. Modelo de Datos
Se recomienda una tabla `audit_logs` independiente (o colección NoSQL) con la estructura:
- `id`, `tenant_id`, `entity_key`
- `action` (CREATE, UPDATE, DELETE)
- `actor_id` (quién hizo el cambio)
- `changes` (JSONB con el delta de cambios)
- `timestamp`
### 2. Ubicación de la Lógica
La lógica estaria en la capa de servicio, desacoplada del Controlador y del Repositorio de configuración.
- AuditRepository: Una clase independiente encargada únicamente de la persistencia de los logs.
### 3. Escalabilidad
- **Partitioning:** Particionar la tabla de logs por fecha (ej. mensual).
* **Beneficio 1 (Lectura):** Postgres solo busca en la partición relevante (ej. *Enero*), ignorando millones de registros de otros meses.
* **Beneficio 2 (Mantenimiento):** Eliminar datos antiguos es instantáneo (`DROP TABLE particion_vieja`), evitando la carga y fragmentación de un `DELETE` masivo.

**Ejemplo de Estructura:**
```sql
-- 1. Tabla Maestra (Lógica)
CREATE TABLE audit_logs (...) PARTITION BY RANGE (created_at);

-- 2. Particiones Físicas (Donde realmente viven los datos)
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs ...; -- Enero
CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs ...; -- Febrero

-- 3. Retención de datos (Limpieza instantánea)
DROP TABLE audit_logs_2023_01; -- Adiós a Enero del año pasado en 1ms

---