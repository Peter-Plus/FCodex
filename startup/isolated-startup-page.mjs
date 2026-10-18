export function isolatedStartupPage(source,preset,baked){
 const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const html=source.replace(/<script>[\s\S]*?<\/script>/g,'').replace('../Arts/MilkDragon1.mp4','./fade-intro.mp4')
  .replace('</head>',`<style>.tuning,.tools,.bottom,.workspace,.caption{display:none!important}html,body{background:transparent!important}body[data-phase=settling] .signature,body[data-phase=live] .signature{display:none!important}</style></head>`)
  .replace('</body>','<script src="./fade-startup.js"></script></body>');
 const script=`window.__fadeStartupHost={preset:${JSON.stringify(preset)},bakedLoop:${JSON.stringify({...baked,url:'./fade-loop.mp4'})},ready:false,theme:matchMedia('(prefers-color-scheme:light)').matches?'light':'dark',requestEnter(){this.enterRequested=true},complete(){requestAnimationFrame(()=>requestAnimationFrame(()=>window.fadeStartup.complete()))}};
 window.fadeStartup.onTarget(data=>Object.assign(window.__fadeStartupHost,data,{ready:true}));
 window.addEventListener('keydown',e=>{if(e.key==='Escape')window.fadeStartup.complete()});
 ${scripts.join('\n')}`;
 return {html,script};
}
