(()=>{
 const settings=window.__fadeStartupSettings;
 const host=window.__fadeStartupHost={preset:settings.preset,theme:settings.theme,ready:false,target:null,enterRequested:false};
 const post=route=>fetch(settings.base+route,{method:'POST'});
 let completing=false;
 host.requestEnter=()=>{
  host.enterRequested=true;
  const core=document.getElementById('core');
  core.setAttribute('aria-busy','true');
  let status=document.getElementById('startupError');
  if(!status){status=document.createElement('div');status.id='startupError';status.setAttribute('role','status');document.body.append(status)}
  status.textContent='正在准备工作区，准备好后将自动进入…';
 };
 host.complete=()=>{
  if(completing)return;completing=true;
  // Let the final sphere position paint, then hold it before native handoff.
  requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>post('/complete'),200)));
 };
 document.addEventListener('DOMContentLoaded',()=>{
  const img=document.createElement('img');img.id='realWorkspace';img.alt='';document.body.prepend(img);
  const video=document.getElementById('filmVideo');let notified=false,loading=false,stopped=false;
  video.addEventListener('playing',()=>{if(notified)return;notified=true;if(video.requestVideoFrameCallback)video.requestVideoFrameCallback(()=>post('/shown'));else post('/shown')},{once:true});
  async function poll(){
   if(stopped)return;
   try{
    const state=await(await fetch(settings.base+'/state')).json();
    if(state.ready&&!loading){loading=true;host.target=state.target;host.theme=state.target.theme;img.onload=()=>{host.ready=true;document.getElementById('core').removeAttribute('aria-busy');document.getElementById('startupError')?.remove()};img.onerror=()=>{loading=false};img.src=settings.base+'/picture'}
   }catch{}
   if(!host.ready)setTimeout(poll,300);
  }
  poll();window.addEventListener('pagehide',()=>{stopped=true});
  document.addEventListener('keydown',e=>{if(e.code==='KeyV'){e.preventDefault();e.stopImmediatePropagation()}},true);
 });
})();
