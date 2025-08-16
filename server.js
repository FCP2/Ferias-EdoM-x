// server.js
const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Carpeta pública para servir tu HTML, CSS, JS
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// Configuración Google Sheets
// ======================
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const CREDENTIALS = require('/run/secrets/credenciales.json'); // tu archivo en la raíz
const SHEET_ID = '1jb-NngTnm5Er9g4vM0G92p4aEVSIAyFrBVCdo2FfdWk';
const SHEET_NAME = 'fest';

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: SCOPES,
});

// ======================
// Endpoint para traer ferias
// ======================
app.get('/api/ferias', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    // Primera fila: encabezados
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Convertir a array de objetos
    const ferias = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = row[i] || '';
      });
      return obj;
    });

    res.json(ferias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error leyendo Google Sheet' });
  }
});

// ======================
// Iniciar servidor
// ======================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});