import { products } from '../frontend/src/data/products.js';

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return res.status;
  } catch (err) {
    return 'ERR: ' + err.message;
  }
}

async function run() {
  console.log(`Checking ${products.length} products...`);
  const results = [];
  const urlMap = new Map();

  for (const p of products) {
    const status = await checkUrl(p.image_url);
    const count = (urlMap.get(p.image_url) || 0) + 1;
    urlMap.set(p.image_url, count);
    results.push({
      id: p.id,
      gender: p.gender,
      name: p.name,
      category: p.category,
      url: p.image_url,
      status
    });
  }

  const failed = results.filter(r => r.status !== 200);
  console.log(`\n--- Failed URLs (${failed.length}) ---`);
  failed.forEach(f => console.log(`${f.id} [${f.gender}] (${f.status}): ${f.name} -> ${f.url}`));

  const duplicates = [...urlMap.entries()].filter(([url, count]) => count > 1);
  console.log(`\n--- Duplicate URLs (${duplicates.length}) ---`);
  duplicates.forEach(([url, count]) => console.log(`${count}x: ${url}`));
}

run();
