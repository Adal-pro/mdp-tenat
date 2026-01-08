const pool = require('../config/db');

// 1. CREAR CONFIGURACIÓN (POST)
exports.createSetting = async (req, res) => {
    // El tenantId viene del middleware en server.js
    const tenantId = req.tenantId;
    const { key, value, is_immutable } = req.body;

    // Validación: Key y Value son obligatorios
    if (!key || !value) {
        return res.status(400).json({ error: 'Faltan datos: "key" y "value" son obligatorios.' });
    }

    try {
        const query = `
            INSERT INTO settings (tenant_id, key_name, value, is_immutable)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        // Usamos JSON.stringify(value) para que Postgres reciba el formato correcto
        // tanto si es un texto simple ("rojo") como si es un objeto complejo.
        const valueToSave = JSON.stringify(value);

        const result = await pool.query(query, [tenantId, key, valueToSave, is_immutable || false]);
        res.status(201).json(result.rows[0]);

    } catch (error) {
        // Error código 23505 en Postgres significa violación de índice único (Duplicado)
        if (error.code === '23505') {
            return res.status(409).json({ error: `La clave '${key}' ya existe para este Tenant.` });
        }
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 2. LEER CONFIGURACIONES (GET)
exports.getSettings = async (req, res) => {
    const tenantId = req.tenantId;
    const { key } = req.query; // Permite filtrar: /settings?key=color

    try {
        let query = 'SELECT * FROM settings WHERE tenant_id = $1';
        let params = [tenantId];

        // Si piden una key específica, filtramos
        if (key) {
            query += ' AND key_name = $2';
            params.push(key);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener configuraciones' });
    }
};

// 3. ACTUALIZAR CONFIGURACIÓN (PUT)
exports.updateSetting = async (req, res) => {
    const tenantId = req.tenantId;
    const { key } = req.params; // La key viene en la URL: /settings/:key
    const { value } = req.body;

    if (!value) {
        return res.status(400).json({ error: 'Debes enviar un "value" para actualizar.' });
    }

    try {
        // PASO 1: Verificar si existe y si es inmutable
        const checkQuery = 'SELECT is_immutable FROM settings WHERE tenant_id = $1 AND key_name = $2';
        const checkResult = await pool.query(checkQuery, [tenantId, key]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Configuración no encontrada.' });
        }

        if (checkResult.rows[0].is_immutable) {
            return res.status(403).json({ error: 'Acción denegada: Esta configuración es INMUTABLE.' });
        }

        // PASO 2: Actualizar si pasó las validaciones
        const updateQuery = `
            UPDATE settings 
            SET value = $1, updated_at = CURRENT_TIMESTAMP
            WHERE tenant_id = $2 AND key_name = $3 
            RETURNING *;
        `;
        const valueToSave = JSON.stringify(value);
        const result = await pool.query(updateQuery, [valueToSave, tenantId, key]);
        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
};

// 4. ELIMINAR CONFIGURACIÓN (DELETE)
exports.deleteSetting = async (req, res) => {
    const tenantId = req.tenantId;
    const { key } = req.params;

    try {
        // PASO 1: Verificar inmutabilidad antes de borrar
        const checkQuery = 'SELECT is_immutable FROM settings WHERE tenant_id = $1 AND key_name = $2';
        const checkResult = await pool.query(checkQuery, [tenantId, key]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Configuración no encontrada.' });
        }

        if (checkResult.rows[0].is_immutable) {
            return res.status(403).json({ error: 'Acción denegada: No se puede eliminar una configuración INMUTABLE.' });
        }

        // PASO 2: Borrar
        const deleteQuery = 'DELETE FROM settings WHERE tenant_id = $1 AND key_name = $2';
        await pool.query(deleteQuery, [tenantId, key]);
        
        res.json({ message: `Configuración '${key}' eliminada correctamente.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
};