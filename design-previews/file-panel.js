/* Isolated concept UI: no native shell APIs or OS launches. */
(()=>{
 const panel=document.querySelector('#filePreview'),menu=document.querySelector('#fileOpenMenu'),openButton=document.querySelector('#fileOpenButton');
 const tree=document.querySelector('#filePreviewTree'),treeButton=document.querySelector('#fileTreeButton'),explorer=document.querySelector('#fileExplorerDemo');
 let returnFocus=null;
 const examplePath='G:\\Toy\\FCodex\\workspace.html';
 const source=`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport"
        content="width=device-width, initial-scale=1">
  <title>Fade · 工作空间</title>
  <style>
    :root {
      --canvas: #191919;
      --surface: #242424;
      --accent: #c3a4ef;
    }

    .workspace {
      display: grid;
      min-height: 100dvh;
      background: var(--canvas);
    }

    .file-panel {
      border-radius: 22px;
      background: var(--surface);
      backdrop-filter: blur(28px);
    }
  </style>
</head>
<body>
  <main class="workspace">
    <section class="conversation"></section>
    <aside class="file-panel"></aside>
  </main>
</body>
</html>`;
 for(const line of source.split('\n')){const row=document.createElement('span');row.className='code-line';row.textContent=line;if(line.trim().startsWith('<'))row.classList.add('tag');document.querySelector('#filePreviewSource').append(row)}
 function closeMenu(){menu.hidden=true;openButton.setAttribute('aria-expanded','false')}
 function close(){closeMenu();explorer.hidden=true;panel.classList.remove('is-open');panel.inert=true;document.body.classList.remove('file-preview-open');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})}
 window.openFilePreview=()=>{returnFocus=document.activeElement;panel.inert=false;panel.classList.add('is-open');document.body.classList.add('file-preview-open');document.querySelector('#filePreviewClose').focus({preventScroll:true})};
 document.querySelector('#filePreviewClose').onclick=close;
 treeButton.onclick=()=>{tree.hidden=!tree.hidden;treeButton.setAttribute('aria-expanded',String(!tree.hidden))};
 document.querySelector('#fileExplorerButton').onclick=()=>{closeMenu();explorer.hidden=!explorer.hidden};
 document.querySelector('#fileExplorerClose').onclick=()=>{explorer.hidden=true;document.querySelector('#fileExplorerButton').focus()};
 document.querySelector('#fileCopyButton').onclick=async()=>{try{await navigator.clipboard.writeText(examplePath);announce('已复制示例路径')}catch{explorer.hidden=false;announce('无法访问剪贴板，可在卡片中选择路径复制')}};
 openButton.onclick=()=>{const opening=menu.hidden;menu.hidden=!opening;openButton.setAttribute('aria-expanded',String(opening));if(opening)menu.querySelector('button').focus()};
 menu.querySelectorAll('button').forEach(button=>button.onclick=()=>{closeMenu();openButton.focus();announce('演示：使用'+button.textContent.trim()+'打开 workspace.html')});
 menu.addEventListener('keydown',event=>{const items=[...menu.querySelectorAll('button')],i=items.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();items[event.key==='Home'?0:event.key==='End'?items.length-1:(i+(event.key==='ArrowUp'?-1:1)+items.length)%items.length].focus()}});
 document.addEventListener('pointerdown',event=>{if(!event.target.closest('.open-file-control'))closeMenu()});
 document.addEventListener('keydown',event=>{if(event.key!=='Escape'||!panel.classList.contains('is-open')||document.querySelector('#navigation.open'))return;event.preventDefault();if(!menu.hidden){closeMenu();openButton.focus()}else if(!explorer.hidden)explorer.hidden=true;else close()});
})();
