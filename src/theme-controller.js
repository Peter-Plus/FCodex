// Preserve immediate theme feedback; skip writes whose values are unchanged.
function installFadeThemeController({root,host,button,config,tokens,nativeTheme,wake,persist,Observer=MutationObserver}){
 let dead=false,version=0,pending=false,ready=false,lastMode=null;
 function apply(mode){
  if(dead||!['light','dark'].includes(mode))return;
  if(root.dataset.fadePolarity!==mode)root.dataset.fadePolarity=mode;
  if(host.dataset.theme!==mode)host.dataset.theme=mode;
  for(const [name,{kind}]of tokens){const value=`var(--fc-${kind})`;if(root.style.getPropertyValue(name)!==value)root.style.setProperty(name,value)}
  const label=mode==='light'?'切换暗色':'切换亮色';
  for(const name of ['aria-label','title'])if(button.getAttribute(name)!==label)button.setAttribute(name,label);
  // The controller is installed before the canvas bindings are initialized.
  if(ready&&lastMode!==mode)wake();lastMode=mode;
 }
 const observer=new Observer(()=>{
  if(dead)return;
  const mode=root.dataset.theme;
  if(!pending&&['light','dark'].includes(mode))config.light=mode==='light';
  apply(mode);
 });
 observer.observe(root,{attributes:true,attributeFilter:['data-theme']});
 apply(root.dataset.theme);ready=true;
 return {
  set(light,save=true){
   const request=++version,mode=light?'light':'dark';config.light=light;pending=true;
   if(root.dataset.theme!==mode)root.dataset.theme=mode;
   apply(mode);
   if(save)persist();
   return nativeTheme.set(mode).then(ok=>{
    if(dead||request!==version)return;
    pending=false;
    // The local theme is already applied even if native synchronization fails.
   });
  },
  destroy(){dead=true;version++;observer.disconnect()}
 };
}
