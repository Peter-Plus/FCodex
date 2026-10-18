import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {patchMainBranding,patchBootstrapBranding} from '../startup/branding-patch.mjs';
const build=JSON.parse(fs.readFileSync(new URL('../.fade-runtime-isolated/build.json',import.meta.url)));
const archive=fs.readFileSync(path.join(build.source,'resources/app.asar'));
const tree=JSON.parse(archive.subarray(16,16+archive.readUInt32LE(12)));
const offset=8+archive.readUInt32LE(4);
const entries=tree.files['.vite'].files.build.files;
function read(pattern){const name=Object.keys(entries).find(n=>pattern.test(n));assert.ok(name);const e=entries[name];return archive.subarray(offset+Number(e.offset),offset+Number(e.offset)+e.size).toString()}
test('installed native window and tray paths use Fade on creation and theme updates',()=>{
 const input=read(/^main-.*\.js$/),output=patchMainBranding(input);
 assert.ok(output.includes('N=()=>h?require(`node:path`).join(__dirname,`fade-codex-icon.png`):null'));
 assert.ok(output.includes('new D.Tray(require(`node:path`).join(__dirname,`fade-codex-icon.png`))'));
 assert.ok(output.includes('i.setImage(require(`node:path`).join(__dirname,`fade-codex-icon.png`))'));
 assert.ok(!output.includes('new D.Tray(r.defaultIcon'));
 assert.throws(()=>patchMainBranding(output),/Unsupported branding hook/);
});
test('installed bootstrap sets Fade identity before native window creation',()=>{
 const output=patchBootstrapBranding(read(/^bootstrap-.*\.js$/));
 assert.ok(output.includes('y.app.setAppUserModelId(`FCodex.Purple.Desktop`)'));
 assert.ok(!output.includes('y.app.setAppUserModelId(n.r(pA))'));
});
