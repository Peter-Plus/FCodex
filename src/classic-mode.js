function isFadeClassicShortcut(event){return event.ctrlKey&&!event.altKey&&event.shiftKey&&!event.metaKey&&!event.repeat&&!event.isComposing&&!event.getModifierState?.('AltGraph')&&(event.code==='KeyL'||event.key?.toLowerCase()==='l')}
// The isolated runtime has no OS caption. Keep only its window controls when
// restoring the native app, without retaining the Fade layout or observers.
function installClassicWindowChrome(){
 const api=window.fadeWindowControls;if(!api)return;
 window.__fadeClassicChrome?.destroy();
 const chrome=document.createElement('div');chrome.id='fade-classic-window-controls';
 const view=chrome.attachShadow({mode:'open'});
 view.innerHTML='<style>:host{position:fixed;right:0;top:0;z-index:2147483000;display:flex;height:36px;color:var(--color-text-primary,#888);-webkit-app-region:no-drag}button{width:46px;height:36px;padding:0;border:0;border-radius:0;background:transparent;color:inherit;display:grid;place-items:center;cursor:default}button:hover{background:#8883}button:last-child:hover{background:#c42b1c;color:white}button:focus-visible{outline:2px solid currentColor;outline-offset:-3px}svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1}</style><button data-action="minimize" aria-label="最小化" title="最小化"><svg viewBox="0 0 12 12"><path d="M1 6h10"/></svg></button><button data-action="maximize" aria-label="最大化" title="最大化"><svg viewBox="0 0 12 12"><rect x="1.5" y="1.5" width="9" height="9"/></svg></button><button data-action="close" aria-label="关闭窗口" title="关闭窗口"><svg viewBox="0 0 12 12"><path d="m1 1 10 10M11 1 1 11"/></svg></button>';
 const maximize=view.querySelector('[data-action=maximize]');
 function sync(state){const label=state.fullscreen?'退出全屏':state.maximized?'还原窗口':'最大化';maximize.title=label;maximize.setAttribute('aria-label',label);maximize.querySelector('svg').innerHTML=state.maximized&&!state.fullscreen?'<path d="M3.5 3.5v-2h7v7h-2"/><rect x="1.5" y="3.5" width="7" height="7"/>':'<rect x="1.5" y="1.5" width="9" height="9"/>'}
 const controller=new AbortController();
 const resume=document.createElement('button');resume.type='button';resume.textContent='fade';resume.title='返回 Fade 模式';resume.setAttribute('aria-label','返回 Fade 模式');resume.style.cssText='width:92px;font:12px "Segoe UI",sans-serif;border-radius:6px;margin:3px 6px;height:30px;cursor:pointer';
 view.insertBefore(resume,view.querySelector('button'));
 resume.addEventListener('click',()=>{if(resume.disabled)return;resume.disabled=true;try{if(typeof window.__fadeResume!=='function')throw Error('Fade 尚未加载');window.__fadeResume()}catch(error){resume.disabled=false;resume.textContent='重试 Fade';resume.title=error.message;console.error(error)}},{signal:controller.signal});
 for(const control of view.querySelectorAll('button[data-action]'))control.addEventListener('click',()=>{void api.action(control.dataset.action).then(state=>{if(state)sync(state)}).catch(console.error)},{signal:controller.signal});
 const unsubscribe=api.subscribe(sync);void api.action('state').then(sync).catch(console.error);document.body.append(chrome);
 window.__fadeClassicChrome={destroy(){controller.abort();unsubscribe?.();chrome.remove();delete window.__fadeClassicChrome}};
}
let returningToClassic=false;
async function returnToClassicMode(){
 if(returningToClassic)return;returningToClassic=true;
 try{
  // Finish the last native theme write before removing the bridge and styles.
  await nativeTheme.settled();
  if(disposed)return;
  disposeGptTabs.closeAllForClassic();
  installClassicWindowChrome();
  window.__fadeCodex.destroy();
 }catch(error){if(!disposed)announce('暂未返回经典模式：'+error.message)}
 finally{returningToClassic=false}
}
