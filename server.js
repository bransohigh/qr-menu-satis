// Hostinger lsnode.js wrapper — .env'yi mutlak yol ile yükler
require('dotenv').config({ path: __dirname + '/.env' });
require('./dist/src/server/app.js');
