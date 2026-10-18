function installFadeSettings(){
 const button=document.createElement('button');button.type='button';button.className='header-settings-toggle';button.id='fadeSettingsToggle';button.title='Fade 设置';button.setAttribute('aria-label','Fade 设置');button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','fadeSettingsMenu');
 button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-.7 2.3-2 .9L4 5.8 2 9.2l1.7 1.7v2.2L2 14.8l2 3.4 2.3-.4 2 .9L9 21h6l.7-2.3 2-.9 2.3.4 2-3.4-1.7-1.7v-2.2L22 9.2l-2-3.4-2.3.4-2-.9L15 3Z"/><circle cx="12" cy="12" r="3"/></svg>';
 const menu=document.createElement('section');menu.id='fadeSettingsMenu';menu.className='fade-settings-menu';menu.hidden=true;menu.setAttribute('role','menu');menu.setAttribute('aria-label','Fade 设置');
 menu.innerHTML='<div class="fade-settings-title">Fade 设置</div><button type="button" role="menuitem" aria-haspopup="menu" class="fade-permissions"><span>权限模式</span><span class="fade-permission-value"></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>';
 shadow.append(button,menu);const item=menu.querySelector('button'),value=menu.querySelector('.fade-permission-value');
 const startup=document.createElement('button');startup.type='button';startup.className='fade-startup-fullscreen';startup.setAttribute('role','menuitemcheckbox');startup.setAttribute('aria-checked','false');startup.setAttribute('aria-label','启动全屏');startup.title='下次启动生效，启动动画和应用均使用全屏';startup.innerHTML='<span>启动全屏</span><span class="fade-setting-switch" aria-hidden="true"></span>';startup.disabled=true;menu.append(startup);
 const quit=document.createElement('button');quit.type='button';quit.className='fade-startup-fullscreen';quit.setAttribute('role','menuitemcheckbox');quit.setAttribute('aria-checked','false');quit.setAttribute('aria-label','点击 × 时退出应用');quit.title=window.fadeWindowControls?.closeToQuitSupported?'立即生效；有运行中的任务时先确认':'首次安装此功能后，请退出并重新启动 Fade';quit.innerHTML='<span>点击 × 时退出应用</span><span class="fade-setting-switch" aria-hidden="true"></span>';quit.disabled=true;menu.append(quit);
 let settingsDead=false;
 async function readStartup(){if(!window.fadeStartupPreferences)return;try{const prefs=await window.fadeStartupPreferences.get();if(settingsDead)return;startup.setAttribute('aria-checked',String(prefs.startupFullscreen));startup.disabled=false;quit.setAttribute('aria-checked',String(prefs.closeToQuit===true));quit.disabled=!window.fadeWindowControls?.closeToQuitSupported}catch(error){if(!settingsDead)announce('启动设置读取失败：'+error.message)}}
 on(window,'fade-startup-preferences-ready',readStartup);void readStartup();
 on(startup,'click',async()=>{if(startup.disabled)return;startup.disabled=true;try{const prefs=await window.fadeStartupPreferences.set(startup.getAttribute('aria-checked')!=='true');if(!settingsDead)startup.setAttribute('aria-checked',String(prefs.startupFullscreen))}catch(error){if(!settingsDead)announce('启动设置保存失败：'+error.message)}finally{if(!settingsDead)startup.disabled=false}});
 on(quit,'click',async()=>{if(quit.disabled)return;quit.disabled=true;try{const prefs=await window.fadeStartupPreferences.set({closeToQuit:quit.getAttribute('aria-checked')!=='true'});if(!settingsDead)quit.setAttribute('aria-checked',String(prefs.closeToQuit))}catch(error){if(!settingsDead)announce('退出设置保存失败：'+error.message)}finally{if(!settingsDead)quit.disabled=false}});
 const usage=document.createElement('button');usage.type='button';usage.className='fade-startup-fullscreen';usage.setAttribute('role','menuitemcheckbox');usage.setAttribute('aria-label','小球显示账户额度');usage.setAttribute('aria-checked',String(orbUsage.enabled));usage.innerHTML='<span>小球显示账户额度</span><span class="fade-setting-switch" aria-hidden="true"></span>';menu.append(usage);on(usage,'click',()=>{orbUsage.set(!orbUsage.enabled);usage.setAttribute('aria-checked',String(orbUsage.enabled))});
 const autohide=document.createElement('button');autohide.type='button';autohide.className='fade-startup-fullscreen';autohide.setAttribute('role','menuitemcheckbox');autohide.setAttribute('aria-label','输入框自动隐藏');autohide.setAttribute('aria-checked',String(composerAutohide.enabled));autohide.innerHTML='<span>输入框自动隐藏</span><span class="fade-setting-switch" aria-hidden="true"></span>';menu.append(autohide);on(autohide,'click',()=>{composerAutohide.set(!composerAutohide.enabled);autohide.setAttribute('aria-checked',String(composerAutohide.enabled))});
 const accent=document.createElement('button');accent.type='button';accent.className='fade-startup-fullscreen';accent.setAttribute('role','menuitem');accent.setAttribute('aria-label','应用FCodex强调色');accent.title='将原生亮色和暗色强调色设为 FCodex 推荐紫色，其他主题设置不变';accent.innerHTML='<span>应用FCodex强调色</span>';menu.append(accent);
 on(accent,'click',async()=>{if(accent.disabled)return;accent.disabled=true;const label=accent.querySelector('span');label.textContent='应用中…';try{await nativeTheme.applyRecommendedAccent(__FADE_ACCENT_PALETTE__);if(!settingsDead)announce('已应用 FCodex 推荐强调色')}catch(error){if(!settingsDead)announce('强调色应用失败：'+error.message)}finally{if(!settingsDead){accent.disabled=false;label.textContent='应用FCodex强调色'}}});
 const classic=document.createElement('button');classic.type='button';classic.className='fade-classic-mode';classic.setAttribute('role','menuitem');classic.textContent='返回经典模式';classic.title='仅本次恢复原生界面；关闭所有 GPT 标签，回复完成后释放缓存';menu.append(classic);
 on(classic,'click',()=>{close();returnToClassicMode()});
 let activeNative=null,popup=null;const positioned=new Map();
 function positionOptions(){
  popup=activeNative?.getAttribute('aria-expanded')==='true'?document.getElementById(activeNative.getAttribute('aria-controls')):null;
  item.setAttribute('aria-expanded',String(!!popup));
  if(!popup||menu.hidden)return;
  const wrapper=popup.closest('[data-radix-popper-content-wrapper]')||popup;
  if(!positioned.has(wrapper))positioned.set(wrapper,wrapper.getAttribute('style'));
  const anchor=menu.getBoundingClientRect(),size=popup.getBoundingClientRect(),gap=10;
  const left=anchor.left-size.width-gap;
  // On narrow windows, stack below instead of covering the settings card.
  const x=left>=8?left:Math.max(8,Math.min(anchor.left,window.innerWidth-size.width-8));
  const y=left>=8?Math.max(8,Math.min(anchor.top,window.innerHeight-size.height-8)):anchor.bottom+gap;
  wrapper.style.setProperty('position','fixed','important');wrapper.style.setProperty('left','0','important');wrapper.style.setProperty('top','0','important');wrapper.style.setProperty('transform',`translate(${x}px, ${y}px)`,'important');
 }
 function source(){return [...document.querySelectorAll('[data-codex-composer-root] [data-composer-navigation-target=permissions]')].find(el=>!el.closest('[hidden],[inert],[data-app-shell-active-page="false"]')&&el.getClientRects().length)}
 function sync(){const native=source();item.disabled=!native||native.disabled||native.getAttribute('aria-disabled')==='true';value.textContent=native?.textContent.trim()||'当前页面不可用'}
 function close(focus=false){if(popup)popup.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));popup=null;activeNative=null;item.setAttribute('aria-expanded','false');menu.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus()}
 on(button,'click',()=>{if(!menu.hidden){close();return}closeNav(false);chatPicker?.close();sync();menu.hidden=false;button.setAttribute('aria-expanded','true');item.focus()});
 on(item,'click',()=>{
  const native=source();if(!native||item.disabled)return;
  if(popup){popup.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));return}
  activeNative=native;
  const rect=menu.getBoundingClientRect();native.style.setProperty('--fc-permission-x',Math.max(8,rect.left-310)+'px');native.style.setProperty('--fc-permission-y',Math.max(0,rect.top-32)+'px');
  native.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',code:'ArrowDown',bubbles:true,cancelable:true}));
  requestAnimationFrame(positionOptions);
 });
 on(document,'pointerdown',event=>{const path=event.composedPath();if(!path.includes(menu)&&!path.includes(button)&&!path.includes(popup))close()},{capture:true});
 on(menu,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true)}if(event.key==='Tab')close()});
 on(window,'resize',()=>close());
 const observer=new MutationObserver(()=>{if(!menu.hidden){sync();positionOptions()}});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','aria-disabled','aria-expanded','aria-controls','data-app-shell-active-page']});
 return ()=>{settingsDead=true;observer.disconnect();close();for(const[el,style]of positioned){if(style===null)el.removeAttribute('style');else el.setAttribute('style',style)}button.remove();menu.remove()};
}
