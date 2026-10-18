import test from 'node:test';
import assert from 'node:assert/strict';
import {installDiagnosticGate,patchDiagnosticIndex} from '../startup/diagnostic-gate.mjs';
function clock(){let now=0,id=0;const timers=new Map();return {performance:{now:()=>now},setTimeout(fn,ms){timers.set(++id,{fn,at:now+ms});return id},clearTimeout(id){timers.delete(id)},advance(ms){now+=ms;for(const [id,t]of timers)if(t.at<=now){timers.delete(id);t.fn()}}}}
test('native entry waits for opening plus five seconds; repeated opening cannot extend it',async()=>{
 const w=clock();let loaded=false;installDiagnosticGate(w).then(()=>loaded=true);
 w.advance(2000);await Promise.resolve();assert.equal(loaded,false);
 w.__fadeDiagnosticGate.opening();w.advance(4000);w.__fadeDiagnosticGate.opening();await Promise.resolve();assert.equal(loaded,false);
 w.advance(1000);await Promise.resolve();assert.equal(loaded,true);assert.equal(w.__fadeDiagnosticGate.state.releasedAt,7000);
 assert.equal(w.__fadeDiagnosticGate.state.reason,'opening-plus-5s');
});
test('missing animation fails open, and skip release is idempotent',async()=>{
 const w=clock();const ready=installDiagnosticGate(w);w.advance(30000);await ready;assert.equal(w.__fadeDiagnosticGate.state.reason,'fallback-timeout');
 const other=clock();const skipped=installDiagnosticGate(other);other.__fadeDiagnosticGate.release('skip');other.__fadeDiagnosticGate.release('duplicate');await skipped;assert.equal(other.__fadeDiagnosticGate.state.reason,'skip');
});
test('diagnostic index defers native entry and removes speculative module preloads without weakening CSP',()=>{
 const html='<meta http-equiv="Content-Security-Policy" content="script-src self"><script type="module" crossorigin src="./assets/index-test.js"></script><link rel="modulepreload" href="./assets/shared.js">';
 const result=patchDiagnosticIndex(html);assert.ok(result.html.includes('Content-Security-Policy'));assert.ok(!result.html.includes('modulepreload'));assert.ok(!result.html.includes('index-test.js'));
 assert.match(result.script,/await import\("\.\/assets\/index-test.js"\)/);assert.ok(result.script.indexOf(')(window);')<result.script.indexOf('await import'));
 assert.throws(()=>patchDiagnosticIndex('<html></html>'));
});
