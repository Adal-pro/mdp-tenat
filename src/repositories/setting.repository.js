const pool = require('../config/db');

class SettingRepository {
    async findOne(tenantId, key) {
        const query = 'SELECT * FROM settings WHERE tenant_id = $1 AND key_name = $2';
        const result = await pool.query(query, [tenantId, key]);
        return result.rows[0];
    }

    async findAll(tenantId) {
        const query = 'SELECT * FROM settings WHERE tenant_id = $1';
        const result = await pool.query(query, [tenantId]);
        return result.rows;
    }

    async create(tenantId, key, value, isImmutable) {
        const query = `
            INSERT INTO settings (tenant_id, key_name, value, is_immutable)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const valueToSave = JSON.stringify(value);
        const result = await pool.query(query, [tenantId, key, valueToSave, isImmutable]);
        return result.rows[0];
    }

    async update(tenantId, key, value) {
        const query = `
            UPDATE settings 
            SET value = $1, updated_at = CURRENT_TIMESTAMP
            WHERE tenant_id = $2 AND key_name = $3 
            RETURNING *;
        `;
        const valueToSave = JSON.stringify(value);
        const result = await pool.query(query, [valueToSave, tenantId, key]);
        return result.rows[0];
    }

    async delete(tenantId, key) {
        const query = 'DELETE FROM settings WHERE tenant_id = $1 AND key_name = $2';
        const result = await pool.query(query, [tenantId, key]);
        return result.rowCount;
    }
}

module.exports = new SettingRepository();
