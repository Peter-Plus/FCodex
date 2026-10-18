import {fadePort} from './startup/endpoint.mjs';
import {ensureWindowControls} from './startup/window-controls.mjs';
const targets=await(await fetch(`http://127.0.0.1:${await fadePort()}/json/list`)).json();
await ensureWindowControls(targets.find(t=>t.type==='page'&&t.url==='app://-/index.html'));
import fs from 'node:fs/promises';
const css=await fs.readFile(new URL('theme.css',import.meta.url),'utf8');const js=await fs.readFile(new URL('fade.js',import.meta.url),'utf8');
const expression=`(()=>{window.__fadeCodex?.destroy();window.__fadeSkipIntro=true;const s=document.createElement('style');s.id='fade-codex-style';s.textContent=${JSON.stringify(css)};document.head.append(s);${js}\nreturn window.__fadeCodex.status()})()`;
await fs.writeFile(new URL('.hot-update-expression.js',import.meta.url),expression);
await import('node:child_process').then(({execFileSync})=>{process.stdout.write(execFileSync(process.execPath,[new URL('inspect-ui.mjs',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),new URL('.hot-update-expression.js',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')]))});
