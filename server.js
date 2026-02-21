// Hostinger lsnode.js wrapper — .env'yi mutlak yol ile yükler
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection:', reason);
  process.exit(1);
});

console.log('[server.js] NODE_VERSION:', process.version);
console.log('[server.js] CWD:', process.cwd());
console.log('[server.js] PORT env:', process.env.PORT);

require('dotenv').config({ path: __dirname + '/.env' });

console.log('[server.js] APP_URL:', process.env.APP_URL);
console.log('[server.js] DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('[server.js] JWT_SECRET set:', !!process.env.JWT_SECRET);

try {
  require('./dist/src/server/app.js');
} catch (err) {
  console.error('[FATAL] app.js yüklenemedi:', err.message);
  console.error(err.stack);
  process.exit(1);
}
