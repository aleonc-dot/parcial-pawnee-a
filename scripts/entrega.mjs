import { execFileSync } from 'node:child_process'; 
import fs from 'node:fs'; import path from 'node:path';

function git(...args) { 
    return execFileSync('git', args, { encoding: 'utf8' }).trim(); 
}
const codigo = process.argv[2]; 
if (!/^e[0-9]{3,4}$/.test(codigo ?? '')) throw new Error('Uso desde la raíz: node scripts/entrega.mjs eNNN');
if (git('rev-parse', '--show-prefix')) throw new Error('Ejecuta desde la raíz del repositorio');
if (git('status', '--porcelain')) throw new Error('Hay cambios o archivos pendientes. Revisar y hacer commit antes.');
const version = JSON.parse(fs.readFileSync('VERSION.json', 'utf8')).version;
const files = git('ls-files').split('\n');
const peligrosos = files.filter(f => f.split('/').some(x => x === 'node_modules' || x === '.private' || (x.startsWith('.env') && x !== '.env.example')) || /\.(pem|key)$/.test(f));
if (peligrosos.length) throw new Error('Archivos sensibles/dependencias versionados: ' + peligrosos.join(', '));
const destino = path.resolve('..', `entrega-${codigo}-${version}.zip`);
git('archive', '--format=zip', '--output=' + destino, 'HEAD');
console.log(JSON.stringify({ codigo, version, rama: git('branch', '--show-current'), sha: git('rev-parse', 'HEAD'), repositorio: git('remote', 'get-url', 'origin'), archivo: destino }, null, 2));
console.log('Revisar contenido; subir ZIP y estos datos a D2L. El script no hace push.');
