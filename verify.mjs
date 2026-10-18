import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('.',import.meta.url));
for(const args of [['--check','fade.js'],['--test','tests/native-adapter.test.mjs','tests/gpt-tabs.test.mjs','tests/runtime-lifecycle.test.mjs','tests/header.test.mjs','tests/rail-history.test.mjs','tests/home-orb.test.mjs','tests/chat-picker.test.mjs','tests/conversation.test.mjs','tests/native-theme.test.mjs','tests/file-panel.test.mjs','tests/message-rail.test.mjs'],['design-previews/check-horizon-motion.mjs'],['design-previews/check-particle-orbs.mjs']])execFileSync(process.execPath,args,{cwd,stdio:'inherit'});
console.log('Offline checks complete. Live Codex visual/action validation remains required.');

