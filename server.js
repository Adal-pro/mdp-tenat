const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importamos el archivo de rutas que acabamos de crear
const settingsRoutes = require('./src/routes/settings.routes'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// --- MIDDLEWARE DE AISLAMIENTO (TENANT) ---
// Se aplica globalmente antes de llegar a las rutas
app.use((req, res, next) => {
    const tenantId = req.headers['x-tenant-id'];
    
    if (!tenantId) {
        return res.status(400).json({ error: 'Acceso denegado: Falta el header X-Tenant-ID' });
    }

    req.tenantId = tenantId;
    console.log(`> Request del Tenant: ${tenantId}`);
    next();
});

// --- CONEXIÓN DE RUTAS ---
// Todas las rutas de settingsRoutes empezarán por "/settings"
app.use('/settings', settingsRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});