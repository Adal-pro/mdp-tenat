const settingService = require('../services/setting.service');

// 1. CREAR CONFIGURACIÓN (POST)
exports.createSetting = async (req, res) => {
    const tenantId = req.tenantId;
    const { key, value, is_immutable } = req.body;

    if (!key || !value) {
        return res.status(400).json({ error: 'Faltan datos: "key" y "value" son obligatorios.' });
    }

    try {
        const result = await settingService.createSetting(tenantId, key, value, is_immutable);
        res.status(201).json(result);
    } catch (error) {
        if (error.code === 'DUPLICATE_KEY') {
            return res.status(409).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 2. LEER CONFIGURACIONES (GET)
exports.getSettings = async (req, res) => {
    const tenantId = req.tenantId;
    const { key } = req.query;

    try {
        const result = await settingService.getSettings(tenantId, key);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener configuraciones' });
    }
};

// 3. ACTUALIZAR CONFIGURACIÓN (PUT)
exports.updateSetting = async (req, res) => {
    const tenantId = req.tenantId;
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
        return res.status(400).json({ error: 'Debes enviar un "value" para actualizar.' });
    }

    try {
        const result = await settingService.updateSetting(tenantId, key, value);
        res.json(result);
    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'IMMUTABLE_VIOLATION') {
            return res.status(403).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
};

// 4. ELIMINAR CONFIGURACIÓN (DELETE)
exports.deleteSetting = async (req, res) => {
    const tenantId = req.tenantId;
    const { key } = req.params;

    try {
        await settingService.deleteSetting(tenantId, key);
        res.json({ message: `Configuración '${key}' eliminada correctamente.` });
    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'IMMUTABLE_VIOLATION') {
            return res.status(403).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
};