function fadeUsageDisplay(data){
 const windows=[data?.primary_window,data?.secondary_window].filter(w=>typeof w?.used_percent==='number'&&Number.isFinite(w.used_percent));
 const label=w=>w.limit_window_seconds===18000?'5 小时':w.limit_window_seconds===604800?'每周':'账户';
 const remaining=w=>Math.round(Math.max(0,Math.min(100,100-w.used_percent)));
 const chosen=windows.find(w=>w.limit_window_seconds===18000)||windows[0];
 return {text:chosen?remaining(chosen)+'%':'—',title:windows.length?windows.map(w=>label(w)+'额度剩余 '+remaining(w)+'%').join(' · '):'账户额度暂不可用'};
}
function installOrbUsage(tabs){
 const orb=$('#orbButton'),badge=document.createElement('span');badge.className='fade-orb-usage';badge.setAttribute('aria-hidden','true');orb.append(badge);
 let enabled=true,dead=false,loading=false;try{enabled=localStorage.getItem('fade-orb-usage')!=='false'}catch{}
 const oldTitle=orb.getAttribute('title');
 function render(){if(dead)return;badge.hidden=!enabled;if(!enabled)return;const display=fadeUsageDisplay(tabs.accountUsage());badge.textContent=display.text}
 async function refresh(){if(dead||!enabled||loading||document.hidden)return;loading=true;try{await tabs.refreshAccountUsage()}catch{}finally{loading=false;render()}}
 const unsubscribe=tabs.subscribe(render);const timer=setInterval(refresh,60000);on(window,'focus',refresh);on(document,'visibilitychange',refresh);render();void refresh();
 return {get enabled(){return enabled},set(value){enabled=value;try{localStorage.setItem('fade-orb-usage',String(value))}catch{}render();if(value)void refresh()},destroy(){dead=true;clearInterval(timer);unsubscribe();badge.remove();if(oldTitle===null)orb.removeAttribute('title');else orb.title=oldTitle}};
}
