const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

// Definición de las rutas
// Como en server.js usaremos app.use('/settings', ...), aquí solo ponemos la raíz '/'
router.post('/', settingsController.createSetting);
router.get('/', settingsController.getSettings);
router.put('/:key', settingsController.updateSetting);
router.delete('/:key', settingsController.deleteSetting);

module.exports = router;