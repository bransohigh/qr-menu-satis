import { Category, Menu, Product, Theme } from '@prisma/client';

export interface ThemeData {
  menu: Menu & { theme: Theme; categories: Category[]; products: Product[] };
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
}

type ProductWithCategory = Product & { category?: Category };

/**
 * Shared HTML wrapper used by all themes.
 */
function wrapHtml(
  title: string,
  bodyClass: string,
  cssVars: string,
  extraCss: string,
  body: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { ${cssVars} }
    body { font-family: system-ui, -apple-system, sans-serif; }
    ${extraCss}
  </style>
</head>
<body class="${bodyClass}">
${body}
</body>
</html>`;
}

function escHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPrice(price: unknown): string {
  return Number(price).toFixed(2);
}

function productImg(imageUrl: string | null | undefined, alt: string, cls = ''): string {
  if (!imageUrl) return `<div class="no-img ${cls}" aria-hidden="true">🍽</div>`;
  return `<img src="${escHtml(imageUrl)}" alt="${escHtml(alt)}" class="${cls}" loading="lazy"/>`;
}

// ─── THEME 01: Classic List ─────────────────────────────────────────────────
function theme01({ menu, categories, productsByCategory }: ThemeData): string {
  const rows = categories
    .map((cat) => {
      const prods = (productsByCategory[cat.id] || []) as ProductWithCategory[];
      if (!prods.length) return '';
      const items = prods
        .map(
          (p) => `
        <tr>
          <td class="pname">${escHtml(p.name)}<br/><small>${escHtml(p.description)}</small></td>
          <td class="pprice">$${formatPrice(p.price)}</td>
        </tr>`
        )
        .join('');
      return `<section>
        <h2 class="cat-title">${escHtml(cat.name)}</h2>
        <table class="menu-table"><tbody>${items}</tbody></table>
      </section>`;
    })
    .join('');

  return wrapHtml(
    menu.businessName || 'Our Menu',
    '',
    '--accent:#c0392b;',
    `body{max-width:700px;margin:0 auto;padding:1rem;background:#fefefe;color:#222;}
    header{text-align:center;padding:2rem 0 1.5rem;border-bottom:2px solid var(--accent);}
    header h1{font-size:2rem;letter-spacing:1px;}
    .cat-title{margin:2rem 0 .75rem;font-size:1.25rem;color:var(--accent);text-transform:uppercase;letter-spacing:1px;}
    .menu-table{width:100%;border-collapse:collapse;}
    .menu-table tr{border-bottom:1px solid #eee;}
    .pname{padding:.75rem .5rem;font-size:.95rem;}
    .pname small{color:#666;font-size:.8rem;}
    .pprice{padding:.75rem .5rem;text-align:right;font-weight:700;white-space:nowrap;}
    .no-img{display:none;}`,
    `<header><h1>${escHtml(menu.businessName || 'Our Menu')}</h1></header>
    <main>${rows || '<p style="text-align:center;padding:2rem;color:#888;">No items yet.</p>'}</main>`
  );
}

// ─── THEME 02: Card Grid ────────────────────────────────────────────────────
function theme02({ menu, categories, productsByCategory }: ThemeData): string {
  const sections = categories
    .map((cat) => {
      const prods = productsByCategory[cat.id] || [];
      if (!prods.length) return '';
      const cards = prods
        .map(
          (p) => `
        <article class="card">
          ${productImg(p.imageUrl, p.name, 'card-img')}
          <div class="card-body">
            <h3>${escHtml(p.name)}</h3>
            <p>${escHtml(p.description)}</p>
            <span class="price">$${formatPrice(p.price)}</span>
          </div>
        </article>`
        )
        .join('');
      return `<section class="section">
        <h2 class="cat-header">${escHtml(cat.name)}</h2>
        <div class="card-grid">${cards}</div>
      </section>`;
    })
    .join('');

  return wrapHtml(
    menu.businessName || 'Our Menu',
    '',
    '--accent:#2980b9;--radius:12px;',
    `body{background:#f4f7fb;color:#222;padding:0;}
    header{background:var(--accent);color:#fff;text-align:center;padding:2.5rem 1rem;}
    header h1{font-size:2.2rem;}
    .section{max-width:1100px;margin:2.5rem auto;padding:0 1rem;}
    .cat-header{font-size:1.4rem;font-weight:700;margin-bottom:1rem;color:var(--accent);border-left:4px solid var(--accent);padding-left:.75rem;}
    .card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;}
    .card{background:#fff;border-radius:var(--radius);overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}
    .card-img{width:100%;height:150px;object-fit:cover;}
    .no-img{width:100%;height:80px;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#eaf2fb;}
    .card-body{padding:1rem;}
    .card-body h3{font-size:1rem;margin-bottom:.3rem;}
    .card-body p{font-size:.82rem;color:#666;margin-bottom:.5rem;}
    .price{font-weight:700;color:var(--accent);}`,
    `<header><h1>${escHtml(menu.businessName || 'Our Menu')}</h1></header>
    <main>${sections || '<p style="text-align:center;padding:2rem;color:#888;">No items yet.</p>'}</main>`
  );
}

// ─── THEME 03: Minimal Typography ───────────────────────────────────────────
function theme03({ menu, categories, productsByCategory }: ThemeData): string {
  const sections = categories
    .map((cat) => {
      const prods = productsByCategory[cat.id] || [];
      if (!prods.length) return '';
      const items = prods
        .map(
          (p) => `
        <div class="item">
          <div class="item-info">
            <span class="item-name">${escHtml(p.name)}</span>
            <span class="item-desc">${escHtml(p.description)}</span>
          </div>
          <span class="item-price">$${formatPrice(p.price)}</span>
        </div>`
        )
        .join('');
      return `<section class="section">
        <h2 class="cat">${escHtml(cat.name)}</h2>
        ${items}
      </section>`;
    })
    .join('');

  return wrapHtml(
    menu.businessName || 'Menu',
    '',
    '--font-serif:Georgia,serif;',
    `body{background:#fff;color:#1a1a1a;max-width:640px;margin:0 auto;padding:2rem 1.5rem;}
    h1{font-family:var(--font-serif);font-size:2.8rem;font-weight:400;text-align:center;margin-bottom:.25rem;}
    .tagline{text-align:center;color:#999;letter-spacing:3px;font-size:.7rem;text-transform:uppercase;margin-bottom:3rem;}
    .section{margin-bottom:2.5rem;}
    .cat{font-family:var(--font-serif);font-size:1.1rem;font-style:italic;color:#555;border-bottom:1px solid #eee;padding-bottom:.5rem;margin-bottom:1rem;}
    .item{display:flex;align-items:baseline;gap:.5rem;padding:.5rem 0;border-bottom:1px dotted #eee;}
    .item-info{flex:1;display:flex;flex-direction:column;}
    .item-name{font-size:.95rem;font-weight:600;}
    .item-desc{font-size:.78rem;color:#999;margin-top:.1rem;}
    .item-price{font-family:var(--font-serif);font-size:1rem;}`,
    `<h1>${escHtml(menu.businessName || 'Menu')}</h1>
    <p class="tagline">Est. 2024</p>
    <main>${sections || '<p style="text-align:center;color:#ccc;">No items yet.</p>'}</main>`
  );
}

// ─── THEME 04: Dark Mode ─────────────────────────────────────────────────────
function theme04({ menu, categories, productsByCategory }: ThemeData): string {
  const sections = categories
    .map((cat) => {
      const prods = productsByCategory[cat.id] || [];
      if (!prods.length) return '';
      const cards = prods
        .map(
          (p) => `
        <div class="dark-card">
          ${productImg(p.imageUrl, p.name, 'dark-img')}
          <div class="dark-body">
            <span class="dark-name">${escHtml(p.name)}</span>
            <span class="dark-desc">${escHtml(p.description)}</span>
          </div>
          <span class="dark-price">$${formatPrice(p.price)}</span>
        </div>`
        )
        .join('');
      return `<section class="dark-section">
        <h2 class="dark-cat">${escHtml(cat.name)}</h2>
        ${cards}
      </section>`;
    })
    .join('');

  return wrapHtml(
    menu.businessName || 'Menu',
    '',
    '',
    `body{background:#0d0d0d;color:#e0e0e0;font-family:'Segoe UI',sans-serif;padding:0;}
    header{background:#1a1a1a;text-align:center;padding:2rem 1rem;border-bottom:1px solid #333;}
    header h1{font-size:2rem;color:#fff;letter-spacing:2px;}
    main{max-width:720px;margin:0 auto;padding:1.5rem;}
    .dark-section{margin-bottom:2rem;}
    .dark-cat{font-size:1rem;text-transform:uppercase;letter-spacing:2px;color:#f39c12;margin-bottom:1rem;}
    .dark-card{display:flex;align-items:center;gap:1rem;padding:.75rem;border-radius:8px;background:#1a1a1a;margin-bottom:.5rem;}
    .dark-img{width:60px;height:60px;object-fit:cover;border-radius:6px;}
    .no-img{width:60px;height:60px;border-radius:6px;background:#2a2a2a;display:flex;align-items:center;justify-content:center;font-size:1.5rem;}
    .dark-body{flex:1;display:flex;flex-direction:column;}
    .dark-name{font-weight:600;color:#fff;}
    .dark-desc{font-size:.8rem;color:#888;margin-top:.15rem;}
    .dark-price{font-weight:700;color:#f39c12;white-space:nowrap;}`,
    `<header><h1>${escHtml(menu.businessName || 'Menu')}</h1></header>
    <main>${sections || '<p style="text-align:center;padding:2rem;color:#555;">No items yet.</p>'}</main>`
  );
}

// ─── THEME 05: Hero Sections ─────────────────────────────────────────────────
function theme05({ menu, categories, productsByCategory }: ThemeData): string {
  const gradients = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
  ];

  const sections = categories
    .map((cat, i) => {
      const prods = productsByCategory[cat.id] || [];
      const grad = gradients[i % gradients.length];
      const items = prods
        .map(
          (p) => `
        <div class="hero-item">
          ${productImg(p.imageUrl, p.name, 'hero-img')}
          <div class="hero-item-body">
            <strong>${escHtml(p.name)}</strong>
            <p>${escHtml(p.description)}</p>
          </div>
          <span class="hero-price">$${formatPrice(p.price)}</span>
        </div>`
        )
        .join('');
      return `<section class="hero-section">
        <div class="hero-banner" style="background:${grad}">
          <h2>${escHtml(cat.name)}</h2>
        </div>
        <div class="hero-items">${items || '<p class="no-items">No items in this category.</p>'}</div>
      </section>`;
    })
    .join('');

  return wrapHtml(
    menu.businessName || 'Menu',
    '',
    '',
    `body{background:#f8f8f8;color:#222;margin:0;}
    .top-header{text-align:center;padding:3rem 1rem;background:linear-gradient(135deg,#1a1a2e,#16213e);}
    .top-header h1{color:#fff;font-size:2.5rem;}
    .hero-section{margin-bottom:1.5rem;}
    .hero-banner{padding:2.5rem 1.5rem;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.3);}
    .hero-banner h2{font-size:1.8rem;}
    .hero-items{max-width:800px;margin:0 auto;padding:1rem;}
    .hero-item{display:flex;align-items:center;gap:1rem;padding:1rem;background:#fff;border-radius:8px;margin-bottom:.75rem;box-shadow:0 1px 4px rgba(0,0,0,.08);}
    .hero-img{width:70px;height:70px;object-fit:cover;border-radius:8px;}
    .no-img{width:70px;height:70px;background:#f0f0f0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;}
    .hero-item-body{flex:1;}
    .hero-item-body p{font-size:.82rem;color:#666;margin-top:.25rem;}
    .hero-price{font-weight:700;font-size:1.1rem;color:#667eea;}
    .no-items{color:#aaa;padding:.5rem;}`,
    `<div class="top-header"><h1>${escHtml(menu.businessName || 'Menu')}</h1></div>
    <main>${sections || '<p style="text-align:center;padding:2rem;color:#888;">No items yet.</p>'}</main>`
  );
}

// ─── THEME 06: Sidebar Navigation ────────────────────────────────────────────
function theme06({ menu, categories, productsByCategory }: ThemeData): string {
  const navLinks = categories
    .map(
      (cat) =>
        `<a href="#cat-${escHtml(cat.id)}" class="nav-link">${escHtml(cat.name)}</a>`
    )
    .join('');

  const sections = categories
    .map((cat) => {
      const prods = productsByCategory[cat.id] || [];
      const items = prods
        .map(
          (p) => `
        <div class="sb-item">
          ${productImg(p.imageUrl, p.name, 'sb-img')}
          <div class="sb-body">
            <strong>${escHtml(p.name)}</strong>
            <span class="sb-desc">${escHtml(p.description)}</span>
          </div>
          <span class="sb-price">$${formatPrice(p.price)}</span>
        </div>`
        )
        .join('');
      return `<section id="cat-${escHtml(cat.id)}" class="sb-section">
        <h2>${escHtml(cat.name)}</h2>
        ${items || '<p class="empty">No items.</p>'}
      </section>`;
    })
    .join('');

  return wrapHtml(
    menu.businessName || 'Menu',
    '',
    '--sidebar:220px;--accent:#6c5ce7;',
    `body{display:flex;min-height:100vh;color:#222;background:#f9f9f9;}
    .sidebar{width:var(--sidebar);background:#fff;border-right:1px solid #eee;position:fixed;top:0;left:0;height:100vh;overflow-y:auto;padding:1.5rem 0;}
    .sidebar h2{padding:.75rem 1.25rem;font-size:.8rem;text-transform:uppercase;letter-spacing:1px;color:#aaa;}
    .nav-link{display:block;padding:.6rem 1.25rem;color:#444;text-decoration:none;font-size:.9rem;transition:background .15s;}
    .nav-link:hover{background:#f0edff;color:var(--accent);}
    .content{margin-left:var(--sidebar);flex:1;padding:1.5rem 2rem;}
    .content-header{margin-bottom:2rem;}
    .content-header h1{font-size:2rem;color:var(--accent);}
    .sb-section{margin-bottom:2.5rem;}
    .sb-section h2{font-size:1.15rem;color:var(--accent);margin-bottom:1rem;padding-bottom:.5rem;border-bottom:2px solid var(--accent);}
    .sb-item{display:flex;align-items:center;gap:1rem;padding:.75rem;background:#fff;border-radius:8px;margin-bottom:.5rem;box-shadow:0 1px 3px rgba(0,0,0,.06);}
    .sb-img{width:55px;height:55px;object-fit:cover;border-radius:6px;}
    .no-img{width:55px;height:55px;background:#ede7f6;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;}
    .sb-body{flex:1;display:flex;flex-direction:column;}
    .sb-desc{font-size:.8rem;color:#888;}
    .sb-price{font-weight:700;color:var(--accent);}
    .empty{color:#ccc;}
    @media(max-width:600px){.sidebar{display:none;}.content{margin-left:0;}}`,
    `<nav class="sidebar"><h2>${escHtml(menu.businessName || 'Menu')}</h2>${navLinks}</nav>
    <div class="content">
      <div class="content-header"><h1>${escHtml(menu.businessName || 'Our Menu')}</h1></div>
      ${sections || '<p style="color:#ccc;">No items yet.</p>'}
    </div>`
  );
}

// ─── THEME 07: Floating Category Nav ─────────────────────────────────────────
function theme07({ menu, categories, productsByCategory }: ThemeData): string {
  const pills = categories
    .map(
      (cat) =>
        `<a href="#cat-${escHtml(cat.id)}" class="pill">${escHtml(cat.name)}</a>`
    )
    .join('');

  const sections = categories
    .map((cat) => {
      const prods = productsByCategory[cat.id] || [];
      const cards = prods
        .map(
          (p) => `
        <div class="fn-card">
          ${productImg(p.imageUrl, p.name, 'fn-img')}
          <div class="fn-info">
            <h3>${escHtml(p.name)}</h3>
            <p>${escHtml(p.description)}</p>
            <span class="fn-price">$${formatPrice(p.price)}</span>
          </div>
        </div>`
        )
        .join('');
      return `<section id="cat-${escHtml(cat.id)}" class="fn-section">
        <h2>${escHtml(cat.name)}</h2>
        <div class="fn-grid">${cards || '<p class="empty">No items.</p>'}</div>
      </section>`;
    })
    .join('');

  return wrapHtml(
    menu.businessName || 'Menu',
    '',
    '--accent:#e17055;',
    `body{background:#fff8f5;color:#222;margin:0;}
    .top{text-align:center;padding:2rem 1rem 1rem;}
    .top h1{font-size:2.2rem;color:var(--accent);}
    .float-nav{position:sticky;top:0;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border-bottom:1px solid #fce3d8;padding:.75rem 1rem;display:flex;gap:.5rem;flex-wrap:wrap;z-index:100;}
    .pill{padding:.35rem .9rem;background:var(--accent);color:#fff;border-radius:20px;text-decoration:none;font-size:.82rem;transition:opacity .15s;}
    .pill:hover{opacity:.8;}
    .fn-section{max-width:900px;margin:2rem auto;padding:0 1rem;}
    .fn-section h2{font-size:1.2rem;color:var(--accent);margin-bottom:1rem;}
    .fn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;}
    .fn-card{display:flex;gap:.75rem;background:#fff;border-radius:10px;padding:.75rem;box-shadow:0 2px 8px rgba(225,112,85,.1);}
    .fn-img{width:70px;height:70px;object-fit:cover;border-radius:8px;flex-shrink:0;}
    .no-img{width:70px;height:70px;background:#ffe5dc;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;}
    .fn-info{display:flex;flex-direction:column;}
    .fn-info h3{font-size:.95rem;}
    .fn-info p{font-size:.78rem;color:#999;flex:1;margin-top:.15rem;}
    .fn-price{font-weight:700;color:var(--accent);}
    .empty{color:#ccc;}`,
    `<div class="top"><h1>${escHtml(menu.businessName || 'Menu')}</h1></div>
    <nav class="float-nav">${pills}</nav>
    <main>${sections || '<p style="text-align:center;padding:2rem;color:#ccc;">No items yet.</p>'}</main>`
  );
}

// ─── THEME 08: Image Focus ────────────────────────────────────────────────────
function theme08({ menu, categories, productsByCategory }: ThemeData): string {
  const sections = categories
    .map((cat) => {
      const prods = productsByCategory[cat.id] || [];
      const cards = prods
        .map(
          (p) => `
        <article class="img-card">
          <div class="img-frame">
            ${productImg(p.imageUrl, p.name, 'big-img')}
            <span class="img-price">$${formatPrice(p.price)}</span>
          </div>
          <div class="img-footer">
            <h3>${escHtml(p.name)}</h3>
            <p>${escHtml(p.description)}</p>
          </div>
        </article>`
        )
        .join('');
      return `<section class="img-section">
        <h2 class="img-cat">${escHtml(cat.name)}</h2>
        <div class="img-grid">${cards || '<p class="empty">No items.</p>'}</div>
      </section>`;
    })
    .join('');

  return wrapHtml(
    menu.businessName || 'Menu',
    '',
    '--accent:#00b894;',
    `body{background:#fafafa;color:#222;margin:0;}
    header{background:#fff;text-align:center;padding:2rem;border-bottom:1px solid #eee;}
    header h1{font-size:2rem;}
    .img-section{max-width:1100px;margin:2rem auto;padding:0 1rem;}
    .img-cat{font-size:1.3rem;color:var(--accent);margin-bottom:1rem;padding-left:.75rem;border-left:3px solid var(--accent);}
    .img-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;}
    .img-card{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.07);}
    .img-frame{position:relative;}
    .big-img{width:100%;height:180px;object-fit:cover;display:block;}
    .no-img{width:100%;height:120px;background:#e8f8f5;display:flex;align-items:center;justify-content:center;font-size:3rem;}
    .img-price{position:absolute;bottom:.5rem;right:.5rem;background:var(--accent);color:#fff;padding:.25rem .6rem;border-radius:20px;font-size:.85rem;font-weight:700;}
    .img-footer{padding:.75rem;}
    .img-footer h3{font-size:.95rem;margin-bottom:.25rem;}
    .img-footer p{font-size:.78rem;color:#aaa;}
    .empty{color:#ccc;}`,
    `<header><h1>${escHtml(menu.businessName || 'Menu')}</h1></header>
    <main>${sections || '<p style="text-align:center;padding:2rem;color:#ccc;">No items yet.</p>'}</main>`
  );
}

// ─── THEME 09: Compact Menu ───────────────────────────────────────────────────
function theme09({ menu, categories, productsByCategory }: ThemeData): string {
  const sections = categories
    .map((cat) => {
      const prods = productsByCategory[cat.id] || [];
      const rows = prods
        .map(
          (p) => `
        <div class="row">
          <span class="rname">${escHtml(p.name)}</span>
          <span class="rdots"></span>
          <span class="rprice">$${formatPrice(p.price)}</span>
        </div>`
        )
        .join('');
      return `<section class="c-section">
        <div class="c-head">${escHtml(cat.name)}</div>
        ${rows || '<div class="empty">Empty category</div>'}
      </section>`;
    })
    .join('');

  return wrapHtml(
    menu.businessName || 'Menu',
    '',
    '--accent:#2d3436;',
    `body{background:#fff;color:#222;max-width:600px;margin:0 auto;padding:1rem;font-size:.9rem;}
    h1{text-align:center;font-size:1.8rem;padding:1.5rem 0 .5rem;border-bottom:2px solid #222;}
    .c-section{margin-top:1.25rem;}
    .c-head{font-weight:700;text-transform:uppercase;font-size:.75rem;letter-spacing:1.5px;color:#888;padding:.25rem 0;margin-bottom:.25rem;}
    .row{display:flex;align-items:baseline;padding:.35rem 0;border-bottom:1px solid #f0f0f0;}
    .rname{flex-shrink:0;}
    .rdots{flex:1;border-bottom:1px dotted #ccc;margin:0 .5rem;height:.75em;}
    .rprice{flex-shrink:0;font-weight:700;}
    .empty{color:#ccc;font-size:.8rem;padding:.25rem 0;}`,
    `<h1>${escHtml(menu.businessName || 'Menu')}</h1>
    <main>${sections || '<p style="text-align:center;padding:2rem;color:#ccc;">No items yet.</p>'}</main>`
  );
}

// ─── THEME 10: Premium ───────────────────────────────────────────────────────
function theme10({ menu, categories, productsByCategory }: ThemeData): string {
  const navItems = categories
    .map(
      (cat) =>
        `<button class="tab-btn" onclick="showTab('cat-${escHtml(cat.id)}')">${escHtml(cat.name)}</button>`
    )
    .join('');

  const panels = categories
    .map((cat, i) => {
      const prods = productsByCategory[cat.id] || [];
      const cards = prods
        .map(
          (p) => `
        <div class="prm-card">
          ${productImg(p.imageUrl, p.name, 'prm-img')}
          <div class="prm-body">
            <h3>${escHtml(p.name)}</h3>
            <p>${escHtml(p.description)}</p>
          </div>
          <div class="prm-price">$${formatPrice(p.price)}</div>
        </div>`
        )
        .join('');
      return `<div id="cat-${escHtml(cat.id)}" class="tab-panel${i === 0 ? ' active' : ''}">
        ${cards || '<p class="empty">No items in this category.</p>'}
      </div>`;
    })
    .join('');

  const initTab = categories.length > 0 ? `cat-${categories[0].id}` : '';

  return wrapHtml(
    menu.businessName || 'Menu',
    '',
    '--gold:#d4af37;--dark:#1a1a2e;--mid:#16213e;',
    `@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    body{background:var(--dark);color:#e8e8e8;margin:0;font-family:'Segoe UI',system-ui,sans-serif;}
    .prm-header{text-align:center;padding:3.5rem 1rem 2rem;background:var(--mid);}
    .prm-header h1{font-size:2.8rem;color:var(--gold);letter-spacing:3px;font-weight:300;}
    .prm-header p{color:#888;letter-spacing:2px;font-size:.75rem;text-transform:uppercase;margin-top:.5rem;}
    .tab-bar{display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;padding:1rem;background:var(--mid);border-bottom:1px solid #2a2a4a;}
    .tab-btn{padding:.45rem 1.1rem;border-radius:20px;border:1px solid var(--gold);background:transparent;color:var(--gold);cursor:pointer;font-size:.82rem;letter-spacing:.5px;transition:all .2s;}
    .tab-btn:hover,.tab-btn.active-btn{background:var(--gold);color:var(--dark);}
    .content{max-width:800px;margin:0 auto;padding:1.5rem 1rem;}
    .tab-panel{display:none;}
    .tab-panel.active{display:block;animation:fadeIn .3s ease;}
    .prm-card{display:flex;align-items:center;gap:1rem;padding:1rem;background:#0d1b2a;border-radius:10px;margin-bottom:.75rem;border:1px solid #1e2d40;}
    .prm-img{width:65px;height:65px;object-fit:cover;border-radius:8px;flex-shrink:0;}
    .no-img{width:65px;height:65px;background:#1e2d40;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;}
    .prm-body{flex:1;}
    .prm-body h3{color:#fff;font-weight:400;margin-bottom:.25rem;}
    .prm-body p{font-size:.8rem;color:#666;}
    .prm-price{color:var(--gold);font-size:1.1rem;font-weight:600;white-space:nowrap;}
    .empty{color:#444;text-align:center;padding:2rem;}`,
    `<div class="prm-header">
      <h1>${escHtml(menu.businessName || 'Menu')}</h1>
      <p>culinary experience</p>
    </div>
    <div class="tab-bar">${navItems}</div>
    <div class="content">${panels}</div>
    <script>
      function showTab(id) {
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-btn'));
        const panel = document.getElementById(id);
        if (panel) panel.classList.add('active');
        event.target.classList.add('active-btn');
      }
      // Activate first tab button
      const firstBtn = document.querySelector('.tab-btn');
      if (firstBtn) firstBtn.classList.add('active-btn');
      ${initTab ? `const firstPanel = document.getElementById('${initTab}'); if(firstPanel) firstPanel.classList.add('active');` : ''}
    </script>`
  );
}

// ─── Theme Registry ───────────────────────────────────────────────────────────
const THEMES: Record<string, (data: ThemeData) => string> = {
  theme_01: theme01,
  theme_02: theme02,
  theme_03: theme03,
  theme_04: theme04,
  theme_05: theme05,
  theme_06: theme06,
  theme_07: theme07,
  theme_08: theme08,
  theme_09: theme09,
  theme_10: theme10,
};

export function renderTheme(templateKey: string, data: ThemeData): string {
  const renderer = THEMES[templateKey];
  if (!renderer) {
    return wrapHtml('Menu', '', '', '', '<p style="text-align:center;padding:2rem">Theme not found.</p>');
  }
  return renderer(data);
}
