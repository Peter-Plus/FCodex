function once(source,needle,replacement){
 if(source.split(needle).length!==2)throw Error('Unsupported branding hook: '+needle);
 return source.replace(needle,replacement);
}
export function patchMainBranding(source){
 const icon='require(`node:path`).join(__dirname,`fade-codex-icon.png`)';
 source=once(source,'N=()=>h?ab(r,{localIconsDirectory:(0,S.join)(p,`electron`,`.generated`,`windows-app-icons`)}):null',`N=()=>h?${icon}:null`);
 source=once(source,'new D.Tray(r.defaultIcon,process.platform===`win32`&&D.app.isPackaged?F3e(t):void 0)',`new D.Tray(${icon})`);
 source=once(source,'n!=null&&i.setImage(n)',`n!=null&&i.setImage(${icon})`);
 return source;
}
export function patchBootstrapBranding(source){
 return once(source,'y.app.setAppUserModelId(n.r(pA))','y.app.setAppUserModelId(`FCodex.Purple.Desktop`)');
}
