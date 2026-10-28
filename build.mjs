import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = dirname(fileURLToPath(import.meta.url));
const file = join(root, 'index.html');
const html = readFileSync(file, 'utf8');
const source = html.match(/<script id="sweet17-source" type="text\/typescript">([\s\S]*?)<\/script>/)[1];
const temp = mkdtempSync(join(tmpdir(), 'sweet17-'));
try {
  writeFileSync(join(temp, 'vm.ts'), source);
  execFileSync('tsc', ['--strict', '--target', 'ES2022', '--module', 'preserve', '--moduleDetection', 'legacy', '--lib', 'ES2022,DOM', '--outDir', temp, join(temp, 'vm.ts')], { stdio: 'inherit' });
  const js = readFileSync(join(temp, 'vm.js'), 'utf8');
  writeFileSync(file, html.replace(/<script id="sweet17-runtime">[\s\S]*?<\/script>/, () => `<script id="sweet17-runtime">\n${js}</script>`));
  console.log('Built index.html: embedded TypeScript + offline JavaScript runtime.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
