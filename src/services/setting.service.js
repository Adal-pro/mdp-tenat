const settingRepository = require('../repositories/setting.repository');

class SettingService {

    async getSettings(tenantId, key) {
        if (key) {
            const setting = await settingRepository.findOne(tenantId, key);
            return setting ? [setting] : [];
        } else {
            return await settingRepository.findAll(tenantId);
        }
    }

    async createSetting(tenantId, key, value, isImmutable) {
        // 1. Verificar si ya existe
        const existing = await settingRepository.findOne(tenantId, key);
        if (existing) {
            const error = new Error(`La clave '${key}' ya existe para este Tenant.`);
            error.code = 'DUPLICATE_KEY';
            throw error;
        }

        // 2. Crear
        return await settingRepository.create(tenantId, key, value, isImmutable || false);
    }

    async updateSetting(tenantId, key, value) {
        // 1. Verificar existencia e inmutabilidad
        const existing = await settingRepository.findOne(tenantId, key);

        if (!existing) {
            const error = new Error('Configuración no encontrada.');
            error.code = 'NOT_FOUND';
            throw error;
        }

        if (existing.is_immutable) {
            const error = new Error('Acción denegada: Esta configuración es INMUTABLE.');
            error.code = 'IMMUTABLE_VIOLATION';
            throw error;
        }

        // 2. Actualizar
        return await settingRepository.update(tenantId, key, value);
    }

    async deleteSetting(tenantId, key) {
        // 1. Verificar existencia e inmutabilidad
        const existing = await settingRepository.findOne(tenantId, key);

        if (!existing) {
            const error = new Error('Configuración no encontrada.');
            error.code = 'NOT_FOUND';
            throw error;
        }

        if (existing.is_immutable) {
            const error = new Error('Acción denegada: No se puede eliminar una configuración INMUTABLE.');
            error.code = 'IMMUTABLE_VIOLATION';
            throw error;
        }

        // 2. Eliminar
        return await settingRepository.delete(tenantId, key);
    }
}

module.exports = new SettingService();
