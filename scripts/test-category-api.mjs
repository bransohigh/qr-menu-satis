/**
 * Minimal end-to-end smoke test: Register → Create Menu → Create Category.
 * Run while the dev server is running: node scripts/test-category-api.mjs
 */

import http from 'node:http';

const BASE = 'http://localhost:3000';
const TEST_EMAIL = `test_${Date.now()}@qrmenu.test`;
const TEST_PASS  = 'test1234';

// ── Helpers ────────────────────────────────────────────────────────────────
let cookieJar = '';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const json = body ? JSON.stringify(body) : null;
    const url  = new URL(path, BASE);
    const opts = {
      method,
      hostname: url.hostname,
      port:     url.port || 80,
      path:     url.pathname,
      headers: {
        'Content-Type':  'application/json',
        'Content-Length': json ? Buffer.byteLength(json) : 0,
        ...(cookieJar ? { Cookie: cookieJar } : {}),
      },
    };
    const r = http.request(opts, (res) => {
      // Capture Set-Cookie headers
      const sc = res.headers['set-cookie'];
      if (sc) {
        cookieJar = sc.map(c => c.split(';')[0]).join('; ');
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on('error', reject);
    if (json) r.write(json);
    r.end();
  });
}

function pass(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); }
function fail(msg, detail) {
  console.error(`  \x1b[31m✗\x1b[0m ${msg}`);
  if (detail) console.error('    ', JSON.stringify(detail));
  process.exitCode = 1;
}

// ── Tests ──────────────────────────────────────────────────────────────────
console.log('\n🧪 QR Menu API smoke test\n');

// 1. Register
console.log('Step 1: Register user');
const reg = await req('POST', '/api/auth/register', { email: TEST_EMAIL, password: TEST_PASS });
if (reg.status === 201) {
  pass(`Registered: ${TEST_EMAIL}`);
} else {
  fail('Registration failed', reg.body);
}

// 2. Find first theme
console.log('\nStep 2: Fetch themes to get a themeId');
const themes = await req('GET', '/themes/api/list');
let themeId;
if (themes.status === 200 && themes.body.themes?.length > 0) {
  themeId = themes.body.themes[0].id;
  pass(`Got theme: ${themes.body.themes[0].name} (${themeId})`);
} else {
  // fallback: try to get from DB directly using a known seed
  fail('Could not fetch themes', themes.body);
}

// 3. Create menu
console.log('\nStep 3: Create menu from theme');
const menu = await req('POST', '/api/menus/create-from-theme', {
  themeId,
  businessName: 'Test Cafe',
});
if (menu.status === 201 || (menu.body && menu.body.redirect)) {
  pass('Menu created');
} else {
  fail('Menu creation failed', menu.body);
}

// 4. Create category
console.log('\nStep 4: POST /api/categories { name: "Kahveler" }');
const cat = await req('POST', '/api/categories', { name: 'Kahveler' });
if (cat.status === 201 && cat.body.category) {
  pass(`Category created: "${cat.body.category.name}" (slug: ${cat.body.category.slug})`);
} else {
  fail('Category creation failed', cat.body);
}

// 5. Verify category in list
console.log('\nStep 5: GET /api/categories – verify category exists');
const cats = await req('GET', '/api/categories');
if (cats.status === 200) {
  const found = cats.body.categories?.find(c => c.name === 'Kahveler');
  if (found) {
    pass(`"Kahveler" appears in categories list (id: ${found.id})`);
  } else {
    fail('Category not found in list', cats.body);
  }
} else {
  fail('Could not fetch categories', cats.body);
}

// 6. Rename category
console.log('\nStep 6: PATCH /api/categories/:id – rename to "Sıcak İçecekler"');
const catId = cat.body.category?.id;
if (catId) {
  const renamed = await req('PATCH', `/api/categories/${catId}`, { name: 'Sıcak İçecekler' });
  if (renamed.status === 200 && renamed.body.category?.name === 'Sıcak İçecekler') {
    pass(`Renamed. New slug: ${renamed.body.category.slug}`);
  } else {
    fail('Rename failed', renamed.body);
  }
}

// 7. Delete category
console.log('\nStep 7: DELETE /api/categories/:id');
if (catId) {
  const del = await req('DELETE', `/api/categories/${catId}`);
  if (del.status === 200) {
    pass('Category deleted');
  } else {
    fail('Delete failed', del.body);
  }
}

console.log('\n' + (process.exitCode ? '❌ Some tests failed.' : '✅ All tests passed.') + '\n');
