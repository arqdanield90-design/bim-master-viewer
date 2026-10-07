// Copia el visor publicado (../index.html) a la carpeta web de la app
const fs = require('fs'), path = require('path');
const www = path.join(__dirname, 'www');
fs.mkdirSync(www, { recursive: true });
fs.copyFileSync(path.join(__dirname, '..', 'index.html'), path.join(www, 'index.html'));
console.log('Visor copiado a app/www');
