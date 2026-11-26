import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
await mkdir(path.join(dist, 'content'), { recursive: true });

for (const file of ['site.json', 'investigations.json', 'candidates.json']) {
  const source = await readFile(path.join(root, 'content', file), 'utf8');
  JSON.parse(source);
  await writeFile(path.join(dist, 'content', file), source);
}

console.log(`Built ${dist}`);
