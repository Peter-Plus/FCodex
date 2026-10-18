 const tokens=new Map();
 const palette={
  fg:['--color-text','--color-text-primary','--color-text-prose','--color-text-emphasis','--color-text-composer-primary','--color-token-text-primary','--color-token-foreground','--app-color-text-foreground','--app-color-icon-primary'],
  muted:['--color-text-secondary','--color-token-text-secondary','--app-color-text-foreground-secondary','--app-color-icon-secondary'],
  soft:['--color-text-tertiary','--color-token-text-tertiary','--app-color-text-foreground-tertiary','--input-placeholder-text-color'],
  bg:['--color-surface','--color-surface-canvas','--color-token-main-surface-primary','--color-token-side-bar-background','--app-color-background-shell','--app-color-background-surface'],
  panel:['--color-surface-secondary','--color-surface-card','--color-surface-elevated','--color-surface-elevated-secondary','--color-background-composer-surface','--color-background-composer-primary','--composer-background-color','--color-background-user-message','--app-color-background-elevated-primary','--app-color-background-elevated-secondary'],
  line:['--color-border','--color-border-subtle','--color-token-border-default','--app-color-border','--app-color-border-light','--app-shell-sidebar-divider'],
  hover:['--color-background-primary-ghost-hover','--color-background-secondary-ghost-hover','--color-token-list-hover-background']
 };
 for(const[kind,names]of Object.entries(palette))for(const n of names)tokens.set(n,{kind,value:root.style.getPropertyValue(n),priority:root.style.getPropertyPriority(n)});
 // CodeMirror assigns mark classes at runtime. Identify its explicit semantic tokens
 // instead of pinning a generated class or changing editor content/decorations.
 const editorStyle=document.createElement('style');editorStyle.id='fade-codex-editor-style';document.head.append(editorStyle);
 function syncEditorMarks(){
  const code=new Set(),links=new Set();
  for(const sheet of document.styleSheets){
   if(sheet.href||sheet.ownerNode===editorStyle||sheet.ownerNode?.id==='fade-codex-style')continue;
   try{for(const rule of sheet.cssRules){
    const sel=rule.selectorText,st=rule.style;if(!sel?.startsWith('.\u037c')||!st)continue;
    if(st.backgroundColor.includes('--color-codex-editor-inline-code-background')&&st.fontFamily.includes('--font-code-family'))code.add(sel);
    if(st.color==='var(--color-text-info)'&&st.textDecoration.includes('underline'))links.add(sel);
   }}catch{}
  }
  const scope='html[data-fade-codex] .cm-content[data-language="markdown"]';
  let css='';
  if(code.size)css+=`${scope} :is(${[...code].join(',')}){background:var(--fc-inline-bg)!important;color:var(--fc-inline-fg)!important;border-radius:4px;padding:.08em .32em;box-shadow:inset 0 0 0 1px var(--fc-inline-border);box-decoration-break:clone;-webkit-box-decoration-break:clone}`;
  if(links.size){const sel=`${scope} :is(${[...links].join(',')})`;css+=`${sel}{color:var(--fc-link)!important;text-decoration:underline;text-underline-offset:.16em}${sel}:hover{color:var(--fc-link-hover)!important}`;}
  if(editorStyle.textContent!==css)editorStyle.textContent=css;
 }
 syncEditorMarks();
 // insertRule does not emit DOM mutations; inspect only small inline style sheets.
 const editorStyleTimer=setInterval(syncEditorMarks,1500);

