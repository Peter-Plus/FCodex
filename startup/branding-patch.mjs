function once(source,needle,replacement){
 const count=needle instanceof RegExp?[...source.matchAll(needle)].length:source.split(needle).length-1;
 if(count!==1)throw Error('Unsupported branding hook: '+needle);
 return source.replace(needle,replacement);
}
export function patchMainBranding(source){
 const icon='require(`node:path`).join(__dirname,`fade-codex-icon.png`)';
 source=once(source,/N=\(\)=>h\?[\w$]+\(r,\{localIconsDirectory:\(0,[\w$]+\.join\)\(p,`electron`,`.generated`,`windows-app-icons`\)\}\):null/g,`N=()=>h?${icon}:null`);
 source=once(source,/new ([\w$]+)\.Tray\(r.defaultIcon,process.platform===`win32`&&\1.app.isPackaged\?[\w$]+\(t\):void 0\)/g,(_match,electron)=>`new ${electron}.Tray(${icon})`);
 source=once(source,'n!=null&&i.setImage(n)',`n!=null&&i.setImage(${icon})`);
 return source;
}
export function patchBootstrapBranding(source){
 return once(source,/y.app.setAppUserModelId\(n.r\([\w$]+\)\)/g,'y.app.setAppUserModelId(`FCodex.Purple.Desktop`)');
}
