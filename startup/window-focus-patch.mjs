// Limit the two native automatic composer focus paths, not explicit user focus.
export function patchWindowComposerFocus(source){
 const replace=(from,to)=>{if(source.split(from).length!==2)throw Error('Unsupported composer autofocus hook: '+from.slice(0,80));source=source.replace(from,to)};
 replace('k===!0&&e.focus(),e.view.dom.dataset.virtualkeyboard',
  'k===!0&&fadeMayAutofocusComposer(e.view.dom)&&e.focus(),e.view.dom.dataset.virtualkeyboard');
 replace('&&(n.activeElement===r||n.activeElement?.getAttribute(`role`)!==`tab`)&&e.focus()',
  '&&(n.activeElement===r||n.activeElement?.getAttribute(`role`)!==`tab`)&&fadeMayAutofocusComposer(e.view.dom)&&e.focus()');
 return source+`\nfunction fadeMayAutofocusComposer(dom){
 if(!window.__fadeWindowModeEnabled)return true;
 if(!dom.isConnected)return false;
 const page=dom.closest('[data-fade-page-key]');
 return !page||page.getAttribute('data-app-shell-active-page')==='true';
}
window.__fadePaneFocusVersion=1;\n`;
}
