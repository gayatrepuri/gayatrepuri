// Runs after `npm run build:web`. Some hosts (like Netlify's drag-and-drop)
// skip any folder called "node_modules", but the web build stores a few
// built-in images there. This renames that folder to "vendor" and updates
// every reference to it, so the site works wherever it's uploaded.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const from = path.join(dist, 'assets', 'node_modules');
if (fs.existsSync(from)) {
  fs.renameSync(from, path.join(dist, 'assets', 'vendor'));
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
  let changed = 0;
  for (const file of walk(dist)) {
    if (!/\.(js|html|css|json|map)$/.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes('/assets/node_modules/')) {
      fs.writeFileSync(file, text.replaceAll('/assets/node_modules/', '/assets/vendor/'));
      changed++;
    }
  }
  console.log(`web build fixed: moved assets/node_modules → assets/vendor (${changed} files updated)`);
}
