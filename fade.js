(function startFade(styleText=document.getElementById('fade-codex-style')?.textContent||'') {
 if(window.__fadeCodex)return;
 // Keep a fresh initializer, not the disposed runtime's listeners and state.
 window.__fadeResume=()=>startFade(styleText);
 if(!document.getElementById('fade-codex-style')){const style=document.createElement('style');style.id='fade-codex-style';style.textContent=styleText;document.head.append(style)}
 window.__fadeClassicChrome?.destroy();
 const root=document.documentElement,abort=new AbortController(),signal=abort.signal;
 const originalAttrs=['data-fade-codex','data-fade-polarity','data-fade-shell','data-fade-native-tools','data-fade-account-access','data-fade-rail-open','data-fade-menu-open','data-fade-settings'].map(n=>[n,root.getAttribute(n)]);
 const host=document.createElement('div');host.id='fade-codex-layer';document.body.append(host);
 const shadow=host.attachShadow({mode:'open'});shadow.innerHTML="<style>\r\n:host{--bg:#191919;--paper:#242424;--raised:#2d2d2d;--ink:#ededed;--text:#bdbdbd;--muted:#909090;--line:#ffffff12;--edge:#ffffff23;--purple:#c3a4ef;--on:#20152b;--accent-soft:#c3a4ef12;--glass:#292929dc;--veil:#11111180;--shadow:0 18px 65px #0000002c;--ease:cubic-bezier(.2,.85,.2,1);--orb-left:clamp(35px,8vw,140px);color-scheme:dark}\r\n:host([data-theme=light]){--bg:#f0f0f0;--paper:#fafafa;--raised:#fff;--ink:#242424;--text:#555;--muted:#747474;--line:#0000000c;--edge:#0000001b;--purple:#7847ae;--on:#fff;--accent-soft:#7847ae0b;--glass:#ffffffe6;--veil:#dedede80;--shadow:0 18px 65px #00000010;color-scheme:light}\r\n*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:13px/1.6 \"Segoe UI Variable Text\",\"Segoe UI\",\"Microsoft YaHei UI\",sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}button,textarea{font:inherit}button{display:inline-flex;justify-content:center;align-items:center;gap:8px;color:inherit;background:none;border:0;cursor:pointer;transition:background .2s,color .2s,transform .25s var(--ease)}button:active{transform:scale(.97)}button:focus-visible,textarea:focus-visible{outline:2px solid var(--purple);outline-offset:4px}button:disabled{opacity:.4;cursor:default}svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;pointer-events:none}[hidden]{display:none!important}h1,h2,h3,p{margin:0}.spacer{flex:1}.icon{width:31px;height:31px;color:var(--muted);border-radius:9px}.icon:hover{color:var(--ink);background:var(--line)}.icon svg{width:15px;height:15px}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}\r\n.app{height:100dvh;position:relative;transition:filter .4s,transform .6s var(--ease)}.nav-is-open .app{transform:scale(.985)}.app-head{height:68px;padding:0 34px;display:flex;align-items:center;gap:13px}.wordmark{font-size:19px;letter-spacing:-.7px;font-weight:550}.app-head .divider{height:13px;width:1px;background:var(--edge)}.location{font-size:10px;color:var(--muted)}.local-indicator{font-size:9px;color:var(--muted);display:flex;align-items:center;gap:7px}.local-indicator:before{content:\"\";width:4px;height:4px;border-radius:50%;background:var(--purple)}.workspace{position:absolute;inset:82px 0 27px;display:flex;justify-content:center}.conversation{width:min(740px,calc(100% - 220px));display:flex;flex-direction:column;min-height:0}.thread-caption{display:flex;align-items:center;justify-content:space-between;padding:0 12px 18px;font-size:10px;color:var(--muted)}.thread-caption span:last-child{font-size:9px;color:var(--muted)}.thread-body{flex:1;overflow:auto;padding:0 14px 25px;scrollbar-width:thin;scrollbar-color:var(--edge) transparent}.user-message{max-width:83%;margin:0 0 32px auto;border:1px solid var(--line);background:var(--paper);border-radius:16px 16px 4px 16px;padding:15px 19px;font-size:12px;line-height:1.95;color:var(--text)}.assistant-name{display:flex;align-items:center;gap:9px;font-size:11px;margin-bottom:17px}.assistant-mark{width:23px;height:23px;border-radius:7px;background:var(--ink);color:var(--bg);display:grid;place-items:center;font-size:14px}.assistant-name small{font-size:9px;color:var(--muted);margin-left:4px}.answer{font-size:13px;color:var(--text);line-height:1.95}.answer h1{font-size:29px;letter-spacing:-.8px;font-weight:500;color:var(--ink);line-height:1.4;margin:0 0 18px}.answer p{margin:0 0 20px}.answer strong{font-weight:550;color:var(--ink)}.file-card{display:flex;width:100%;align-items:center;padding:17px 19px;text-align:left;border:1px solid var(--edge);background:var(--paper);border-radius:12px;margin:25px 0 23px;gap:15px}.file-card:hover{background:var(--raised);border-color:var(--purple)}.file-art{width:45px;height:45px;border-radius:9px;border:1px solid var(--edge);background:var(--bg);display:grid;place-items:center}.mini-hole{width:24px;height:24px;border-radius:50%;background:#0b0b0b;border:1px solid #b7a4d0;box-shadow:0 0 8px #a49aaa26}.file-copy b{display:block;font-size:12px;font-weight:550}.file-copy small{font-size:10px;color:var(--muted)}.file-card>svg{margin-left:auto;color:var(--muted);width:15px}.notes{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin:23px 0}.notes>div{border-top:1px solid var(--edge);padding-top:12px}.notes h3{font-size:11px;font-weight:550;color:var(--ink);margin-bottom:6px}.notes p{font-size:11px;line-height:1.9;color:var(--muted)}.status-line{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:10px}.status-line svg{width:12px;color:var(--purple)}.composer{padding:16px 17px 11px;border:1px solid var(--edge);border-radius:18px;background:var(--paper);box-shadow:0 7px 22px #00000009;transition:box-shadow .25s,border-color .25s}.composer:focus-within{border-color:var(--purple);box-shadow:0 0 0 3px var(--accent-soft)}textarea{display:block;width:100%;height:47px;resize:none;border:0;background:none;color:var(--ink);outline:none!important;padding:0 2px;font-size:12px;line-height:1.8}textarea::placeholder{color:var(--muted)}.composer-bottom{display:flex;align-items:center;gap:8px}.composer-bottom .model{font-size:10px;color:var(--muted)}.send{width:31px;height:31px;border-radius:9px;background:var(--purple);color:var(--on)}.send svg{width:16px}.composer-caption{display:flex;justify-content:space-between;padding:10px 12px 0;font-size:9px;color:var(--muted)}.new-chat-empty{padding:clamp(35px,10vh,110px) 0 35px;animation:appear .5s var(--ease)}.new-chat-empty .eyebrow{font-size:10px;color:var(--purple);margin-bottom:18px}.new-chat-empty h1{font-size:32px;font-weight:450;letter-spacing:-.8px;margin-bottom:14px}.new-chat-empty p{font-size:12px;color:var(--muted);line-height:1.9}.new-chat-empty .shortcuts{display:flex;gap:8px;flex-wrap:wrap;margin-top:27px}.shortcuts button{padding:8px 12px;border:1px solid var(--edge);border-radius:20px;font-size:10px;color:var(--text)}.shortcuts button:hover{color:var(--purple);background:var(--accent-soft)}\r\n/* A single persistent orb; the same button handles click and double click. */\r\n.navigation{position:fixed;inset:0;z-index:50;pointer-events:none}.orb-button{position:absolute;left:-47px;top:50%;transform:translateY(-50%);width:94px;height:94px;border-radius:50%;pointer-events:auto;transition:left .5s var(--ease),width .5s var(--ease),height .5s var(--ease);padding:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent;isolation:isolate}.orb-button:active{transform:translateY(-50%)}.orb-button canvas{width:100%;height:100%;pointer-events:none}:host(.near-orb) .orb-button,.orb-button:focus-visible{left:5px}.navigation.open .orb-button{left:var(--orb-left);width:146px;height:146px}.orb-button:focus-visible{outline:1px solid var(--purple);outline-offset:-8px}.orb-caption{position:absolute;left:28px;top:calc(50% + 59px);font-size:9px;color:var(--muted);opacity:0;transition:opacity .25s;white-space:nowrap;pointer-events:none}:host(.near-orb) .orb-caption{opacity:1}.navigation.open .orb-caption{opacity:0}.veil{position:absolute;inset:0;background:var(--veil);backdrop-filter:blur(13px);-webkit-backdrop-filter:blur(13px);opacity:0;transition:opacity .4s;pointer-events:none}.navigation.open .veil{opacity:1;pointer-events:auto}.nav-content{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .3s}.navigation.open .nav-content{opacity:1}.nav-heading{position:absolute;left:calc(var(--orb-left) + 193px);top:calc(50% - min(39vh,310px));display:flex;align-items:baseline;gap:13px}.nav-heading h2{font-size:18px;font-weight:450;letter-spacing:-.3px}.nav-heading span{font-size:10px;color:var(--muted)}.arc-viewport{position:absolute;left:calc(var(--orb-left) + 176px);top:50%;transform:translateY(-50%) translateX(-20px);width:min(540px,calc(100vw - var(--orb-left) - 215px));height:min(65vh,520px);overflow:auto;overscroll-behavior:contain;scrollbar-width:none;mask-image:linear-gradient(to bottom,transparent 0%,#000 11%,#000 89%,transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0%,#000 11%,#000 89%,transparent 100%);transition:transform .55s var(--ease);pointer-events:none;padding:0 34px 0 34px;scroll-behavior:smooth}.arc-viewport::-webkit-scrollbar{display:none}.navigation.open .arc-viewport{transform:translateY(-50%) translateX(0);pointer-events:auto}.arc-list{padding:60px 0;min-height:100%;display:flex;flex-direction:column;justify-content:center;gap:9px}.nav-row{flex-shrink:0;position:relative;display:flex;align-items:center;gap:0;height:58px;border:1px solid var(--edge);border-radius:11px;background:var(--glass);box-shadow:0 7px 24px #0000000b;transition:background .2s,border-color .2s,opacity .25s;transform:translateX(var(--arc-x,0px));will-change:transform}.nav-row:hover{background:var(--raised);border-color:var(--purple)}.nav-row:focus-within{border-color:var(--purple)}.nav-row.project{height:62px}.project-letter{margin-left:17px;width:26px;color:var(--muted);font-size:13px;font-weight:500}.row-main{justify-content:flex-start;flex:1;min-width:0;height:100%;text-align:left;padding:0 12px;gap:9px;outline-offset:-4px!important}.row-title{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.row-meta{margin-left:auto;font-size:9px;color:var(--muted);white-space:nowrap}.expand-button{margin:0 12px 0 0;width:28px;height:28px;border-radius:7px;color:var(--muted);flex-shrink:0;outline-offset:0!important}.expand-button:hover{background:var(--accent-soft);color:var(--purple)}.expand-button svg{width:14px;transition:transform .35s var(--ease)}.expand-button[aria-expanded=true] svg{transform:rotate(90deg)}.nav-row.chat{height:46px;width:calc(100% - 22px);margin-left:22px;border-color:var(--line);background:color-mix(in srgb,var(--glass) 80%,transparent)}.nav-row.chat .row-main{padding:0 17px}.chat-dot{width:4px;height:4px;border-radius:50%;background:var(--muted);margin-right:4px;flex-shrink:0}.nav-row.chat.selected{border-color:color-mix(in srgb,var(--purple) 45%,transparent);background:var(--accent-soft)}.nav-row.chat.selected .row-title,.nav-row.chat.selected .chat-dot{color:var(--purple)}.nav-row.chat.selected .chat-dot{background:var(--purple)}.nav-row.chat .row-title{font-size:11px}.nav-row.chat .row-meta{font-size:8px}.arc-hint{position:absolute;left:calc(var(--orb-left) + 193px);top:calc(50% + min(37vh,290px));color:var(--muted);font-size:9px;display:flex;gap:16px;align-items:center;pointer-events:auto}.arc-hint button{font-size:9px;color:var(--text);border-bottom:1px solid var(--edge);padding:2px 0}.orb-open-caption{position:absolute;left:calc(var(--orb-left) + 20px);top:calc(50% + 78px);font-size:9px;color:var(--muted);text-align:center;width:106px;line-height:1.9}.nav-close{position:absolute;top:28px;right:32px;width:35px;height:35px;border:1px solid var(--edge);border-radius:50%;background:var(--glass);color:var(--muted);pointer-events:auto}.nav-close svg{width:14px}.nav-footnote{position:absolute;bottom:30px;right:34px;color:var(--muted);font-size:9px}.nav-row.entering{animation:row-in .36s var(--ease) both}@keyframes row-in{from{opacity:0;translate:-18px 0}to{opacity:1;translate:0 0}}\r\n.utilities{position:fixed;right:25px;bottom:23px;z-index:20;display:flex;align-items:center;gap:8px}.utility-toggle{width:36px;height:36px;border-radius:50%;background:var(--paper);border:1px solid var(--edge);color:var(--muted);box-shadow:0 3px 12px #0000000b}.utility-toggle[aria-expanded=true]{color:var(--purple);background:var(--raised)}.utility-toggle svg{width:16px}.utility-hint{font-size:9px;color:var(--muted)}.utility-panel{position:absolute;right:0;bottom:48px;width:255px;padding:12px;background:var(--glass);border:1px solid var(--edge);border-radius:15px;box-shadow:var(--shadow);backdrop-filter:blur(24px);animation:appear .2s var(--ease)}.utility-panel .menu-label{font-size:9px;color:var(--muted);padding:6px 9px 9px}.utility-panel button{display:flex;width:100%;justify-content:flex-start;font-size:11px;padding:10px;border-radius:8px;gap:10px}.utility-panel button:hover{background:var(--line)}.utility-panel button svg{width:15px;color:var(--muted)}.utility-panel button small{margin-left:auto;color:var(--muted);font-size:9px}.utility-panel .separator{height:1px;background:var(--line);margin:7px 6px}.toast{position:fixed;left:50%;bottom:27px;z-index:100;transform:translate(-50%,10px);background:var(--ink);color:var(--bg);border-radius:11px;padding:10px 17px;font-size:11px;opacity:0;pointer-events:none;transition:opacity .2s,transform .3s;max-width:80vw;text-align:center}.toast.show{opacity:1;transform:translate(-50%,0)}dialog{width:min(640px,calc(100vw - 32px));max-height:80vh;overflow:auto;background:var(--paper);color:var(--ink);border:1px solid var(--edge);border-radius:18px;padding:28px;box-shadow:var(--shadow)}dialog::backdrop{background:var(--veil);backdrop-filter:blur(12px)}dialog header{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}dialog h2{font-size:23px;font-weight:450;letter-spacing:-.5px}dialog p{font-size:12px;line-height:2;color:var(--text);margin-bottom:17px}dialog h3{font-size:12px;font-weight:550;margin:21px 0 8px}dialog .hint{font-size:10px;color:var(--muted)}dialog .primary{padding:10px 14px;background:var(--purple);color:var(--on);border-radius:9px;font-size:11px}.key-row{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);padding:13px 0;font-size:11px;color:var(--text)}.key-row span:last-child{color:var(--muted);font-size:10px}@keyframes appear{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}\r\n@media(min-width:1700px){.workspace{inset:100px 0 40px}.conversation{width:790px}.answer{font-size:14px}.user-message{font-size:13px}.answer h1{font-size:33px}.thread-caption{padding-bottom:24px}.composer textarea{height:58px}}\r\n@media(max-width:850px){:host{--orb-left:24px}.nav-heading{left:174px}.arc-viewport{left:152px;width:calc(100vw - 180px);padding-right:18px;padding-left:20px}.arc-hint{left:174px}.orb-open-caption{left:45px}.navigation.open .orb-button{width:125px;height:125px}.project-letter{margin-left:12px;width:19px}.row-main{padding:0 8px}.row-meta{font-size:8px}.expand-button{margin-right:8px}.conversation{width:calc(100% - 135px)}.answer h1{font-size:26px}.nav-footnote{display:none}}\r\n@media(max-width:560px){:host{--orb-left:2px}.app-head{height:58px;padding:0 20px}.workspace{inset:72px 0 76px}.conversation{width:calc(100% - 58px);margin-left:18px}.thread-body{padding:0 4px 18px}.thread-caption{padding:0 4px 14px}.user-message{max-width:96%;font-size:11px;padding:12px 14px;margin-bottom:24px}.answer{font-size:12px}.answer h1{font-size:24px}.notes{gap:18px}.notes p{font-size:10px}.file-card{padding:13px;gap:10px}.file-copy small{font-size:9px}.file-copy b{font-size:11px}.composer{padding:13px}.composer-caption{font-size:8px;padding:8px 2px 0}.composer-bottom .model{font-size:9px}.utilities{bottom:19px;right:18px}.utility-hint{display:none}.location{font-size:9px}.local-indicator{font-size:8px}.orb-button{width:76px;height:76px;left:-38px}:host(.near-orb) .orb-button,.orb-button:focus-visible{left:-8px}.orb-caption{left:8px;top:calc(50% + 42px);font-size:8px}.navigation.open .orb-button{left:-5px;width:101px;height:101px}.orb-open-caption{left:2px;top:calc(50% + 58px);width:85px;font-size:8px}.nav-heading{left:111px;top:calc(50% - min(39vh,310px));gap:7px;flex-direction:column}.nav-heading h2{font-size:17px}.nav-heading span{font-size:9px}.arc-viewport{left:95px;width:calc(100vw - 99px);padding-left:14px;padding-right:13px;height:min(63vh,500px)}.arc-list{gap:8px;padding:48px 0}.nav-row.project{height:58px}.nav-row.chat{height:44px;width:calc(100% - 10px);margin-left:10px}.nav-row.chat .row-main{padding:0 10px}.row-title{font-size:11px}.row-meta{display:none}.project-letter{font-size:11px;width:16px;margin-left:12px}.expand-button{width:27px;margin-right:7px}.nav-row.chat .row-title{font-size:10px}.arc-hint{left:112px;top:calc(50% + min(36vh,283px));font-size:8px;gap:9px}.nav-close{top:19px;right:18px;width:31px;height:31px}.nav-row{border-radius:9px}.navigation.open .veil{backdrop-filter:blur(15px)}}\r\n@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}\r\n\r\n/* One continuous movement, with a stable canvas backing store. */\r\n.orb-button{transition:left 620ms var(--ease),width 620ms var(--ease),height 620ms var(--ease);will-change:left,width,height}\r\n.orb-button canvas{display:block;width:100%;height:100%}\r\n.veil{transition:opacity 950ms cubic-bezier(.3,0,.2,1);backdrop-filter:blur(15px)}\r\n.nav-content{transition:opacity 240ms ease}\r\n.arc-viewport,.navigation.open .arc-viewport{transform:translateY(-50%);transition:none;padding-left:38px;padding-right:38px;width:min(590px,calc(100vw - var(--orb-left) - 190px));height:min(75vh,620px)}\r\n.arc-list{gap:15px;padding-top:95px;padding-bottom:95px}\r\n.nav-row{transform:translateX(var(--arc-x,0px)) rotate(var(--arc-angle,0deg));transform-origin:0 50%;will-change:transform,translate;box-shadow:0 6px 24px #0000000b}\r\n.nav-row.project{width:100%;justify-content:flex-start;text-align:left;padding:0 18px;height:60px;gap:15px}\r\n.nav-row.project:active{transform:translateX(var(--arc-x,0px)) rotate(var(--arc-angle,0deg)) scale(.99)}\r\n.nav-row.project .project-letter{margin:0;width:21px;flex-shrink:0}\r\n.nav-row.project .row-title{flex:1}.nav-row.project .row-meta{margin-left:auto}\r\n.nav-row.project .row-chevron{width:13px;height:13px;color:var(--muted);transition:transform .3s var(--ease);margin-left:3px}\r\n.nav-row.project[aria-expanded=true] .row-chevron{transform:rotate(90deg)}\r\n.nav-row.entering{animation:none}\r\n.nav-row.chat .row-meta{display:none}\r\n.composer{margin-bottom:4px}\r\n@media(max-width:850px){.arc-viewport,.navigation.open .arc-viewport{width:calc(100vw - 172px);padding-left:24px;padding-right:20px}.nav-row.project{gap:10px;padding:0 13px}}\r\n@media(max-width:560px){.arc-viewport,.navigation.open .arc-viewport{width:calc(100vw - 103px);padding-left:15px;padding-right:18px;height:72vh}.arc-list{padding-top:80px;padding-bottom:80px;gap:13px}.nav-row.project{padding:0 11px;gap:8px}.nav-row.project .project-letter{width:16px}}\r\n@media(prefers-reduced-motion:reduce){.orb-button,.veil,.nav-content{transition:none!important}}\r\n\r\n/* Radial cards widen toward the outside of the disc. */\r\n.nav-row,.nav-row:hover,.nav-row.chat,.nav-row.chat.selected{background:transparent;border:0;box-shadow:none}\r\n.nav-row>.card-surface{position:absolute;inset:0;width:100%;height:100%;z-index:0;overflow:visible;pointer-events:none;filter:drop-shadow(0 5px 12px #00000009)}\r\n.card-surface path{fill:var(--glass);stroke:var(--edge);stroke-width:1;vector-effect:non-scaling-stroke;transition:fill .2s,stroke .2s}\r\n.nav-row:hover>.card-surface path,.nav-row:focus-within>.card-surface path{fill:var(--raised);stroke:var(--purple)}\r\n.nav-row.chat.selected>.card-surface path{fill:var(--glass);stroke:var(--purple)}\r\n.nav-row>:not(.card-surface){position:relative;z-index:1}\r\n.nav-row.project{height:68px}.nav-row.chat{height:54px}\r\n.mini-hole{background:var(--ink);border-color:var(--purple);box-shadow:0 0 8px var(--accent-soft)}\r\n#chatGuides{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:2;fill:none;stroke:var(--purple);stroke-width:2.1;stroke-linecap:round;opacity:.8}\r\n\r\n/* Angular transparency follows the fan instead of horizontal crop lines. */\r\n.arc-viewport,.navigation.open .arc-viewport{mask-image:var(--fan-mask);-webkit-mask-image:var(--fan-mask);mask-size:100% 100%;-webkit-mask-size:100% 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat}\r\n/* Extra paint space, with the original layout window retained by padding. */\r\n.arc-viewport,.navigation.open .arc-viewport{--layout-height:min(75vh,620px);height:100dvh;padding-top:calc((100dvh - var(--layout-height))/2);padding-bottom:calc((100dvh - var(--layout-height))/2)}\r\n.arc-list{min-height:var(--layout-height)}\r\n@media(max-width:560px){.arc-viewport,.navigation.open .arc-viewport{--layout-height:72vh}}\r\n:host{all:initial;position:fixed;inset:0;z-index:2147483000;pointer-events:none;font:13px/1.6 \"Segoe UI Variable Text\",\"Segoe UI\",sans-serif;color:var(--ink)}.orb-button{outline:none}.orb-button:focus-visible{outline:1px solid var(--purple)}.nav-content{color:var(--ink)}.compact-head{position:absolute;left:0;right:257px;top:0;height:43px;padding:0 26px;display:flex;align-items:center;gap:13px;color:var(--ink);-webkit-app-region:drag;pointer-events:auto;z-index:1}.compact-wordmark{transform:translateX(-6px);-webkit-app-region:no-drag;cursor:pointer;padding:0;border:0;background:transparent;color:inherit;line-height:1.6;font-size:19px;font-weight:550;letter-spacing:-.7px;flex:none}.compact-title{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;border-left:1px solid var(--edge);padding-left:13px;line-height:16px}.compact-title[hidden]{display:none}@media(max-width:560px){.compact-head{padding-left:16px;gap:10px;right:250px}.compact-title{font-size:10px}}[data-fade-person]::before{content:\"\";width:20px;height:20px;background:currentColor;mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8' r='3.5'/%3E%3Cpath d='M5 21v-2a7 7 0 0 1 14 0v2z'/%3E%3C/svg%3E\") center/contain no-repeat}.compact-title{-webkit-app-region:no-drag;cursor:pointer;border-radius:5px;padding:5px 9px 5px 13px;text-align:left;display:block;max-width:100%;transition:background .15s,color .15s}\n/* Keep the orb and particles out of the native rail even across stacking contexts. */\n.navigation{clip-path:var(--fade-navigation-clip,none);transition:left var(--fade-rail-duration,320ms) var(--fade-rail-ease,ease)}\n.compact-title:hover,.compact-title[aria-expanded=true]{color:var(--ink);background:var(--line)}\n.chat-picker{position:absolute;left:82px;top:48px;width:min(360px,calc(100vw - 100px));max-height:calc(100dvh - 76px);display:flex;flex-direction:column;padding:8px;border:1px solid var(--edge);border-radius:16px;background:var(--glass);backdrop-filter:blur(28px);box-shadow:var(--shadow);pointer-events:auto;z-index:30;color:var(--ink);-webkit-app-region:no-drag}\n.chat-picker-search{padding:6px 5px 9px}\n.chat-picker-search input{box-sizing:border-box;width:100%;height:34px;padding:0 11px;border:1px solid var(--edge);border-radius:9px;background:var(--paper);color:var(--ink);font:12px 'Segoe UI',sans-serif;outline:none}\n.chat-picker-search input::placeholder{color:var(--muted)}\n.chat-picker-search input:focus{border-color:var(--purple)}\n.chat-picker-list{min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--edge) transparent;padding:0 2px 4px}\n.chat-picker-row{display:flex;width:100%;gap:10px;padding:9px 10px;border-radius:9px;text-align:left;justify-content:flex-start;font-size:13px;line-height:20px;color:var(--ink)}\n.chat-picker-row:hover,.chat-picker-row:focus-visible{background:var(--line)}\n.chat-picker-row[aria-current=page]{background:var(--accent-soft);color:var(--purple)}\n.chat-picker-row.chat{padding-left:37px}\n.chat-picker-icon{width:17px;height:18px;flex:none;display:flex;align-items:center}.chat-picker-icon:empty{display:none}.chat-picker-icon svg{width:18px;height:18px}\n.chat-picker-label{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.chat-picker-label{min-width:0}\n.fade-chat-status{display:inline-flex;align-items:center;gap:5px;margin-left:auto;flex:none;padding:2px 6px;border-radius:6px;font-size:10px;line-height:16px;color:var(--muted);white-space:nowrap;font-weight:400}\n.fade-chat-status[data-status=working],.fade-chat-status[data-status=reply],.fade-chat-status[data-status=approval]{color:var(--purple);background:var(--accent-soft)}\n.fade-chat-status[data-status=working]::before{content:'';width:7px;height:7px;border:1px solid currentColor;border-right-color:transparent;border-radius:50%;animation:fade-chat-working 1s linear infinite}\n.fade-chat-status[data-status=completed]::before{content:'✓';color:var(--purple)}\n@keyframes fade-chat-working{to{transform:rotate(360deg)}}\n@media(prefers-reduced-motion:reduce){.fade-chat-status[data-status=working]::before{animation:none}}\n.chat-picker-section{padding:10px;line-height:18px;color:var(--muted);font-size:11px}\n.chat-picker-empty,.chat-picker-row.more{padding:10px 10px 10px 37px;color:var(--muted);font-size:12px}\n@media(max-width:560px){.chat-picker{left:16px;width:calc(100vw - 32px)}}\n/* A completed, unopened answer leaves a quiet but unmistakable purple signal. */\n.nav-row.chat:has([data-completion-pending=true])>.card-surface path{\n fill:color-mix(in srgb,var(--purple) 17%,var(--glass));stroke:var(--purple);stroke-width:1.8;\n}\n.nav-row.chat:has([data-completion-pending=true])>.card-surface{filter:drop-shadow(0 0 9px color-mix(in srgb,var(--purple) 22%,transparent))}\n.nav-row.chat [data-completion-pending=true] .chat-dot{width:17px;height:17px;display:grid;place-items:center;background:var(--purple);color:var(--bg);font-size:11px;line-height:1}\n.nav-row.chat [data-completion-pending=true] .chat-dot::after{content:'✓'}\n[data-completion-pending=true] .fade-chat-status{color:var(--purple)}\n.nav-row.project[data-completion-pending=true] .row-meta{display:block;color:var(--purple);background:var(--accent-soft);border:1px solid color-mix(in srgb,var(--purple) 40%,transparent);border-radius:7px;padding:2px 7px;font-size:11px}\n.chat-picker-row[data-completion-pending=true]{background:var(--accent-soft);box-shadow:inset 3px 0 var(--purple)}\n.chat-picker-project{display:flex;align-items:center;border-radius:9px;padding-right:6px}\n.chat-picker-project:hover,.chat-picker-project:focus-within{background:var(--line)}\n.chat-picker-project>.project{flex:1;min-width:0;width:auto}\n.chat-picker-project .project-menu,.chat-picker-project .project-new-chat{margin-left:4px}\n.chat-picker-project .project-new-chat svg{fill:none;stroke:currentColor;stroke-width:1.5}\n.fade-chat-actions{display:flex;align-items:center;gap:3px;flex:none;position:relative;z-index:1}\n.fade-chat-action{display:grid;place-items:center;flex:none;width:26px;height:28px;padding:5px;border-radius:7px;color:var(--muted)}\n.fade-chat-action svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}\n.fade-chat-action:hover,.fade-chat-action:focus-visible,.fade-chat-action[aria-pressed=true]{color:var(--purple);background:var(--accent-soft)}\n.fade-chat-action:disabled{opacity:.45;cursor:wait}\n.chat-picker-chat{display:flex;align-items:center;min-width:0;border-radius:9px;padding-right:6px}\n.chat-picker-chat>.chat-picker-row{flex:1;min-width:0;width:auto}\n.chat-picker-chat:hover{background:var(--line)}\n.nav-row.chat:has(.fade-chat-actions){gap:6px}\n.nav-row.chat:has(.fade-chat-actions)>.row-main{min-width:0;flex:1;width:auto}\n#historyViewport .nav-row.chat:has(.fade-chat-actions){flex-direction:row-reverse}\n#historyViewport .fade-chat-actions{transform:scaleX(-1)}\n.chat-picker-section-toggle{display:flex;align-items:center;justify-content:flex-start;gap:7px;width:100%;border-radius:7px;text-align:left;cursor:pointer}\n/* Open sections reveal their chevron on hover or keyboard focus. */\n.chat-picker-section-toggle::after,.chat-picker-row.project .chat-picker-label::after,.project-main .row-title::after{content:'';display:inline-block;flex:none;width:12px;height:12px;background:currentColor;mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='m6 4 4 4-4 4' fill='none' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") center/contain no-repeat;transform:translateY(var(--chevron-collapsed-y,1px)) rotate(0deg);vertical-align:-1px;margin-left:8px;opacity:1}\n.chat-picker-section-toggle::after{margin-left:0}\n.chat-picker-section-toggle[aria-expanded=true]::after,.chat-picker-row.project[aria-expanded=true] .chat-picker-label::after,.project-main[aria-expanded=true] .row-title::after{transform:translateY(var(--chevron-expanded-y,1px)) rotate(90deg);opacity:0}\n.chat-picker-section-toggle:hover::after,.chat-picker-section-toggle:focus-visible::after,.chat-picker-project:hover .chat-picker-label::after,.chat-picker-row.project:focus-visible .chat-picker-label::after,.nav-row.project:hover .project-main .row-title::after,.project-main:focus-visible .row-title::after{opacity:1}\n.chat-picker-section-toggle:hover,.chat-picker-section-toggle:focus-visible{color:var(--purple);background:var(--accent-soft)}\n\n.chat-picker-section-actions{display:flex;align-items:center;gap:4px;padding-right:6px}\n.chat-picker-section-actions>.chat-picker-section-toggle{flex:1;min-width:0;width:auto}\n.chat-picker-add-project{display:grid;place-items:center;width:28px;height:28px;padding:5px;flex:none;border-radius:7px;color:var(--muted)}\n.chat-picker-add-project svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round}\n.chat-picker-add-project:hover,.chat-picker-add-project:focus-visible{color:var(--purple);background:var(--accent-soft)}\n\n.chat-picker-section-actions>.chat-picker-row{flex:1;min-width:0}\n\n.chat-picker-row.native-section{font-weight:600;color:var(--muted);font-size:12px;margin-top:6px}\n.chat-picker-nested-project{margin-left:12px}\n.nav-row.native-section .row-title{font-weight:600;color:var(--purple)}\n.compact-title{flex:0 1 auto;max-width:220px}\n.fade-gpt-area{display:flex;align-items:center;gap:5px;min-width:0;flex:1;border-left:1px solid var(--edge);padding-left:10px;-webkit-app-region:no-drag}\n.fade-gpt-tabs{display:flex;gap:4px;min-width:0;overflow:visible}\n\n.fade-gpt-tab{display:flex;align-items:center;flex:none;max-width:210px;height:32px;box-sizing:border-box;border-radius:8px;gap:2px;color:var(--text)}\n.fade-gpt-tab[draggable=true]{position:relative;user-select:none}\n.fade-gpt-tab[draggable=true] .fade-gpt-select{cursor:grab}\n.fade-gpt-tabs[data-fade-dragging] .fade-gpt-select{cursor:grabbing}\n.fade-gpt-tab[data-fade-drop]::after{content:\"\";position:absolute;top:4px;bottom:4px;width:2px;border-radius:2px;background:var(--purple);pointer-events:none}\n.fade-gpt-tab[data-fade-drop=before]::after{left:-3px}\n.fade-gpt-tab[data-fade-drop=after]::after{right:-3px}\n.fade-gpt-tab:has([aria-selected=true]){background:var(--accent-soft);color:var(--purple)}\n.fade-gpt-select{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;height:32px;box-sizing:border-box;padding:6px 7px 6px 11px;font-size:13px;line-height:20px;color:inherit;text-align:left}\n.fade-gpt-close,.fade-gpt-add{flex:none;width:28px;height:28px;border-radius:7px;color:var(--muted);font-size:17px}\n.fade-gpt-add{font-size:21px;width:30px;height:32px}\n.fade-gpt-close:hover,.fade-gpt-add:hover{background:var(--line);color:var(--ink)}\n.fade-gpt-add:disabled{opacity:.4;cursor:progress}\n@media(max-width:700px){.compact-title{max-width:110px}.compact-head{gap:7px}.fade-gpt-area{padding-left:5px}.fade-gpt-tab{max-width:150px}}\n\n.fade-codex-tab{flex:none;white-space:nowrap;padding-right:10px}\n/* Two compact groups share available width; directory and add controls never scroll. */\n.fade-gpt-area{flex:none;overflow:visible}\n.fade-gpt-tabs{flex:none}\n.fade-directory,.fade-gpt-area .compact-title{flex:none;max-width:none;box-sizing:border-box;border:1px solid color-mix(in srgb,var(--ink) 17%,transparent);height:32px;padding:6px 10px;font-size:12px;line-height:18px;white-space:nowrap;color:var(--muted);border-radius:6px}\n.fade-directory:hover,.fade-directory[aria-expanded=true]{background:var(--line);color:var(--ink)}\n.fade-directory:focus-visible,.fade-gpt-select:focus-visible,.fade-gpt-close:focus-visible,.fade-gpt-add:focus-visible{outline:1px solid var(--purple);outline-offset:-1px}\r\n.fade-gpt-select{display:flex;align-items:center;gap:6px}\n.fade-tab-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.fade-tab-status{display:inline-flex;align-items:center;justify-content:center;flex:0 0 13px;width:13px;height:13px;color:currentColor}\n.fade-tab-status svg{display:block;width:13px;height:13px}\n.fade-tab-status-working svg{animation:fade-tab-spin .9s linear infinite}\n.fade-tab-status-working{color:var(--muted)}\n.fade-tab-status-completed,.fade-tab-status-reply{color:var(--purple)}\n@keyframes fade-tab-spin{to{transform:rotate(360deg)}}\n@media(prefers-reduced-motion:reduce){.fade-tab-status-working svg{animation:none}}\r\n\n.fade-tabs-scroll{display:flex;align-items:center;gap:13px;min-width:0;max-width:100%;flex:0 1 auto;height:43px;overflow-x:auto;overflow-y:hidden;border-left:1px solid color-mix(in srgb,var(--purple) 30%,transparent);scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--ink) 35%,transparent) transparent;-webkit-app-region:no-drag;overscroll-behavior-x:contain}\n.fade-tabs-scroll .fade-gpt-area{border-left:1px solid color-mix(in srgb,var(--purple) 30%,transparent)}\n.fade-tabs-scroll .fade-gpt-area:first-child{border-left:0}\n.fade-tabs-scroll::-webkit-scrollbar{height:5px}\n.fade-tabs-scroll::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--ink) 35%,transparent);border-radius:5px}\n.fade-tabs-scroll::-webkit-scrollbar-track{background:transparent}\n\n.fade-directory:hover,.fade-directory[aria-expanded=true],.fade-gpt-area .compact-title:hover,.fade-gpt-area .compact-title[aria-expanded=true]{border-color:color-mix(in srgb,var(--ink) 30%,transparent);background:var(--line);color:var(--ink)}\n:host([data-window-mode]) #headerTabsScroll{display:none!important}\n.fade-window-add{width:30px;height:30px;border:0;border-radius:8px;background:transparent;color:var(--ink);font-size:22px;pointer-events:auto;-webkit-app-region:no-drag}\n.fade-window-add:hover{background:var(--line)}\n.fade-window-row{position:absolute;top:43px;left:0;right:0;height:42px;display:flex;background:var(--bg,#181818);border-bottom:1px solid var(--edge);pointer-events:auto}\n.fade-window-row[hidden],.fade-window-add[hidden],.fade-window-menu[hidden]{display:none}\n.fade-window-row,.fade-window-add,.fade-window-menu{visibility:var(--fade-window-chrome-visibility,visible)}\n.fade-window-pane{display:flex;flex:1 1 0;align-items:center;gap:5px;min-width:0;-webkit-app-region:no-drag}\n.fade-window-pane[data-focused]{box-shadow:inset 0 -2px var(--purple)}\n.fade-window-divider:focus-visible,.fade-window-add:focus-visible{outline:2px solid var(--purple);outline-offset:-2px}\n.fade-window-directory{margin-left:8px}\n.fade-window-tabs{flex:0 1 auto;min-width:0;max-width:100%;height:42px;border-left:0;gap:4px}\n.fade-window-tabs .fade-gpt-tabs{gap:4px}\n.fade-window-close-pane{margin-left:auto;margin-right:8px}\n/* The actual hit target spans the body; the hairline is only its paint. */\n.fade-window-divider{flex:0 0 5px;position:relative;height:calc(100dvh - 43px);align-self:flex-start;cursor:col-resize;touch-action:none;pointer-events:auto;-webkit-app-region:no-drag;z-index:3}\n.fade-window-divider::after{content:'';position:absolute;inset:0 2px;background:var(--edge);pointer-events:none}\n.fade-window-divider:is(:hover,:focus-visible)::after{background:var(--purple)}\n.fade-window-menu{position:absolute;top:39px;z-index:30;min-width:180px;padding:6px;border:1px solid var(--edge);border-radius:10px;background:var(--bg,#202020);box-shadow:0 8px 30px #0003;pointer-events:auto}\n.fade-window-menu button{display:block;width:100%;padding:9px 12px;text-align:left;color:var(--ink);border:0;border-radius:6px;background:transparent;font:inherit;cursor:pointer}\n.fade-window-menu button:hover{background:var(--line)}\n.fade-preview-directory{position:fixed;z-index:31;box-sizing:border-box;padding:6px;border:1px solid var(--edge);border-radius:10px;background:var(--bg,#202020);color:var(--ink);box-shadow:0 8px 30px #0003;pointer-events:auto;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--edge) transparent;visibility:var(--fade-window-chrome-visibility,visible);-webkit-app-region:no-drag}\n.fade-preview-directory[hidden]{display:none}\n.fade-preview-directory-heading{padding:7px 10px;font-size:12px;opacity:.65}\n.fade-preview-directory button{display:block;position:relative;box-sizing:border-box;width:100%;padding:9px 12px 9px 30px;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:inherit;border:0;border-radius:6px;background:transparent;font:inherit;cursor:pointer}\n.fade-preview-directory button[aria-checked=true]{color:var(--purple);background:var(--line)}\n.fade-preview-directory button[aria-checked=true]::before{content:'✓';position:absolute;left:10px}\n.fade-preview-directory button:is(:hover,:focus-visible){background:var(--line)}\n.fade-preview-directory button:focus-visible{outline:1px solid var(--purple);outline-offset:-1px}\n.navigation{left:var(--fade-workspace-inset,0px)}.arc-viewport,.navigation.open .arc-viewport{max-width:calc(100vw - var(--fade-workspace-inset,0px) - var(--orb-left) - 176px)}@media(max-width:850px){.arc-viewport,.navigation.open .arc-viewport{max-width:calc(100vw - var(--fade-workspace-inset,0px) - 172px)}}@media(max-width:560px){.arc-viewport,.navigation.open .arc-viewport{max-width:calc(100vw - var(--fade-workspace-inset,0px) - 103px)}}.header-menu-toggle{position:absolute;right:217px;top:6px;width:30px;height:30px;padding:7px;border-radius:8px;color:var(--ink);pointer-events:auto;-webkit-app-region:no-drag;z-index:2}.header-menu-toggle:hover{background:var(--line)}.header-menu-toggle svg{width:16px;height:16px;transition:transform .2s}.header-menu-toggle[aria-expanded=true] svg{transform:rotate(180deg)}:host([data-menu-open]) .compact-head{right:489px}@media(max-width:560px){.header-menu-toggle{right:210px}:host([data-menu-open]) .compact-title{display:none}:host([data-menu-open]) .compact-head{right:auto}}@media(prefers-reduced-motion:reduce){.header-menu-toggle svg{transition:none}}.header-theme-toggle{position:absolute;right:181px;top:6px;width:30px;height:30px;padding:6px;border-radius:8px;color:var(--ink);pointer-events:auto;-webkit-app-region:no-drag;z-index:2}.header-theme-toggle:hover{background:var(--line)}.header-theme-toggle svg{width:17px;height:17px}.header-theme-toggle .theme-moon{display:none}:host([data-theme=light]) .header-theme-toggle .theme-sun{display:none}:host([data-theme=light]) .header-theme-toggle .theme-moon{display:block}@media(max-width:560px){.header-theme-toggle{right:174px}}.header-fullscreen-toggle{position:absolute;right:145px;top:6px;width:30px;height:30px;padding:6px;border-radius:8px;color:var(--ink);pointer-events:auto;-webkit-app-region:no-drag;z-index:2}\n.header-fullscreen-toggle:hover{background:var(--line)}\n.header-fullscreen-toggle svg{width:17px;height:17px}\n.fullscreen-window-controls{position:absolute;right:0;top:0;height:43px;display:flex;pointer-events:auto;-webkit-app-region:no-drag;z-index:3;color:var(--ink)}\n.fullscreen-window-controls[hidden]{display:none}\n.fullscreen-window-controls button{width:46px;height:43px;display:grid;place-items:center;padding:0;color:inherit;border-radius:0}\n.fullscreen-window-controls button:hover{background:var(--line)}\n.fullscreen-window-controls #fullscreenClose:hover{background:#c42b1c;color:white}\n.fullscreen-window-controls svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1}\n.header-fullscreen-toggle:focus-visible,.fullscreen-window-controls button:focus-visible{outline:2px solid var(--purple);outline-offset:-3px}\n@media(max-width:560px){.header-fullscreen-toggle{right:138px}}\r\n\n.header-fullscreen-toggle .fullscreen-exit{display:none}\n.header-fullscreen-toggle[aria-pressed=true] .fullscreen-enter{display:none}\n.header-fullscreen-toggle[aria-pressed=true] .fullscreen-exit{display:block}\n\r\n\n#fullscreenRestore .window-restore{display:none}\n#fullscreenRestore[data-maximized=true] .window-maximize{display:none}\n#fullscreenRestore[data-maximized=true] .window-restore{display:block}\n/* One viewport coordinate system; only the compositor transform interpolates.\r\n   The canvas keeps its backing size while the whole hit target scales with it. */\r\n.navigation .orb-button{\r\n --orb-x:var(--fade-workspace-inset,0px);\r\n --orb-y:50vh;\r\n --orb-scale:0.6438356164;\r\n position:fixed!important;\r\n left:-73px!important;top:-73px!important;\r\n width:146px!important;height:146px!important;\r\n transform-origin:center;\r\n transform:translate3d(var(--orb-x),var(--orb-y),0) scale(var(--orb-scale))!important;\r\n transition:transform 420ms cubic-bezier(.22,.7,.18,1);\r\n will-change:transform;\r\n}\r\n:host(.near-orb) .navigation .orb-button,.navigation .orb-button:focus-visible{\r\n --orb-x:calc(var(--fade-workspace-inset,0px) + 52px);\r\n}\r\n:host .navigation.open .orb-button{\r\n --orb-x:calc(var(--fade-workspace-inset,0px) + var(--orb-left) + 73px);\r\n --orb-scale:1;\r\n transition-duration:520ms;\r\n}\r\n@media(max-width:850px){\r\n :host .navigation.open .orb-button{--orb-x:calc(var(--fade-workspace-inset,0px) + var(--orb-left) + 62.5px);--orb-scale:0.8561643836}\r\n}\r\n@media(max-width:560px){\r\n .navigation .orb-button{--orb-scale:0.5205479452}\r\n :host(.near-orb) .navigation .orb-button,.navigation .orb-button:focus-visible{--orb-x:calc(var(--fade-workspace-inset,0px) + 30px)}\r\n :host .navigation.open .orb-button{--orb-x:calc(var(--fade-workspace-inset,0px) + 45.5px);--orb-scale:0.6917808219}\r\n}\r\n:host([data-home-orb]) .navigation:not(.open) .orb-button,\r\n:host([data-orb-arriving-home]) .navigation .orb-button{\r\n --orb-x:var(--fade-home-x);--orb-y:var(--fade-home-y);--orb-scale:0.6438356164;\r\n transition-duration:600ms;\r\n}\r\n@media(prefers-reduced-motion:reduce){.navigation .orb-button{transition:none!important}}\r\n\r\n/* Dock the normal-size orb halfway beyond the top edge. The open state uses\r\n   the same centered position and responsive scale as ordinary navigation. */\r\n:host([data-window-mode]) .navigation .orb-button{-webkit-app-region:no-drag}\r\n/* Confine both particles and pointer hits to the title bar while docked. */\r\n:host([data-window-mode]) .navigation:not(.open){clip-path:inset(0 0 calc(100% - 43px) 0)}\r\n:host([data-window-mode]) .navigation:not(.open) .orb-button{--orb-x:50vw!important;--orb-y:0px!important}\r\n:host([data-window-mode].near-orb) .navigation:not(.open) .orb-button,\r\n:host([data-window-mode]) .navigation:not(.open) .orb-button:focus-visible{--orb-y:21.5px!important}\r\n:host([data-window-mode]) .orb-caption{display:none}\r\n\r\n.fade-orb-usage{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;color:#000;font:600 14px/1.2 \"Segoe UI\",sans-serif;pointer-events:none;white-space:nowrap;font-variant-numeric:tabular-nums}\n:host([data-theme=light]) .fade-orb-usage{color:#fff}\n.fade-orb-usage[hidden]{display:none}\n/* The left fan mirrors geometry, never readable text. */\n/* Both lists share one opacity transition, independent of row replacement. */\n#navigation .nav-content{transition:opacity 180ms ease}\n#navigation.open .nav-content{opacity:0}\n#navigation.open.cards-ready .nav-content{opacity:1;transition:opacity 320ms cubic-bezier(.4,0,.2,1)}\n@media(prefers-reduced-motion:reduce){#navigation .nav-content{transition:none!important}}\n#arcList,#historyList{min-height:0;justify-content:flex-start;overflow-anchor:none}\n#navigation{left:0!important;--orb-left:calc(50vw - 73px)}\n:host .navigation.open .orb-button{--orb-x:50vw;--orb-y:50vh;--orb-scale:1}\n#arcViewport,.navigation.open #arcViewport,#historyViewport{\n width:calc(50% - 124px);max-width:none;height:100vh;padding:0 24px;box-sizing:border-box;\n}\n#arcViewport,.navigation.open #arcViewport{left:calc(50% + 100px)}\n#historyViewport,.navigation.open #historyViewport{left:24px;transform:translateY(-50%) scaleX(-1)}\n#historyViewport .row-main,#historyViewport .project-main,#historyViewport .history-message{direction:ltr}\n#historyViewport .row-main,#historyViewport .project-main{transform:scaleX(-1)}\n#historyViewport .history-message{font-size:12px;justify-content:center}\n#historyViewport .history-message:not(:has(.row-main)){color:transparent}\n#historyViewport .history-message::after{content:attr(data-label);position:absolute;inset:0;display:grid;place-items:center;transform:scaleX(-1);color:var(--muted)}\n#historyGuides{position:absolute;left:0;top:0;width:100%;pointer-events:none;overflow:visible}\n#historyGuides path{fill:none;stroke:var(--purple);stroke-width:1.2;opacity:.65}\n.fade-codex-tab[aria-selected=true]{background:var(--accent-soft);color:var(--purple);border-radius:8px}\n@media(max-width:700px){\n :host .navigation.open .orb-button{--orb-scale:.62}\n #arcViewport,.navigation.open #arcViewport,#historyViewport{width:calc(50% - 58px);padding:0 10px}\n #arcViewport,.navigation.open #arcViewport{left:calc(50% + 48px)}\n #historyViewport,.navigation.open #historyViewport{left:10px}\n .nav-row .row-title{font-size:11px}\n}\r\n.fade-scroll-origin{position:fixed;transform:translate(-50%,-50%);width:24px;height:24px;display:grid;place-items:center;border:1px solid var(--edge);border-radius:50%;background:var(--paper);color:var(--muted);font:16px/1 sans-serif;pointer-events:none;z-index:10}.fade-scroll-origin[hidden]{display:none}:host([data-fan-scrolling]) .arc-viewport,:host([data-fan-scrolling]) .arc-viewport *{cursor:ns-resize!important}\r\n/* Navigation takes visual priority; keep only a faint trace of the workspace. */\n#navigation .veil{\n background:rgb(48 48 48 / 76%);\n backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);\n transition:opacity 260ms cubic-bezier(.3,0,.2,1);\n}\n#navigation .card-surface path{fill:var(--paper)}\n#navigation .nav-row:hover>.card-surface path,\n#navigation .nav-row:focus-within>.card-surface path{fill:var(--raised)}\n@media(prefers-reduced-motion:reduce){#navigation .veil{transition:none!important}}\r\n\n:host([data-theme=light]) #navigation .veil{background:rgb(218 218 218 / 76%)}\n.compact-head,.header-menu-toggle,.header-theme-toggle,.header-fullscreen-toggle,.header-settings-toggle,.fullscreen-window-controls,.fade-conversation-title{\n filter:blur(var(--fade-background-blur,0px));transition:filter 220ms ease;\n}\n@media(prefers-reduced-motion:reduce){.compact-head,.header-menu-toggle,.header-theme-toggle,.header-fullscreen-toggle,.header-settings-toggle,.fullscreen-window-controls,.fade-conversation-title{transition:none}}\r\n.nav-row.project-actions{gap:0}\n.project-main{display:flex;align-items:center;gap:15px;flex:1;min-width:0;height:100%;padding:0;text-align:left;outline-offset:-5px!important}\n.project-main .row-title{min-width:0}\n.project-new-chat{flex:none;width:28px;height:28px;margin-left:12px;border-radius:7px;color:var(--muted)}\n.project-new-chat svg{width:16px;height:16px}\n.project-new-chat:hover,.project-new-chat:focus-visible{background:var(--accent-soft);color:var(--purple)}\n@media(max-width:850px){.project-main{gap:10px}.project-new-chat{margin-left:8px}}\n@media(max-width:560px){.project-main{gap:8px}.project-new-chat{margin-left:4px}}\n.project-menu{flex:none;width:28px;height:28px;margin-left:8px;border-radius:7px;color:var(--muted)}\n.project-menu svg{width:16px;height:16px;fill:currentColor;stroke:none}\n.project-menu:hover,.project-menu:focus-visible,.project-menu[aria-expanded=true]{background:var(--accent-soft);color:var(--purple)}\n.project-menu+.project-new-chat{margin-left:4px}\r\n.header-settings-toggle{position:absolute;right:145px;top:6px;width:30px;height:30px;padding:6px;border-radius:8px;color:var(--ink);pointer-events:auto;-webkit-app-region:no-drag;z-index:2}\n.header-settings-toggle:hover,.header-settings-toggle[aria-expanded=true]{background:var(--line)}\n.header-settings-toggle svg{width:17px;height:17px}\n.header-settings-toggle:focus-visible{outline:2px solid var(--purple);outline-offset:-3px}\n.header-fullscreen-toggle{right:181px}.header-theme-toggle{right:217px}.header-menu-toggle{right:253px}\n.compact-head{right:293px}:host([data-menu-open]) .compact-head{right:525px}\n.fade-settings-menu{position:absolute;right:145px;top:44px;width:280px;max-width:calc(100vw - 24px);padding:8px;border:1px solid var(--edge);border-radius:12px;background:var(--paper);color:var(--ink);box-shadow:var(--shadow);pointer-events:auto;-webkit-app-region:no-drag;z-index:5}\n.fade-settings-menu[hidden]{display:none}\n.fade-settings-title{font-size:11px;color:var(--muted);padding:6px 10px 8px}\n.fade-permissions{display:flex;align-items:center;gap:10px;width:100%;padding:10px;border-radius:7px;font-size:12px;text-align:left}\n.fade-permissions:hover,.fade-permissions:focus-visible{background:var(--line)}\n.fade-permissions:disabled{opacity:.5;cursor:default}\n.fade-permission-value{margin-left:auto;color:var(--muted);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.fade-permissions svg{width:14px;height:14px;flex:none;color:var(--muted)}\n.fade-permissions svg{transform:rotate(180deg)}\n.fade-permissions[aria-expanded=true]{background:var(--line)}\n.fade-classic-mode{display:flex;align-items:center;width:100%;padding:10px;margin-top:6px;border-top:1px solid var(--edge);border-radius:7px;font-size:12px;text-align:left}\n.fade-classic-mode:hover,.fade-classic-mode:focus-visible{background:var(--line)}\n.fade-startup-fullscreen{display:flex;align-items:center;justify-content:space-between;width:100%;padding:10px;border-radius:7px;font-size:12px;text-align:left}\n.fade-startup-fullscreen:hover,.fade-startup-fullscreen:focus-visible{background:var(--line)}\n.fade-startup-fullscreen:disabled{opacity:.5}\n.fade-setting-switch{width:28px;height:16px;border-radius:12px;background:var(--muted);padding:2px;box-sizing:border-box}\n.fade-setting-switch:after{content:'';display:block;width:12px;height:12px;border-radius:50%;background:var(--paper);transition:transform .15s}\n.fade-startup-fullscreen[aria-checked=true] .fade-setting-switch{background:var(--purple)}\n.fade-startup-fullscreen[aria-checked=true] .fade-setting-switch:after{transform:translateX(12px)}\n@media(max-width:560px){.header-settings-toggle{right:138px}.header-fullscreen-toggle{right:174px}.header-theme-toggle{right:210px}.header-menu-toggle{right:246px}.compact-head{right:286px}.fade-settings-menu{right:12px}}\n\n.fade-accent-apply{font-size:11px;color:var(--purple);flex:none;margin-left:12px}\n\n.fade-setting-shortcut{margin-left:auto;padding-left:10px;font:10px/1.4 \"Segoe UI\",sans-serif;color:var(--muted);white-space:nowrap}\n\n.fade-settings-group[hidden]{display:none}\n.fade-settings-group{margin:0 4px 6px 10px;padding-left:8px;border-left:1px solid var(--edge)}\n.fade-settings-chevron{font-size:18px;line-height:1;color:var(--muted)}\n.fade-settings-group-entry[aria-expanded=true] .fade-settings-chevron{transform:rotate(90deg)}\n.fade-background-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:#0005;pointer-events:auto;-webkit-app-region:no-drag;z-index:12}\r\n.fade-background-overlay[hidden],.background-custom[hidden]{display:none}\r\n.fade-background-dialog{width:680px;max-width:100%;max-height:calc(100dvh - 48px);overflow:auto;padding:24px;background:var(--paper);color:var(--ink);border:1px solid var(--edge);border-radius:16px;box-shadow:var(--shadow);font:13px/1.6 \"Segoe UI\",sans-serif;box-sizing:border-box}\r\n.fade-background-dialog header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:22px}\r\n.fade-background-dialog h2{margin:0;font-size:18px;font-weight:550}.fade-background-dialog h3{margin:0 0 12px;font-size:13px;font-weight:550}\r\n.fade-background-dialog p{margin:5px 0 0;color:var(--muted);font-size:12px}\r\n.fade-background-dialog button,.fade-background-dialog select,.fade-background-dialog input{font:inherit;box-sizing:border-box}\r\n.fade-background-dialog button{cursor:pointer;color:inherit}.fade-background-dialog button:disabled{cursor:default;opacity:.5}\r\n.fade-background-dialog :is(button,input,select):focus-visible{outline:2px solid var(--purple);outline-offset:3px}\r\n.background-close{width:30px;height:30px;flex:none;border-radius:7px;background:var(--line);font-size:20px!important}\r\n.background-themes{display:grid;grid-template-columns:1fr 1fr;gap:24px}\r\n.background-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\r\n.background-choices button{display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;min-width:0;padding:4px 4px 7px;border:1px solid var(--edge);border-radius:9px;background:transparent;text-align:center;font-size:12px}\r\n.background-choices button[aria-pressed=true]{border-color:var(--purple);box-shadow:0 0 0 1px var(--purple)}\r\n.background-swatch{display:flex;flex:none;align-items:center;justify-content:center;width:100%;height:68px;border-radius:5px;margin-bottom:5px;background-color:#242424;background-size:cover;background-position:center;font-size:22px;color:#aaa}\r\n.background-theme[data-mode=light] .background-swatch{background-color:#f5f5f4;color:#777}\r\n.background-theme[data-mode=light] .solid{background:#f2f3f7}.background-theme[data-mode=dark] .solid{background:#1e2027}\r\n.background-theme .paper{background-image:linear-gradient(#242424f0,#242424f0),var(--fc-paper-texture);background-size:auto,160px}\r\n.background-theme[data-mode=light] .paper{background-image:linear-gradient(#f5f5f499,#f5f5f499),var(--fc-paper-texture)}\r\n.background-custom{margin-top:16px}.background-file-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\r\n.background-filename{flex-basis:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:12px}\r\n.background-file-row button{padding:5px 10px;border:1px solid var(--edge);border-radius:6px;background:var(--line);font-size:12px}\r\n.background-strength{display:block;margin-top:16px;font-size:12px}.background-strength output{float:right;color:var(--muted)}\r\n.background-strength input{display:block;width:100%;accent-color:var(--purple);margin:9px 0}\r\n.background-fit{display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-top:12px}\r\n.background-fit select{background:var(--paper);color:var(--ink);border:1px solid var(--edge);border-radius:6px;padding:4px 8px}\r\n.fade-background-dialog .background-status{margin-top:22px;color:var(--ink);min-height:20px}\r\n.fade-background-dialog .background-note{font-size:11px}\r\n@media(max-width:560px){.fade-background-overlay{padding:12px}.fade-background-dialog{padding:18px;max-height:calc(100dvh - 24px)}.background-themes{grid-template-columns:1fr;gap:22px}}\r\n\r\n.background-themes>section{min-width:0}\r\n.background-presets{display:grid;gap:6px;margin-top:12px}\r\n.background-preset-row,.background-save{display:flex;gap:8px;min-width:0}\r\n.background-preset-row button,.background-save button{padding:5px 8px;border:1px solid var(--edge);border-radius:6px;background:var(--line);font-size:12px;flex:none}\r\n.background-preset-row button:first-child{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;display:block}\r\n.background-preset-row button[aria-pressed=true]{border-color:var(--purple)}\r\n.background-save{margin-top:16px}\r\n.background-save input{width:0;min-width:0;flex:1;background:var(--paper);color:var(--ink);border:1px solid var(--edge);border-radius:6px;padding:5px 8px}\r\n.background-transforms{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin-top:8px}.background-transforms .background-strength{margin-top:8px}.background-transforms .background-strength:last-child{grid-column:1/-1}\r\n.fade-conversation-title{position:fixed;height:40px;box-sizing:border-box;padding:9px 24px 10px;font-size:15px;font-weight:550;line-height:20px;text-align:center;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:auto}\n.fade-conversation-title[hidden]{display:none}\r\n\r\n\r\n.fade-conversation-title{user-select:none}.fade-conversation-title:focus-visible{outline:1px solid var(--muted);outline-offset:-4px}\r\n.fade-title-editor{position:fixed;height:30px;box-sizing:border-box;padding:3px 10px;border:0;border-radius:0;background:transparent;box-shadow:none;appearance:none;color:var(--ink);font:550 15px/22px \"Segoe UI\",sans-serif;text-align:center;pointer-events:auto;outline:none}\r\n\r\n:host{--purple:var(--fc-accent);--accent-soft:color-mix(in srgb,var(--fc-accent) 7%,transparent)}:host([data-theme=light]){--purple:var(--fc-accent);--accent-soft:color-mix(in srgb,var(--fc-accent) 4.3%,transparent)}/* Compact brand entry; the original rail-toggle behavior is retained. */\n.compact-wordmark{display:grid;place-items:center;width:34px;height:34px;padding:5px;box-sizing:border-box;border-radius:9px;line-height:1;transform:none;flex:none}\n.compact-wordmark img{display:block;width:24px;height:24px;object-fit:contain;pointer-events:none}\n.compact-wordmark:hover,.compact-wordmark[aria-expanded=true]{background:var(--accent-soft)}\n.compact-wordmark:focus-visible{outline:2px solid var(--purple);outline-offset:-2px}\r\n/* Match the native rail center and place the divider at its right edge. */\n.compact-head{padding-left:calc((var(--fade-navigation-width,60px) - 34px)/2);gap:calc((var(--fade-navigation-width,60px) - 34px)/2)}\r\n/* Shadow-root companion: paint only, retain every existing hit target. */\n:host{\n --paper:#292c35;--raised:#303541;--edge:#3b404c;\n --ink:#eceef4;--text:#c4cad6;--muted:#a6afc0;\n --fade-polish-tab:color-mix(in srgb,var(--purple) 14%,#292c35);\n --fade-polish-rim:#ffffff12;\n}\n:host([data-theme=light]){\n --paper:#fcfcff;--raised:#fff;--edge:#dce0ea;\n --ink:#282d3b;--text:#485267;--muted:#667188;\n --fade-polish-tab:color-mix(in srgb,var(--purple) 9%,#fff);\n --fade-polish-rim:#ffffffcc;\n}\n.fade-gpt-tab:has([aria-selected=true]),.fade-codex-tab[aria-selected=true]{\n background:var(--fade-polish-tab);\n box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--purple) 24%,transparent),inset 0 2px 0 var(--fade-polish-rim),0 2px 5px #1016280a;\n}\n.fade-directory,.fade-gpt-area .compact-title{border-color:var(--edge);background:color-mix(in srgb,var(--paper) 55%,transparent)}\n.fade-gpt-close{color:var(--muted)}\n.fade-tabs-scroll,.fade-tabs-scroll .fade-gpt-area{border-left-color:var(--edge)}\n.compact-wordmark:hover,.compact-wordmark[aria-expanded=true]{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--purple) 22%,transparent)}\n/* Quiet off-state track; checked tracks keep their existing purple. */\n.fade-settings-menu [aria-checked=false] .fade-setting-switch{\n background:color-mix(in srgb,var(--muted) 32%,var(--paper));\n}\n/* Busy tab bars: keep targets and scrolling geometry, quiet idle chrome. */\n.fade-gpt-tab .fade-gpt-close{opacity:.38}\n.fade-gpt-tab:has([aria-selected=true]) .fade-gpt-close{opacity:.72}\n.fade-gpt-tab:is(:hover,:focus-within) .fade-gpt-close{opacity:1}\n.fade-tabs-scroll{--fade-scroll-thumb:color-mix(in srgb,var(--ink) 14%,transparent);scrollbar-color:var(--fade-scroll-thumb) transparent}\n.fade-tabs-scroll:is(:hover,:focus-within){--fade-scroll-thumb:color-mix(in srgb,var(--ink) 34%,transparent)}\n.fade-tabs-scroll::-webkit-scrollbar-thumb{background:var(--fade-scroll-thumb)}\n@media(hover:none),(pointer:coarse){\n .fade-gpt-tab .fade-gpt-close{opacity:1}\n .fade-tabs-scroll{--fade-scroll-thumb:color-mix(in srgb,var(--ink) 34%,transparent)}\n}\n</style><header class=\"compact-head\"><button type=\"button\" id=\"fadeRailToggle\" class=\"compact-wordmark\" aria-label=\"FCodex · 展开侧栏\" title=\"FCodex · 展开侧栏\" aria-expanded=\"false\"><img src=\"data:image/png;base64,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\" width=\"24\" height=\"24\" alt=\"\" draggable=\"false\"></button><div id=\"headerTabsScroll\" class=\"fade-tabs-scroll\" aria-label=\"聊天标签区域\"><div class=\"fade-gpt-area\"><button type=\"button\" id=\"compactTitle\" class=\"compact-title\" aria-haspopup=\"dialog\" aria-expanded=\"false\" aria-controls=\"chatPicker\">Codex</button><div id=\"codexTabs\" class=\"fade-gpt-tabs\" role=\"tablist\" aria-label=\"Codex 聊天页签\"></div><button id=\"codexAdd\" class=\"fade-gpt-add\" aria-label=\"新建 Codex 聊天\" title=\"新建 Codex 聊天\">+</button></div><div class=\"fade-gpt-area\"><button id=\"gptDirectory\" class=\"fade-directory\" aria-haspopup=\"dialog\" aria-expanded=\"false\" aria-controls=\"chatPicker\">GPT</button><div id=\"gptTabs\" class=\"fade-gpt-tabs\" role=\"tablist\" aria-label=\"ChatGPT 聊天页签\"></div><button id=\"gptAdd\" class=\"fade-gpt-add\" type=\"button\" aria-label=\"新建 ChatGPT 聊天\" title=\"新建 ChatGPT 聊天\">+</button></div></div></header><button type=\"button\" id=\"headerMenuToggle\" class=\"header-menu-toggle\" aria-label=\"展开应用菜单\" aria-expanded=\"false\" title=\"展开应用菜单\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m14 6-6 6 6 6\"/></svg></button><button type=\"button\" id=\"headerThemeToggle\" class=\"header-theme-toggle\" aria-label=\"切换亮色\" title=\"切换亮色\"><svg class=\"theme-sun\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5\"/></svg><svg class=\"theme-moon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M20 14a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z\"/></svg></button><button type=\"button\" id=\"headerFullscreenToggle\" class=\"header-fullscreen-toggle\" aria-label=\"全屏\" title=\"全屏\" aria-pressed=\"false\"><svg class=\"fullscreen-enter\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6\"/></svg><svg class=\"fullscreen-exit\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3 9h6V3m6 0v6h6M9 21v-6H3m18 0h-6v6\"/></svg></button><div id=\"fullscreenWindowControls\" class=\"fullscreen-window-controls\" hidden><button id=\"fullscreenMinimize\" type=\"button\" aria-label=\"最小化\" title=\"最小化\"><svg viewBox=\"0 0 12 12\"><path d=\"M1 6h10\"/></svg></button><button id=\"fullscreenRestore\" type=\"button\" aria-label=\"退出全屏并还原窗口\" title=\"退出全屏\"><svg class=\"window-maximize\" viewBox=\"0 0 12 12\"><rect x=\"1.5\" y=\"1.5\" width=\"9\" height=\"9\"/></svg><svg class=\"window-restore\" viewBox=\"0 0 12 12\"><path d=\"M3.5 3.5v-2h7v7h-2\"/><rect x=\"1.5\" y=\"3.5\" width=\"7\" height=\"7\"/></svg></button><button id=\"fullscreenClose\" type=\"button\" aria-label=\"关闭窗口\" title=\"关闭窗口\"><svg viewBox=\"0 0 12 12\"><path d=\"m1 1 10 10M11 1 1 11\"/></svg></button></div><section id=\"chatPicker\" class=\"chat-picker\" role=\"dialog\" aria-label=\"聊天列表\" hidden><div class=\"chat-picker-search\"><input id=\"chatSearch\" type=\"search\" placeholder=\"搜索聊天\" aria-label=\"搜索聊天\" autocomplete=\"off\"></div><div id=\"chatPickerList\" class=\"chat-picker-list\"></div></section><div class=\"navigation\" id=\"navigation\"><div class=\"veil\" id=\"veil\" aria-hidden=\"true\"></div><section class=\"nav-content\" id=\"navContent\" inert><h2 id=\"navTitle\" class=\"sr-only\">项目导航</h2><div class=\"arc-viewport\" id=\"arcViewport\" tabindex=\"0\" aria-label=\"项目和聊天列表，可上下滚动\"><svg id=\"chatGuides\" aria-hidden=\"true\"></svg><div class=\"arc-list\" id=\"arcList\"></div></div></section><button class=\"orb-button\" id=\"orbButton\" aria-label=\"单击展开项目导航，右键新建聊天\" aria-expanded=\"false\" aria-controls=\"navContent\"><canvas id=\"orbCanvas\" aria-hidden=\"true\"></canvas></button></div>\r\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\"></div><dialog id=\"infoDialog\" aria-labelledby=\"dialogTitle\"><header><h2 id=\"dialogTitle\">事件视界</h2><button class=\"icon\" id=\"dialogClose\" aria-label=\"关闭说明\"><svg><use href=\"#close\"/></svg></button></header><div id=\"dialogBody\"></div></dialog>\r\n<script>\r\nconst $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];\r\nconst reduceMotion=matchMedia('(prefers-reduced-motion:reduce)'), stateKey='fade-horizon-expanded-v1';\r\nconst groups=[{id:'A',title:'Fade Codex',chats:[{id:'1',title:'让界面退后一步'},{id:'2',title:'打磨控件的细节'},{id:'3',title:'暗色与亮色的关系'}]},{id:'B',title:'Personal site',chats:[{id:'4',title:'首页布局探索'},{id:'5',title:'作品集的阅读节奏'}]},{id:'C',title:'灵感与笔记',chats:[{id:'7',title:'一个新的想法'},{id:'8',title:'把灵感变成原型'}]}];\r\nlet expanded={A:false,B:false,C:false,recent:false},recent=['1','4','7'], currentProject='A',currentChat='1',newCount=0,navOpen=false,toastTimer,lastScroll=0,returnFocus=null;\r\ntry{const saved=JSON.parse(localStorage.getItem(stateKey)||'null');if(saved&&typeof saved==='object')Object.keys(expanded).forEach(k=>expanded[k]=saved[k]===true)}catch{}\r\nconst chatsContent=new Map(), svg=n=>`<svg aria-hidden=\"true\"><use href=\"#${n}\"/></svg>`;\r\nconst initialContent=$('#chatContent').innerHTML;\r\nchatsContent.set('1',{html:initialContent,draft:''});\r\nfunction persist(){try{localStorage.setItem(stateKey,JSON.stringify(expanded))}catch{}}\r\nfunction announce(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2500)}\r\nfunction rememberChat(){chatsContent.set(currentChat,{html:$('#chatContent').innerHTML,draft:$('#prompt').value,scroll:$('#threadBody').scrollTop})}\r\nfunction emptyContent(title,subtitle){$('#chatContent').replaceChildren();const block=document.createElement('section');block.className='new-chat-empty';const kicker=document.createElement('div');kicker.className='eyebrow';kicker.textContent=subtitle;const heading=document.createElement('h1');heading.textContent=title;const desc=document.createElement('p');desc.textContent='空间已经准备好。写下一个想法，从这里继续。';block.append(heading);$('#chatContent').append(block)}\r\nfunction bindArtifact(){const card=$('#artifactCard');if(card)card.onclick=()=>openFilePreview()}\r\nfunction switchChat(id){const group=groups.find(g=>g.chats.some(c=>c.id===id));if(!group)return;rememberChat();currentProject=group.id;currentChat=id;const chat=group.chats.find(c=>c.id===id);$('#location').textContent=group.id+' / '+group.title;$('#threadTitle').textContent=chat.id.startsWith('new')?chat.title:'聊天 '+chat.id+' · '+chat.title;const old=chatsContent.get(id);if(old){$('#chatContent').innerHTML=old.html;$('#prompt').value=old.draft;$('#threadBody').scrollTop=old.scroll||0}else{emptyContent(chat.title,group.title+' / 示例会话');$('#prompt').value='';$('#threadBody').scrollTop=0}recent=[id,...recent.filter(x=>x!==id)].slice(0,8);bindArtifact();closeNav();$('#prompt').focus({preventScroll:true})}\r\nfunction createChat(){rememberChat();newCount++;const id='new-'+Date.now()+'-'+newCount;const group=groups.find(g=>g.id===currentProject)||groups[0];group.chats.unshift({id,title:'新聊天 '+newCount});currentChat=id;recent=[id,...recent].slice(0,8);$('#location').textContent=group.id+' / '+group.title;$('#threadTitle').textContent='新聊天 '+newCount;$('#chatDate').textContent='刚刚';emptyContent('一个新的开始。',group.title+' / 新聊天');$('#prompt').value='';$('#threadBody').scrollTop=0;burstTime=performance.now();startSpin();shakeCore();wakeParticles();closeNav();document.body.classList.add('near-orb');setTimeout(()=>{if(!navOpen)document.body.classList.remove('near-orb')},1200);$('#prompt').focus({preventScroll:true});}\r\nfunction addCardSurface(row){\r\n row.insertAdjacentHTML('afterbegin','<svg class=\"card-surface\" viewBox=\"0 0 1000 100\" preserveAspectRatio=\"none\" aria-hidden=\"true\"><path d=\"M 16 18 L 976 1 Q 999 0 999 15 L 999 85 Q 999 100 976 99 L 16 82 Q 1 81 1 68 L 1 32 Q 1 19 16 18 Z\"/></svg>');\r\n return row;\r\n}\r\nfunction makeProjectRow(id,title,count){\r\n const row=document.createElement('button');row.type='button';row.className='nav-row project';row.dataset.group=id;row.setAttribute('aria-expanded',String(expanded[id]));row.setAttribute('aria-label',(expanded[id]?'收起':'展开')+title);\r\n row.innerHTML=`<span class=\"project-letter\">${id==='recent'?'◷':id}</span><span class=\"row-title\">${title}</span><span class=\"row-meta\">${count}</span><svg class=\"row-chevron\" aria-hidden=\"true\"><use href=\"#chevron\"/></svg>`;\r\n row.onclick=()=>toggleGroup(id);return addCardSurface(row);\r\n}\r\nfunction makeChatRow(chat,group,entering){const row=document.createElement('div');row.className='nav-row chat'+(chat.id===currentChat?' selected':'')+(entering?' entering':'');row.innerHTML=`<button class=\"row-main\"><span class=\"chat-dot\"></span><span class=\"row-title\"></span><span class=\"row-meta\"></span></button>`;row.querySelector('.row-title').textContent=(chat.id.startsWith('new')?'':'聊天 '+chat.id+' · ')+chat.title;row.querySelector('.row-meta').textContent=group.id+' / '+group.title;const b=row.querySelector('button');b.onclick=()=>switchChat(chat.id);if(chat.id===currentChat)b.setAttribute('aria-current','page');return addCardSurface(row)}\r\nfunction renderRows(animateGroup=null){cancelReveal();const list=$('#arcList'),oldScroll=$('#arcViewport').scrollTop;list.replaceChildren();groups.forEach(g=>{list.append(makeProjectRow(g.id,g.title,g.chats.length));if(expanded[g.id])g.chats.forEach(c=>list.append(makeChatRow(c,g,animateGroup===g.id)))});list.append(makeProjectRow('recent','最近',recent.length));if(expanded.recent)recent.forEach(id=>{const g=groups.find(g=>g.chats.some(c=>c.id===id));if(g)list.append(makeChatRow(g.chats.find(c=>c.id===id),g,animateGroup==='recent'))});$('#arcViewport').scrollTop=oldScroll;layoutArc();if(animateGroup)revealCards($$('#arcList .entering'),0,400)}\r\nfunction toggleGroup(id){expanded[id]=!expanded[id];persist();renderRows(expanded[id]?id:null);const toggle=$(`#arcList [data-group=\"${id}\"]`);toggle.focus({preventScroll:true});const viewport=$('#arcViewport'),row=toggle.closest('.nav-row');if(row.offsetTop>viewport.scrollTop+viewport.clientHeight-95)viewport.scrollTo({top:row.offsetTop-viewport.clientHeight/2,behavior:reduceMotion.matches?'instant':'smooth'})}\r\nlet arcFrame=0;\r\nfunction layoutArc(){\r\n const view=$('#arcViewport');if(!view.clientHeight)return;\r\n const rows=$$('#arcList .nav-row'),first=rows[0],last=rows.at(-1);\r\n centerArcEnds(view,$('#arcList'),rows);\r\n const spread=first&&last?(last.offsetTop+last.offsetHeight/2-first.offsetTop-first.offsetHeight/2)/2:1;\r\n const mid=view.scrollTop+view.clientHeight/2,half=Math.min(arcLayoutHeight(view)*.40,Math.max(1,spread)),radius=innerWidth<560?150:350;\r\n rows.forEach(row=>{const y=row.offsetTop+row.offsetHeight/2+Number(row.dataset.revealOffset||0)-mid;const angle=Math.max(-20,Math.min(20,y/half*20));row.style.setProperty('--arc-x',(radius*(Math.cos(angle*Math.PI/180)-1)).toFixed(2)+'px');row.style.setProperty('--arc-angle',angle.toFixed(2)+'deg')});updateChatGuides(rows);\r\n}\r\nfunction centerArcEnds(view,list,rows){\r\n if(!rows.length||!view.clientHeight)return;\r\n const style=getComputedStyle(view);\r\n list.style.paddingTop=Math.max(0,(view.clientHeight-rows[0].offsetHeight)/2-(parseFloat(style.paddingTop)||0))+'px';\r\n list.style.paddingBottom=Math.max(0,(view.clientHeight-rows.at(-1).offsetHeight)/2-(parseFloat(style.paddingBottom)||0))+'px';\r\n}\r\nfunction arcLayoutHeight(view){return Number(view.dataset?.layoutHeight)||view.clientHeight}\r\nfunction updateChatGuides(rows){\r\n const layer=$('#chatGuides'),view=$('#arcViewport');if(!layer)return;\r\n const padding=getComputedStyle(view),height=$('#arcList').offsetHeight+(parseFloat(padding.paddingTop)||0)+(parseFloat(padding.paddingBottom)||0);layer.setAttribute('viewBox',`0 0 ${view.clientWidth} ${height}`);layer.style.height=height+'px';\r\n const runs=[];let run=[];rows.forEach(row=>{if(row.classList.contains('chat'))run.push(row);else if(run.length){runs.push(run);run=[]}});if(run.length)runs.push(run);\r\n const ns='http://www.w3.org/2000/svg';layer.replaceChildren();\r\n // One common circle for all group segments, never a per-card spline.\r\n const sample=rows.find(row=>row.classList.contains('chat'));if(!sample)return;\r\n const inset=Math.min(13,Math.max(5,parseFloat(getComputedStyle(sample).marginLeft)/2));\r\n const radius=Math.max(350,arcLayoutHeight(view)*1.35),cx=sample.offsetLeft-inset-radius,cy=view.scrollTop+view.clientHeight/2;\r\n const point=y=>[cx+Math.sqrt(Math.max(0,radius*radius-(y-cy)*(y-cy))),y];\r\n runs.forEach(group=>{\r\n  const first=group[0],last=group.at(-1);\r\n  const top=Math.max(view.scrollTop-2,first.offsetTop+first.offsetHeight*.23+Number(first.dataset.revealOffset||0));\r\n  const bottom=Math.min(view.scrollTop+view.clientHeight+2,last.offsetTop+last.offsetHeight*.77+Number(last.dataset.revealOffset||0));\r\n  if(bottom<=top)return;\r\n  const start=point(top),end=point(bottom),path=document.createElementNS(ns,'path');\r\n  path.setAttribute('d',`M ${start[0]} ${start[1]} A ${radius} ${radius} 0 0 1 ${end[0]} ${end[1]}`);\r\n  path.style.opacity=String(Math.min(...group.map(row=>row.style.opacity===''?1:Number(row.style.opacity))));layer.append(path);\r\n });\r\n}\r\nlet revealFrame=0,revealRows=[];\r\nfunction cancelReveal(){cancelAnimationFrame(revealFrame);revealFrame=0;revealRows.forEach(row=>{row.style.translate='';row.style.opacity='';delete row.dataset.revealOffset});revealRows=[]}\r\nfunction revealCards(rows,delay=180,duration=650){\r\n cancelReveal();if(reduceMotion.matches||!rows.length){layoutArc();return}\r\n const view=$('#arcViewport'),start=performance.now()+delay,bleed=(view.clientHeight-arcLayoutHeight(view))/2;\r\n const entries=rows.filter(row=>row.offsetTop+row.offsetHeight>=view.scrollTop+bleed-30&&row.offsetTop<=view.scrollTop+view.clientHeight-bleed+30).map((row,index)=>({row,offset:view.scrollTop+view.clientHeight-bleed+45-row.offsetTop,at:start+index*65}));\r\n revealRows=entries.map(e=>e.row);entries.forEach(({row,offset})=>{row.style.translate=`0 ${offset}px`;row.style.opacity='0';row.dataset.revealOffset=offset});layoutArc();\r\n function frame(now){let finished=true;entries.forEach(({row,offset,at})=>{const p=Math.max(0,Math.min(1,(now-at)/duration)),eased=1-Math.pow(1-p,3),y=offset*(1-eased);row.style.translate=`0 ${y}px`;row.dataset.revealOffset=y;row.style.opacity=String(Math.min(1,p*5));if(p<1)finished=false});layoutArc();if(!finished&&navOpen)revealFrame=requestAnimationFrame(frame);else{cancelReveal();layoutArc()}}\r\n revealFrame=requestAnimationFrame(frame);\r\n}\r\n$('#arcViewport').addEventListener('scroll',()=>{if(!arcFrame)arcFrame=requestAnimationFrame(()=>{arcFrame=0;layoutArc()})},{passive:true});\r\nfunction openNav(spin=true){if(navOpen)return;navOpen=true;returnFocus=document.activeElement;$('#utilityPanel').hidden=true;$('#utilityToggle').setAttribute('aria-expanded','false');$('#orbButton').getBoundingClientRect();if(spin)startSpin();$('#navigation').classList.add('open');$('#navigation').setAttribute('role','dialog');$('#navigation').setAttribute('aria-modal','true');$('#navigation').setAttribute('aria-labelledby','navTitle');document.body.classList.add('nav-is-open');$('#app').inert=true;$('#navContent').inert=false;$('#orbButton').setAttribute('aria-expanded','true');renderRows();$('#arcViewport').scrollTop=lastScroll;layoutArc();revealCards($$('#arcList .nav-row'));$('#orbButton').focus({preventScroll:true});wakeParticles()}\r\nfunction closeNav(){if(!navOpen)return;cancelReveal();lastScroll=$('#arcViewport').scrollTop;navOpen=false;$('#navigation').classList.remove('open');['role','aria-modal','aria-labelledby'].forEach(a=>$('#navigation').removeAttribute(a));document.body.classList.remove('nav-is-open');$('#app').inert=false;$('#navContent').inert=true;$('#orbButton').setAttribute('aria-expanded','false');if(returnFocus?.isConnected&&!returnFocus.closest('[inert]'))returnFocus.focus({preventScroll:true});else $('#orbButton').focus({preventScroll:true})}\r\n$('#orbButton').addEventListener('click',()=>{startSpin();if(!navOpen)openNav(false)});\r\n$('#orbButton').addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();createChat()});\r\n$('#orbButton').addEventListener('pointerenter',()=>{document.body.classList.add('near-orb');wakeParticles()});\r\ndocument.addEventListener('pointermove',e=>{if(navOpen)return;const near=e.clientX<135&&Math.abs(e.clientY-innerHeight/2)<145;document.body.classList.toggle('near-orb',near)},{passive:true});\r\n$('#veil').onclick=closeNav;\r\ndocument.addEventListener('keydown',e=>{if($('#infoDialog').open)return;if(e.key==='Escape'){if(navOpen)closeNav();else{$('#utilityPanel').hidden=true;$('#utilityToggle').setAttribute('aria-expanded','false')}return}if(navOpen&&e.key==='Tab'){const targets=[$('#orbButton'),...$$('#navContent button,#arcViewport')].filter(el=>!el.disabled&&!el.closest('[inert]'));const i=targets.indexOf(document.activeElement);e.preventDefault();const next=e.shiftKey?(i<=0?targets.length-1:i-1):(i+1)%targets.length;targets[next].focus({preventScroll:true});if(targets[next].closest('#arcList'))targets[next].scrollIntoView({block:'center',behavior:'instant'})}});\r\nfunction updateFanMask(){\r\n const view=$('#arcViewport'),w=view.clientWidth,h=view.clientHeight;\r\n if(!w||!h)return;\r\n view.dataset.layoutHeight=String(innerWidth<=560?innerHeight*.72:Math.min(innerHeight*.75,620));\r\n // Match the shallow boundary marked in the reference (about 150 / 900).\r\n // Only the mask changes; card and guide-circle geometry stay independent.\r\n const slope=Math.tan(9.5*Math.PI/180),outer=Math.max(12,h*.025),inner=outer+w*slope;\r\n const feather=9;\r\n const svg=`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${w}\" height=\"${h}\" viewBox=\"0 0 ${w} ${h}\"><defs><filter id=\"f\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\"><feGaussianBlur stdDeviation=\"${feather}\"/></filter></defs><path fill=\"white\" filter=\"url(#f)\" d=\"M -40 ${inner+40*slope} L ${w+40} ${outer-40*slope} L ${w+40} ${h-outer+40*slope} L -40 ${h-inner-40*slope} Z\"/></svg>`;\r\n view.style.setProperty('--fan-mask',`url(\"data:image/svg+xml,${encodeURIComponent(svg)}\")`);\r\n}\r\nwindow.addEventListener('resize',()=>{updateFanMask();layoutArc();resizeCanvas()});\r\nfunction setTheme(mode){document.documentElement.dataset.theme=mode;$('#themeLabel').textContent=mode==='dark'?'切换到亮色':'切换到暗色';try{localStorage.setItem('fade-horizon-theme',mode)}catch{}wakeParticles()}\r\n$('#utilityToggle').onclick=()=>{const open=$('#utilityPanel').hidden;$('#utilityPanel').hidden=!open;$('#utilityToggle').setAttribute('aria-expanded',String(open))};\r\nfunction closeUtilities(){$('#utilityPanel').hidden=true;$('#utilityToggle').setAttribute('aria-expanded','false')}\r\n$('#menuTheme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');$('#menuNavigation').onclick=openNav;$('#menuNew').onclick=()=>{closeUtilities();createChat()};$('#menuArtifact').onclick=()=>{closeUtilities();openFilePreview()};$('#menuHelp').onclick=()=>{closeUtilities();showInfo('help')};\r\ndocument.addEventListener('pointerdown',e=>{if(!e.target.closest('#utilities'))closeUtilities()});\r\n$('#sendButton').onclick=()=>{const input=$('#prompt'),text=input.value.trim();if(!text){input.focus();return}if($('#chatContent .new-chat-empty'))$('#chatContent').replaceChildren();const message=document.createElement('div');message.className='user-message';message.style.marginTop='20px';message.textContent=text;$('#chatContent').append(message);input.value='';$('#threadBody').scrollTop=$('#threadBody').scrollHeight;rememberChat();};$('#attachmentButton').onclick=()=>announce('概念预览不上传文件');\r\nfunction showInfo(kind){$('#dialogTitle').textContent=kind==='help'?'从暗核开始':'事件视界 · 导航概念';$('#dialogBody').innerHTML=kind==='help'?`<p>将鼠标移到屏幕左侧中点，暗核会从边缘浮出。触摸屏可以直接点击露出的部分。</p><div class=\"key-row\"><span>单击暗核</span><span>展开 / 收起导航</span></div><div class=\"key-row\"><span>双击暗核</span><span>粒子反馈 + 新聊天</span></div><div class=\"key-row\"><span>项目卡片</span><span>展开 / 收起聊天</span></div><div class=\"key-row\"><span>滚动卡片列表</span><span>沿约 40° 弧线浏览</span></div><div class=\"key-row\"><span>Esc / 点击遮罩</span><span>返回内容</span></div><p class=\"hint\" style=\"margin-top:20px\">项目展开状态与外观保存在本机。聊天与输入只保留在当前页面，刷新后重置。键盘可用 Tab 进入暗核，Enter 展开；工具菜单内也有新聊天入口。</p>`:`<p>一个平面暗核，代替常驻的导航栏。细光环与流动粒子只描绘边缘，不使用球面的立体高光。</p><h3>从左侧中点展开</h3><p>靠近时浮出，单击后放大并向右让出一点距离。卡片随实时位置沿 ±20° 圆盘倾斜，上下通过透明渐隐退场。</p><h3>只看需要的东西</h3><p>默认四张项目卡片：A、B、C 与最近。展开状态会记住；背景使用半透明毛玻璃遮罩，避免与导航争夺注意力。</p><h3>其他工具退到角落</h3><p>外观、设计说明和备用的新聊天入口收在右下角。主体区域保持安静。</p><button class=\"primary\" id=\"tryNavigation\">体验导航</button>`;$('#infoDialog').showModal();const b=$('#tryNavigation');if(b)b.onclick=()=>{$('#infoDialog').close();openNav()}}\r\n$('#dialogClose').onclick=()=>$('#infoDialog').close();bindArtifact();\r\n// Selected candidate 05: flat monochrome core and independent particle orbits.\r\nconst canvas=$('#orbCanvas'),ctx=canvas.getContext('2d');\r\nconst canvasSize=240;\r\nlet raf=0,lastDraw=0,burstTime=-10000,orbClock=0;\r\nconst orbState={\"config\":{\"count\":360,\"core\":29,\"min\":46,\"max\":101,\"size\":[0.4,0.95],\"speed\":[0.08,0.68],\"kind\":\"halo\",\"gain\":2.089655172413793,\"boost\":22.950000000000003,\"spikes\":[{\"angle\":3.3289530220962322,\"length\":6.514577205778939,\"width\":1.7580197050818243,\"lean\":-0.1123993437635363},{\"angle\":3.7646865913520156,\"length\":2.8002971864309085,\"width\":2.223162750845222,\"lean\":-0.21387571195009514},{\"angle\":4.471335947027946,\"length\":7.716405562647022,\"width\":2.219762124654335,\"lean\":0.259925041493625},{\"angle\":5.051999881190983,\"length\":5.27779640541568,\"width\":1.349086621522292,\"lean\":-0.18253838222444754},{\"angle\":5.339542174880122,\"length\":8.932607067607261,\"width\":1.648031550921587,\"lean\":0.16072759372636936},{\"angle\":5.429716198138715,\"length\":4.455811456885703,\"width\":2.0432368678353665,\"lean\":0.051943822803150394},{\"angle\":5.559729618327229,\"length\":6.60194937679845,\"width\":1.2971282963317208,\"lean\":0.10803445842934706},{\"angle\":6.009154916689592,\"length\":3.364849082767387,\"width\":0.9587978683015536,\"lean\":-0.021478618029505014},{\"angle\":6.328726441234005,\"length\":5.484336536585355,\"width\":2.1901137241671673,\"lean\":-0.3013715323009819},{\"angle\":6.968825255545643,\"length\":7.753985469610288,\"width\":1.0675624908166355,\"lean\":-0.09044211042346433},{\"angle\":7.091238504715848,\"length\":2.8160682458112483,\"width\":2.4741798312541503,\"lean\":0.1312349961237487},{\"angle\":7.839798835596396,\"length\":5.087774940087945,\"width\":2.344840272262081,\"lean\":-0.16969397440079773},{\"angle\":8.22441729086822,\"length\":9.922656482080328,\"width\":2.0559292213758456,\"lean\":-0.14639958562038372},{\"angle\":8.346041898088586,\"length\":5.465121141412252,\"width\":1.3762782279595285,\"lean\":-0.13867823939581284},{\"angle\":8.910564509681786,\"length\":7.838009727298571,\"width\":1.8709358693762623,\"lean\":-0.2432345533336047},{\"angle\":9.250554486930948,\"length\":8.359421021648057,\"width\":2.0623573283521184,\"lean\":0.15046805582296655}]},\"trigger\":-100,\"baseScale\":1,\"currentScale\":1,\"currentBoost\":0,\"coreAngle\":0,\"particles\":[{\"angle\":1.6354155060004076,\"r\":75.1518670982147,\"radial\":0.5300339472402672,\"speed\":0.5616657446154074,\"size\":0.7249114378027708,\"opacity\":0.5660078594368869},{\"angle\":3.027104763597296,\"r\":62.20255530576587,\"radial\":0.29459191465028856,\"speed\":0.2312042044207493,\"size\":1.0760543472160353,\"opacity\":0.7628047273984921},{\"angle\":0.13606055399491912,\"r\":48.058480745232465,\"radial\":0.03742692264059027,\"speed\":0.3603482471782233,\"size\":1.5023087258158825,\"opacity\":0.9703016300477069},{\"angle\":0.3792495983983773,\"r\":94.71721874378864,\"radial\":0.8857676135234299,\"speed\":0.4706965082424661,\"size\":0.30028876889933465,\"opacity\":0.2448800307735958},{\"angle\":5.153874017825441,\"r\":54.58656125404816,\"radial\":0.1561192955281485,\"speed\":0.2586334357956736,\"size\":1.3006726183791768,\"opacity\":0.8753280677284588},{\"angle\":0.9106293938860617,\"r\":46.96956616852848,\"radial\":0.017628475791426866,\"speed\":0.23247735795795677,\"size\":1.536701312857776,\"opacity\":0.9860258606631407},{\"angle\":1.1994769893368182,\"r\":84.10121856089216,\"radial\":0.6927494283798574,\"speed\":0.2394760836655983,\"size\":0.5105823845129593,\"opacity\":0.42424685787937805},{\"angle\":4.305602504836346,\"r\":56.49826896434846,\"radial\":0.19087761753360843,\"speed\":0.4145993426950643,\"size\":1.243168717404371,\"opacity\":0.8472696525034393},{\"angle\":5.028623667728972,\"r\":46.41016189114003,\"radial\":0.007457488929818721,\"speed\":0.13043613933998732,\"size\":1.554450982587211,\"opacity\":0.994091460401856},{\"angle\":0.30350247972772937,\"r\":46.59419158342684,\"radial\":0.010803483335033472,\"speed\":0.4771219718429466,\"size\":1.5486057441256251,\"opacity\":0.9914390008614007},{\"angle\":5.363900011338117,\"r\":82.60757925573648,\"radial\":0.6655923501042996,\"speed\":0.6341567331684351,\"size\":0.5444052237014041,\"opacity\":0.4483456413269779},{\"angle\":5.16555694891158,\"r\":99.4315268649546,\"radial\":0.9714823066355384,\"speed\":0.4438420463202914,\"size\":0.23321835731175541,\"opacity\":0.15581670481051157},{\"angle\":3.615208780489314,\"r\":53.53271512175565,\"radial\":0.1369584567591936,\"speed\":0.4805322321323047,\"size\":1.3326792410684136,\"opacity\":0.8907458648660566},{\"angle\":1.6208861459464252,\"r\":51.52673409346194,\"radial\":0.10048607442658067,\"speed\":0.13905603492544596,\"size\":1.3941917707966505,\"opacity\":0.9199996079826778},{\"angle\":5.3883393862046525,\"r\":72.3657917607965,\"radial\":0.47937803201448187,\"speed\":0.6716055541407369,\"size\":0.7967771014798344,\"opacity\":0.6090496052624587},{\"angle\":2.014227188648857,\"r\":50.77862110991625,\"radial\":0.08688402018029544,\"speed\":0.5000150141678891,\"size\":1.417326238763306,\"opacity\":0.9308789396772887},{\"angle\":3.686057774397415,\"r\":87.67258292545368,\"radial\":0.7576833259173397,\"speed\":0.6166187893195253,\"size\":0.4334160429366453,\"opacity\":0.3657127212118453},{\"angle\":5.581294418935965,\"r\":88.60686704741423,\"radial\":0.7746703099529858,\"speed\":0.5903904904894443,\"size\":0.41417473403062965,\"opacity\":0.3501543828014003},{\"angle\":5.782486801056471,\"r\":56.422629349098806,\"radial\":0.18950235180179648,\"speed\":0.19891189284521332,\"size\":1.2454300980968918,\"opacity\":0.8483820845581511},{\"angle\":5.647741147090784,\"r\":67.26101089279018,\"radial\":0.3865638344143668,\"speed\":0.6493662949552447,\"size\":0.9338861615459311,\"opacity\":0.6868590845076891},{\"angle\":1.1432850301952686,\"r\":47.78171561956131,\"radial\":0.032394829446569275,\"speed\":0.57601411167161,\"size\":1.5110302205896418,\"opacity\":0.9743012356606261},{\"angle\":0.17958494162947186,\"r\":47.057226268341765,\"radial\":0.019222295788032043,\"speed\":0.6715402599531601,\"size\":1.5339248722808234,\"opacity\":0.9847612054856317},{\"angle\":1.0096708029248125,\"r\":51.21920109913415,\"radial\":0.09489456543880284,\"speed\":0.08182640636509882,\"size\":1.4036892355943584,\"opacity\":0.9244738422914713},{\"angle\":2.5194243463459136,\"r\":76.83334837761811,\"radial\":0.5606063341385111,\"speed\":0.5536383998521031,\"size\":0.6826352320577624,\"opacity\":0.5398083620709484},{\"angle\":6.0481182259646316,\"r\":47.99987190496514,\"radial\":0.03636130736300256,\"speed\":0.27109761108746533,\"size\":1.5041544838640872,\"opacity\":0.9711487759581796},{\"angle\":5.100821378480656,\"r\":47.3753115976914,\"radial\":0.025005665412570897,\"speed\":0.17016999396511356,\"size\":1.523861595584658,\"opacity\":0.9801705217177342},{\"angle\":3.4732447668718227,\"r\":48.47044273796637,\"radial\":0.04491714069029773,\"speed\":0.15513129448064727,\"size\":1.4893522000482216,\"opacity\":0.9643443818514529},{\"angle\":0.5945463921288053,\"r\":64.98104735733946,\"radial\":0.3451099519516265,\"speed\":0.5502003197466958,\"size\":0.9972266470410083,\"opacity\":0.7212211138425023},{\"angle\":1.9227886643535677,\"r\":50.81091498714948,\"radial\":0.08747118158453604,\"speed\":0.5396765402328937,\"size\":1.416325442876971,\"opacity\":0.9304096467013535},{\"angle\":3.1220074457233187,\"r\":49.066396819500746,\"radial\":0.05575266944546804,\"speed\":0.5513213618577657,\"size\":1.4706629065976187,\"opacity\":0.9557182021305772},{\"angle\":3.1494245376779237,\"r\":46.2824725218255,\"radial\":0.005135864033190867,\"speed\":0.60219317827578,\"size\":1.5585101894163957,\"opacity\":0.9959313491802444},{\"angle\":4.495398989175642,\"r\":54.07699229494148,\"radial\":0.14685440536257247,\"speed\":0.18808765842401207,\"size\":1.316121943808316,\"opacity\":0.8827873979972283},{\"angle\":3.1250113139349986,\"r\":80.13566014919495,\"radial\":0.620648366348999,\"speed\":0.48381379276869246,\"size\":0.6021935206143829,\"opacity\":0.4878073765304636},{\"angle\":5.135778016677505,\"r\":46.54564442251877,\"radial\":0.009920807682159503,\"speed\":0.5427649449396552,\"size\":1.550147146985161,\"opacity\":0.9921388085356331},{\"angle\":3.41360701829896,\"r\":76.35102569679522,\"radial\":0.5518368308508221,\"speed\":0.27186802952724326,\"size\":0.6946743727735838,\"opacity\":0.5473416460027337},{\"angle\":4.639135035464201,\"r\":46.31192165237772,\"radial\":0.005671302770504033,\"speed\":0.5071341109901054,\"size\":1.5575737579902724,\"opacity\":0.9955070518677201},{\"angle\":0.15139626864327224,\"r\":49.10159722791087,\"radial\":0.056392676871106814,\"speed\":0.5895028533688773,\"size\":1.469561015422066,\"opacity\":0.9552083827517668},{\"angle\":0.000902222542030537,\"r\":97.4370596918838,\"radial\":0.9352192671251602,\"speed\":0.3610971668745365,\"size\":0.2584068233480759,\"opacity\":0.19495212382159405},{\"angle\":1.4776711705973338,\"r\":52.600810295794155,\"radial\":0.12001473265080286,\"speed\":0.4700244603771945,\"size\":1.3611606705384278,\"opacity\":0.9043511421722445},{\"angle\":2.195923384393932,\"r\":65.41024541482733,\"radial\":0.35291355299686056,\"speed\":0.5414987620725286,\"size\":0.9852084704031854,\"opacity\":0.714769576564672},{\"angle\":1.4839991895277582,\"r\":90.21633250476188,\"radial\":0.8039333182683978,\"speed\":0.1510502592577136,\"size\":0.38205174514086077,\"opacity\":0.32307015068987754},{\"angle\":5.212359218091823,\"r\":60.564845839511804,\"radial\":0.26481537890021467,\"speed\":0.4508750962008491,\"size\":1.123325170483377,\"opacity\":0.7871745087102585},{\"angle\":4.379948818002233,\"r\":64.07373496508112,\"radial\":0.3286133630014748,\"speed\":0.5773176803414876,\"size\":1.022773956538758,\"opacity\":0.7348343115721725},{\"angle\":5.348190787371254,\"r\":46.00000002046842,\"radial\":3.7215307557386456e-10,\"speed\":0.6678925872853888,\"size\":1.5674999993480807,\"opacity\":0.9999999997052548},{\"angle\":0.3927850431308714,\"r\":96.7624463410215,\"radial\":0.9229535698367545,\"speed\":0.5639434466175209,\"size\":0.26811794277155554,\"opacity\":0.20761126299886884},{\"angle\":0.31225385464291466,\"r\":66.84313509352225,\"radial\":0.3789660926094953,\"speed\":0.5494847276150107,\"size\":0.9454018856711632,\"opacity\":0.693173962395911},{\"angle\":4.734621746672208,\"r\":48.035360327409855,\"radial\":0.03700655140745187,\"speed\":0.3155002153995449,\"size\":1.5030367799524338,\"opacity\":0.9706358291796368},{\"angle\":4.006510249136257,\"r\":71.06868681909769,\"radial\":0.45579430580177627,\"speed\":0.4650052116299097,\"size\":0.8309712577547441,\"opacity\":0.628943351752388},{\"angle\":1.9942280481114683,\"r\":46.13957813956529,\"radial\":0.002537784355732517,\"speed\":0.19910456541842275,\"size\":1.5630561295403311,\"opacity\":0.9979898195147875},{\"angle\":5.951059872604241,\"r\":51.90999627312267,\"radial\":0.10745447769313946,\"speed\":0.6142040985209907,\"size\":1.3823803566647768,\"opacity\":0.9144197090085023},{\"angle\":1.5292657663045328,\"r\":61.62828300649474,\"radial\":0.2841506001180862,\"speed\":0.3917002458420585,\"size\":1.0925632920053545,\"opacity\":0.7713616285079503},{\"angle\":0.7477519422633132,\"r\":66.23025189328752,\"radial\":0.3678227616961366,\"speed\":0.16757490337600459,\"size\":0.9623680718257208,\"opacity\":0.7024218259493548},{\"angle\":3.3005816133633408,\"r\":46.83288121544989,\"radial\":0.015143294826361545,\"speed\":0.42323288988623115,\"size\":1.5410332041152008,\"opacity\":0.9879973786225764},{\"angle\":4.484329167057094,\"r\":76.51073269481348,\"radial\":0.5547405944511543,\"speed\":0.10390838444596938,\"size\":0.6906800670708624,\"opacity\":0.5448488667006843},{\"angle\":1.019005665642293,\"r\":47.282983643163526,\"radial\":0.023326975330245955,\"speed\":0.08186215881431677,\"size\":1.526780738653286,\"opacity\":0.9815033006890819},{\"angle\":4.070311272387241,\"r\":74.08166883529371,\"radial\":0.5105757970053402,\"speed\":0.2679448255411767,\"size\":0.7522551212299577,\"opacity\":0.5825935469503055},{\"angle\":5.861034211184535,\"r\":73.16555614768762,\"radial\":0.4939192026852295,\"speed\":0.6757136721310334,\"size\":0.7759229333955435,\"opacity\":0.5967388505845145},{\"angle\":5.773394118575567,\"r\":76.37122047836655,\"radial\":0.5522040086975736,\"speed\":0.6537580364325625,\"size\":0.6941688670702879,\"opacity\":0.5470265261014534},{\"angle\":2.333378043728804,\"r\":50.4520489918019,\"radial\":0.08094634530548907,\"speed\":0.20146265350418413,\"size\":1.4274576299807042,\"opacity\":0.9356229771433988},{\"angle\":0.7569023134558094,\"r\":61.686308075893834,\"radial\":0.28520560137988793,\"speed\":0.6169234413252431,\"size\":1.0908919106498172,\"opacity\":0.7704976001174687},{\"angle\":2.0290847573000645,\"r\":65.62947477760017,\"radial\":0.356899541410912,\"speed\":0.5894778224914128,\"size\":0.979086449567445,\"opacity\":0.7114712091889893},{\"angle\":6.242185661604454,\"r\":64.39427565362338,\"radial\":0.3344413755204251,\"speed\":0.4059710883963584,\"size\":1.0137266896378647,\"opacity\":0.7300288241395324},{\"angle\":3.4875236724245653,\"r\":49.82584982673885,\"radial\":0.0695609059407064,\"speed\":0.26929809191198845,\"size\":1.4469393876102625,\"opacity\":0.9447110754109848},{\"angle\":0.9276345145762891,\"r\":81.8648051272651,\"radial\":0.6520873659502744,\"speed\":0.25007726418792947,\"size\":0.561538788670473,\"opacity\":0.4602560469303923},{\"angle\":5.540468483179563,\"r\":50.2905556055828,\"radial\":0.07801010191968737,\"speed\":0.15503594167068224,\"size\":1.4324749795357443,\"opacity\":0.9379678205591446},{\"angle\":3.260671774464046,\"r\":48.914486204873484,\"radial\":0.05299065827042695,\"speed\":0.10622189365906817,\"size\":1.4754207886138788,\"opacity\":0.9579179787521394},{\"angle\":5.4811682736954435,\"r\":46.00927379796268,\"radial\":0.00016861450841226596,\"speed\":0.17363499786111994,\"size\":1.5672046370057446,\"opacity\":0.9998664561834061},{\"angle\":3.5855834868379026,\"r\":67.10291989205953,\"radial\":0.38368945258290044,\"speed\":0.5773131669660222,\"size\":0.9382377939761084,\"opacity\":0.6892490471731099},{\"angle\":5.13311049673925,\"r\":46.480017431197055,\"radial\":0.008727589658128282,\"speed\":0.6388677441318219,\"size\":1.5522315005626537,\"opacity\":0.9930847229290549},{\"angle\":0.6520900349118057,\"r\":65.21392218496209,\"radial\":0.34934403972658323,\"speed\":0.5239258802159931,\"size\":0.9907004455384647,\"opacity\":0.7177215904272625},{\"angle\":0.12978369330977418,\"r\":48.7453120828691,\"radial\":0.04991476514307447,\"speed\":0.3370007967362188,\"size\":1.4807242696953096,\"opacity\":0.9603669886793325},{\"angle\":2.1321194850460015,\"r\":46.6829030149869,\"radial\":0.012416418454307295,\"speed\":0.5242555840539332,\"size\":1.545790166382481,\"opacity\":0.9901600635763976},{\"angle\":5.4081435226877295,\"r\":47.84307260410347,\"radial\":0.033510410983699404,\"speed\":0.09345370590077128,\"size\":1.5090955467245188,\"opacity\":0.9734147295631541},{\"angle\":3.90166302733098,\"r\":50.006647599057956,\"radial\":0.07284813816469017,\"speed\":0.5852045326728416,\"size\":1.4413071821172516,\"opacity\":0.9420882850262194},{\"angle\":5.156893703107408,\"r\":63.82033591523246,\"radial\":0.3240061075496812,\"speed\":0.5731452636543153,\"size\":1.0299428532394082,\"opacity\":0.7386302708095813},{\"angle\":1.6552481840152373,\"r\":48.23581861955026,\"radial\":0.040651247628186574,\"speed\":0.22901874582191817,\"size\":1.4967275897635328,\"opacity\":0.9677377751614938},{\"angle\":4.474202488225128,\"r\":65.68418744852843,\"radial\":0.35789431724597154,\"speed\":0.4070677249199411,\"size\":0.9775603594396898,\"opacity\":0.7106477233531024},{\"angle\":1.273024543379008,\"r\":46.34511727449661,\"radial\":0.006274859536301915,\"speed\":0.4035152949798064,\"size\":1.5565183759701753,\"opacity\":0.9950287484430512},{\"angle\":6.106933916980445,\"r\":47.704690489082985,\"radial\":0.030994372528781535,\"speed\":0.30451259393665253,\"size\":1.5134598810010695,\"opacity\":0.9754139756697224},{\"angle\":3.2594283496863983,\"r\":58.65393637881752,\"radial\":0.23007157052395494,\"speed\":0.504448816035361,\"size\":1.1792111907898037,\"opacity\":0.8154853603246287},{\"angle\":6.075358003470355,\"r\":69.4249064398835,\"radial\":0.4259073898160635,\"speed\":0.13718927528447405,\"size\":0.8749457335901707,\"opacity\":0.65403095688179},{\"angle\":0.48191049498382627,\"r\":46.12505931967808,\"radial\":0.00227380581232874,\"speed\":0.605319570326544,\"size\":1.563518219922531,\"opacity\":0.9981989408860965},{\"angle\":4.719369974263321,\"r\":46.09509407405387,\"radial\":0.00172898316461573,\"speed\":0.2751240949287304,\"size\":1.564472039556204,\"opacity\":0.9986305268789499},{\"angle\":0.09151799293126511,\"r\":91.44685642331886,\"radial\":0.8263064804239794,\"speed\":0.46608964941100195,\"size\":0.35843550009106784,\"opacity\":0.3020907673314702},{\"angle\":5.287506897301425,\"r\":78.49008398486028,\"radial\":0.5907287997247324,\"speed\":0.642938354222978,\"size\":0.6418356836881329,\"opacity\":0.5138154396555901},{\"angle\":4.752998186290364,\"r\":65.04114677132011,\"radial\":0.34620266856945664,\"speed\":0.08241886554511159,\"size\":0.9955411754416568,\"opacity\":0.7203181878752539},{\"angle\":1.5948089084776704,\"r\":86.0575760302701,\"radial\":0.7283195641867292,\"speed\":0.2848879805997834,\"size\":0.46763079313833683,\"opacity\":0.3923549048214284},{\"angle\":4.9574522613050815,\"r\":98.61165158197471,\"radial\":0.956575483308631,\"speed\":0.6556097698357047,\"size\":0.24283411928249884,\"opacity\":0.17229307329324084},{\"angle\":3.075657443519374,\"r\":75.73717691991075,\"radial\":0.5406759439983774,\"speed\":0.14184885461055569,\"size\":0.710098893896358,\"opacity\":0.5569079469410606},{\"angle\":3.665756503240506,\"r\":46.401798802825176,\"radial\":0.007305432778639515,\"speed\":0.33541441371237346,\"size\":1.554716755572266,\"opacity\":0.9942119781301747},{\"angle\":1.1082976502378743,\"r\":61.81113811748406,\"radial\":0.28747523849971024,\"speed\":0.5960055830292456,\"size\":1.0872987565479384,\"opacity\":0.7686383726903194},{\"angle\":5.610590242954766,\"r\":62.42470462718221,\"radial\":0.2986309932214948,\"speed\":0.5142795127390694,\"size\":1.0696876691526402,\"opacity\":0.7594912194287907},{\"angle\":5.735336003346863,\"r\":84.719243799487,\"radial\":0.7039862508997635,\"speed\":0.2536745213844577,\"size\":0.49684343059857844,\"opacity\":0.41421402215281844},{\"angle\":1.9827757957999543,\"r\":59.01407204277095,\"radial\":0.23661949168674454,\"speed\":0.6048640055068434,\"size\":1.1686197463517927,\"opacity\":0.8101597571664679},{\"angle\":5.978488003738684,\"r\":74.55016511513855,\"radial\":0.5190939111843375,\"speed\":0.1875248943711863,\"size\":0.7402440625130549,\"opacity\":0.5753411712684928},{\"angle\":2.2398885521720144,\"r\":95.86260665876084,\"radial\":0.9065928483411062,\"speed\":0.1528395245716344,\"size\":0.28180490476177494,\"opacity\":0.22418970016647852},{\"angle\":0.21309084492746586,\"r\":57.25241053550259,\"radial\":0.20458928246368344,\"speed\":0.5417730914259079,\"size\":1.2206855852357308,\"opacity\":0.8361680905608797},{\"angle\":5.219231928237045,\"r\":46.00000029607897,\"radial\":5.383254044928943e-9,\"speed\":0.09613008837786512,\"size\":1.5674999905698845,\"opacity\":0.9999999957364628},{\"angle\":1.2414502156721179,\"r\":46.00160134839433,\"radial\":0.000029115425351482885,\"speed\":0.4050144908437641,\"size\":1.5674489972763879,\"opacity\":0.9999769405495521},{\"angle\":0.4271161931473294,\"r\":75.96665868691375,\"radial\":0.5448483397620681,\"speed\":0.5814720524674952,\"size\":0.7043192649164505,\"opacity\":0.5533344235848323},{\"angle\":6.1501132607565,\"r\":56.441983374782,\"radial\":0.18985424317785454,\"speed\":0.49828924204994857,\"size\":1.2448513654391788,\"opacity\":0.8480974628252859},{\"angle\":0.5242835836439405,\"r\":46.029378288795655,\"radial\":0.0005341507053756056,\"speed\":0.5647652802101945,\"size\":1.5665643764818062,\"opacity\":0.9995769413405767},{\"angle\":4.340386071046748,\"r\":52.66872692472784,\"radial\":0.12124958044959715,\"speed\":0.28800942900405213,\"size\":1.3590793607597003,\"opacity\":0.9033604891714703},{\"angle\":2.948163966019843,\"r\":46.81651595765144,\"radial\":0.014845744684571624,\"speed\":0.33430365479952073,\"size\":1.541552080471269,\"opacity\":0.9882333946404996},{\"angle\":3.7653328136462583,\"r\":46.1901653088874,\"radial\":0.0034575510706800878,\"speed\":0.56581897792017,\"size\":1.5614463786860888,\"opacity\":0.9972611455462497},{\"angle\":0.9517196818654696,\"r\":95.02857131420134,\"radial\":0.8914285693491154,\"speed\":0.1532248990547144,\"size\":0.29515519441966165,\"opacity\":0.23929621828866593},{\"angle\":1.814129405723819,\"r\":75.49026898631759,\"radial\":0.536186708842138,\"speed\":0.6745839969390854,\"size\":0.7163350218821589,\"opacity\":0.5607492103795229},{\"angle\":5.612221209361153,\"r\":65.25929966797496,\"radial\":0.350169084872272,\"speed\":0.32193109566525663,\"size\":0.9894302440222298,\"opacity\":0.7170394162113579},{\"angle\":3.2747345163153585,\"r\":47.56021326597782,\"radial\":0.028367513926869502,\"speed\":0.19275734576653444,\"size\":1.5180200733633513,\"opacity\":0.9775007257379736},{\"angle\":0.3051023942349376,\"r\":65.08986619696996,\"radial\":0.3470884763085448,\"speed\":0.3875164593826202,\"size\":0.9941754725120537,\"opacity\":0.7195861226595905},{\"angle\":1.3998299461368238,\"r\":46.36428472883091,\"radial\":0.006623358706016521,\"speed\":0.5669122194935682,\"size\":1.5559090763483434,\"opacity\":0.994752558463513},{\"angle\":4.65753305019821,\"r\":53.219678054552396,\"radial\":0.13126687371913448,\"speed\":0.6712801071920247,\"size\":1.3422279236068673,\"opacity\":0.8953189807371963},{\"angle\":2.977646388165664,\"r\":57.18324926727148,\"radial\":0.2033318048594815,\"speed\":0.38517548295219944,\"size\":1.2227426726826884,\"opacity\":0.8371869915552602},{\"angle\":0.48251946096741377,\"r\":95.53490318705624,\"radial\":0.9006346034010226,\"speed\":0.5929675775887143,\"size\":0.28697835781383235,\"opacity\":0.23015249166703716},{\"angle\":5.7129284402924805,\"r\":69.33295626041709,\"radial\":0.42423556837122,\"speed\":0.5667225289221132,\"size\":0.8774262730599682,\"opacity\":0.6554303950181909},{\"angle\":5.440313290237633,\"r\":62.803244537011864,\"radial\":0.3055135370365794,\"speed\":0.4518045760614841,\"size\":1.0588642649252498,\"opacity\":0.7538406357033846},{\"angle\":3.2651531050879137,\"r\":51.64186943203973,\"radial\":0.10257944421890411,\"speed\":0.5403267565931443,\"size\":1.3906406231247073,\"opacity\":0.9183238128655573},{\"angle\":6.054773599148121,\"r\":46.00194524571794,\"radial\":0.00003536810396257739,\"speed\":0.5752566304199926,\"size\":1.5674380442525766,\"opacity\":0.9999719884121253},{\"angle\":2.750590524314672,\"r\":46.003389937379254,\"radial\":0.00006163522507735899,\"speed\":0.6638794943726432,\"size\":1.5673920314926935,\"opacity\":0.9999511847512988},{\"angle\":0.2720110497367963,\"r\":62.251544649155974,\"radial\":0.2954826299846541,\"speed\":0.6591530894852738,\"size\":1.0746493971276696,\"opacity\":0.7620741815143888},{\"angle\":3.2378126407823715,\"r\":62.59801072693688,\"radial\":0.3017820132170342,\"speed\":0.22720706757829257,\"size\":1.0647284399707941,\"opacity\":0.7569049165047318},{\"angle\":0.3318586714633419,\"r\":86.52359783701795,\"radial\":0.736792687945781,\"speed\":0.37416503169961746,\"size\":0.4576381205537837,\"opacity\":0.38469810198575877},{\"angle\":1.2375612059499168,\"r\":68.92471780819588,\"radial\":0.41681305105810684,\"speed\":0.4725220549036955,\"size\":0.8884653634234148,\"opacity\":0.6616387023142163},{\"angle\":3.1173226202685997,\"r\":51.18017911383311,\"radial\":0.09418507479696567,\"speed\":0.28036280592937285,\"size\":1.4048956030205721,\"opacity\":0.925041367188725},{\"angle\":1.911284484301864,\"r\":60.85961784854098,\"radial\":0.27017486997347234,\"speed\":0.4497496586197519,\"size\":1.114773742737858,\"opacity\":0.7827955808749828},{\"angle\":0.11303401567144163,\"r\":57.85533930518034,\"radial\":0.21555162373055156,\"speed\":0.4050437788898533,\"size\":1.202793901207693,\"opacity\":0.827278739722084},{\"angle\":3.309395554358999,\"r\":50.63118730871701,\"radial\":0.08420340561303659,\"speed\":0.6315747024226699,\"size\":1.421897703266713,\"opacity\":0.9330210571173149},{\"angle\":3.001856029302653,\"r\":50.70083121047293,\"radial\":0.08546965837223505,\"speed\":0.2676888589818858,\"size\":1.419737761083524,\"opacity\":0.9320092546768997},{\"angle\":1.2626200183676604,\"r\":70.67858841601048,\"radial\":0.44870160756382693,\"speed\":0.5197882174139733,\"size\":0.841343154243736,\"opacity\":0.6349092878564108},{\"angle\":2.9164376791602455,\"r\":52.24413292863759,\"radial\":0.11352968961159256,\"speed\":0.4923804663423268,\"size\":1.3721054395796293,\"opacity\":0.9095514718774094},{\"angle\":5.162776626285965,\"r\":47.601225659935224,\"radial\":0.0291131938170041,\"speed\":0.43591676128647927,\"size\":1.5167252063767331,\"opacity\":0.976908422537628},{\"angle\":3.319264560651915,\"r\":100.95115974435984,\"radial\":0.9991119953519971,\"speed\":0.5478596397562508,\"size\":0.22014536792272907,\"opacity\":0.12157781611434286},{\"angle\":4.949998901418641,\"r\":74.25279824203987,\"radial\":0.5136872407643613,\"speed\":0.38408000760160393,\"size\":0.7478604665478541,\"opacity\":0.5799459190942418},{\"angle\":3.6391713815758635,\"r\":81.86874361655849,\"radial\":0.652158974846518,\"speed\":0.6361818001383747,\"size\":0.5614474053873785,\"opacity\":0.460193016596021},{\"angle\":3.7847061178287533,\"r\":55.53640900133445,\"radial\":0.17338925456971718,\"speed\":0.5089142268979124,\"size\":1.2720106450507531,\"opacity\":0.8614017623565838},{\"angle\":5.105509630089521,\"r\":75.85301954129098,\"radial\":0.5427821734780177,\"speed\":0.19590929591647288,\"size\":0.7071793539028132,\"opacity\":0.5551044364261712},{\"angle\":3.5416586019720877,\"r\":79.67803672449648,\"radial\":0.6123279404453904,\"speed\":0.32602476353386867,\"size\":0.613126776937883,\"opacity\":0.49505997773162574},{\"angle\":1.2145851792619273,\"r\":65.0762274316599,\"radial\":0.34684049875745265,\"speed\":0.2555052050347489,\"size\":0.9945577383888273,\"opacity\":0.7197910707465106},{\"angle\":4.604110169693908,\"r\":90.40570920474646,\"radial\":0.8073765309953902,\"speed\":0.3622657022460045,\"size\":0.37836191095423954,\"opacity\":0.3198577307918409},{\"angle\":0.4591679002822905,\"r\":63.00334098720828,\"radial\":0.3091516543128779,\"speed\":0.2749570919340077,\"size\":1.0531559734444473,\"opacity\":0.7508514736798696},{\"angle\":2.80959752112789,\"r\":47.720848820745864,\"radial\":0.03128816037719757,\"speed\":0.6446378471186738,\"size\":1.5129500994762475,\"opacity\":0.9751805584108852},{\"angle\":0.02649507905678019,\"r\":53.68993341557423,\"radial\":0.13981697119225878,\"speed\":0.1523985557187335,\"size\":1.3278906688824053,\"opacity\":0.8884479475141939},{\"angle\":3.618179376092168,\"r\":85.60771990124422,\"radial\":0.720140361840804,\"speed\":0.2007559651888497,\"size\":0.4773659702871715,\"opacity\":0.3997234742069606},{\"angle\":5.217469211428316,\"r\":49.84384959510119,\"radial\":0.06988817445638522,\"speed\":0.1709917431799618,\"size\":1.4463783915364299,\"opacity\":0.9444499986283132},{\"angle\":4.282250821266105,\"r\":49.00366275012871,\"radial\":0.05461205000234015,\"speed\":0.377971614355195,\"size\":1.4726272494409376,\"opacity\":0.9566267151503777},{\"angle\":3.7876757244989854,\"r\":66.7403040612779,\"radial\":0.37709643747778,\"speed\":0.4935991964615875,\"size\":0.9482421853452838,\"opacity\":0.6947267421148865},{\"angle\":6.222754671636204,\"r\":70.89098898675164,\"radial\":0.4525634361227571,\"speed\":0.5519815688878127,\"size\":0.8356908723623266,\"opacity\":0.6316619163534783},{\"angle\":2.384016634173656,\"r\":50.52056939230671,\"radial\":0.08219217076921287,\"speed\":0.5871950768187596,\"size\":1.4253302589249706,\"opacity\":0.9346278518904549},{\"angle\":5.487577993674836,\"r\":46.03564023126477,\"radial\":0.0006480042048139694,\"speed\":0.5753248065852792,\"size\":1.5663649689873613,\"opacity\":0.9994867640374209},{\"angle\":3.6050465790805144,\"r\":79.79809463431255,\"radial\":0.6145108115329553,\"speed\":0.5234071669759296,\"size\":0.6102515500677135,\"opacity\":0.4931587710785582},{\"angle\":3.1050473390224322,\"r\":47.16745224407023,\"radial\":0.021226404437640633,\"speed\":0.46053766338204755,\"size\":1.5304356280809537,\"opacity\":0.9831707050655051},{\"angle\":5.01547852954039,\"r\":73.0757451088884,\"radial\":0.49228627470706177,\"speed\":0.5119556697569375,\"size\":0.7782559353378504,\"opacity\":0.5981230550245107},{\"angle\":3.574205787757614,\"r\":99.61482155228782,\"radial\":0.9748149373143239,\"speed\":0.2708336590890155,\"size\":0.2312464309426075,\"opacity\":0.15202664196346152},{\"angle\":2.5166675649980514,\"r\":69.71157558182331,\"radial\":0.4311195560331511,\"speed\":0.640816345793024,\"size\":0.8672261856974328,\"opacity\":0.6496653662929455},{\"angle\":3.241553781670819,\"r\":86.15845518495922,\"radial\":0.7301537306356223,\"speed\":0.5502510587594016,\"size\":0.4654596539734531,\"opacity\":0.3906994968979539},{\"angle\":0.5483893927072386,\"r\":87.32811768433166,\"radial\":0.7514203215333028,\"speed\":0.2023092975302686,\"size\":0.4406145147826269,\"opacity\":0.3714211056355479},{\"angle\":5.6126230407737046,\"r\":88.27846414560203,\"radial\":0.7686993481018551,\"speed\":0.2070146940155092,\"size\":0.42089017064975304,\"opacity\":0.35563610928902434},{\"angle\":3.7732735008037186,\"r\":49.09515369762804,\"radial\":0.05627552177505533,\"speed\":0.35372882242661796,\"size\":1.4697627028321696,\"opacity\":0.9553017091574163},{\"angle\":4.299267460973299,\"r\":47.07315614267719,\"radial\":0.01951192986685801,\"speed\":0.21928782924943402,\"size\":1.533420473855179,\"opacity\":0.9845313662351605},{\"angle\":0.7029065366761157,\"r\":46.94822370624936,\"radial\":0.017240431022715583,\"speed\":0.3277222062160468,\"size\":1.537377493008799,\"opacity\":0.9863337331372484},{\"angle\":5.443706815457597,\"r\":47.4016013133039,\"radial\":0.025483660241889083,\"speed\":0.5463723350189369,\"size\":1.5230306664046922,\"opacity\":0.979790980611948},{\"angle\":5.286687961611561,\"r\":54.73701058324258,\"radial\":0.15885473787713783,\"speed\":0.4446281215964148,\"size\":1.2961209288311535,\"opacity\":0.8731241513693937},{\"angle\":2.1236626628346786,\"r\":54.1868515383335,\"radial\":0.1488518461515182,\"speed\":0.5841234482118147,\"size\":1.3127869091153197,\"opacity\":0.8811799102873805},{\"angle\":0.0973068182930397,\"r\":63.57322876787228,\"radial\":0.3195132503249505,\"speed\":0.5943576659395896,\"size\":1.036947877738963,\"opacity\":0.742329485406703},{\"angle\":0.5252879646813775,\"r\":48.765385056982645,\"radial\":0.05027972830877538,\"speed\":0.12969656434813195,\"size\":1.4800947274124432,\"opacity\":0.9600764484317554},{\"angle\":5.565626753545936,\"r\":46.228436787857554,\"radial\":0.004153396142864582,\"speed\":0.4631577007501924,\"size\":1.5602288255443302,\"opacity\":0.9967098260845326},{\"angle\":4.89270116346165,\"r\":61.52384316652749,\"radial\":0.2822516939368635,\"speed\":0.5366589645637749,\"size\":1.095573488170874,\"opacity\":0.7729164802106654},{\"angle\":2.9497476655430455,\"r\":60.28019954636616,\"radial\":0.2596399917521121,\"speed\":0.37382291174849774,\"size\":1.1316006179942717,\"opacity\":0.7913999871214711},{\"angle\":2.536360929324063,\"r\":49.859776412785834,\"radial\":0.07017775295974248,\"speed\":0.5091213305938257,\"size\":1.4458820521820754,\"opacity\":0.9442189811997213},{\"angle\":3.7624074719513105,\"r\":59.40376008294576,\"radial\":0.243704728780832,\"speed\":0.6230451170942235,\"size\":1.157189845391774,\"opacity\":0.804391990965733},{\"angle\":3.308570249123812,\"r\":46.39741903048513,\"radial\":0.007225800554275076,\"speed\":0.41827071714985253,\"size\":1.5548559464880916,\"opacity\":0.9942750928592393},{\"angle\":0.6691721870164867,\"r\":46.59091077447582,\"radial\":0.010743832263196777,\"speed\":0.554734568944885,\"size\":1.548709898875339,\"opacity\":0.9914862957128813},{\"angle\":1.8125024301579555,\"r\":98.41636637394518,\"radial\":0.9530248431626396,\"speed\":0.3286923947452497,\"size\":0.24529050400108626,\"opacity\":0.17612599936825682},{\"angle\":5.8464355088135305,\"r\":48.908656330034205,\"radial\":0.0528846605460765,\"speed\":0.6333740877670926,\"size\":1.4756034649270338,\"opacity\":0.9580023868019721},{\"angle\":2.8181993155951672,\"r\":71.88382152783377,\"radial\":0.47061493686970507,\"speed\":0.22681198992469537,\"size\":0.8094296280482867,\"opacity\":0.6164519113964463},{\"angle\":2.1210285471678776,\"r\":54.076149801496314,\"radial\":0.146839087299933,\"speed\":0.5910134195638945,\"size\":1.316147528729457,\"opacity\":0.8827997241151316},{\"angle\":2.022816744343471,\"r\":60.609844038955956,\"radial\":0.2656335279810174,\"speed\":0.10657185460121543,\"size\":1.1220185454437037,\"opacity\":0.7865062537956715},{\"angle\":1.4008168628582145,\"r\":85.06645954131353,\"radial\":0.7102992643875188,\"speed\":0.3216929711044701,\"size\":0.4891926831162452,\"opacity\":0.40856078470746837},{\"angle\":4.574814468560226,\"r\":46.089949897774055,\"radial\":0.001635452686801015,\"speed\":0.15699392268154205,\"size\":1.5646357988365815,\"opacity\":0.998704615490146},{\"angle\":5.127121032162718,\"r\":47.96644975866013,\"radial\":0.035753631975638835,\"speed\":0.5349467247491206,\"size\":1.5052073159546056,\"opacity\":0.9716318255446486},{\"angle\":1.424677779434815,\"r\":63.72512744008219,\"radial\":0.3222750443651307,\"speed\":0.31487451917945836,\"size\":1.0326401862376533,\"opacity\":0.7400558398881864},{\"angle\":4.8073870637875045,\"r\":88.14431950301231,\"radial\":0.7662603546002238,\"speed\":0.24827863796453797,\"size\":0.42364833746406827,\"opacity\":0.35787117339783525},{\"angle\":0.3985503330665649,\"r\":50.80031694778505,\"radial\":0.08727848995972823,\"speed\":0.18370905306535687,\"size\":1.4166538576590615,\"opacity\":0.9305636601964148},{\"angle\":1.2726863576804726,\"r\":46.16607383219439,\"radial\":0.0030195242217162174,\"speed\":0.5822622438168733,\"size\":1.5622129458787768,\"opacity\":0.9976081753619712},{\"angle\":3.6139467210611547,\"r\":49.85932991323527,\"radial\":0.07016963478609588,\"speed\":0.348444404349145,\"size\":1.445895966150434,\"opacity\":0.944225457743944},{\"angle\":5.66896131220417,\"r\":46.000508584334106,\"radial\":0.000009246987892876211,\"speed\":0.24410670211921143,\"size\":1.5674838016114268,\"opacity\":0.9999926763822028},{\"angle\":5.105453910465665,\"r\":46.00001267966365,\"radial\":2.3053933909359244e-7,\"speed\":0.5828909105834467,\"size\":1.5674995961527265,\"opacity\":0.9999998174128414},{\"angle\":5.12655513741326,\"r\":66.74348374141266,\"radial\":0.37715424984386664,\"speed\":0.3226423244575433,\"size\":0.9481543209208638,\"opacity\":0.6946787349720362},{\"angle\":2.1021200881313384,\"r\":46.276131188041965,\"radial\":0.005020567055308421,\"speed\":0.243943638618983,\"size\":1.5587118526524923,\"opacity\":0.9960227108885427},{\"angle\":1.3321241253517129,\"r\":100.6094595952973,\"radial\":0.9928992653690418,\"speed\":0.18246487800261463,\"size\":0.22216881766082922,\"opacity\":0.1302483895836212},{\"angle\":1.9332681288065137,\"r\":49.61469466458966,\"radial\":0.06572172117435748,\"speed\":0.6268188619677154,\"size\":1.4535248455724497,\"opacity\":0.9477730806320185},{\"angle\":2.0343920163622213,\"r\":49.90131464374167,\"radial\":0.07093299352257586,\"speed\":0.40987411602388524,\"size\":1.4445877833668388,\"opacity\":0.9436164380712664},{\"angle\":2.5130141114193574,\"r\":81.17389623067174,\"radial\":0.6395253860122136,\"speed\":0.5310763356937807,\"size\":0.5776562880807401,\"opacity\":0.4712933179618568},{\"angle\":6.113247502761086,\"r\":46.243331300721884,\"radial\":0.004424205467670667,\"speed\":0.23461318311711143,\"size\":1.5597550465979209,\"opacity\":0.9964952528949559},{\"angle\":3.7559651435279022,\"r\":53.2743243111009,\"radial\":0.13226044202001636,\"speed\":0.48827980405490834,\"size\":1.340559673211408,\"opacity\":0.8945208774209994},{\"angle\":1.8985385735316493,\"r\":88.20072013405084,\"radial\":0.7672858206191062,\"speed\":0.4789874037904548,\"size\":0.42248761891403974,\"opacity\":0.35693173430736286},{\"angle\":0.8114527175899038,\"r\":53.392440721925794,\"radial\":0.13440801312592354,\"speed\":0.3185480743260571,\"size\":1.3369557531562446,\"opacity\":0.8927954862098109},{\"angle\":5.250046331443607,\"r\":60.19806747998324,\"radial\":0.25814668145424063,\"speed\":0.3723009067702116,\"size\":1.133991655487171,\"opacity\":0.7926186600892807},{\"angle\":3.058815525970222,\"r\":53.6197816670005,\"radial\":0.13854148485455456,\"speed\":0.6211490506875786,\"size\":1.330026769720051,\"opacity\":0.8894733862603103},{\"angle\":3.5022792376496823,\"r\":46.12078811591701,\"radial\":0.002196147562127411,\"speed\":0.5265481312447676,\"size\":1.5636541664784531,\"opacity\":0.9982604599834805},{\"angle\":5.567595352667825,\"r\":49.225235237553036,\"radial\":0.05864064068278246,\"speed\":0.15828474219728705,\"size\":1.4656925071941354,\"opacity\":0.9534174175806256},{\"angle\":6.12262495394973,\"r\":83.8889217996392,\"radial\":0.6888894872661675,\"speed\":0.5154248031372436,\"size\":0.5153370050228494,\"opacity\":0.4276846923005673},{\"angle\":2.73746828957156,\"r\":57.1533756804826,\"radial\":0.20278864873604718,\"speed\":0.6010127570862069,\"size\":1.2236315144516234,\"opacity\":0.837627046912408},{\"angle\":2.7790694782839385,\"r\":56.46166599051254,\"radial\":0.19021210891840984,\"speed\":0.25954812746452927,\"size\":1.2442628844753936,\"opacity\":0.8478079961432502},{\"angle\":0.4691864636164256,\"r\":76.34790872005297,\"radial\":0.5517801585464177,\"speed\":0.5350273578195157,\"size\":0.6947524064529185,\"opacity\":0.5473902810891377},{\"angle\":1.752174435872946,\"r\":46.01752262176518,\"radial\":0.00031859312300335283,\"speed\":0.5723762313019264,\"size\":1.56694193116957,\"opacity\":0.9997476702266492},{\"angle\":4.399643850054856,\"r\":91.19151438660745,\"radial\":0.8216638979383174,\"speed\":0.22685667468873477,\"size\":0.36326490784403614,\"opacity\":0.306465296068384},{\"angle\":3.9528843945999403,\"r\":68.00436778555252,\"radial\":0.40007941428277305,\"speed\":0.12661019029711393,\"size\":0.9135067106610588,\"opacity\":0.6756061704692657},{\"angle\":1.938653674466837,\"r\":64.71637489409812,\"radial\":0.3402977253472386,\"speed\":0.5863000611088239,\"size\":1.0046593421969894,\"opacity\":0.7251957305012339},{\"angle\":2.9020363654000243,\"r\":72.5211785034763,\"radial\":0.48220324551775107,\"speed\":0.26893777121690826,\"size\":0.7927114884347775,\"opacity\":0.6066604616155007},{\"angle\":3.196910604027415,\"r\":69.91405768659496,\"radial\":0.43480104884718096,\"speed\":0.6481742894166841,\"size\":0.8617864229025542,\"opacity\":0.6465794234622998},{\"angle\":2.2432688643158745,\"r\":55.025544435404164,\"radial\":0.16410080791643938,\"speed\":0.10275327017787217,\"size\":1.287404061510495,\"opacity\":0.8688954415319421},{\"angle\":0.26399867081587725,\"r\":59.57911177259915,\"radial\":0.2468929413199845,\"speed\":0.43128370369904095,\"size\":1.152057075083743,\"opacity\":0.8017948532412122},{\"angle\":2.42107067557772,\"r\":46.83389908255065,\"radial\":0.01516180150092091,\"speed\":0.1188904141624369,\"size\":1.5410009332058225,\"opacity\":0.9879826989397233},{\"angle\":0.4569821192679878,\"r\":46.71174236286672,\"radial\":0.012940770233940406,\"speed\":0.4836558360826745,\"size\":1.5448751424835578,\"opacity\":0.9897442467368575},{\"angle\":2.663766889212339,\"r\":51.715576646693115,\"radial\":0.10391957539442027,\"speed\":0.11478636083638888,\"size\":1.3883685572711164,\"opacity\":0.9172507989997738},{\"angle\":5.758917502570063,\"r\":50.601653345931,\"radial\":0.08366642447147275,\"speed\":0.6576491899766487,\"size\":1.4228139428662416,\"opacity\":0.9334500909914536},{\"angle\":0.2784332074457094,\"r\":63.94408878651562,\"radial\":0.3262561597548295,\"speed\":0.18088811712422234,\"size\":1.026439931000571,\"opacity\":0.7367767568595075},{\"angle\":3.7487757116182236,\"r\":76.83633653908608,\"radial\":0.5606606643470196,\"speed\":0.27358350559471506,\"size\":0.6825608682567175,\"opacity\":0.5397616441121563},{\"angle\":3.3020762182495975,\"r\":66.61290744513039,\"radial\":0.37478013536600724,\"speed\":0.6719506946503657,\"size\":0.9517645599288127,\"opacity\":0.6966498234741656},{\"angle\":3.6470123445336027,\"r\":76.31865686412898,\"radial\":0.551248306620527,\"speed\":0.37289868873814,\"size\":0.6954848724300802,\"opacity\":0.5478466762742664},{\"angle\":0.5235889345483704,\"r\":54.34453351926881,\"radial\":0.15171879125943286,\"speed\":0.3745945139924014,\"size\":1.3080042062833028,\"opacity\":0.8788720087851876},{\"angle\":3.9634563856956504,\"r\":59.50349103489706,\"radial\":0.24551801881631016,\"speed\":0.5459355316925194,\"size\":1.1542697938873456,\"opacity\":0.8029150082130607},{\"angle\":2.5016881762324337,\"r\":90.71752768550252,\"radial\":0.8130459579182275,\"speed\":0.29546015889892374,\"size\":0.3723295261101911,\"opacity\":0.31455573874557297},{\"angle\":4.560926560048729,\"r\":79.02698996019936,\"radial\":0.6004907265490793,\"speed\":0.33649048216314104,\"size\":0.628802645791151,\"opacity\":0.5053513194353987},{\"angle\":5.251680369977964,\"r\":46.222017420418204,\"radial\":0.004036680371240067,\"speed\":0.34538356017822736,\"size\":1.5604330308588172,\"opacity\":0.9968023029152474},{\"angle\":3.020936811311582,\"r\":79.14661660141624,\"radial\":0.602665756389386,\"speed\":0.6290384052964285,\"size\":0.6259116986768819,\"opacity\":0.5034626491145173},{\"angle\":1.2411847135955005,\"r\":74.07357412339191,\"radial\":0.5104286204253075,\"speed\":0.5525601549004765,\"size\":0.7524632039679284,\"opacity\":0.5827187424780034},{\"angle\":2.6302694679133767,\"r\":46.081528405439414,\"radial\":0.001482334644352995,\"speed\":0.42244369430695083,\"size\":1.5649038978588257,\"opacity\":0.9988259039006282},{\"angle\":4.689874880321086,\"r\":73.8273992562242,\"radial\":0.505952713749531,\"speed\":0.2401742039995028,\"size\":0.7588003229893754,\"opacity\":0.5865243736226633},{\"angle\":0.0652891210776171,\"r\":46.00916303893094,\"radial\":0.0001666007078353802,\"speed\":0.6248447809972286,\"size\":1.5672081645035152,\"opacity\":0.9998680511401977},{\"angle\":4.8476468824309,\"r\":65.05735297266578,\"radial\":0.3464973267757416,\"speed\":0.580497585256116,\"size\":0.9950868215562299,\"opacity\":0.7200746821391452},{\"angle\":0.9211425347132238,\"r\":46.04919569701126,\"radial\":0.0008944672183864318,\"speed\":0.20734503236352003,\"size\":1.5659333273228997,\"opacity\":0.9992915502698064},{\"angle\":0.22029969268590982,\"r\":98.39052436374735,\"radial\":0.9525549884317701,\"speed\":0.0979937545377703,\"size\":0.24561984499081943,\"opacity\":0.17663099253933906},{\"angle\":5.052967110279452,\"r\":48.66826350745042,\"radial\":0.04851388195364405,\"speed\":0.434024068595864,\"size\":1.4831413931403594,\"opacity\":0.9614821015966585},{\"angle\":4.771765590765569,\"r\":48.3385915898486,\"radial\":0.04251984708815637,\"speed\":0.6166963568485309,\"size\":1.4934957163869564,\"opacity\":0.9662515449927185},{\"angle\":3.9657319518442335,\"r\":46.118816124385894,\"radial\":0.0021602931706526237,\"speed\":0.546935128129027,\"size\":1.5637169333345358,\"opacity\":0.9982888628543725},{\"angle\":4.284428061764652,\"r\":46.00011680860436,\"radial\":0.0000021237928065890596,\"speed\":0.5253744946470247,\"size\":1.5674962796471361,\"opacity\":0.9999983179559185},{\"angle\":0.08860229186646851,\"r\":55.927880013000774,\"radial\":0.18050690932728683,\"speed\":0.448168528534629,\"size\":1.2602498432773896,\"opacity\":0.8556537257405163},{\"angle\":5.882154154706053,\"r\":46.00008525237025,\"radial\":0.0000015500430953532137,\"speed\":0.558191331194892,\"size\":1.567497284712639,\"opacity\":0.9999987723657733},{\"angle\":0.2812134188895504,\"r\":48.47963859365268,\"radial\":0.04508433806641242,\"speed\":0.24339780154023116,\"size\":1.4890633300130667,\"opacity\":0.9642113503980945},{\"angle\":5.847980019687189,\"r\":47.49422421408604,\"radial\":0.027167712983382542,\"speed\":0.20719452830701557,\"size\":1.5201041435681828,\"opacity\":0.9784536477857391},{\"angle\":4.242707817853036,\"r\":84.50228703305925,\"radial\":0.700041582419259,\"speed\":0.27983370890825404,\"size\":0.501648954755465,\"opacity\":0.4177402992961202},{\"angle\":0.2862955641174599,\"r\":87.78527181476457,\"radial\":0.7597322148139014,\"speed\":0.5302068981995871,\"size\":0.43107314558195076,\"opacity\":0.3638420847278324},{\"angle\":0.40042209286318803,\"r\":79.85229687902975,\"radial\":0.6154963068914502,\"speed\":0.6218479346128627,\"size\":0.6089550764046661,\"opacity\":0.49230008562402794},{\"angle\":2.3458194715072245,\"r\":46.19813825387764,\"radial\":0.003602513706866111,\"speed\":0.17840090470239606,\"size\":1.5611927096442457,\"opacity\":0.9971462945310516},{\"angle\":2.703297033575479,\"r\":85.66672518152862,\"radial\":0.7212131851187022,\"speed\":0.25761992875264955,\"size\":0.47608413455624454,\"opacity\":0.39875821779741893},{\"angle\":3.6972216416676944,\"r\":46.196264273732496,\"radial\":0.0035684413405907695,\"speed\":0.5558941546789317,\"size\":1.5612523316300055,\"opacity\":0.9971732895397939},{\"angle\":4.05481040599093,\"r\":74.60034135072424,\"radial\":0.5200062063768043,\"speed\":0.40381669564528094,\"size\":0.7389614308931416,\"opacity\":0.574563679570113},{\"angle\":0.5969767467136637,\"r\":48.63184845592622,\"radial\":0.04785179010774946,\"speed\":0.31611929578345205,\"size\":1.484284156805413,\"opacity\":0.9620090742379387},{\"angle\":0.8401786882029207,\"r\":84.6535829269014,\"radial\":0.7027924168527526,\"speed\":0.09467723130684089,\"size\":0.4982957831575536,\"opacity\":0.41528172523842183},{\"angle\":3.781748106247229,\"r\":52.410533285816975,\"radial\":0.11655515065121777,\"speed\":0.37375624013483183,\"size\":1.3669963868796604,\"opacity\":0.9071258420512074},{\"angle\":0.6197977918601913,\"r\":84.59516982230753,\"radial\":0.7017303604055916,\"speed\":0.6103896701246404,\"size\":0.4995892944515601,\"opacity\":0.41623121282387077},{\"angle\":3.0358613026133066,\"r\":89.59799098230589,\"radial\":0.7926907451328343,\"speed\":0.2787915690045725,\"size\":0.39423406603397837,\"opacity\":0.33352045868699043},{\"angle\":3.5493439718886077,\"r\":67.59706224508025,\"radial\":0.3926738590014593,\"speed\":0.14020937306825945,\"size\":0.9246563031554718,\"opacity\":0.6817750530703041},{\"angle\":2.129090679932719,\"r\":47.16943399463681,\"radial\":0.021262436266123848,\"speed\":0.09236409285325939,\"size\":1.5303729146295002,\"opacity\":0.9831421065126146},{\"angle\":3.2699815744689698,\"r\":46.50057872965983,\"radial\":0.009101431448360531,\"speed\":0.09494093268638563,\"size\":1.5515783800729515,\"opacity\":0.9927883749855241},{\"angle\":3.795021445798889,\"r\":92.1759800539134,\"radial\":0.8395632737075164,\"speed\":0.6363254832814685,\"size\":0.34486010706091386,\"opacity\":0.2895337172571293},{\"angle\":5.884189869583645,\"r\":50.989234277473614,\"radial\":0.0907133504995202,\"speed\":0.5714358242335132,\"size\":1.4108027609345843,\"opacity\":0.9278177755642625},{\"angle\":0.4460482783108706,\"r\":71.02371867408225,\"radial\":0.45497670316513183,\"speed\":0.42935696986444016,\"size\":0.8321648092462939,\"opacity\":0.6296314628305326},{\"angle\":3.7807483919184692,\"r\":46.50959719854439,\"radial\":0.009265403609897966,\"speed\":0.5229797723358309,\"size\":1.5512919357445056,\"opacity\":0.9926583891659694},{\"angle\":0.5914341743524015,\"r\":47.00428795403062,\"radial\":0.018259780982374928,\"speed\":0.31690465133348916,\"size\":1.5356014150310564,\"opacity\":0.9855249607883726},{\"angle\":2.5986740420019276,\"r\":46.020679799764636,\"radial\":0.0003759963593570134,\"speed\":0.53468246289965,\"size\":1.5668413855283476,\"opacity\":0.9997022052842361},{\"angle\":1.083644349934573,\"r\":47.74936794116304,\"radial\":0.03180668983932795,\"speed\":0.20573948216227766,\"size\":1.5120504588277073,\"opacity\":0.9747685645128911},{\"angle\":3.4919761601555543,\"r\":66.2038246225617,\"radial\":0.36734226586475816,\"speed\":0.14795581930126606,\"size\":0.9631016778838282,\"opacity\":0.7028202214454264},{\"angle\":3.026381295015538,\"r\":73.29721104558018,\"radial\":0.49631292810145783,\"speed\":0.23198958735167013,\"size\":0.772507043706679,\"opacity\":0.5947089236681229},{\"angle\":1.5660265482243174,\"r\":49.548197737562674,\"radial\":0.0645126861375031,\"speed\":0.22994642357336958,\"size\":1.4556004192615795,\"opacity\":0.9487371057609495},{\"angle\":1.5162286704678773,\"r\":99.85121572550274,\"radial\":0.9791130131909589,\"speed\":0.5774799064895882,\"size\":0.22881794334280872,\"opacity\":0.14706268517649446},{\"angle\":5.512173833481766,\"r\":76.86310432866222,\"radial\":0.5611473514302221,\"speed\":0.13882824832464408,\"size\":0.6818948444033472,\"opacity\":0.5393431213751158},{\"angle\":3.63184634593762,\"r\":62.67555745754662,\"radial\":0.30319195377357494,\"speed\":0.1273580538736266,\"size\":1.0625115782280028,\"opacity\":0.7557472838708045},{\"angle\":4.937747155598554,\"r\":87.35771182013627,\"radial\":0.7519583967297503,\"speed\":0.4727572748556336,\"size\":0.43999391205436356,\"opacity\":0.3709312494112017},{\"angle\":1.0207139911567844,\"r\":46.07627998059025,\"radial\":0.0013869087380044898,\"speed\":0.1523685051988517,\"size\":1.5650709882096923,\"opacity\":0.9989014920695091},{\"angle\":2.895996172676128,\"r\":49.71525069580922,\"radial\":0.06755001265107666,\"speed\":0.12249875307315845,\"size\":1.4503877129520988,\"opacity\":0.946315053811072},{\"angle\":5.94822283264464,\"r\":59.085747322194564,\"radial\":0.23792267858535576,\"speed\":0.6778204327615168,\"size\":1.1665150478908124,\"opacity\":0.8090992957508559},{\"angle\":4.945611206329443,\"r\":46.00005406901445,\"radial\":9.830729900486388e-7,\"speed\":0.5430137603385503,\"size\":1.5674982779021436,\"opacity\":0.9999992214061537},{\"angle\":0.7855627745971759,\"r\":46.21963536185987,\"radial\":0.003993370215633997,\"speed\":0.5968605351977614,\"size\":1.560508807910925,\"opacity\":0.9968366183611826},{\"angle\":0.5409068680859428,\"r\":49.4466193567386,\"radial\":0.06266580648615636,\"speed\":0.5122872405241126,\"size\":1.4587725466921238,\"opacity\":0.9502094763930155},{\"angle\":0.685565190597581,\"r\":86.58524900425172,\"radial\":0.7379136182591222,\"speed\":0.6001443128475401,\"size\":0.45632331258274245,\"opacity\":0.38368333433842294},{\"angle\":0.21549585006782312,\"r\":81.17613375386594,\"radial\":0.6395660682521079,\"speed\":0.15293512073618837,\"size\":0.5776038155469417,\"opacity\":0.4712576363043556},{\"angle\":0.5896916019256426,\"r\":53.40034593597331,\"radial\":0.13455174429042388,\"speed\":0.4650928963954495,\"size\":1.3367146481539876,\"opacity\":0.8926799951387508},{\"angle\":1.509180767104992,\"r\":51.263743977823154,\"radial\":0.09570443596042102,\"speed\":0.29024240572959414,\"size\":1.4023125360662823,\"opacity\":0.9238259686791949},{\"angle\":1.5162261366937617,\"r\":92.62575080406424,\"radial\":0.8477409237102588,\"speed\":0.17932437585603855,\"size\":0.33665058518707797,\"opacity\":0.2817363149572964},{\"angle\":3.28661291666376,\"r\":76.22827909306513,\"radial\":0.549605074419366,\"speed\":0.19179352916012848,\"size\":0.6977495749755965,\"opacity\":0.5492564327333276},{\"angle\":6.02790538527986,\"r\":52.74780562040364,\"radial\":0.12268737491642982,\"speed\":0.5015014946847237,\"size\":1.3566570940736054,\"opacity\":0.9022068473698608},{\"angle\":3.236967717815723,\"r\":46.55527315819336,\"radial\":0.010095875603515549,\"speed\":0.5346503901059277,\"size\":1.5498413957910373,\"opacity\":0.9920000152031834},{\"angle\":2.1857534529259937,\"r\":63.489181577333355,\"radial\":0.31798511958787923,\"speed\":0.08468904143636026,\"size\":1.0393336266198985,\"opacity\":0.7435871215190254},{\"angle\":1.0250147069885809,\"r\":70.12323666290268,\"radial\":0.4386043029618669,\"speed\":0.15883012302110916,\"size\":0.856177898637436,\"opacity\":0.6433893047296578},{\"angle\":1.7596676661287558,\"r\":81.10754743810939,\"radial\":0.6383190443292617,\"speed\":0.5486004661662509,\"size\":0.5792130516107944,\"opacity\":0.472351195659124},{\"angle\":1.5347596790845972,\"r\":96.51605849553769,\"radial\":0.9184737908279579,\"speed\":0.6117871457261845,\"size\":0.2717863374991642,\"opacity\":0.21218286382176643},{\"angle\":2.3060657581513304,\"r\":50.579229422565305,\"radial\":0.08325871677391466,\"speed\":0.564596906774302,\"size\":1.4235097135054886,\"opacity\":0.9337758219763961},{\"angle\":2.7928294107217413,\"r\":58.246837792067744,\"radial\":0.2226697780375953,\"speed\":0.32009440666073413,\"size\":1.1912163676025695,\"opacity\":0.8214999911621613},{\"angle\":5.516990444448861,\"r\":61.32873597196751,\"radial\":0.2787042903994093,\"speed\":0.44687849300622806,\"size\":1.101203325588845,\"opacity\":0.7758200443001542},{\"angle\":4.7124186176420855,\"r\":56.03655760583614,\"radial\":0.1824828655606571,\"speed\":0.11483370014916519,\"size\":1.2569903068128783,\"opacity\":0.8540571101178939},{\"angle\":5.2968037855913686,\"r\":49.82399124801541,\"radial\":0.06952711360028024,\"speed\":0.1969456657180057,\"size\":1.4469973170260453,\"opacity\":0.9447380325544298},{\"angle\":0.011420986826294546,\"r\":56.98822138799919,\"radial\":0.19978584341816716,\"speed\":0.25935390535681874,\"size\":1.2285486981659883,\"opacity\":0.8400593255423804},{\"angle\":2.216500576530028,\"r\":59.1103467103725,\"radial\":0.23836994018859087,\"speed\":0.2179194178971643,\"size\":1.1657929514343517,\"opacity\":0.8087352972115056},{\"angle\":1.9351893761959682,\"r\":95.29087378963507,\"radial\":0.8961977052660921,\"speed\":0.5481016716809028,\"size\":0.29089209563260277,\"opacity\":0.2345694771562149},{\"angle\":5.045382672932987,\"r\":55.03832726135186,\"radial\":0.16433322293367017,\"speed\":0.5041019692496416,\"size\":1.287018259603938,\"opacity\":0.868708037031843},{\"angle\":4.5911346393017585,\"r\":98.46533722579392,\"radial\":0.9539152222871621,\"speed\":0.5752840138182826,\"size\":0.244669112186773,\"opacity\":0.17516764173810792},{\"angle\":1.7501797821800416,\"r\":89.24741471796187,\"radial\":0.7863166312356705,\"speed\":0.137093301934277,\"size\":0.4012302594619874,\"opacity\":0.3394200561114492},{\"angle\":5.272110641251223,\"r\":61.24434964525218,\"radial\":0.2771699935500396,\"speed\":0.6416887873613172,\"size\":1.1036408782333278,\"opacity\":0.7770754297280803},{\"angle\":5.223539622188086,\"r\":54.48882142059395,\"radial\":0.15434220764716272,\"speed\":0.3240708519370024,\"size\":1.3036320100241678,\"opacity\":0.8767594653325909},{\"angle\":0.8508945572918604,\"r\":58.29125691028401,\"radial\":0.22347739836880023,\"speed\":0.6616910367288543,\"size\":1.189904791994894,\"opacity\":0.8208440053618302},{\"angle\":3.6644326472267856,\"r\":46.100972990673974,\"radial\":0.0018358725577085476,\"speed\":0.30535550214849,\"size\":1.5642848962488043,\"opacity\":0.9985458553754124},{\"angle\":4.276663530424954,\"r\":46.04914509665218,\"radial\":0.0008935472118578765,\"speed\":0.5752822270759216,\"size\":1.5659349385119605,\"opacity\":0.9992922789801506},{\"angle\":1.325476350564733,\"r\":71.04563671837843,\"radial\":0.4553752130614262,\"speed\":0.6794720398443491,\"size\":0.8315829899588976,\"opacity\":0.629296081667001},{\"angle\":6.212573472773209,\"r\":58.501108676659086,\"radial\":0.22729288503016526,\"speed\":0.49529084641047844,\"size\":1.1837139785008108,\"opacity\":0.8177439704327089},{\"angle\":2.9548727825266554,\"r\":46.3337181644309,\"radial\":0.00606760298965269,\"speed\":0.2637616568280027,\"size\":1.5568807640074782,\"opacity\":0.9951929972723733},{\"angle\":0.7039409777542737,\"r\":46.02402586090745,\"radial\":0.0004368338346808838,\"speed\":0.2610714118006373,\"size\":1.566734826476548,\"opacity\":0.9996540200450997},{\"angle\":0.9454697915380591,\"r\":98.8839687457714,\"radial\":0.9615267044685708,\"speed\":0.373061836336797,\"size\":0.2395090435838784,\"opacity\":0.166894954825452},{\"angle\":4.634261110292543,\"r\":46.04846386130703,\"radial\":0.0008811611146731782,\"speed\":0.43734173483899036,\"size\":1.5659566300799401,\"opacity\":0.9993020896400215},{\"angle\":1.881566239761445,\"r\":48.25883901735708,\"radial\":0.04106980031558336,\"speed\":0.18578804500940077,\"size\":1.496003509366588,\"opacity\":0.9674048955927691},{\"angle\":4.721794752204457,\"r\":46.016173257919036,\"radial\":0.0002940592348915287,\"speed\":0.41046057571699907,\"size\":1.56698490445813,\"opacity\":0.9997671016613516},{\"angle\":4.137595073490289,\"r\":52.459286664226,\"radial\":0.11744157571319994,\"speed\":0.19447582004077346,\"size\":1.3655004867447953,\"opacity\":0.9064150033590863},{\"angle\":3.8347832198334073,\"r\":71.33043966856403,\"radial\":0.460553448519346,\"speed\":0.1927605278163781,\"size\":0.8240344678122833,\"opacity\":0.6249359021457075},{\"angle\":3.863599952809983,\"r\":71.61573880591521,\"radial\":0.4657407055620948,\"speed\":0.14092514680784676,\"size\":0.8164945582455743,\"opacity\":0.6205639278066521},{\"angle\":0.08748658276309554,\"r\":79.13856624592496,\"radial\":0.6025193862895448,\"speed\":0.40261607378964887,\"size\":0.6261060982419904,\"opacity\":0.5035897808433306},{\"angle\":6.023446454857644,\"r\":46.00425876519285,\"radial\":0.00007743209441550737,\"speed\":0.3753397509598544,\"size\":1.567364359904089,\"opacity\":0.9999386735437853},{\"angle\":2.125186994216333,\"r\":47.45421468767637,\"radial\":0.026440267048661294,\"speed\":0.165012372010399,\"size\":1.5213681024358021,\"opacity\":0.9790313524473075},{\"angle\":5.229477864150944,\"r\":69.29448396605831,\"radial\":0.4235360721101511,\"speed\":0.5177044908122201,\"size\":0.8784647816361877,\"opacity\":0.6560158044638089},{\"angle\":3.9589549399481743,\"r\":52.854033879012114,\"radial\":0.12461879780022021,\"speed\":0.37150818408607345,\"size\":1.3534050808803373,\"opacity\":0.9006568357361892},{\"angle\":3.2689768569603737,\"r\":86.07080249215021,\"radial\":0.728560045311822,\"speed\":0.30046243596865096,\"size\":0.46734587968810104,\"opacity\":0.39213792489029553},{\"angle\":3.231952767341093,\"r\":47.82954456724484,\"radial\":0.033264446677178885,\"speed\":0.38506982962141734,\"size\":1.509522047618677,\"opacity\":0.9736101959234457},{\"angle\":2.8067539741086667,\"r\":47.23803211133177,\"radial\":0.02250967475148672,\"speed\":0.20814113295463954,\"size\":1.5282025212384616,\"opacity\":0.9821521052625983},{\"angle\":0.5133898032355432,\"r\":81.60554946261233,\"radial\":0.6473736265929515,\"speed\":0.5796875721027028,\"size\":0.5675665729417394,\"opacity\":0.4644022529158231},{\"angle\":3.8744540881383953,\"r\":48.48578711420251,\"radial\":0.04519612934913654,\"speed\":0.10543999396771192,\"size\":1.4888701945861862,\"opacity\":0.9641224017889507},{\"angle\":3.995876882775393,\"r\":82.5678362014917,\"radial\":0.6648697491180309,\"speed\":0.38296790479027476,\"size\":0.5453168024869854,\"opacity\":0.4489841241584928},{\"angle\":5.62306030296586,\"r\":64.81104134585206,\"radial\":0.3420189335609464,\"speed\":0.32903534003443585,\"size\":1.0019989857579448,\"opacity\":0.7237744477053232},{\"angle\":3.6208012471346347,\"r\":47.457781494875086,\"radial\":0.0265051180886379,\"speed\":0.6316478705700933,\"size\":1.5212554103252778,\"opacity\":0.9789798524373762},{\"angle\":1.983339004631816,\"r\":50.225849621638595,\"radial\":0.07683362948433814,\"speed\":0.36739152689221466,\"size\":1.4344866406607464,\"opacity\":0.9389071255399213},{\"angle\":1.2440823183636398,\"r\":48.32200963281976,\"radial\":0.04221835696035925,\"speed\":0.4074420657450726,\"size\":1.4940170367232,\"opacity\":0.9664913611626466},{\"angle\":5.68666950254644,\"r\":79.87151795580057,\"radial\":0.6158457810145558,\"speed\":0.1704589178883088,\"size\":0.6084955631123368,\"opacity\":0.4919955277049575},{\"angle\":1.228714460479219,\"r\":51.04755999974817,\"radial\":0.09177381817723942,\"speed\":0.5799772316776004,\"size\":1.4089976503863206,\"opacity\":0.9269698106728478},{\"angle\":5.561924526278434,\"r\":70.12385780117958,\"radial\":0.4386155963850832,\"speed\":0.23557393474092148,\"size\":0.8561612615559784,\"opacity\":0.6433798287457635},{\"angle\":1.8536705717117783,\"r\":68.35310501331982,\"radial\":0.4064200911512695,\"speed\":0.38006408104679,\"size\":0.9039931059888158,\"opacity\":0.670318288326804},{\"angle\":5.845450669435815,\"r\":52.66962108245978,\"radial\":0.12126583786290507,\"speed\":0.5218848216923745,\"size\":1.359051965083064,\"opacity\":0.903347445781601},{\"angle\":5.915456744575038,\"r\":46.19912180655488,\"radial\":0.003620396482816017,\"speed\":0.37619592325407636,\"size\":1.5611614174743624,\"opacity\":0.9971321262473527},{\"angle\":2.86824240182861,\"r\":50.629235873579724,\"radial\":0.08416792497417679,\"speed\":0.6000853154250284,\"size\":1.4219582381610012,\"opacity\":0.9330494059949255},{\"angle\":2.9684297906716584,\"r\":49.32732198092694,\"radial\":0.06049676328958065,\"speed\":0.38103429891265406,\"size\":1.4625004042118728,\"opacity\":0.9519383121138646},{\"angle\":0.9593951624557644,\"r\":49.149319624396604,\"radial\":0.05726035680721098,\"speed\":0.2120218725428189,\"size\":1.468067501921505,\"opacity\":0.9545171479745053},{\"angle\":3.0679959074642245,\"r\":49.121112181864454,\"radial\":0.05674749421571732,\"speed\":0.15280853024945457,\"size\":1.4689502283167153,\"opacity\":0.9549257261984103},{\"angle\":3.762558585537367,\"r\":64.4800480220583,\"radial\":0.3360008731283327,\"speed\":0.20264885429539614,\"size\":1.0113097824050075,\"opacity\":0.7287422281763863},{\"angle\":0.19010429693264047,\"r\":58.11588230769023,\"radial\":0.2202887692307314,\"speed\":0.21647992800593374,\"size\":1.195085504945347,\"opacity\":0.8234335579781243},{\"angle\":5.721201724801408,\"r\":57.09551451738761,\"radial\":0.20173662758886574,\"speed\":0.17210128699625032,\"size\":1.2253535993934006,\"opacity\":0.8384792903419142},{\"angle\":3.7022875894666147,\"r\":72.74293664859539,\"radial\":0.4862352117926435,\"speed\":0.3316304837089316,\"size\":0.786920824928204,\"opacity\":0.6032485664434633},{\"angle\":4.695258983544182,\"r\":49.37266332287196,\"radial\":0.061321151324944694,\"speed\":0.10255300527676289,\"size\":1.461083253260201,\"opacity\":0.9512812807621367},{\"angle\":3.9901816373574,\"r\":53.20248668136087,\"radial\":0.13095430329747032,\"speed\":0.5750307034841095,\"size\":1.3427528632307526,\"opacity\":0.8955700402085353},{\"angle\":5.8653133431229705,\"r\":52.29211545966538,\"radial\":0.11440209926664333,\"speed\":0.3050467122765693,\"size\":1.3706316763469861,\"opacity\":0.9088521121773075},{\"angle\":4.0058453002035606,\"r\":47.56821149224186,\"radial\":0.028512936222579232,\"speed\":0.2673018698648567,\"size\":1.5177675253362797,\"opacity\":0.977385218492988},{\"angle\":2.5574237458945333,\"r\":49.162141484999594,\"radial\":0.05749348154544723,\"speed\":0.6010831329422845,\"size\":1.4676663010125213,\"opacity\":0.9543314189677292},{\"angle\":3.3350028118393342,\"r\":88.32384362792487,\"radial\":0.7695244295986339,\"speed\":0.6474967852118395,\"size\":0.41995908550707595,\"opacity\":0.3548794821796327},{\"angle\":5.704054888310874,\"r\":83.88618760466568,\"radial\":0.6888397746302852,\"speed\":0.255816308311947,\"size\":0.5153983563175573,\"opacity\":0.42772894064584793},{\"angle\":2.5067476403784212,\"r\":85.82332812012172,\"radial\":0.7240605112749402,\"speed\":0.31748672421787566,\"size\":0.47268926124162874,\"opacity\":0.3961945737038374},{\"angle\":2.5536786463497596,\"r\":50.194204530631474,\"radial\":0.07625826419329951,\"speed\":0.34258367678391166,\"size\":1.435470743243777,\"opacity\":0.9393664581855907},{\"angle\":1.0198823544121443,\"r\":86.3317707840589,\"radial\":0.7333049233465254,\"speed\":0.23697610448764278,\"size\":0.46173986309866155,\"opacity\":0.38785278773287085},{\"angle\":6.030203609103676,\"r\":46.223109339787285,\"radial\":0.004056533450677852,\"speed\":0.6208803380475196,\"size\":1.5603982955062674,\"opacity\":0.9967865728993928},{\"angle\":1.2976433656289852,\"r\":48.93537208960352,\"radial\":0.05337040162915489,\"speed\":0.5417435541578974,\"size\":1.474766389855203,\"opacity\":0.9576155739724279},{\"angle\":1.6086203297802393,\"r\":46.16318974983902,\"radial\":0.002967086360709395,\"speed\":0.6460589999203189,\"size\":1.5623047213274956,\"opacity\":0.9976497185998303},{\"angle\":4.617173437135026,\"r\":91.74233070875695,\"radial\":0.8316787401592173,\"speed\":0.4486583510308139,\"size\":0.35289524399268135,\"opacity\":0.2970140537737463},{\"angle\":1.2843118604544392,\"r\":59.46268431106876,\"radial\":0.24477607838306842,\"speed\":0.6670127115277693,\"size\":1.1554643316100441,\"opacity\":0.8035193852944433}]};\r\nconst ease=x=>x*x*(3-2*x),clamp=x=>Math.min(1,Math.max(0,x));\r\nfunction envelope(age,config,startScale=1){\r\n if(age<0||age>=.78)return {scale:1,boost:0};\r\n const accelerate=ease(clamp(age/.09)),decelerate=1-ease(clamp((age-.28)/.50));\r\n const boost=config.boost*accelerate*decelerate;\r\n const peak=Math.max(config.gain,startScale);\r\n const scale=age<=.42?startScale+(peak-startScale)*ease(age/.42):peak+(1-peak)*ease((age-.42)/.36);\r\n return {scale,boost};\r\n}\r\n\r\nfunction drawSpikes(ctx,state,cx,cy,k,color){\r\n const radius=state.config.core*k*state.currentScale;\r\n ctx.save();ctx.translate(cx,cy);ctx.rotate(state.coreAngle);ctx.fillStyle=`rgb(${color})`;\r\n for(const spike of state.config.spikes){\r\n  const length=spike.length*k*(.7+.3*state.currentScale),width=spike.width*k,root=radius-1.5*k;\r\n  ctx.save();ctx.rotate(spike.angle);ctx.beginPath();ctx.moveTo(root,-width);ctx.lineTo(radius+length,spike.lean*width);ctx.lineTo(root,width);ctx.closePath();ctx.fill();ctx.restore();\r\n }\r\n ctx.restore();\r\n}\r\n\r\n// A covered orb owns no animation frames. Integrate its motion once on reveal.\r\nlet startupCovered=!!window.__fadeInPageState&&!window.__fadeInPageState.done;\r\nlet coveredAt=startupCovered&&!document.hidden?performance.now():null,coveredMotion=!reduceMotion.matches;\r\nfunction spinArea(age){\r\n const t=clamp(age/.09),u=clamp((age-.28)/.5);\r\n return orbState.config.boost*(.09*(t*t*t-.5*t*t*t*t)+Math.max(0,Math.min(age-.09,.19))+.5*(u-u*u*u+.5*u*u*u*u));\r\n}\r\nfunction advanceCovered(now=performance.now()){\r\n if(!startupCovered||coveredAt===null)return;\r\n const dt=Math.max(0,(now-coveredAt)/1000);coveredAt=now;\r\n if(!coveredMotion)return;\r\n const age=orbClock-orbState.trigger,boost=spinArea(age+dt)-spinArea(age);\r\n orbClock+=dt;\r\n orbState.coreAngle=(orbState.coreAngle+.12*dt+.55*boost)%(Math.PI*2);\r\n for(const p of orbState.particles)p.angle=(p.angle+p.speed*(dt+boost))%(Math.PI*2);\r\n const motion=envelope(orbClock-orbState.trigger,orbState.config,orbState.baseScale);\r\n orbState.currentScale=motion.scale;orbState.currentBoost=motion.boost;\r\n}\r\nfunction setStartupCovered(covered){\r\n covered=!!covered;if(covered===startupCovered)return;\r\n if(covered){startupCovered=true;coveredMotion=!reduceMotion.matches;coveredAt=document.hidden?null:performance.now();cancelAnimationFrame(raf);raf=0}\r\n else{advanceCovered();startupCovered=false;coveredAt=null;if(!document.hidden)paint(performance.now());wakeParticles()}\r\n lastDraw=0;\r\n}\r\nfunction startSpin(){advanceCovered();if(!reduceMotion.matches){orbState.baseScale=orbState.currentScale;orbState.trigger=orbClock;}wakeParticles()}\r\nfunction shakeCore(){\r\n if(reduceMotion.matches)return;\r\n const button=$('#orbButton');button.getAnimations().filter(a=>a.id==='core-impact').forEach(a=>a.cancel());\r\n const impact=button.animate([{translate:'0 0'},{translate:'-10px 3px',offset:.10},{translate:'10px -5px',offset:.21},{translate:'-8px -3px',offset:.33},{translate:'7px 4px',offset:.46},{translate:'-4px 2px',offset:.62},{translate:'3px -2px',offset:.78},{translate:'0 0'}],{duration:560,easing:'linear'});impact.id='core-impact';\r\n}\r\n\r\nfunction resizeCanvas(){\r\n if(!ctx)return;\r\n const dpr=Math.min(devicePixelRatio||1,2),size=Math.round(canvasSize*dpr);\r\n if(canvas.width!==size||canvas.height!==size){canvas.width=size;canvas.height=size;ctx.setTransform(dpr,0,0,dpr,0,0)}\r\n paint(performance.now());wakeParticles();\r\n}\r\nlet particleExposure=null;\nfunction particlesExposed(){\n const button=canvas.parentElement;\n if(!button)return true;\n const scope=canvas.getRootNode().host||document.body;\n return scope.classList.contains('near-orb')||scope.hasAttribute('data-home-orb')||scope.hasAttribute('data-orb-arriving-home')||button.matches(':focus-visible')||button.closest('.navigation')?.classList.contains('open');\n}\nfunction paint(now,dt=0){\r\n if(!ctx||startupCovered)return;\r\n const target=particlesExposed()?1:0;\n if(particleExposure===null||reduceMotion.matches)particleExposure=target;\n else{particleExposure+=(target-particleExposure)*(1-Math.exp(-dt*14));if(Math.abs(target-particleExposure)<.001)particleExposure=target}\n const state=orbState,motion=reduceMotion.matches?{scale:1,boost:0}:envelope(orbClock-state.trigger,state.config,state.baseScale);\r\n state.currentScale=motion.scale;state.currentBoost=motion.boost;\r\n state.coreAngle=(state.coreAngle+dt*(reduceMotion.matches?0:.12+motion.boost*.55))%(Math.PI*2);\r\n const s=canvasSize,cx=s/2,cy=s/2,k=s/260,color=document.documentElement.dataset.theme==='light'?'0,0,0':'255,255,255';\r\n const age=(now-burstTime)/1000,impact=!reduceMotion.matches&&age>=0&&age<.56?Math.pow(1-age/.56,2):0;\r\n ctx.clearRect(0,0,s,s);ctx.save();ctx.translate(Math.sin(age*117)*impact*4,Math.cos(age*93)*impact*3);\r\n for(const p of state.particles){\r\n  if(!reduceMotion.matches)p.angle=(p.angle+dt*p.speed*(1+motion.boost))%(Math.PI*2);\r\n  if(!particleExposure)continue;\n  const origin=state.config.core*.65;\n  const r=(origin+(p.r-origin)*particleExposure)*k;ctx.fillStyle=`rgba(${color},${p.opacity*particleExposure})`;ctx.beginPath();ctx.arc(cx+Math.cos(p.angle)*r,cy+Math.sin(p.angle)*r,p.size*k,0,Math.PI*2);ctx.fill();\r\n }\r\n // Paint the opaque core last so emerging particles remain behind it.\r\n ctx.fillStyle=`rgb(${color})`;ctx.beginPath();ctx.arc(cx,cy,state.config.core*k*state.currentScale,0,Math.PI*2);ctx.fill();\r\n drawSpikes(ctx,state,cx,cy,k,color);\r\n ctx.restore();\r\n}\r\nfunction tick(now){raf=0;if(document.hidden||startupCovered)return;const dt=lastDraw?Math.min(.04,(now-lastDraw)/1000):0;lastDraw=now;orbClock+=dt;paint(now,dt);if(!reduceMotion.matches)raf=requestAnimationFrame(tick)}\r\nfunction wakeParticles(){if(!ctx||startupCovered)return;if(reduceMotion.matches){paint(performance.now());return}if(!raf&&!document.hidden){lastDraw=0;raf=requestAnimationFrame(tick)}}\r\ndocument.addEventListener('visibilitychange',()=>{if(startupCovered){advanceCovered();coveredAt=document.hidden?null:performance.now()}if(document.hidden){cancelAnimationFrame(raf);raf=0;lastDraw=0}else wakeParticles()});\r\nreduceMotion.addEventListener('change',()=>{advanceCovered();coveredMotion=!reduceMotion.matches;cancelAnimationFrame(raf);raf=0;orbState.trigger=-100;orbState.baseScale=1;wakeParticles()});\r\nlet savedTheme;try{savedTheme=localStorage.getItem('fade-horizon-theme')}catch{}setTheme(savedTheme==='light'?'light':'dark');updateFanMask();resizeCanvas();\r\n</script><script src=\"file-panel.js\"></script></body></html>\r<div id=\"toast\" class=\"toast\" role=\"status\"></div>";
 const $=q=>shadow.querySelector(q),$$=q=>[...shadow.querySelectorAll(q)];
 const on=(el,event,fn,options={})=>el.addEventListener(event,fn,{...options,signal});
 let disposed=false;const timeouts=new Set(),frames=new Set();
 const setTimeout=(fn,ms)=>{const id=window.setTimeout(()=>{timeouts.delete(id);if(!disposed)fn()},ms);timeouts.add(id);return id};
 const clearTimeout=id=>{window.clearTimeout(id);timeouts.delete(id)};
 const requestAnimationFrame=fn=>{const id=window.requestAnimationFrame(t=>{frames.delete(id);if(!disposed)fn(t)});frames.add(id);return id};
 const cancelAnimationFrame=id=>{window.cancelAnimationFrame(id);frames.delete(id)};
 const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)');
 // Use the installed app's appearance setting so Windows caption symbols follow
// the same polarity as the renderer. This preference persists with Fade's theme.
function createNativeThemeSync(win,report){
 const bridge=win.electronBridge;
 if(!bridge?.sendMessageFromView)return {set(){return Promise.resolve(false)},settled(){return Promise.resolve()},destroy(){}};
 let stopped=false,flight=null,desired=null,applied=null;
 const pending=new Map();
 function receive(event){
  const data=event.data;
  if(data?.type!=='fetch-response')return;
  const entry=pending.get(data.requestId);if(!entry)return;
  if(data.responseType==='success'&&(!data.status||data.status<400))entry.finish(null,data);
  else entry.finish(new Error('Native appearance setting failed'));
 }
 win.addEventListener('message',receive);
 function request(method,params){return new Promise((resolve,reject)=>{
  const requestId=win.crypto.randomUUID();
  const finish=(error,data)=>{const entry=pending.get(requestId);if(!entry)return;win.clearTimeout(entry.timer);pending.delete(requestId);error?reject(error):resolve(data)};
  const timer=win.setTimeout(()=>finish(new Error('Native appearance setting timed out')),5000);
  pending.set(requestId,{timer,finish});
  Promise.resolve().then(()=>bridge.sendMessageFromView({type:'fetch',requestId,method:'POST',url:'vscode://codex/'+method,body:JSON.stringify(params)})).catch(finish);
 })}
 const write=value=>request('set-setting',{key:'appearanceTheme',value});
 // Electron's native theme settings default to undefined. Match its renderer
 // defaults before persisting a complete theme (the set-setting schema requires it).
 const defaultThemes={
  light:{contrast:45,ink:'#1a1c1f',surface:'#ffffff',semanticColors:{diffAdded:'#00a240',diffRemoved:'#ba2623',skill:'#924ff7'}},
  dark:{contrast:60,ink:'#ffffff',surface:'#181818',semanticColors:{diffAdded:'#40c977',diffRemoved:'#fa423e',skill:'#ad7bf9'}}
 };
 // Seeds from the bundled native Catppuccin Latte/Mocha themes, using the
 // same color selection as the native preset picker. The code theme ID loads
 // native syntax highlighting; fonts, contrast and opacity remain user choices.
 const catppuccin={
  light:{accent:'#8839ef',surface:'#eff1f5',ink:'#4c4f69',semanticColors:{diffAdded:'#40a02b',diffRemoved:'#d20f39',skill:'#8839ef'}},
  dark:{accent:'#cba6f7',surface:'#1e1e2e',ink:'#cdd6f4',semanticColors:{diffAdded:'#a6e3a1',diffRemoved:'#f38ba8',skill:'#cba6f7'}}
 };
 async function applyCatppuccinTheme(){
  const read=async key=>{const response=await request('get-setting',{key});return JSON.parse(response.bodyJsonString).value};
  const matches=(actual,expected)=>expected!==null&&typeof expected==='object'?actual!==null&&typeof actual==='object'&&Object.entries(expected).every(([key,value])=>matches(actual[key],value)):actual===expected;
  const updates=[];
  for(const mode of ['light','dark']){
   const key=mode==='light'?'appearanceLightChromeTheme':'appearanceDarkChromeTheme',before=await read(key);
   if(before!=null&&(typeof before!=='object'||Array.isArray(before)))throw Error('当前原生主题配置格式无效');
   const defaults=defaultThemes[mode];
   updates.push({key:mode==='light'?'appearanceLightCodeThemeId':'appearanceDarkCodeThemeId',value:'catppuccin'});
   updates.push({key,value:{opaqueWindows:false,...defaults,...before,fonts:{code:null,ui:null,...before?.fonts},...catppuccin[mode],accentSource:'custom'}});
  }
  for(const update of updates){
   await request('set-setting',{key:update.key,value:update.value});
   const actual=await read(update.key);
   if(!matches(actual,update.value))throw Error('Catppuccin 主题保存未生效');
  }
 }
 function flush(){
  if(stopped)return Promise.reject(new Error('Disposed'));
  if(flight)return flight;
  flight=(async()=>{while(!stopped&&desired!==applied){const value=desired;await write(value);applied=value}})().finally(()=>{flight=null});
  return flight;
 }
 return {applyCatppuccinTheme,set(value){desired=value;return flush().then(()=>true,error=>{if(!stopped)report(error);return false})},settled:flush,destroy(){stopped=true;win.removeEventListener('message',receive);for(const entry of pending.values())entry.finish(new Error('Disposed'))}};
}

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

 const nativeTheme=createNativeThemeSync(window,()=>announce('窗口按钮主题同步失败，请重启 Codex 后重试'));
 // One delegated handler also covers tab strips recreated by window-mode renders.
function installFadeTabWheel(scope,win){
 const states=new Map(),reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(value,el)=>Math.max(0,Math.min(el.scrollWidth-el.clientWidth,value));
 function stop(el){const state=states.get(el);if(state){win.cancelAnimationFrame(state.frame);states.delete(el)}}
 function wheel(event){
  const el=event.target.closest?.('.fade-tabs-scroll');
  if(!el||event.ctrlKey||el.scrollWidth<=el.clientWidth)return;
  const raw=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
  const delta=raw*(event.deltaMode===1?20:event.deltaMode===2?el.clientWidth:1);
  if(!delta)return;
  event.preventDefault();event.stopPropagation();
  let state=states.get(el);
  if(state&&Math.abs(el.scrollLeft-state.last)>2){stop(el);state=null}
  if(reduced.matches){stop(el);el.scrollLeft=clamp(el.scrollLeft+delta,el);return}
  if(state){
   // Reversing the wheel should reverse immediately, not drain an old backlog.
   state.target=clamp((Math.sign(delta)===Math.sign(state.target-el.scrollLeft)?state.target:el.scrollLeft)+delta,el);return;
  }
  state={target:clamp(el.scrollLeft+delta,el),last:el.scrollLeft,time:win.performance.now(),frame:0};states.set(el,state);
  function tick(time){
   if(!el.isConnected||Math.abs(el.scrollLeft-state.last)>2){stop(el);return}
   state.target=clamp(state.target,el);
   const distance=state.target-el.scrollLeft,dt=Math.min(64,Math.max(1,time-state.time));state.time=time;
   if(Math.abs(distance)<.5){el.scrollLeft=state.target;states.delete(el);return}
   el.scrollLeft+=distance*(1-Math.exp(-dt/65));
   if(el.scrollLeft===state.last){el.scrollLeft=state.target;states.delete(el);return}
   state.last=el.scrollLeft;
   state.frame=win.requestAnimationFrame(tick);
  }
  state.frame=win.requestAnimationFrame(tick);
 }
 const interrupt=event=>{const el=event.target.closest?.('.fade-tabs-scroll');if(el)stop(el)};
 scope.addEventListener('wheel',wheel,{passive:false});scope.addEventListener('pointerdown',interrupt,{capture:true});
 return ()=>{scope.removeEventListener('wheel',wheel);scope.removeEventListener('pointerdown',interrupt,true);for(const el of states.keys())stop(el)};
}

// One presentation area per OS window. Native controllers retain tab state and scope.
function installWindowPreview({changed}){
 const records=new Map(),scopeIds=new WeakMap(),scopeTabs=new Map(),renderers=new Set();let serial=0,active=null,revision=0,disposed=false;
 const body=document.createElement('aside');body.dataset.fadeUnifiedPreview='';body.hidden=true;body.setAttribute('aria-label','预览器');document.body.append(body);
 const notify=()=>{revision++;window.dispatchEvent(new Event('fade-preview-state'));changed()};
 const identity=scope=>scope.node??scope;
 const key=(scope,id)=>{const owner=identity(scope);if(!scopeIds.has(owner))scopeIds.set(owner,++serial);return scopeIds.get(owner)+':'+id};
 function select(id,invoke=true){const item=records.get(id);if(!item)return;if(active!==id){active=id;for(const [key,item] of records)item.mount.hidden=key!==active;notify()}if(invoke)item.activate()}
 const bridge={
  get revision(){return revision},get active(){return active},key,
  // Keep one renderer even during StrictMode registration and mode transitions.
  ownsRenderer(token){return !disposed&&renderers.values().next().value===token},
  registerRenderer(token){if(disposed)return()=>{};const previous=renderers.values().next().value;renderers.add(token);if(previous!==renderers.values().next().value)notify();return()=>{const owned=this.ownsRenderer(token);renderers.delete(token);if(!disposed&&owned)notify()}},
  retainsPath(path){return [...scopeTabs.values()].some(({scope,ids})=>ids.size&&scope.value?.pathname===path)},
  get groups(){return [...scopeTabs.values()].filter(({ids})=>ids.size).map(({scope,snapshot,ids})=>({scope,snapshot,items:[...ids].map(id=>records.get(id)).filter(Boolean)}))},
  mount(id){let item=records.get(id);if(item)return item.mount;const mount=document.createElement('div');mount.className='fade-preview-native-host';mount.hidden=true;body.append(mount);records.set(id,{id,mount,title:'预览',activate(){},close(){}});return mount},
  update(id,data){if(disposed)return;const item=records.get(id);if(!item)return;const different=item.title!==data.title||item.tab!==data.tab||!item.ready;Object.assign(item,data,{ready:true});if(active===null||data.reveal)select(id,false);else if(different)notify()},
  remove(id){const item=records.get(id);if(!item)return;item.mount.remove();records.delete(id);if(active===id){active=null;const next=[...records.values()].find(v=>v.ready);if(next)select(next.id,false)}notify()},
  select,
  reconcile(scope,tabs,controller,activeId,layoutContext,snapshot){const owner=identity(scope),saved=scopeTabs.get(owner),previous=saved?.ids??new Set(),contextChanged=snapshot&&snapshot!==saved?.snapshot;scope=saved?.scope??scope;const next=new Set(tabs.filter(t=>!t.isWorkspaceHome).map(t=>key(scope,t.tabId)));scopeTabs.set(owner,{scope,snapshot:snapshot??saved?.snapshot,ids:next});for(const tab of tabs){if(tab.isWorkspaceHome)continue;const id=key(scope,tab.tabId);this.mount(id);const old=records.get(id),selected=tab.tabId===activeId;this.update(id,{tab,controller,layoutContext,title:typeof tab.title==='string'?tab.title:tab.tabId,reveal:selected&&!old.nativeActive,nativeActive:selected,activate:()=>controller.activateTab(scope,tab.tabId),close:()=>controller.closeTab(scope,tab.tabId)});if(tab.isPreview)controller.pinTab(scope,tab.tabId)}for(const id of previous)if(!next.has(id))this.remove(id);if(!next.size)scopeTabs.delete(owner);else if(contextChanged)notify()},
  release(scope){const owner=identity(scope),ids=scopeTabs.get(owner)?.ids;scopeTabs.delete(owner);for(const id of ids??[])this.remove(id)},
 };
 window.__fadePreviewBridge=bridge;
 return {
  get tabs(){return [...records.values()].filter(v=>v.ready)},get active(){return active},body,
  select,close(id){records.get(id)?.close()},closeAll(){for(const item of [...records.values()])if(item.ready)item.close()},
  reset(){records.clear();scopeTabs.clear();active=null;body.replaceChildren();notify()},
  layout(enabled,left,width){const hidden=!enabled||!this.tabs.length;if(body.hidden!==hidden)body.hidden=hidden;if(!hidden){if(body.style.left!==left+'px')body.style.left=left+'px';if(body.style.width!==width+'px')body.style.width=width+'px'}},
  destroy(){disposed=true;renderers.clear();if(window.__fadePreviewBridge===bridge)delete window.__fadePreviewBridge;window.dispatchEvent(new Event('fade-preview-state'));body.remove();records.clear();scopeTabs.clear()}
 };
}

// Ephemeral ownership only. Conversations and drafts remain native-owned.
function createFadeWindowLayout(){
 let serial=0;
 const panes=[];
 function add(type){if(!['codex','gpt'].includes(type))throw Error('未知窗口类型');if(panes.length>=4)throw Error('最多支持 4 个分栏');const pane={id:'pane-'+ ++serial,type,tabs:[],active:null,weight:1};panes.push(pane);return pane}
 function owner(key){return panes.find(p=>p.tabs.includes(key))}
 function place(key,pane,index=pane.tabs.length){const previous=owner(key);if(previous&&previous.type!==pane.type)throw Error('只能移动到同类型窗口');if(previous){previous.tabs.splice(previous.tabs.indexOf(key),1);if(previous.active===key)previous.active=previous.tabs[0]??null}pane.tabs.splice(Math.max(0,Math.min(index,pane.tabs.length)),0,key);pane.active=key;return previous}
 function forget(key){const pane=owner(key);if(!pane)return;pane.tabs.splice(pane.tabs.indexOf(key),1);if(pane.active===key)pane.active=pane.tabs[0]??null}
 function remove(pane){const i=panes.indexOf(pane);if(i>=0)panes.splice(i,1)}
 return {panes,add,owner,place,forget,remove};
}

function installFadeWindowMode(){
 let resetStartup=false;try{resetStartup=!window.__fadeWindowModeBooted&&localStorage.getItem('fade-window-mode')==='true'}catch{}window.__fadeWindowModeBooted=true;
 const layout=createFadeWindowLayout(),homes=new Map(),api={codex:disposeCodexTabs,gpt:disposeGptTabs};
 const row=document.createElement('div'),menu=document.createElement('div'),button=document.createElement('button'),pageStyle=document.createElement('style');
 row.className='fade-window-row';menu.className='fade-window-menu';menu.hidden=true;menu.setAttribute('role','menu');
 button.className='fade-window-add';button.type='button';button.textContent='＋';button.title='新建窗口';button.setAttribute('aria-label','新建窗口');button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');
 $('.compact-head').append(button);shadow.append(row,menu);document.head.append(pageStyle);
 const previewDirectory=document.createElement('div');previewDirectory.className='fade-preview-directory';previewDirectory.hidden=true;previewDirectory.setAttribute('role','menu');previewDirectory.setAttribute('aria-label','已打开的预览');shadow.append(previewDirectory);
 const paneNodes=new Map(),tabNodes=new Map(),recentPanes=new Map();let resizing=false,resizeCleanup=null,lastStructure='',lastGeometry='',geometryRules=[];
 let pendingProject=null;let interval=0,enabled=false,focus=null,dead=false,signature='',drag=null,pendingPane=null,lastRoute='';
 let previewWasOpen=false;const previewPane={id:'preview',weight:1},preview=installWindowPreview({changed:()=>{const open=preview.tabs.length>0;if(open&&!previewWasOpen)previewPane.weight=layout.panes.reduce((n,p)=>n+p.weight,0)/2||1;previewWasOpen=open;if(!dead&&enabled)render()}});
 const columns=()=>enabled&&preview.tabs.length?[...layout.panes,previewPane]:layout.panes;
 const entries=()=>[...api.codex.tabs().map(tab=>({key:tab.windowKey??tab.path,type:'codex',tab})),...api.gpt.tabs().map(tab=>({key:tab.id,type:'gpt',tab})),...homes.values()];
 const entry=key=>entries().find(e=>e.key===key);
 const pageKey=e=>e.home?e.key:e.type==='codex'?e.tab.location?.state?.fadePaneHome||e.tab.nativePath||e.tab.path:e.tab.location?.state?.fadeDraftKey||e.tab.location?.pathname||e.tab.id;
 function navigateHome(e){const r=fadeNativeRouter(document);r?.navigator.push({pathname:'/',search:''},{sidebarProductMode:'codex',fadePaneHome:e.key,homeDraftKey:e.key})}
 function remember(pane){if(!pane)return;focus=pane;recentPanes.set(pane.type,pane)}
 function destination(type){const recent=recentPanes.get(type);return layout.panes.includes(recent)?recent:layout.panes.find(p=>p.type===type)}
 function prepare(type,key){if(!enabled)return true;sync();const existing=key==null?null:entries().find(e=>e.type===type&&(e.key===key||e.tab.path===key||e.tab.id===key||e.tab.conversationId===key||e.tab.location?.pathname==='/c/'+key));const owner=existing&&layout.owner(existing.key);let p=destination(type);const current=p&&entry(p.active),home=current&&(current.tab.location?.pathname==='/'||type==='gpt'&&!current.tab.location&&current.tab.conversationId?.startsWith('local-chatgpt:'))?current:null;if(owner){activate(owner,existing.key);if(home&&home.key!==existing.key&&existing.tab.location?.pathname!=='/'){api[type].close(type==='gpt'?home.tab.id:home.tab);layout.forget(home.key);sync()}return false}if(!p){if(layout.panes.length>=4){announce('聊天窗口数量已满');return false}p=layout.add(type)}if(key!=null&&home)api[type].replaceHome?.(home.tab);remember(p);pendingPane=p;return true}
 function newChat(type=focus?.type||'codex'){if(!enabled)return false;if(prepare(type))blank(pendingPane);return true}
 function newProjectChat(projectId){if(!enabled)return false;if(!prepare('codex'))return true;pendingProject={key:fadeNativeRouter(document)?.location?.key,pane:pendingPane};if(!adapter.newChat(projectId)){pendingProject=null;announce('未找到项目的新聊天入口')}sync();return true}
 function activate(pane,key){const e=entry(key);if(!e)return;remember(pane);pane.active=key;if(e.home)navigateHome(e);else api[e.type].activate(e.tab);render()}
 function blank(pane){remember(pane);pendingPane=pane;if(pane.type==='gpt'){api.gpt.newChat(true);sync();return}const key='fade-home-'+crypto.randomUUID();api.codex.addHome(key);sync();layout.place(key,pane);activate(pane,key)}
 function add(type){if(!enabled)return;if(layout.panes.length>=4){announce('聊天窗口数量已满');return}try{const pane=layout.add(type);blank(pane);render()}catch(error){announce(error.message)}closeMenu()}
 function closeTab(pane,key){const e=entry(key);if(!e)return;layout.forget(key);if(e.home)homes.delete(key);else api[e.type].close(e.type==='gpt'?e.tab.id:e.tab);if(!pane.tabs.length){layout.remove(pane);if(focus===pane)focus=layout.panes[0]??null}if(!layout.panes.length){const p=layout.add('codex');blank(p)}else if(focus?.active)activate(focus,focus.active);signature='';sync()}
 function closePane(pane){for(const key of [...pane.tabs]){const e=entry(key);layout.forget(key);if(e?.home)homes.delete(key);else if(e)api[e.type].close(e.type==='gpt'?e.tab.id:e.tab)}layout.remove(pane);focus=layout.panes[0]??layout.add('codex');if(focus.active)activate(focus,focus.active);else blank(focus);signature='';sync()}
 function publish(byKey=new Map(entries().map(e=>[e.key,e]))){
  const panes=enabled?layout.panes:[],cols=columns();
  const pages=panes.map(p=>({pane:p,tabs:p.tabs.flatMap(key=>{const e=byKey.get(key);return e?[{id:pageKey(e),active:key===p.active}]:[]})}));
  const structure=JSON.stringify([enabled,pages.map(({pane,tabs})=>[pane.id,tabs])]);
  const geometry=JSON.stringify([enabled,window.innerWidth,cols.map(p=>[p.id,p.weight])]);
  if(structure===lastStructure&&geometry===lastGeometry)return;
  if(structure!==lastStructure){
   const slots={},rules=[],indices=[];
   for(const {pane,tabs} of pages)for(const {id,active} of tabs){
    slots[id]=active?pane.id:'hidden';const selector=`[data-fade-page-key=${JSON.stringify(id)}]`;
    if(active){indices.push({pane,index:rules.length});rules.push(`${selector}{display:flex!important;position:fixed!important;top:85px!important;height:calc(100dvh - 85px)!important;min-width:0!important;flex-direction:column;overflow:hidden;z-index:2;background:var(--fc-bg,var(--color-surface))}`,`${selector}>div{min-width:0;max-width:100%}`)}else rules.push(`${selector}{display:none!important}`);
   }
   pageStyle.textContent=rules.join('\n');geometryRules=indices.map(({pane,index})=>({pane,style:pageStyle.sheet.cssRules[index].style}));
   if((enabled||window.__fadePaneSlots)&&JSON.stringify(window.__fadePaneSlots)!==JSON.stringify(slots)){window.__fadePaneSlots=slots;window.__fadePaneRevision=(window.__fadePaneRevision||0)+1;window.dispatchEvent(new Event('fade-pane-layout'))}
   lastStructure=structure;
  }
  const total=cols.reduce((n,p)=>n+p.weight,0)||1,available=window.innerWidth-Math.max(0,cols.length-1)*5;let left=0;
  for(const p of panes){const width=p.weight/total*available;for(const rule of geometryRules)if(rule.pane===p){if(rule.style.left!==left+'px')rule.style.setProperty('left',left+'px','important');if(rule.style.width!==width+'px')rule.style.setProperty('width',width+'px','important')}left+=width+5}
  preview.layout(enabled,left,previewPane.weight/total*available);lastGeometry=geometry;
 }
 function sync(){if(dead||!enabled)return;if(resetStartup&&api.gpt.ready){resetStartup=false;for(const e of entries())api[e.type].close(e.type==='gpt'?e.tab.id:e.tab);layout.panes.splice(0);focus=layout.add('codex');blank(focus);return}const projectLocation=fadeNativeRouter(document)?.location;if(pendingProject&&projectLocation?.pathname==='/'&&projectLocation.key!==pendingProject.key){const p=pendingProject.pane;pendingProject=null;const key='fade-home-'+crypto.randomUUID();api.codex.addHome(key,projectLocation.state);sync();layout.place(key,p);activate(p,key);return}const all=entries(),keys=new Set(all.map(e=>e.key));
  for(const p of [...layout.panes])for(const key of [...p.tabs])if(!keys.has(key))layout.forget(key);
  for(const e of all)if(!layout.owner(e.key)){let p=pendingPane?.type===e.type?pendingPane:destination(e.type);if(!p){if(layout.panes.length>=4){announce('聊天窗口数量已满');continue}p=layout.add(e.type)}layout.place(e.key,p);pendingPane=null}
  const loc=fadeNativeRouter(document)?.location,route=loc?JSON.stringify([loc.pathname,loc.key]):'';
  if(route&&route!==lastRoute){lastRoute=route;const current=all.find(e=>pageKey(e)===(loc.state?.fadeDraftKey||loc.state?.fadePaneHome||loc.pathname));if(current){const p=layout.owner(current.key);if(p){p.active=current.key;remember(p)}}}
  for(const p of [...layout.panes])if(!p.tabs.length&&p!==pendingPane&&layout.panes.length>1)layout.remove(p);
  render();
 }
 function makeButton(text,label,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.title=label;b.setAttribute('aria-label',label);b.onclick=fn;return b}
 function updateChrome(byKey){
  const previewNode=paneNodes.get('preview');if(previewNode&&previewNode.style.flexGrow!==String(previewPane.weight))previewNode.style.flexGrow=String(previewPane.weight);
  const total=columns().reduce((n,p)=>n+p.weight,0);for(const [i,separator] of [...row.querySelectorAll('[role=separator]')].entries()){const value=String(Math.round(columns()[i].weight/total*100));if(separator.getAttribute('aria-valuenow')!==value)separator.setAttribute('aria-valuenow',value)}
  for(const p of layout.panes){const node=paneNodes.get(p.id);if(!node)continue;if(node.hasAttribute('data-focused')!==(p===focus))node.toggleAttribute('data-focused',p===focus);if(node.style.flexGrow!==String(p.weight))node.style.flexGrow=String(p.weight);
   for(const key of p.tabs){const e=byKey.get(key),ui=tabNodes.get(key);if(!e||!ui)continue;const title=e.tab.title||'新聊天';if(ui.label.textContent!==title){ui.label.textContent=title;ui.select.title=title;ui.select.setAttribute('aria-label',title)}const selected=String(p.active===key);if(ui.select.getAttribute('aria-selected')!==selected)ui.select.setAttribute('aria-selected',selected);
    const status=e.tab.status==='completed'&&e.tab.completionSeen?null:e.tab.status;if(ui.status!==status){ui.status=status;ui.select.querySelector('.fade-tab-status')?.remove();appendCodexTabStatus(document,ui.select,status)}
   }
  }
 }
 function render(){if(resizing)return;const byKey=new Map(entries().map(e=>[e.key,e]));publish(byKey);const key=JSON.stringify([enabled,layout.panes.map(p=>[p.id,p.type,p.tabs]),preview.tabs.map(t=>[t.id,t.title]),preview.active]);if(key===signature){updateChrome(byKey);return}signature=key;row.replaceChildren();paneNodes.clear();tabNodes.clear();button.hidden=!enabled;row.hidden=!enabled;if(!enabled)return;
  layout.panes.forEach((p,index)=>{
   const pane=document.createElement('section');pane.className='fade-window-pane';pane.dataset.pane=p.id;pane.style.flexGrow=String(p.weight);paneNodes.set(p.id,pane);pane.toggleAttribute('data-focused',p===focus);
   const directory=makeButton(p.type==='codex'?'Codex':'GPT','打开聊天目录',()=>{remember(p);chatPicker.openFor(p.type,directory)});directory.className='fade-directory fade-window-directory';pane.append(directory);
   const tabs=document.createElement('div');tabs.className='fade-tabs-scroll fade-window-tabs';const list=document.createElement('div');list.className='fade-gpt-tabs';list.setAttribute('role','tablist');list.setAttribute('aria-label',p.type+' 聊天标签');tabs.append(list);pane.append(tabs);
   for(const id of p.tabs){const e=byKey.get(id);if(!e)continue;const item=document.createElement('div');item.className='fade-gpt-tab';item.draggable=true;
    const select=makeButton('',e.tab.title||'新聊天',()=>activate(p,id));select.className='fade-gpt-select'+(p.type==='codex'?' fade-codex-select':'');select.setAttribute('role','tab');const label=document.createElement('span');label.className='fade-tab-title';select.append(label);const close=makeButton('×','关闭标签',()=>closeTab(p,id));close.className='fade-gpt-close';item.append(select,close);tabNodes.set(id,{label,select});
    item.ondragstart=event=>{drag={key:id,type:p.type,token:crypto.randomUUID()};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('application/x-fade-tab',JSON.stringify({token:drag.token,type:p.type}));event.dataTransfer.setData('text/plain',e.tab.title||'新聊天')};
    item.ondragend=()=>{drag=null};
    item.ondragover=event=>{if(drag?.type===p.type){event.preventDefault();event.dataTransfer.dropEffect='move'}};
    item.ondrop=event=>drop(event,p,id);list.append(item);
   }
   const addTab=makeButton('+','新建聊天',()=>blank(p));addTab.className='fade-gpt-add';tabs.append(addTab);const closePaneButton=makeButton('×','关闭分栏中的所有标签页',()=>closePane(p));closePaneButton.className='fade-gpt-close fade-window-close-pane';pane.append(closePaneButton);
   pane.ondragover=event=>{if(event.dataTransfer.types.includes('application/x-fade-tab')&&drag?.type===p.type){event.preventDefault();event.dataTransfer.dropEffect='move'}};pane.ondrop=event=>drop(event,p);
   row.append(pane);
   if(index<columns().length-1){const separator=document.createElement('div');separator.className='fade-window-divider';separator.tabIndex=0;separator.setAttribute('role','separator');separator.setAttribute('aria-orientation','vertical');separator.setAttribute('aria-label','调整分栏宽度');separator.setAttribute('aria-valuenow',String(Math.round(p.weight/layout.panes.reduce((n,q)=>n+q.weight,0)*100)));separator.onpointerdown=event=>resize(event,p,columns()[index+1],separator);separator.onkeydown=event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const q=columns()[index+1],delta=event.key==='ArrowLeft'?-.08:.08;if(p.weight+delta>.2&&q.weight-delta>.2){p.weight+=delta;q.weight-=delta;render()}};row.append(separator)}
  });
  renderPreview();updateChrome(byKey);if(!previewDirectory.hidden)renderPreviewDirectory();
 }
 function closePreviewDirectory(restoreFocus=false){previewDirectory.hidden=true;const trigger=paneNodes.get('preview')?.querySelector('.fade-window-directory');trigger?.setAttribute('aria-expanded','false');if(restoreFocus)trigger?.focus()}
 function renderPreviewDirectory(){
  const trigger=paneNodes.get('preview')?.querySelector('.fade-window-directory');
  if(!enabled||!trigger||!preview.tabs.length){closePreviewDirectory();return}
  const focused=shadow.activeElement?.dataset.previewId,scroll=previewDirectory.scrollTop;
  previewDirectory.replaceChildren();trigger.setAttribute('aria-expanded','true');
  const heading=document.createElement('div');heading.className='fade-preview-directory-heading';heading.textContent='已打开的预览 · '+preview.tabs.length;heading.setAttribute('role','presentation');previewDirectory.append(heading);
  for(const tab of preview.tabs){
   const item=makeButton(tab.title,tab.title,()=>{closePreviewDirectory();preview.select(tab.id);paneNodes.get('preview')?.querySelector('.fade-window-directory')?.focus()});
   item.dataset.previewId=tab.id;item.setAttribute('role','menuitemradio');item.setAttribute('aria-checked',String(tab.id===preview.active));item.tabIndex=tab.id===preview.active?0:-1;previewDirectory.append(item);
  }
  const rect=trigger.getBoundingClientRect(),width=Math.min(360,window.innerWidth-16);previewDirectory.style.width=width+'px';previewDirectory.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-width-8))+'px';previewDirectory.style.top=(rect.bottom+6)+'px';previewDirectory.style.maxHeight=Math.min(420,Math.max(80,window.innerHeight-rect.bottom-14))+'px';
  previewDirectory.scrollTop=scroll;
  if(focused)[...previewDirectory.querySelectorAll('button')].find(b=>b.dataset.previewId===focused)?.focus({preventScroll:true});
 }
 function togglePreviewDirectory(){
  if(!previewDirectory.hidden){closePreviewDirectory();return}
  previewDirectory.hidden=false;renderPreviewDirectory();const active=previewDirectory.querySelector('[aria-checked="true"]')||previewDirectory.querySelector('button');active?.focus({preventScroll:true});active?.scrollIntoView({block:'nearest'});
 }
 function renderPreview(){if(!preview.tabs.length)return;const pane=document.createElement('section');pane.className='fade-window-pane fade-preview-pane';pane.style.flexGrow=String(previewPane.weight);paneNodes.set('preview',pane);const label=makeButton('预览','打开预览目录',togglePreviewDirectory);label.className='fade-directory fade-window-directory';label.setAttribute('aria-haspopup','menu');label.setAttribute('aria-expanded',String(!previewDirectory.hidden));pane.append(label);const tabs=document.createElement('div');tabs.className='fade-tabs-scroll fade-window-tabs';const list=document.createElement('div');list.className='fade-gpt-tabs';list.setAttribute('role','tablist');tabs.append(list);for(const tab of preview.tabs){const item=document.createElement('div');item.className='fade-gpt-tab';item.dataset.fadePreviewPanel=tab.id;tab.mount.dataset.fadePreviewPanel=tab.id;const select=makeButton('',tab.title,()=>preview.select(tab.id));const title=document.createElement('span');title.className='fade-tab-title';title.textContent=tab.title;select.append(title);select.className='fade-gpt-select';select.setAttribute('role','tab');select.setAttribute('aria-selected',String(preview.active===tab.id));const close=makeButton('×','关闭预览',()=>preview.close(tab.id));close.className='fade-gpt-close';item.append(select,close);list.append(item)}pane.append(tabs);const close=makeButton('×','关闭所有预览',()=>preview.closeAll());close.className='fade-gpt-close fade-window-close-pane';pane.append(close);row.append(pane)}
 function drop(event,p,before){event.preventDefault();event.stopPropagation();let data;try{data=JSON.parse(event.dataTransfer.getData('application/x-fade-tab'))}catch{return}if(!drag||data?.token!==drag.token)return;if(drag.type!==p.type){announce('只能移动到同类型窗口');return}const key=drag.key;drag=null;const from=layout.place(key,p,before?p.tabs.indexOf(before):p.tabs.length);if(from!==p&&!from.tabs.length)layout.remove(from);activate(p,key);signature='';sync()}
 function resize(event,p,q,separator){
  if(event.button!==0)return;event.preventDefault();resizeCleanup?.();resizing=true;separator.setPointerCapture(event.pointerId);
  const x=event.clientX,a=p.weight,b=q.weight,total=columns().reduce((n,v)=>n+v.weight,0),width=innerWidth-Math.max(0,columns().length-1)*5,min=Math.min((a+b)/2,Math.min(240,width/columns().length)/width*total);
  let frame=0,lastX=x,finished=false;const byKey=new Map(entries().map(e=>[e.key,e]));
  const paint=()=>{frame=0;const d=(lastX-x)/width*total;p.weight=Math.max(min,Math.min(a+b-min,a+d));q.weight=a+b-p.weight;publish(byKey);for(const pane of [p,q]){const node=paneNodes.get(pane.id);if(node)node.style.flexGrow=String(pane.weight)}};
  const move=e=>{lastX=e.clientX;if(!frame)frame=globalThis.requestAnimationFrame(paint)};
  const finish=()=>{if(finished)return;finished=true;if(frame){globalThis.cancelAnimationFrame(frame);frame=0;if(!dead)paint()}separator.removeEventListener('pointermove',move);for(const name of ['pointerup','pointercancel','lostpointercapture'])separator.removeEventListener(name,finish);if(separator.hasPointerCapture(event.pointerId))separator.releasePointerCapture(event.pointerId);resizing=false;resizeCleanup=null;if(!dead)render()};
  resizeCleanup=finish;separator.addEventListener('pointermove',move);for(const name of ['pointerup','pointercancel','lostpointercapture'])separator.addEventListener(name,finish);
 }
 function closeMenu(){menu.hidden=true;button.setAttribute('aria-expanded','false')}
 for(const [type,label]of [['codex','新建 Codex 窗口'],['gpt','新建 GPT 窗口']])menu.append(makeButton(label,label,()=>add(type)));
 const openMenu=()=>{if(!enabled)return;for(const item of menu.children){item.disabled=layout.panes.length>=4;item.setAttribute('role','menuitem')}menu.hidden=false;button.setAttribute('aria-expanded','true');const r=button.getBoundingClientRect();menu.style.left=r.left+'px'};on(button,'click',openMenu);on(button,'pointerenter',openMenu);on(menu,'pointerleave',closeMenu);
 on(document,'pointerdown',event=>{if(!event.composedPath().includes(menu)&&!event.composedPath().includes(button))closeMenu()});on(window,'keydown',event=>{if(event.key==='Escape'){drag=null;closeMenu()}});
 on(document,'pointerdown',event=>{const path=event.composedPath();if(!path.includes(previewDirectory)&&!path.includes(paneNodes.get('preview')?.querySelector('.fade-window-directory')))closePreviewDirectory()});
 on(window,'resize',()=>{if(!previewDirectory.hidden)renderPreviewDirectory()});
 on(previewDirectory,'keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closePreviewDirectory(true);return}
  if(event.key==='Tab'){closePreviewDirectory();return}
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  event.preventDefault();const items=[...previewDirectory.querySelectorAll('button')],index=items.indexOf(shadow.activeElement),next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
  items.forEach((item,i)=>item.tabIndex=i===next?0:-1);items[next]?.focus();
 });
 function enterPane(event){const el=event.target.closest?.('[data-fade-page-key]');if(!enabled||!el)return;const e=entries().find(e=>pageKey(e)===el.dataset.fadePageKey),p=e&&layout.owner(e.key);if(p&&p!==focus)activate(p,e.key)}
 // focusin alone cannot distinguish user focus from native editor autofocus.
 // Pointer entry is explicit; keyboard entry is allowed only during native Tab
 // traversal in this event turn, never by a later resize/effect callback.
 let keyboardPaneEntry=false,keyboardEntryTimer=0;
 const clearKeyboardEntry=()=>{keyboardPaneEntry=false;globalThis.clearTimeout(keyboardEntryTimer);keyboardEntryTimer=0};
 on(document,'keydown',event=>{clearKeyboardEntry();if(enabled&&event.isTrusted&&event.key==='Tab'&&!event.altKey&&!event.ctrlKey&&!event.metaKey){keyboardPaneEntry=true;keyboardEntryTimer=globalThis.setTimeout(clearKeyboardEntry,0)}},{capture:true});
 on(document,'pointerdown',event=>{clearKeyboardEntry();enterPane(event)},{capture:true});
 on(document,'focusin',event=>{if(keyboardPaneEntry){clearKeyboardEntry();enterPane(event)}},{capture:true});
 function set(value,persist=true){clearKeyboardEntry();drag=null;resizeCleanup?.();if(value&&(!window.__fadePaneHostSupported||!(window.__fadePaneHostVersion>=2)||!(window.__fadePaneFocusVersion>=1)||!(window.__fadePaneHomeVersion>=1)||!window.__fadePreviewHostSupported||!(window.__fadePreviewHostVersion>=3)||typeof window.__fadeNativeScopeSnapshot!=='function')){announce('窗口模式需要更新运行时，请完整退出后重新启动 FCodex');return false}enabled=!!value;if(enabled&&preview.tabs.length)previewPane.weight=layout.panes.reduce((n,p)=>n+p.weight,0)/2||1;if(enabled&&!interval)interval=globalThis.setInterval(sync,180);if(!enabled&&interval){globalThis.clearInterval(interval);interval=0}host.toggleAttribute('data-window-mode',enabled);root.toggleAttribute('data-fade-window-mode',enabled);if(persist)try{localStorage.setItem('fade-window-mode',''+enabled)}catch{}
  if(enabled&&!layout.panes.length){focus=layout.add('codex');sync();if(!focus.tabs.length)blank(focus)}
  if(!enabled){pendingProject=null;closeMenu();closePreviewDirectory();for(const p of layout.panes)for(const key of p.tabs){const e=entry(key);if(e?.home)homes.delete(key)}layout.panes.splice(0);focus=null}
  window.__fadeWindowModeEnabled=enabled;window.dispatchEvent(new Event('fade-window-mode'));if(!enabled)preview.reset();signature='';render();return true;
 }
 on(window,'resize',()=>{publish();closeMenu()});on(window,'storage',event=>{if(event.key==='fade-window-mode')set(event.newValue==='true',false)});
 try{if(localStorage.getItem('fade-window-mode')==='true')set(true,false)}catch{}render();
 return {get enabled(){return enabled},prepare,newChat,newProjectChat,set,destroy(){clearKeyboardEntry();dead=true;drag=null;resizeCleanup?.();globalThis.clearInterval(interval);enabled=false;window.__fadeWindowModeEnabled=false;window.dispatchEvent(new Event('fade-window-mode'));publish();host.removeAttribute('data-window-mode');root.removeAttribute('data-fade-window-mode');preview.destroy();previewDirectory.remove();row.remove();menu.remove();button.remove();pageStyle.remove()}};
}

// Mirror the native title; keep native controls mounted for the tools drawer.
function installCompactHeader(){
 const hidden=new Set();let pending=0;
 function sync(){
  pending=0;
  const titles=[...document.querySelectorAll('[data-thread-title]')].filter(el=>!el.closest('.app-shell-left-panel,[data-slate-sidebar-content]'));
  const nativeTitle=titles[0];
  const active=document.querySelector('[data-app-action-sidebar-thread-active="true"]');
  const text=nativeTitle?.textContent?.trim()||active?.getAttribute('data-app-action-sidebar-thread-title')||'';
  const label=$('#compactTitle'),display='Codex';if(label.textContent!==display)label.textContent=display;
  label.hidden=false;
  const titlebar=nativeTitle?.closest('[data-app-shell-titlebar],[data-app-shell-tab-row],header,[data-app-shell-header-layout]');
  const bars=titlebar?[titlebar]:[...document.querySelectorAll('[data-app-shell-titlebar]:not([data-app-shell-tab-row="true"])')];
  for(const bar of bars){if(!hidden.has(bar)&&!bar.hasAttribute('data-fade-header-hidden')){hidden.add(bar);bar.setAttribute('data-fade-header-hidden','')}}
 }
 const observer=new MutationObserver(records=>{
  if(!records.some(r=>!host.contains(r.target)))return;
  if(!pending)pending=setTimeout(sync,80);
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-app-action-sidebar-thread-active','data-app-action-sidebar-thread-title']});
 sync();
 return ()=>{observer.disconnect();clearTimeout(pending);for(const el of hidden)el.removeAttribute('data-fade-header-hidden')};
}

function installFullscreenControls(){
 const button=$('#headerFullscreenToggle'),controls=$('#fullscreenWindowControls');
 let nativeFullscreen=false,menuPromise,busy=false,customWindow=false,maximized=false,unsubscribe;
 const windowApi=window.fadeWindowControls;
 const restoreButton=$('#fullscreenRestore');
 function applyWindowState(state){if(!state?.custom)return;customWindow=true;nativeFullscreen=state.fullscreen;maximized=state.maximized;sync()}
 async function windowAction(action){try{applyWindowState(await windowApi.action(action))}catch{announce('窗口操作失败，请重试')}}
 const isFullscreen=()=>nativeFullscreen||!!document.fullscreenElement;
 function sync(){const full=isFullscreen();full?host.setAttribute('data-fullscreen',''):host.removeAttribute('data-fullscreen');button.setAttribute('aria-pressed',String(full));button.title=full?'退出全屏':'全屏';button.setAttribute('aria-label',button.title);controls.hidden=!(full||customWindow);restoreButton.title=full?'退出全屏':maximized?'还原窗口':'最大化';restoreButton.setAttribute('aria-label',restoreButton.title);restoreButton.setAttribute('data-maximized',String(maximized&&!full))}
 async function nativeMenu(){
  if(!menuPromise)menuPromise=(async()=>{
   const url=[...document.querySelectorAll('link[href]')].map(e=>e.href).find(u=>/\/app-shared-[^/]+\.js$/.test(u));
   if(!url)throw Error('Native module unavailable');
   const module=await import(url),api=Object.values(module).find(v=>v&&typeof v==='object'&&v.applicationMenu)?.applicationMenu;
   if(!api)throw Error('Native menu unavailable');return api;
  })().catch(error=>{menuPromise=null;throw error});return menuPromise;
 }
 async function toggle(){
  if(busy)return;busy=true;
  try{
   if(customWindow)await windowAction('fullscreen');
   else if(document.fullscreenElement)await document.exitFullscreen();
   else if(window.electronBridge){const api=await nativeMenu(),snapshot=await api.getSnapshot();const item=snapshot['view-menu']?.find(i=>i.accelerator==='F11');if(!item?.enabled)throw Error('Fullscreen action unavailable');await api.invokeItem(item.nativeCommandId)}
   else await document.documentElement.requestFullscreen();
  }catch{announce('全屏切换失败，请使用 F11 重试')}finally{busy=false;sync()}
 }
 on(button,'click',toggle);
 on($('#fullscreenRestore'),'click',()=>{if(customWindow)void windowAction('maximize');else if(isFullscreen())void toggle()});
 for(const action of ['minimize','close'])on($('#fullscreen'+(action==='minimize'?'Minimize':'Close')),'click',()=>{
  if(customWindow)void windowAction(action);else if(typeof window.__fadeWindowAction==='function')window.__fadeWindowAction(JSON.stringify({action,title:document.title}));else announce('窗口控制尚未连接，请重新运行 Fade 启动器');
 });
 on(window,'message',event=>{if(event.data?.type==='window-fullscreen-changed'){nativeFullscreen=event.data.isFullScreen===true;window.__fadeNativeFullscreen=nativeFullscreen;sync()}});
 on(document,'fullscreenchange',sync);
 on(window,'fade-window-action-error',()=>announce('窗口操作失败，请使用系统窗口菜单重试'));
 on(window,'keydown',event=>{if(event.key==='Escape'&&nativeFullscreen&&!event.defaultPrevented){event.preventDefault();void toggle()}});
 // Native fullscreen can already be active when the theme is reinjected.
 nativeFullscreen=window.__fadeNativeFullscreen??(!!window.screen&&Math.abs(window.outerHeight-window.screen.height)<2&&Math.abs(window.outerWidth-window.screen.width)<2);
 if(windowApi){unsubscribe=windowApi.subscribe(applyWindowState);void windowApi.action('state').then(applyWindowState).catch(()=>{})}
 sync();return ()=>{unsubscribe?.();host.removeAttribute('data-fullscreen')};
}




function installFadeSettings(){
 const button=document.createElement('button');button.type='button';button.className='header-settings-toggle';button.id='fadeSettingsToggle';button.title='Fade 设置';button.setAttribute('aria-label','Fade 设置');button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','fadeSettingsMenu');
 button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-.7 2.3-2 .9L4 5.8 2 9.2l1.7 1.7v2.2L2 14.8l2 3.4 2.3-.4 2 .9L9 21h6l.7-2.3 2-.9 2.3.4 2-3.4-1.7-1.7v-2.2L22 9.2l-2-3.4-2.3.4-2-.9L15 3Z"/><circle cx="12" cy="12" r="3"/></svg>';
 const menu=document.createElement('section');menu.id='fadeSettingsMenu';menu.className='fade-settings-menu';menu.hidden=true;menu.setAttribute('role','menu');menu.setAttribute('aria-label','Fade 设置');
 menu.innerHTML='<div class="fade-settings-title">Fade 设置</div><button type="button" role="menuitem" aria-haspopup="menu" class="fade-permissions"><span>权限模式</span><span class="fade-permission-value"></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>';
 shadow.append(button,menu);const item=menu.querySelector('button'),value=menu.querySelector('.fade-permission-value');
 const startup=document.createElement('button');startup.type='button';startup.className='fade-startup-fullscreen';startup.setAttribute('role','menuitemcheckbox');startup.setAttribute('aria-checked','false');startup.setAttribute('aria-label','启动全屏');startup.title='下次启动生效，启动动画和应用均使用全屏';startup.innerHTML='<span>启动全屏</span><span class="fade-setting-switch" aria-hidden="true"></span>';startup.disabled=true;menu.append(startup);
 const quit=document.createElement('button');quit.type='button';quit.className='fade-startup-fullscreen';quit.setAttribute('role','menuitemcheckbox');quit.setAttribute('aria-checked','false');quit.setAttribute('aria-label','关闭窗口退出进程');quit.title=window.fadeWindowControls?.closeToQuitSupported?'立即生效；有运行中的任务时先确认':'首次安装此功能后，请退出并重新启动 Fade';quit.innerHTML='<span>关闭窗口退出进程</span><span class="fade-setting-switch" aria-hidden="true"></span>';quit.disabled=true;menu.append(quit);
 let settingsDead=false;
 const windowToggle=document.createElement('button');windowToggle.type='button';windowToggle.className='fade-startup-fullscreen';windowToggle.setAttribute('role','menuitemcheckbox');windowToggle.setAttribute('aria-label','窗口模式');windowToggle.setAttribute('aria-checked',String(windowMode.enabled));windowToggle.innerHTML='<span>窗口模式</span><span class="fade-setting-switch" aria-hidden="true"></span>';menu.append(windowToggle);on(windowToggle,'click',()=>{windowMode.set(!windowMode.enabled);windowToggle.setAttribute('aria-checked',String(windowMode.enabled))});
 async function readStartup(){if(!window.fadeStartupPreferences)return;try{const prefs=await window.fadeStartupPreferences.get();if(settingsDead)return;startup.setAttribute('aria-checked',String(prefs.startupFullscreen));startup.disabled=false;quit.setAttribute('aria-checked',String(prefs.closeToQuit===true));quit.disabled=!window.fadeWindowControls?.closeToQuitSupported}catch(error){if(!settingsDead)announce('启动设置读取失败：'+error.message)}}
 on(window,'fade-startup-preferences-ready',readStartup);void readStartup();
 on(startup,'click',async()=>{if(startup.disabled)return;startup.disabled=true;try{const prefs=await window.fadeStartupPreferences.set(startup.getAttribute('aria-checked')!=='true');if(!settingsDead)startup.setAttribute('aria-checked',String(prefs.startupFullscreen))}catch(error){if(!settingsDead)announce('启动设置保存失败：'+error.message)}finally{if(!settingsDead)startup.disabled=false}});
 on(quit,'click',async()=>{if(quit.disabled)return;quit.disabled=true;try{const prefs=await window.fadeStartupPreferences.set({closeToQuit:quit.getAttribute('aria-checked')!=='true'});if(!settingsDead)quit.setAttribute('aria-checked',String(prefs.closeToQuit))}catch(error){if(!settingsDead)announce('退出设置保存失败：'+error.message)}finally{if(!settingsDead)quit.disabled=false}});
 const displayEntry=document.createElement('button');displayEntry.type='button';displayEntry.className='fade-startup-fullscreen fade-settings-group-entry';displayEntry.setAttribute('role','menuitem');displayEntry.setAttribute('aria-expanded','false');displayEntry.setAttribute('aria-controls','fadeDisplaySettings');displayEntry.innerHTML='<span>显示设置</span><span class="fade-settings-chevron" aria-hidden="true">›</span>';menu.append(displayEntry);
 const displayGroup=document.createElement('div');displayGroup.id='fadeDisplaySettings';displayGroup.className='fade-settings-group';displayGroup.hidden=true;displayGroup.setAttribute('role','group');displayGroup.setAttribute('aria-label','显示设置');menu.append(displayGroup);
 function collapseDisplay(){displayGroup.hidden=true;displayEntry.setAttribute('aria-expanded','false')}
 on(displayEntry,'click',()=>{displayGroup.hidden=!displayGroup.hidden;displayEntry.setAttribute('aria-expanded',String(!displayGroup.hidden))});
 on(displayGroup,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();collapseDisplay();displayEntry.focus()}});
 const usage=document.createElement('button');usage.type='button';usage.className='fade-startup-fullscreen';usage.setAttribute('role','menuitemcheckbox');usage.setAttribute('aria-label','小球显示账户额度');usage.setAttribute('aria-checked',String(orbUsage.enabled));usage.innerHTML='<span>小球显示账户额度</span><span class="fade-setting-switch" aria-hidden="true"></span>';displayGroup.append(usage);on(usage,'click',()=>{orbUsage.set(!orbUsage.enabled);usage.setAttribute('aria-checked',String(orbUsage.enabled))});
 const autohide=document.createElement('button');autohide.type='button';autohide.className='fade-startup-fullscreen';autohide.setAttribute('role','menuitemcheckbox');autohide.setAttribute('aria-label','输入框自动隐藏');autohide.setAttribute('aria-checked',String(composerAutohide.enabled));autohide.innerHTML='<span>输入框自动隐藏</span><span class="fade-setting-switch" aria-hidden="true"></span>';displayGroup.append(autohide);on(autohide,'click',()=>{composerAutohide.set(!composerAutohide.enabled);autohide.setAttribute('aria-checked',String(composerAutohide.enabled))});
 const wslEntry=document.createElement('button');wslEntry.type='button';wslEntry.className='fade-startup-fullscreen fade-settings-group-entry';wslEntry.setAttribute('role','menuitem');wslEntry.setAttribute('aria-expanded','false');wslEntry.setAttribute('aria-controls','fadeWslSettings');wslEntry.innerHTML='<span>WSL 设置</span><span class="fade-settings-chevron" aria-hidden="true">›</span>';menu.append(wslEntry);
 const wslGroup=document.createElement('div');wslGroup.id='fadeWslSettings';wslGroup.className='fade-settings-group';wslGroup.hidden=true;wslGroup.setAttribute('role','group');wslGroup.setAttribute('aria-label','WSL 设置');wslEntry.title='面向在 WSL 中运行 Codex 的用户。';menu.append(wslGroup);
 function collapseWsl(){wslGroup.hidden=true;wslEntry.setAttribute('aria-expanded','false')}
 on(wslEntry,'click',()=>{wslGroup.hidden=!wslGroup.hidden;wslEntry.setAttribute('aria-expanded',String(!wslGroup.hidden))});
 on(wslGroup,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();collapseWsl();wslEntry.focus()}});
 const wslPaths=document.createElement('button');wslPaths.type='button';wslPaths.className='fade-startup-fullscreen';wslPaths.setAttribute('role','menuitemcheckbox');wslPaths.setAttribute('aria-label','图片附件路径转换');wslPaths.setAttribute('aria-checked',String(wslImagePaths.enabled));wslPaths.title='发送图片附件时转换为 WSL 的 /mnt/ 路径；仅在本机 Codex 使用默认挂载目录的 WSL 时开启，预览保持原样';wslPaths.innerHTML='<span>图片附件路径转换</span><span class="fade-setting-switch" aria-hidden="true"></span>';wslGroup.append(wslPaths);on(wslPaths,'click',()=>{try{wslImagePaths.set(!wslImagePaths.enabled);wslPaths.setAttribute('aria-checked',String(wslImagePaths.enabled))}catch(error){announce(error.message)}});
 const codeWrap=document.createElement('button');codeWrap.type='button';codeWrap.className='fade-startup-fullscreen';codeWrap.setAttribute('role','menuitemcheckbox');codeWrap.setAttribute('aria-label','预览器代码自动换行');codeWrap.setAttribute('aria-checked',String(previewCodeWrap.enabled));codeWrap.title='关闭后，长代码行可横向滚动查看';codeWrap.innerHTML='<span>预览器代码自动换行</span><span class="fade-setting-switch" aria-hidden="true"></span>';displayGroup.append(codeWrap);on(codeWrap,'click',()=>{previewCodeWrap.set(!previewCodeWrap.enabled);codeWrap.setAttribute('aria-checked',String(previewCodeWrap.enabled))});
 const appearanceEntry=document.createElement('button');appearanceEntry.type='button';appearanceEntry.className='fade-startup-fullscreen fade-settings-group-entry';appearanceEntry.setAttribute('role','menuitem');appearanceEntry.setAttribute('aria-expanded','false');appearanceEntry.setAttribute('aria-controls','fadeAppearanceSettings');appearanceEntry.innerHTML='<span>外观</span><span class="fade-settings-chevron" aria-hidden="true">›</span>';menu.append(appearanceEntry);
 const appearanceGroup=document.createElement('div');appearanceGroup.id='fadeAppearanceSettings';appearanceGroup.className='fade-settings-group';appearanceGroup.hidden=true;appearanceGroup.setAttribute('role','group');appearanceGroup.setAttribute('aria-label','外观');menu.append(appearanceGroup);
 function collapseAppearance(){appearanceGroup.hidden=true;appearanceEntry.setAttribute('aria-expanded','false')}
 on(appearanceEntry,'click',()=>{appearanceGroup.hidden=!appearanceGroup.hidden;appearanceEntry.setAttribute('aria-expanded',String(!appearanceGroup.hidden))});
 on(appearanceGroup,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();collapseAppearance();appearanceEntry.focus()}});
 const accent=document.createElement('button');accent.type='button';accent.className='fade-startup-fullscreen';accent.setAttribute('role','menuitem');accent.setAttribute('aria-label','应用FCodex推荐主题');accent.title='应用原生 Catppuccin 亮色、暗色及代码主题，保留字体、对比度和窗口透明设置';accent.innerHTML='<span>应用FCodex推荐主题</span>';appearanceGroup.append(accent);
 on(accent,'click',async()=>{if(accent.disabled)return;accent.disabled=true;const label=accent.querySelector('span');label.textContent='应用中…';try{await nativeTheme.applyCatppuccinTheme();if(!settingsDead)announce('已应用原生 Catppuccin 主题')}catch(error){if(!settingsDead)announce('主题应用失败：'+error.message)}finally{if(!settingsDead){accent.disabled=false;label.textContent='应用FCodex推荐主题'}}});
 const classic=document.createElement('button');classic.type='button';classic.className='fade-classic-mode';classic.setAttribute('role','menuitem');classic.innerHTML='<span>返回经典模式</span><kbd class="fade-setting-shortcut">Ctrl+Shift+L</kbd>';classic.setAttribute('aria-keyshortcuts','Control+Shift+L');classic.title='仅本次恢复原生界面；关闭所有 GPT 标签，回复完成后释放缓存';menu.append(classic);
 const backgrounds=document.createElement('button');backgrounds.type='button';backgrounds.className='fade-startup-fullscreen';backgrounds.setAttribute('role','menuitem');backgrounds.setAttribute('aria-haspopup','dialog');backgrounds.textContent='正文背景';appearanceGroup.append(backgrounds);on(backgrounds,'click',()=>{close();backgroundSettings.open()});
 on(classic,'click',()=>{close();returnToClassicMode()});
 on(window,'keydown',event=>{if(!isFadeClassicShortcut(event))return;event.preventDefault();event.stopImmediatePropagation();close();void returnToClassicMode()},{capture:true});
 let activeNative=null,popup=null;const positioned=new Map();
 function positionOptions(){
  popup=activeNative?.getAttribute('aria-expanded')==='true'?document.getElementById(activeNative.getAttribute('aria-controls')):null;
  item.setAttribute('aria-expanded',String(!!popup));
  if(!popup||menu.hidden)return;
  const wrapper=popup.closest('[data-radix-popper-content-wrapper]')||popup;
  if(!positioned.has(wrapper))positioned.set(wrapper,wrapper.getAttribute('style'));
  // Settings lives in the high-z shadow host; its native submenu is a body portal.
  wrapper.style.setProperty('z-index','2147483004','important');
  const anchor=menu.getBoundingClientRect(),size=popup.getBoundingClientRect(),gap=10;
  const left=anchor.left-size.width-gap;
  // On narrow windows, stack below instead of covering the settings card.
  const x=left>=8?left:Math.max(8,Math.min(anchor.left,window.innerWidth-size.width-8));
  const y=left>=8?Math.max(8,Math.min(anchor.top,window.innerHeight-size.height-8)):anchor.bottom+gap;
  wrapper.style.setProperty('position','fixed','important');wrapper.style.setProperty('left','0','important');wrapper.style.setProperty('top','0','important');wrapper.style.setProperty('transform',`translate(${x}px, ${y}px)`,'important');
 }
 function source(){return [...document.querySelectorAll('[data-codex-composer-root] [data-composer-navigation-target=permissions]')].find(el=>!el.closest('[hidden],[inert],[data-app-shell-active-page="false"]')&&el.getClientRects().length)}
 function sync(){wslPaths.setAttribute('aria-checked',String(wslImagePaths.enabled));codeWrap.setAttribute('aria-checked',String(previewCodeWrap.enabled));windowToggle.setAttribute('aria-checked',String(windowMode.enabled));usage.setAttribute('aria-checked',String(orbUsage.enabled));autohide.setAttribute('aria-checked',String(composerAutohide.enabled));const native=source();item.disabled=!native||native.disabled||native.getAttribute('aria-disabled')==='true';value.textContent=native?.textContent.trim()||'当前页面不可用'}
 function close(focus=false){collapseWsl();collapseAppearance();collapseDisplay();if(popup)popup.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));popup=null;activeNative=null;item.setAttribute('aria-expanded','false');menu.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus()}
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
 return {get enabled(){return enabled},set(value,persist=true){enabled=value;if(persist)try{localStorage.setItem('fade-orb-usage',String(value))}catch{}render();if(value)void refresh()},destroy(){dead=true;clearInterval(timer);unsubscribe();badge.remove();if(oldTitle===null)orb.removeAttribute('title');else orb.title=oldTitle}};
}

function installComposerAutohide(){
 const key='fade-composer-autohide',marked=new Set();
 let enabled=false,dead=false,frame=0,timer=0,mouse=null,composing=false;
 try{enabled=localStorage.getItem(key)==='true'}catch{}
 function mark(el,name,value){if(el.getAttribute(name)!==value)el.setAttribute(name,value)}
 function clear(){for(const el of marked){el.removeAttribute('data-fade-autohide-footer');el.removeAttribute('data-fade-composer-visible')}marked.clear()}
 function refresh(){
  frame=0;if(dead)return;
  root.toggleAttribute('data-fade-composer-autohide',enabled);
  if(!enabled){clear();return}
  const footers=[...document.querySelectorAll('[data-thread-scroll-footer]')].filter(el=>el.querySelector('[data-codex-composer-root]'));
  for(const composer of document.querySelectorAll('[data-codex-composer-root][data-composer-placement=home]')){const footer=composer.closest('.z-20');if(footer&&!footers.includes(footer))footers.push(footer)}
  for(const el of [...marked])if(!footers.includes(el)){el.removeAttribute('data-fade-autohide-footer');el.removeAttribute('data-fade-composer-visible');marked.delete(el)}
  for(const footer of footers){
   marked.add(footer);mark(footer,'data-fade-autohide-footer','');
   const box=footer.getBoundingClientRect(),area=footer.closest('.thread-scroll-container')?.getBoundingClientRect();
   const bottom=area?.bottom??window.innerHeight;
   // Include the scroll-to-bottom button and the gap above the expanded composer.
   const scrollButton=footer.querySelector('button[class~="group/scroll-to-bottom"]');
   const scrollBox=scrollButton?.getBoundingClientRect();
   const keepTop=scrollBox?.height?Math.min(box.top,scrollBox.top-8):box.top-64;
   const near=mouse&&mouse.x>=box.left&&mouse.x<=box.right&&mouse.y>=bottom-40&&mouse.y<=bottom;
   const over=mouse&&footer.getAttribute('data-fade-composer-visible')==='true'&&(footer.matches(':hover')||(mouse.x>=box.left&&mouse.x<=box.right&&mouse.y>=keepTop&&mouse.y<=bottom));
   const focus=footer.contains(document.activeElement);
   const popup=[...footer.querySelectorAll('[aria-expanded=true],[data-state=open]')].some(el=>el.getClientRects().length);
   const portal=[...document.querySelectorAll('[role=menu],[role=listbox],[role=dialog],[data-radix-popper-content-wrapper]')].some(el=>el.getClientRects().length&&!el.closest('[hidden],[data-state=closed]'));
   const keep=near||over||focus||popup||(footer.getAttribute('data-fade-composer-visible')==='true'&&(portal||composing));
   mark(footer,'data-fade-composer-visible',String(!!keep));
  }
 }
 function schedule(){if(!dead&&!frame)frame=requestAnimationFrame(refresh)}
 function move(event){mouse={x:event.clientX,y:event.clientY};clearTimeout(timer);timer=setTimeout(schedule,180);if(event.clientY>=window.innerHeight-48)schedule();else if([...marked].some(el=>el.getAttribute('data-fade-composer-visible')!=='true'))schedule()}
 on(document,'pointermove',move,{passive:true});
 on(document,'pointerleave',()=>{mouse=null;clearTimeout(timer);timer=setTimeout(schedule,350)});
 on(document,'focusin',schedule);on(document,'focusout',schedule);
 on(document,'pointerdown',event=>{if(!enabled)return;const active=document.activeElement;if([...marked].some(el=>el.contains(active))&&!event.target.closest('[data-fade-autohide-footer],[role=menu],[role=listbox],[role=dialog],[data-radix-popper-content-wrapper]')){active.blur();schedule()}},{capture:true});
 on(document,'compositionstart',()=>{composing=true;schedule()});on(document,'compositionend',()=>{composing=false;schedule()});
 on(window,'blur',()=>{mouse=null;schedule()});on(window,'resize',schedule);
 const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-expanded','data-state','data-app-shell-active-page','hidden']});
 refresh();
 return {get enabled(){return enabled},set(value,persist=true){enabled=!!value;if(persist)try{localStorage.setItem(key,String(enabled))}catch{}refresh()},destroy(){dead=true;observer.disconnect();clearTimeout(timer);if(frame)cancelAnimationFrame(frame);clear();root.removeAttribute('data-fade-composer-autohide')}};
}

function fadeWslAttachmentPath(path){
 if(typeof path!=='string')return path;
 const match=/^([a-z]):[\\/](.*)$/i.exec(path);
 return match?'/mnt/'+match[1].toLowerCase()+'/'+match[2].replace(/\\/g,'/'):path;
}
// Copy submission data only: never modify the composer attachments or preview src.
function fadeWslAttachmentArguments(args){
 const paths=new Map(),seen=new WeakMap();
 function visit(value,key='',depth=0){
  if(!value||typeof value!=='object'||depth>24)return value;
  if(seen.has(value))return seen.get(value);
  if(!Array.isArray(value)&&Object.getPrototypeOf(value)!==Object.prototype)return value;
  const copy=Array.isArray(value)?[]:{...value};seen.set(value,copy);
  let changed=false;
  for(const [k,v]of Object.entries(value)){
   let next=v;
   if((k==='localPath'&&key==='imageAttachments')||(k==='path'&&value.type==='localImage')||(['path','fsPath'].includes(k)&&value.isImageAttachment===true)){
    next=fadeWslAttachmentPath(v);if(next!==v){paths.set(v,next);paths.set(v.replace(/\\/g,'/'),next)}
   }else if(k!=='src'&&k!=='prompt'&&k!=='text')next=visit(v,Array.isArray(value)?key:k,depth+1);
   copy[k]=next;if(next!==v)changed=true;
  }
  const result=changed?copy:value;seen.set(value,result);return result;
 }
 const result=visit(args);
 // Native already-serialized follow-ups can include a generated image file list.
 // Change only the path on image-attachment headings, never user prose.
 function metadata(value,depth=0){
  if(!value||typeof value!=='object'||depth>24)return value;
  if(!Array.isArray(value)&&Object.getPrototypeOf(value)!==Object.prototype)return value;
  if(value.type==='text'&&typeof value.text==='string'){
   const text=value.text.replace(/(^## [^\r\n]*: )([^\r\n]+)(\r?\nImage attachment: true(?:\r?\n|$))/gm,(all,prefix,path,suffix)=>paths.has(path)?prefix+paths.get(path)+suffix:all);
   return text===value.text?value:{...value,text};
  }
  let changed=false;const copy=Array.isArray(value)?[]:{...value};
  for(const [k,v]of Object.entries(value)){const next=metadata(v,depth+1);copy[k]=next;if(next!==v)changed=true}
  return changed?copy:value;
 }
 return paths.size?metadata(result):result;
}
// The native composer submits through a returned coordinator. Convert the prepared
// execution payload, not the queued message or its Windows-backed preview context.
function fadeWrapWslTurnCoordinator(service,enabled){
 const functions=new Map();
 return new Proxy(service,{get(target,key){
  if(key==='__fadeWslTurnCoordinator')return true;
  const value=Reflect.get(target,key,target);
  if(typeof value!=='function')return value;
  if(functions.has(key))return functions.get(key);
  const wrapped=(...args)=>{
   const index=key==='sendMessage'?1:key==='sendQueuedMessageNow'?3:-1;
   if(index>=0&&typeof args[index]==='function'){
    const prepare=args[index];
    args[index]=async function(...input){
     const result=await Reflect.apply(prepare,this,input);
     // Execution host can differ from the manager host (for example remote work).
     return enabled()&&result?.executionHostId==='local'?fadeWslAttachmentArguments(result):result;
    };
   }
   const result=Reflect.apply(value,target,args);
   return key==='dup'?fadeWrapWslTurnCoordinator(result,enabled):result;
  };
  functions.set(key,wrapped);return wrapped;
 }});
}
function fadeWrapWslAttachmentService(service,enabled,cache=new WeakMap()){
 if(cache.has(service))return cache.get(service);
 const methods=new Set(['startConversation','startTurn','startTurnWithOutcome','sendFollowUpMessage','steerTurn','editLastUserTurn','startEmptyTurn']);
 const functions=new Map();
 const proxy=new Proxy(service,{get(target,key){
  if(key==='__fadeWslAttachmentBridge')return true;
  const value=Reflect.get(target,key,target);
  if(typeof value!=='function')return value;
  if(functions.has(key))return functions.get(key);
  const wrapped=(...args)=>{const result=Reflect.apply(value,target,methods.has(key)&&enabled()?fadeWslAttachmentArguments(args):args);return key==='getTurnCoordinator'?Promise.resolve(result).then(coordinator=>fadeWrapWslTurnCoordinator(coordinator,enabled)):key==='dup'?fadeWrapWslAttachmentService(result,enabled,cache):result};
  functions.set(key,wrapped);return wrapped;
 }});cache.set(service,proxy);return proxy;
}
function installWslImagePaths(doc=document,win=window){
 const key='fade-wsl-image-attachments';let enabled=false,dead=false,ready=false,timer=0,unwatch=null;
 const installed=new Map(),cache=new WeakMap();
 try{enabled=win.localStorage.getItem(key)==='true';win.localStorage.removeItem('fade-wsl-image-paths')}catch{}
 function hook(provider){
  if(!provider||typeof provider.forHost!=='function')return;
  if(installed.has(provider)){ready=provider.forHost===installed.get(provider).wrapper;return}
  const original=provider.forHost;
  function wrapper(host,...args){const service=Reflect.apply(original,this,[host,...args]);return host==='local'?fadeWrapWslAttachmentService(service,()=>!dead&&enabled,cache):service}
  try{provider.forHost=wrapper;if(provider.forHost!==wrapper)return;installed.set(provider,{original,wrapper});ready=true}catch{}
 }
 async function init(){
  try{
   const links=[...doc.querySelectorAll('link[href]')],initial=links.find(l=>/app-initial-.*\.js$/.test(l.href)),shared=links.find(l=>/app-shared-.*\.js$/.test(l.href));
   if(!initial||!shared)throw Error('native modules unavailable');
   const [module,common]=await Promise.all([import(initial.href),import(shared.href)]);if(dead)return;
   if(!module.JPr||typeof module.YPr!=='function')throw Error('unsupported attachment RPC');
   let scope;
   for(const button of doc.querySelectorAll('button')){let fiber=button[Object.keys(button).find(k=>k.startsWith('__reactFiber$'))];for(let d=0;fiber&&d<40;d++,fiber=fiber.return)for(let h=fiber.memoizedState;h&&typeof h==='object';h=h.next){const candidate=h.memoizedState?.current;if(candidate?.scope===common.Cot&&typeof candidate.get==='function'){scope=candidate;break}}if(scope)break}
   if(!scope)throw Error('native scope unavailable');
   const sync=()=>{ready=false;hook(scope.get(module.JPr))};sync();
   if(typeof scope.watch==='function')unwatch=scope.watch(({get})=>{const provider=get(module.JPr);if(!dead){ready=false;hook(provider)}});
  }catch(error){if(!dead)timer=win.setTimeout(init,2000)}
 }
 function storage(event){if(event.key===key||event.key===null)try{enabled=win.localStorage.getItem(key)==='true'}catch{enabled=false}}
 win.addEventListener('storage',storage);void init();
 return {get enabled(){return enabled},get ready(){return ready},set(value){if(value&&!ready)throw Error('原生附件接口尚未就绪，请稍后重试');enabled=!!value;try{win.localStorage.setItem(key,String(enabled))}catch{}},destroy(){dead=true;ready=false;win.clearTimeout(timer);unwatch?.();win.removeEventListener('storage',storage);for(const [provider,{original,wrapper}]of installed)if(provider.forHost===wrapper)provider.forHost=original;installed.clear()}};
}

// Fade the transcript, never the paper or the composer. Native DOM and scroll
// geometry remain intact. Bounds follow footer resize, scroll and autohide.
function installPaperSurface(doc=document){
 const win=doc.defaultView,entries=new Map();let frame=0,dead=false;
 const schedule=()=>{if(!dead&&!frame)frame=win.requestAnimationFrame(update)};
 // Retained GPT pages restore their transcript height and scroll offset in
 // separate commits. Do not paint either commit with the previous mask bounds.
 function refresh(){if(dead)return;if(frame){win.cancelAnimationFrame(frame);frame=0}update()}
 function clear(entry){entry.content.removeAttribute('data-fade-paper-transcript');for(const key of ['top','solid','end','cut'])entry.content.style.removeProperty('--fc-paper-'+key);entry.scroll.removeAttribute('data-fade-paper-ready');}
 const resize=new win.ResizeObserver(refresh);
 function update(){
  frame=0;if(dead)return;
  const scrolls=new Set(doc.querySelectorAll('.thread-scroll-container'));
  for(const [scroll,entry]of entries)if(!scrolls.has(scroll)||scroll.firstElementChild!==entry.content||scroll.querySelector('[data-thread-scroll-footer]')!==entry.footer){clear(entry);resize.unobserve(scroll);resize.unobserve(entry.content);if(entry.footer)resize.unobserve(entry.footer);scroll.removeEventListener('scroll',refresh);entries.delete(scroll)}
  for(const scroll of scrolls){
   const content=scroll.firstElementChild,footer=scroll.querySelector('[data-thread-scroll-footer]');
   if(!content||content===footer||!content.className.includes('thread-content'))continue;
   let entry=entries.get(scroll);
   if(!entry){entry={scroll,content,footer};entries.set(scroll,entry);resize.observe(scroll);resize.observe(content);if(footer)resize.observe(footer);scroll.addEventListener('scroll',refresh,{passive:true})}
   const viewport=scroll.getBoundingClientRect(),body=content.getBoundingClientRect();if(!viewport.height||!body.height)continue;
   const hidden=footer?.getAttribute('data-fade-composer-visible')==='false';
   const foot=footer?.getBoundingClientRect();
   const end=Math.max(0,Math.min(body.height,(foot&&!hidden&&foot.height?Math.min(foot.top,viewport.bottom):viewport.bottom)-body.top));
   const top=Math.max(0,viewport.top-body.top),solid=Math.max(top, end-24);
   for(const [key,value]of Object.entries({top,solid,end,cut:Math.max(0,body.height-end)}))content.style.setProperty('--fc-paper-'+key,value.toFixed(2)+'px');
   content.setAttribute('data-fade-paper-transcript','');scroll.setAttribute('data-fade-paper-ready','');
  }
 }
 const observer=new win.MutationObserver(refresh);
 observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-fade-composer-visible','hidden','data-app-shell-active-page']});
 win.addEventListener('resize',schedule);update();
 return ()=>{dead=true;if(frame)win.cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();win.removeEventListener('resize',schedule);for(const entry of entries.values()){entry.scroll.removeEventListener('scroll',refresh);clear(entry)}entries.clear()};
}

function createFadeBackgroundStore(win){
 let database=null,stopped=false;
 const ready=new Promise((resolve,reject)=>{
  const request=win.indexedDB.open('fcodex-backgrounds',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('themes');
  request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(Error('请关闭其他旧版 FCodex 窗口后重试'));
  request.onsuccess=()=>{if(stopped){request.result.close();reject(Error('设置已关闭'));return}database=request.result;database.onversionchange=()=>database.close();resolve(database)};
 });
 async function transact(mode,value){
  const db=await ready;if(stopped)throw Error('设置已关闭');
  return new Promise((resolve,reject)=>{const tx=db.transaction('themes',value===undefined?'readonly':'readwrite'),store=tx.objectStore('themes');const request=value===undefined?store.get(mode):store.put(value,mode);tx.oncomplete=()=>resolve(request.result);tx.onabort=tx.onerror=()=>reject(tx.error||Error('本机存储不可用'));});
 }
 return {read:mode=>transact(mode),write:(mode,value)=>transact(mode,value),close(){stopped=true;database?.close()}};
}
function normalizeFadeBackground(value){
 const v=value&&typeof value==='object'?value:{};
 const image=typeof v.image==='string'&&v.image.length<14000000&&/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v.image)?v.image:'';
 const bound=(k,a,b,d)=>Number.isFinite(v[k])?Math.max(a,Math.min(b,v[k])):d;
 return {rotation:bound('rotation',-180,180,0),x:bound('x',-100,100,0),y:bound('y',-100,100,0),zoom:bound('zoom',25,300,100),blur:bound('blur',0,30,0),kind:['solid','paper','custom'].includes(v.kind)&&!(v.kind==='custom'&&!image)?v.kind:'paper',image,name:typeof v.name==='string'?v.name.slice(0,160):'',strength:Number.isFinite(v.strength)?Math.max(0,Math.min(100,v.strength)):35,fit:v.fit==='tile'?'tile':'cover'};
}
async function prepareFadeBackground(file,win){
 if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('请选择 PNG、JPG 或 WebP 图片');
 if(file.size>10*1024*1024)throw Error('图片需小于 10 MB');
 const url=win.URL.createObjectURL(file),image=new win.Image();
 try{
  image.src=url;await image.decode();
  if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40000000)throw Error('图片尺寸过大，请选择不超过 4000 万像素的图片');
  const scale=Math.min(1,2560/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=win.document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  return {image:canvas.toDataURL('image/webp',.86),name:file.name};
 }catch(error){throw Error(error.message.includes('像素')?error.message:'图片无法读取，请换一张有效的 PNG、JPG 或 WebP 图片')}
 finally{win.URL.revokeObjectURL(url)}
}
function installBackgroundSettings({doc=document,shadow,announce=()=>{}}){
 const win=doc.defaultView,root=doc.documentElement,store=createFadeBackgroundStore(win),controller=new win.AbortController();
 const on=(el,event,fn)=>el.addEventListener(event,fn,{signal:controller.signal});
 const state={light:normalizeFadeBackground(),dark:normalizeFadeBackground()};let presets=[];let dead=false,loaded=false,busy=false,returnFocus=null;
 const original=root.getAttribute('data-fade-background');
 const keys=['--fc-custom-background','--fc-custom-wash','--fc-custom-size','--fc-custom-repeat','--fc-custom-transform','--fc-custom-blur','--fc-custom-opacity'];
 const originalStyles=keys.map(key=>[key,root.style.getPropertyValue(key),root.style.getPropertyPriority(key)]);
 const overlay=doc.createElement('div');overlay.className='fade-background-overlay';overlay.hidden=true;
 overlay.innerHTML='<section class="fade-background-dialog" role="dialog" aria-modal="true" aria-labelledby="fadeBackgroundTitle"><header><div><h2 id="fadeBackgroundTitle">正文背景</h2><p>亮色与暗色分别设置，切换主题时自动应用。</p></div><button type="button" class="background-close" aria-label="关闭背景设置">×</button></header><div class="background-themes"></div><p class="background-status" role="status" aria-live="polite">正在读取设置…</p><p class="background-note">自定义图片仅保存在本机。支持 PNG、JPG、WebP，最大 10 MB。</p></section>';
 shadow.append(overlay);const status=overlay.querySelector('.background-status'),sections=new Map();
 for(const mode of ['light','dark']){
  const section=doc.createElement('section');section.className='background-theme';section.dataset.mode=mode;
  section.innerHTML=`<h3>${mode==='light'?'亮色背景':'暗色背景'}</h3><div class="background-choices" role="group" aria-label="${mode==='light'?'亮色':'暗色'}背景"><button type="button" data-kind="solid" aria-pressed="false"><span class="background-swatch solid" aria-hidden="true"></span><span>极简</span></button><button type="button" data-kind="paper" aria-pressed="false"><span class="background-swatch paper" aria-hidden="true"></span><span>牛皮纸</span></button><button type="button" data-kind="custom" aria-pressed="false"><span class="background-swatch custom" aria-hidden="true">＋</span><span>自定义</span></button></div><div class="background-presets"></div><div class="background-custom" hidden><div class="background-file-row"><span class="background-filename"></span><button type="button" data-action="upload">更换图片</button><button type="button" data-action="remove">移除</button></div><label class="background-strength">图片强度 <output>35%</output><input type="range" min="0" max="100" step="1" aria-label="${mode==='light'?'亮色':'暗色'}背景图片强度"></label><label class="background-fit">显示方式<select aria-label="${mode==='light'?'亮色':'暗色'}背景显示方式"><option value="cover">填充</option><option value="tile">平铺</option></select></label><div class="background-transforms"></div><div class="background-save"><input type="text" maxlength="40" aria-label="预设名称" placeholder="为这个背景命名"><button type="button" data-action="save">保存预设</button></div></div><input class="background-file" type="file" accept="image/png,image/jpeg,image/webp" hidden>`;
  overlay.querySelector('.background-themes').append(section);sections.set(mode,section);
  for(const [key,label,min,max,unit]of [['rotation','旋转',-180,180,'°'],['x','水平位置',-100,100,'%'],['y','垂直位置',-100,100,'%'],['zoom','缩放',25,300,'%'],['blur','模糊',0,30,'px']]){
   const el=doc.createElement('label');el.className='background-strength';el.innerHTML=`${label} <output></output><input type="range" data-adjust="${key}" min="${min}" max="${max}" step="1" aria-label="${mode==='light'?'亮色':'暗色'}背景${label}">`;section.querySelector('.background-transforms').append(el);
   const input=el.querySelector('input');input.dataset.unit=unit;
   on(input,'input',()=>{el.querySelector('output').textContent=input.value+unit;apply({...state[mode],[key]:Number(input.value)},mode)});
   on(input,'change',()=>void commit(mode,{...state[mode],[key]:Number(input.value)}));
  }
  on(section.querySelector('[data-action=save]'),'click',()=>{
   const input=section.querySelector('.background-save input'),name=input.value.trim();
   if(!name){status.textContent='请先填写预设名称';input.focus();return}
   void savePresets([...presets,{id:win.crypto.randomUUID(),title:name,value:{...state[mode]}}]).then(ok=>{if(ok)input.value=''})
  });
  on(section.querySelector('.background-presets'),'click',event=>{
   const button=event.target.closest('button[data-preset]');if(!button)return;
   const preset=presets.find(p=>p.id===button.dataset.preset);if(!preset)return;
   if(button.dataset.action==='delete')void savePresets(presets.filter(p=>p.id!==preset.id));else void commit(mode,preset.value);
  });
  const file=section.querySelector('input[type=file]');
  for(const button of section.querySelectorAll('[data-kind]'))on(button,'click',()=>{const kind=button.dataset.kind;if(kind==='custom'&&!state[mode].image){file.click();return}void commit(mode,{...state[mode],kind})});
  on(section.querySelector('[data-action=upload]'),'click',()=>file.click());
  on(section.querySelector('[data-action=remove]'),'click',()=>void commit(mode,{...state[mode],image:'',name:'',kind:'paper'}));
  on(file,'change',()=>{const chosen=file.files[0];file.value='';if(chosen)void commit(mode,async()=>({...state[mode],...await prepareFadeBackground(chosen,win),kind:'custom'}))});
  const range=section.querySelector('input[type=range]');on(range,'input',()=>{section.querySelector('output').textContent=range.value+'%'});
  on(range,'change',()=>void commit(mode,{...state[mode],strength:Number(range.value)}));
  on(section.querySelector('select'),'change',event=>void commit(mode,{...state[mode],fit:event.target.value}));
 }
 function apply(preview,previewMode){
  if(dead)return;const mode=root.dataset.fadePolarity==='light'?'light':'dark',value=previewMode===mode?preview:state[mode];
  if(root.getAttribute('data-fade-background')!==value.kind)root.setAttribute('data-fade-background',value.kind);
  const set=(key,value)=>{if(root.style.getPropertyValue(key)!==value)root.style.setProperty(key,value)};
  if(value.kind==='custom'){
   set('--fc-custom-transform',`translate(${value.x}%,${value.y}%) rotate(${value.rotation}deg) scale(${value.zoom/100})`);
   set('--fc-custom-blur',value.blur+'px');set('--fc-custom-opacity',String(value.strength/100));
   set('--fc-custom-background',`url("${value.image}")`);
   set('--fc-custom-wash',`rgb(${mode==='light'?'245 245 244':'36 36 36'} / ${100-value.strength}%)`);
   set('--fc-custom-size',value.fit==='tile'?'720px auto':'cover');set('--fc-custom-repeat',value.fit==='tile'?'repeat':'no-repeat');
  }else for(const key of keys)if(root.style.getPropertyValue(key))root.style.removeProperty(key);
 }
 function render(){
  if(dead)return;
  for(const [mode,section]of sections){const value=state[mode];for(const button of section.querySelectorAll('[data-kind]'))button.setAttribute('aria-pressed',String(button.dataset.kind===value.kind));
   section.querySelector('.background-custom').hidden=value.kind!=='custom';
   const swatch=section.querySelector('.custom');swatch.style.backgroundImage=value.image?`url("${value.image}")`:'';swatch.textContent=value.image?'':'＋';
   section.querySelector('.background-filename').textContent=value.name||'尚未选择图片';section.querySelector('.background-filename').title=value.name;
   section.querySelector('input[type=range]').value=value.strength;section.querySelector('output').textContent=value.strength+'%';section.querySelector('select').value=value.fit;
   for(const input of section.querySelectorAll('[data-adjust]')){input.value=value[input.dataset.adjust];input.previousElementSibling.textContent=input.value+input.dataset.unit}
   const list=section.querySelector('.background-presets');list.replaceChildren();
   for(const preset of presets){
    const row=doc.createElement('div');row.className='background-preset-row';
    const choose=doc.createElement('button');choose.type='button';choose.dataset.preset=preset.id;choose.textContent=preset.title;choose.title=preset.title;choose.setAttribute('aria-pressed',String(JSON.stringify(value)===JSON.stringify(preset.value)));
    const remove=doc.createElement('button');remove.type='button';remove.dataset.preset=preset.id;remove.dataset.action='delete';remove.textContent='删除';remove.setAttribute('aria-label','删除预设 '+preset.title);row.append(choose,remove);list.append(row);
   }
   for(const control of section.querySelectorAll('button,input,select'))control.disabled=busy||!loaded;
  }
 }
 async function savePresets(next){
  if(dead||busy||!loaded)return false;busy=true;render();
  try{await store.write('presets',next);if(dead)return false;presets=next;status.textContent='预设已保存。删除预设不改变当前背景';channel?.postMessage('changed');return true}
  catch(error){if(!dead)status.textContent='保存失败：'+error.message;return false}
  finally{busy=false;render()}
 }
 async function commit(mode,next){
  if(dead||busy||!loaded)return;busy=true;render();status.textContent='正在保存…';
  try{const value=normalizeFadeBackground(typeof next==='function'?await next():next);if(dead)return;await store.write(mode,value);if(dead)return;state[mode]=value;apply();status.textContent=(mode==='light'?'亮色':'暗色')+'背景已保存';channel?.postMessage('changed')}
  catch(error){if(!dead){status.textContent='保存失败：'+error.message;announce(status.textContent)}}
  finally{busy=false;apply();render()}
 }
 async function load(){
  try{const values=await Promise.all(['light','dark','presets'].map(mode=>store.read(mode)));if(dead)return;state.light=normalizeFadeBackground(values[0]);state.dark=normalizeFadeBackground(values[1]);presets=Array.isArray(values[2])?values[2].filter(p=>p&&typeof p.id==='string'&&typeof p.title==='string'&&p.value?.kind==='custom').map(p=>({id:p.id,title:p.title.slice(0,40),value:normalizeFadeBackground(p.value)})):[];loaded=true;apply();render();status.textContent='更改会自动保存'}
  catch(error){if(!dead){status.textContent='背景设置读取失败：'+error.message;render()}}
 }
 const channel=win.BroadcastChannel?new win.BroadcastChannel('fcodex-backgrounds'):null;
 if(channel)channel.onmessage=()=>{if(!busy)void load()};
 const themeObserver=new win.MutationObserver(apply);themeObserver.observe(root,{attributes:true,attributeFilter:['data-fade-polarity']});
 function close(){overlay.hidden=true;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})}
 on(overlay.querySelector('.background-close'),'click',close);
 on(overlay,'pointerdown',event=>{if(event.target===overlay)close()});
 on(overlay,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close()}else if(event.key==='Tab'){const items=[...overlay.querySelectorAll('button,input,select')].filter(e=>!e.disabled&&e.getClientRects().length);const first=items[0],last=items.at(-1),active=shadow.activeElement;if(event.shiftKey&&active===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&active===last){event.preventDefault();first?.focus()}}});
 apply();render();const ready=load();
 return {ready,open(){if(dead)return;returnFocus=shadow.querySelector('#fadeSettingsToggle')||shadow.activeElement;overlay.hidden=false;overlay.querySelector('.background-close').focus()},close,get:mode=>({...state[mode]}),destroy(){dead=true;controller.abort();themeObserver.disconnect();channel?.close();store.close();overlay.remove();if(original===null)root.removeAttribute('data-fade-background');else root.setAttribute('data-fade-background',original);for(const[key,value,priority]of originalStyles){if(value)root.style.setProperty(key,value,priority);else root.style.removeProperty(key)}}};
}

// A mounted sidebar row can keep its creation key after its conversation is saved.
function fadeConversationRenameRow(doc,routeId){
 if(!routeId)return null;
 const id=decodeURIComponent(routeId);
 return [...doc.querySelectorAll('[data-app-action-sidebar-thread-row]')].find(row=>
  [id,'local:'+id].includes(row.getAttribute('data-app-action-sidebar-thread-id'))||fadeCodexConversationId(row)===id
 )||null;
}
function installConversationTitle(){
 const title=document.createElement('div');title.className='fade-conversation-title';title.setAttribute('role','heading');title.setAttribute('aria-level','1');title.hidden=true;shadow.append(title);
 let frame=0,dead=false;const marked=new Set();
 const visible=el=>!el.closest('[hidden],[data-app-shell-active-page="false"]')&&el.getBoundingClientRect().width>0;
 function sync(){
  frame=0;if(dead)return;
  const composer=[...document.querySelectorAll('[data-codex-composer-root]')].find(visible);
  const scroll=[...document.querySelectorAll('.thread-scroll-container')].find(visible);
  const page=scroll||composer;
  const path=fadeNativeRouter(document)?.location?.pathname||'';
  const hasMessages=!!scroll?.querySelector('[data-content-search-unit-key],[data-turn-key],[data-message-id]');
  const viewer=[...document.querySelectorAll('.codex-dialog.inset-0:has([data-testid="viewer-header"])')].some(visible);
  title.hidden=viewer||!page||!hasMessages||root.hasAttribute('data-fade-settings');
  if(editor)editor.hidden=viewer;
  for(const el of [...marked])if(el!==scroll||title.hidden){el.removeAttribute('data-fade-title-space');el.parentElement?.removeAttribute('data-fade-title-layout');marked.delete(el)}
  if(title.hidden)return;
  if(scroll&&!marked.has(scroll)){scroll.setAttribute('data-fade-title-space','');scroll.parentElement?.setAttribute('data-fade-title-layout','');marked.add(scroll)}
  const selected=shadow.querySelector('#gptTabs [aria-selected=true]')||shadow.querySelector('#codexTabs [aria-selected=true]');
  const native=[...document.querySelectorAll('[data-thread-title]')].find(el=>!el.closest('[data-app-shell-active-page="false"],.app-shell-left-panel'));
  const text=selected?.getAttribute('title')||native?.textContent?.trim()||'新聊天';
  if(title.textContent!==text)title.textContent=text;

  if(scroll)resize.observe(scroll);if(composer)resize.observe(composer);
  const box=scroll?.getBoundingClientRect(),anchor=composer?.getBoundingClientRect();
  const width=box?.width||anchor?.width||Math.min(736,window.innerWidth-48);
  const left=box?.left??anchor?.left??(window.innerWidth-width)/2;
  title.style.left=left+'px';title.style.width=width+'px';title.style.top=(box?box.top-40:43)+'px';
 }
 let renaming=false,editor=null;
 async function openRename(){

  if(renaming)return;renaming=true;
  try{
   if(shadow.querySelector('#gptTabs [aria-selected=true]')){if(!disposeGptTabs.renameCurrent())announce('当前聊天暂时无法重命名');return}
   const path=fadeNativeRouter(document)?.location?.pathname;
   const id=path?.match(/^\/local\/([^/?#]+)$/)?.[1];
   const row=fadeConversationRenameRow(document,id);
   if(!row){announce('当前聊天暂时无法重命名');return}
   let fiber=row[Object.keys(row).find(k=>k.startsWith('__reactFiber'))];
   if(fiber?.alternate){let top=fiber;while(top.return)top=top.return;if(top.stateNode?.current&&top.stateNode.current!==top)fiber=fiber.alternate}
   for(let i=0;fiber&&i<20;i++,fiber=fiber.return){
    if(typeof fiber.memoizedProps?.getItems!=='function')continue;
    const items=await fiber.memoizedProps.getItems();
    if(path!==fadeNativeRouter(document)?.location?.pathname)return;
    const action=items.find(item=>item.id==='rename-thread');
    if(action?.enabled!==false&&typeof action?.onSelect==='function'){await action.onSelect();return}break;
   }
   announce('当前聊天暂时无法重命名');
  }catch{announce('打开重命名失败，请重试')}finally{renaming=false}
 }
 function finishEdit(){editor?.remove();editor=null;title.style.visibility='';}
 async function saveEdit(){
  const value=editor?.value.trim();if(!value){editor?.focus();return}if(value===title.textContent){finishEdit();return}
  editor.disabled=true;
  const mask=document.createElement('style');mask.textContent='html[data-fade-inline-saving] [role=dialog],html[data-fade-inline-saving] [data-state=open][class*="fixed"]{opacity:0!important;pointer-events:none!important}';document.head.append(mask);root.setAttribute('data-fade-inline-saving','');
  try{
   await openRename();
   let dialog,input;for(let i=0;i<30;i++){dialog=[...document.querySelectorAll('[role=dialog]')].find(el=>el.querySelector('input'));input=dialog?.querySelector('input');if(input)break;await new Promise(resolve=>setTimeout(resolve,30))}
   if(!input)throw Error('重命名入口不可用');
   const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
   await new Promise(resolve=>setTimeout(resolve,0));
   const save=[...dialog.querySelectorAll('button')].find(el=>/^(保存|Save)$/.test(el.textContent.trim()));if(!save||save.disabled)throw Error('无法保存此标题');save.click();
   for(let i=0;i<60&&dialog.isConnected;i++)await new Promise(resolve=>setTimeout(resolve,50));
   if(dialog.isConnected){[...dialog.querySelectorAll('button')].find(el=>/^(取消|Cancel)$/.test(el.textContent.trim()))?.click();throw Error('保存未完成，请重试')}
   finishEdit();schedule();
  }catch(error){announce(error.message);if(editor){editor.disabled=false;editor.focus()}}
  finally{root.removeAttribute('data-fade-inline-saving');mask.remove()}
 }
 function rename(){
  if(editor||renaming)return;
  editor=document.createElement('input');editor.className='fade-title-editor';editor.value=title.textContent;editor.setAttribute('aria-label','聊天标题');const box=title.getBoundingClientRect();const width=Math.min(480,box.width-48);Object.assign(editor.style,{left:(box.left+(box.width-width)/2)+'px',top:(box.top+5)+'px',width:width+'px'});shadow.append(editor);title.style.visibility='hidden';editor.focus();editor.select();
  on(editor,'keydown',event=>{if(event.isComposing)return;if(event.key==='Enter'){event.preventDefault();void saveEdit()}else if(event.key==='Escape'){event.preventDefault();finishEdit();title.focus()}});
 }
 on(document,'pointerdown',event=>{if(editor&&!editor.disabled&&!event.composedPath().includes(editor))finishEdit()},{capture:true});
 on(title,'dblclick',event=>{event.preventDefault();rename()});
 on(title,'keydown',event=>{if(event.key==='F2'){event.preventDefault();void rename()}});title.tabIndex=0;title.setAttribute('aria-label','聊天标题，双击或按 F2 重命名');
 function schedule(){if(!dead&&!frame)frame=requestAnimationFrame(sync)}
 const observer=new MutationObserver(schedule);
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-app-shell-active-page','data-app-action-sidebar-thread-title','data-fade-settings']});
 observer.observe(shadow,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-selected','title']});
 const resize=new ResizeObserver(schedule);resize.observe(document.documentElement);
 on(window,'resize',schedule);on(document,'transitionend',schedule);
 sync();return ()=>{dead=true;finishEdit();observer.disconnect();resize.disconnect();if(frame)cancelAnimationFrame(frame);for(const el of marked){el.removeAttribute('data-fade-title-space');el.parentElement?.removeAttribute('data-fade-title-layout')}title.remove()};
}



 const disposeTabWheel=installFadeTabWheel(shadow,window);
 const disposeHeader=installCompactHeader();
 let config={light:root.dataset.theme==='light'};try{Object.assign(config,JSON.parse(localStorage.getItem('fade-codex-v1')||'{}'))}catch{}
 // Native appearance is authoritative; saved Fade config is only a fallback.
 if(['light','dark'].includes(root.dataset.theme))config.light=root.dataset.theme==='light';
 root.setAttribute('data-fade-codex','');
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
  if(code.size){
   const marks=`:is(${[...code].join(',')})`;
   css+=`${scope} .cm-line:not(.cm-markdown-code-line) ${marks}{background:var(--fc-inline-bg)!important;color:var(--fc-inline-fg)!important;border-radius:4px;padding:.08em .32em;box-shadow:inset 0 0 0 1px var(--fc-inline-border);box-decoration-break:clone;-webkit-box-decoration-break:clone}`;
   // Native Markdown assigns the inline-code token to fenced code too. Reset
   // that token only; leave any nested syntax-highlighting marks untouched.
   css+=`${scope} .cm-markdown-code-line ${marks}{background:transparent!important;color:inherit!important;border:0!important;border-radius:0!important;padding:0!important;box-shadow:none!important;font-family:inherit!important;box-decoration-break:slice;-webkit-box-decoration-break:slice}`;
  }
  if(links.size){const sel=`${scope} :is(${[...links].join(',')})`;css+=`${sel}{color:var(--fc-link)!important;text-decoration:underline;text-underline-offset:.16em}${sel}:hover{color:var(--fc-link-hover)!important}`;}
  if(editorStyle.textContent!==css)editorStyle.textContent=css;
 }
 syncEditorMarks();
 // insertRule does not emit DOM mutations; inspect only small inline style sheets.
 const editorStyleTimer=setInterval(syncEditorMarks,1500);


 let navOpen=false,toastTimer,lastScroll=0,returnFocus=null,inerted=[],groups=[],recent=[],pinned=[],sections=[],expanded={recent:false,pinned:true};
 const savedExpanded=(()=>{try{return JSON.parse(localStorage.getItem('fade-codex-orb-expanded-v2')||'{}')||{}}catch{return {}}})();
 expanded.recent=savedExpanded.recent===true;
 function persist(){try{localStorage.setItem('fade-codex-orb-expanded-v2',JSON.stringify(expanded))}catch{}}
 function announce(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
 const themeController=installFadeThemeController({root,host,button:$('#headerThemeToggle'),config,tokens,nativeTheme,wake:()=>wakeParticles(),persist:()=>{try{localStorage.setItem('fade-codex-v1',JSON.stringify(config))}catch{}}});
 function setTheme(light,persist=true){return themeController.set(light,persist)}
 function fadeHistoryDirection(button){
 const key=Object.keys(button).find(k=>k.startsWith('__reactFiber$'));
 for(let fiber=key?button[key]:null,depth=0;fiber&&depth<12;fiber=fiber.return,depth++){
  const id=fiber.memoizedProps?.tooltipContent?.props?.id;
  if(id==='codex.command.navigateBack')return 'back';
  if(id==='codex.command.navigateForward')return 'forward';
 }
 return null;
}
function installRailHistory(doc){
 let row=null,account=null,dead=false;const originals=new Map(),controls={};
 function sources(){
  const result={};
  for(const b of doc.querySelectorAll('button')){
   if(b.closest('.fade-rail-history,[data-app-shell-active-page="false"]'))continue;
   const direction=fadeHistoryDirection(b);if(direction&&!result[direction])result[direction]=b;
  }
  return result;
 }
 function sync(){
  if(dead)return;
  const rail=doc.querySelector('[data-app-navigation-rail]');
  const next=rail&&[...rail.querySelectorAll('button')].find(b=>/open profile menu|打开个人资料菜单|打开个人资料|打开个人信息菜单|打开设置|open settings/i.test(b.getAttribute('aria-label')||''));
  if(!next){row?.remove();row=null;account=null;for(const[b,value]of originals){if(value===null)b.removeAttribute('data-fade-history-source');else b.setAttribute('data-fade-history-source',value)}originals.clear();return}
  if(next!==account||!row?.isConnected){
   row?.remove();account=next;row=doc.createElement('div');row.className='fade-rail-history';
   for(const direction of ['back','forward']){
    const b=doc.createElement('button');b.type='button';b.title=direction==='back'?'后退':'前进';b.setAttribute('aria-label',b.title);
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+(direction==='back'?'m14 5-7 7 7 7':'m10 5 7 7-7 7')+'"/></svg>';
    b.addEventListener('click',()=>{const native=sources()[direction];if(native&&!native.disabled&&native.getAttribute('aria-disabled')!=='true')native.click()});
    controls[direction]=b;row.append(b);
   }
   // Keep navigation outside the profile's wrappers: their hover/hit surfaces
   // must remain limited to the avatar, and their width is only 36px.
   let footer=account;
   while(footer.parentElement!==rail)footer=footer.parentElement;
   rail.insertBefore(row,footer);
  }
  const native=sources();
  for(const direction of ['back','forward']){
   const b=native[direction];controls[direction].disabled=!b||b.disabled||b.getAttribute('aria-disabled')==='true';
   if(b&&!originals.has(b)){originals.set(b,b.getAttribute('data-fade-history-source'));b.setAttribute('data-fade-history-source','')}
  }
 }
 const observer=new MutationObserver(records=>{if(!records.every(r=>r.target.closest?.('.fade-rail-history')))sync()});
 observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','aria-disabled','aria-label']});sync();
 return ()=>{dead=true;observer.disconnect();row?.remove();for(const[b,value]of originals){if(value===null)b.removeAttribute('data-fade-history-source');else b.setAttribute('data-fade-history-source',value)}};
}

 const disposeRailHistory=installRailHistory(document);
 function installConversationSurface(doc,accountButton){
 const assistantIcon="data:image/png;base64,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";
 const owned=new Set(),marked=new Map(),menuStyles=new Map(),speakers=new WeakMap(),listeners=new AbortController();let frame=0,dead=false,activePlus=null;
 const label=el=>[el.getAttribute('aria-label'),el.getAttribute('title'),el.textContent].filter(Boolean).join(' ').trim();
 function mark(el,key,value=''){if(!el)return;if(!marked.has(el))marked.set(el,new Map());const attrs=marked.get(el);if(!attrs.has(key))attrs.set(key,el.getAttribute(key));if(el.getAttribute(key)!==value)el.setAttribute(key,value)}
 function account(){return [...doc.querySelectorAll('.app-shell-left-panel button')].find(el=>/open profile menu|打开个人资料菜单|打开个人资料|打开个人信息菜单|打开设置|open settings/i.test(el.getAttribute('aria-label')||''))}
 function positionAccountMenu(source){
  if(source.getAttribute('aria-expanded')!=='true')return;
  const id=source.getAttribute('aria-controls');
  let menu=id?doc.getElementById(id):null;
  if(!menu){
   const menus=[...doc.querySelectorAll('[role=menu]')].filter(el=>el.getClientRects().length&&!el.closest('[hidden]'));
   menu=menus.find(el=>source.id&&el.getAttribute('aria-labelledby')===source.id)||(menus.length===1?menus[0]:null);
  }
  if(!menu)return;
  const wrapper=menu.closest('[data-radix-popper-content-wrapper]');
  if(!wrapper)return;
  mark(menu,'data-fade-account-menu');mark(wrapper,'data-fade-account-popup');
  const anchor=source.getBoundingClientRect(),viewport=doc.documentElement.clientWidth;
  const width=Math.min(280,viewport-24),left=Math.max(12,Math.min(viewport-width-12,anchor.left+(anchor.width-width)/2));
  for(const[key,value]of Object.entries({'--fc-menu-left':left+'px','--fc-menu-width':width+'px','--fc-menu-anchor-top':anchor.top+'px'})){
   if(!menuStyles.has(wrapper))menuStyles.set(wrapper,new Map());
   const saved=menuStyles.get(wrapper);if(!saved.has(key))saved.set(key,[wrapper.style.getPropertyValue(key),wrapper.style.getPropertyPriority(key)]);
   wrapper.style.setProperty(key,value);
  }
 }
 function avatar(user=false){const el=doc.createElement('span');el.className='fc-avatar';el.setAttribute('aria-hidden','true');const image=user?account()?.querySelector('img'):null;if(image){const copy=doc.createElement('img');copy.src=image.currentSrc||image.src;copy.alt='';el.append(copy)}else if(user)el.setAttribute('data-fade-person','');else{const copy=doc.createElement('img');copy.src=assistantIcon;copy.alt='';el.append(copy)}return el}
 function isUser(el){return el.getAttribute('data-fade-speaker')==='user'||el.hasAttribute('data-local-conversation-user-anchor')||el.hasAttribute('data-user-message-bubble')||!!el.querySelector('[data-user-message-bubble],[data-local-conversation-user-anchor]')}
 function speakerRow(user){const row=doc.createElement('div');row.setAttribute('data-fade-speaker',user?'user':'assistant');row.setAttribute('data-markdown-copy','exclude');row.append(avatar(user));if(!user){const name=doc.createElement('span');name.textContent='FCodex';row.append(name)}owned.add(row);return row}
 function syncSpeakers(){
  const groups=new Map(),keep=new Set();
  for(const el of doc.querySelectorAll('[data-content-search-unit-key]')){
   if(el.closest('[data-fade-native-tools],.app-shell-left-panel'))continue;
   if(isUser(el)){
    let row=speakers.get(el);if(!row||!row.isConnected){row=speakerRow(true);speakers.set(el,row)}
    if(row.parentElement!==el)el.prepend(row);keep.add(row);continue;
   }
   // A response contains many searchable units. Use their shared native turn,
   // not the individual unit, as the identity owner.
   let turn=null;
   for(let p=el;p&&p!==doc.body;p=p.parentElement){
    if(p.hasAttribute('data-content-search-turn-key'))turn=p;
    if(p.hasAttribute('data-turn-key')){turn=p;break}
   }
   const owner=turn||el;
   if(!groups.has(owner))groups.set(owner,{first:el,turn});
  }
  for(const[owner,{first,turn}]of groups){
   let row=speakers.get(owner);if(!row||!row.isConnected){row=speakerRow(false);speakers.set(owner,row)}
   if(first===turn){if(first.firstElementChild!==row)first.prepend(row);keep.add(row);continue}
   let anchor=first;
   // Stop below any wrapper containing the user's message so the assistant
   // header cannot jump above it. Include work/elapsed blocks before the answer.
   while(turn&&anchor.parentElement&&anchor.parentElement!==doc.body&&anchor.parentElement!==turn&&!isUser(anchor.parentElement))anchor=anchor.parentElement;
   for(let prev=anchor.previousElementSibling;prev;prev=prev.previousElementSibling){
    if(isUser(prev))break;
    if(!prev.hasAttribute('data-fade-speaker'))anchor=prev;
   }
   if(anchor.parentElement){if(anchor.previousElementSibling!==row)anchor.parentElement.insertBefore(row,anchor)}
   else if(row.parentElement!==first)first.prepend(row);
   keep.add(row);
  }
  // React may replace searchable wrappers while leaving our moved headers alive.
  // Reconcile all owned headers, including leftovers from those old wrappers.
  for(const el of [...owned])if(el.hasAttribute('data-fade-speaker')&&!keep.has(el)){el.remove();owned.delete(el)}
 }
 function classify(button){const target=button.getAttribute('data-composer-navigation-target'),text=label(button);
  if(target==='add-context')return 'add';if(target==='permissions')return 'permissions';
  if(target==='reasoning'||target==='model'||/^(GPT-|模型|选择模型|Select model)/i.test(text))return 'model';
  if(/^(Send|发送|发送消息|Submit|提交|Steer|Queue|引导|排队)(\s|$)/i.test(text))return 'send';
  if(/^(Stop|停止)(\s|$)/i.test(text))return 'stop';
  if(/dictat|voice|语音输入|语音聊天|语音模式|听写/i.test(text))return 'voice';
  if(/context window|上下文|用量|usage|\d+%/i.test(text))return 'usage';
  return null;
 }
 function refresh(){
  frame=0;if(dead)return;observer.disconnect();
  for(const [el]of marked)if(!el.isConnected)marked.delete(el);
  for(const el of owned)if(!el.isConnected)owned.delete(el);
  for(const permission of doc.querySelectorAll('[data-codex-composer-root] [data-composer-navigation-target=permissions]')){mark(permission,'data-fade-control','permissions');mark(permission,'tabindex','-1')}
  for(const surface of doc.querySelectorAll('[data-codex-composer-root] [data-composer-surface-variant]')){
   if(['inline','document'].includes(surface.getAttribute('data-composer-surface-variant')))continue;
   mark(surface,'data-fade-composer');
   const body=surface.querySelector('[class*="_ComposerLayoutBody_"]')||surface;
   mark(body,'data-fade-composer-body');
   for(const input of surface.querySelectorAll('[class*="_ComposerLayoutInput_"]'))mark(input,'data-fade-composer-input');
   for(const footer of surface.querySelectorAll('[class*="_ComposerLayoutFooter_"]')){
    mark(footer,'data-fade-footer');
    for(const button of footer.querySelectorAll('button,[role=img][aria-label]')){
     if(button.hasAttribute('data-fade-idle-send'))continue;
     const kind=classify(button);if(kind)mark(button,'data-fade-control',kind);else if(button.hasAttribute('data-fade-control')){button.removeAttribute('data-fade-control')}
     if(!kind)continue;
     // Flatten only layout wrappers, leaving native buttons and event handlers intact.
     for(let parent=button.parentElement;parent&&parent!==footer;parent=parent.parentElement){if(parent.matches('button,[role=button]'))break;mark(parent,'data-fade-flatten')}
    }
    const nativeSend=[...footer.querySelectorAll('[data-fade-control=send],[data-fade-control=stop]')].some(el=>!el.hasAttribute('data-fade-idle-send'));
    let idle=footer.querySelector('[data-fade-idle-send]');
    if(!nativeSend&&!idle){idle=doc.createElement('button');idle.type='button';idle.disabled=true;idle.setAttribute('aria-label','发送');idle.setAttribute('data-fade-control','send');idle.setAttribute('data-fade-idle-send','');owned.add(idle);footer.append(idle)}
    if(idle)idle.hidden=nativeSend;
   }
  }
  syncSpeakers();
  if(accountButton){
  const source=account();
  if(source){mark(source,'data-fade-account-source');
   for(let parent=source.parentElement;parent&&parent!==doc.body;parent=parent.parentElement){mark(parent,'data-fade-account-ancestor');if(parent.matches('.app-shell-left-panel'))break}
   if(doc.documentElement?.hasAttribute('data-fade-account-access')){
    const box=accountButton.getBoundingClientRect();
    for(const [key,value]of Object.entries({left:box.left,top:box.top,width:box.width,height:box.height}))source.style.setProperty('--fc-account-'+key,value+'px');
    accountButton.style.setProperty('visibility','hidden');accountButton.setAttribute('aria-hidden','true');accountButton.setAttribute('tabindex','-1');
   }else{accountButton.style.removeProperty('visibility');accountButton.removeAttribute('aria-hidden');accountButton.removeAttribute('tabindex')}
positionAccountMenu(source);
const text=source.textContent.trim()||'账户';if(accountButton.dataset.identity!==text){accountButton.dataset.identity=text;accountButton.replaceChildren(avatar(true));const name=doc.createElement('span');name.textContent=text;accountButton.append(name)}accountButton.hidden=false}
  else accountButton.hidden=true;
  }
  observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-expanded','aria-controls','data-composer-navigation-target','src']});
 }
 function schedule(){if(!frame&&!dead)frame=window.requestAnimationFrame(refresh)}
 const observer=new MutationObserver(schedule);
 doc.addEventListener('click',event=>{const plus=event.target.closest?.('[data-composer-navigation-target=add-context]');if(plus){activePlus=plus;schedule()}},{capture:true,signal:listeners.signal});
 doc.addEventListener('input',schedule,{capture:true,signal:listeners.signal});
 window.addEventListener('resize',schedule,{signal:listeners.signal});
 refresh();
 const dispose=()=>{dead=true;observer.disconnect();listeners.abort();if(frame)window.cancelAnimationFrame(frame);for(const el of owned)el.remove();for(const[el,styles]of menuStyles)for(const[key,[value,priority]]of styles){if(value)el.style.setProperty(key,value,priority);else el.style.removeProperty(key)}for(const[el,attrs]of marked)for(const[key,value]of attrs){if(value===null)el.removeAttribute(key);else el.setAttribute(key,value)}for(const el of doc.querySelectorAll('[data-composer-navigation-target=permissions]')){el.style.removeProperty('--fc-permission-x');el.style.removeProperty('--fc-permission-y')}const source=account();if(source)for(const key of ['left','top','width','height'])source.style.removeProperty('--fc-account-'+key);if(accountButton){accountButton.style.removeProperty('visibility');accountButton.removeAttribute('aria-hidden');accountButton.removeAttribute('tabindex')}};
 dispose.refresh=schedule;return dispose;
}

 const disposeConversation=installConversationSurface(document);
 // Keep the preference separate from native editor state: changing display must
// not recreate the editor, its undo history, or an unsaved document.
function installPreviewCodeWrap(doc){
 const key='fade-preview-code-wrap',attr='data-fade-preview-code-nowrap',root=doc.documentElement,win=doc.defaultView;
 const original=root.getAttribute(attr);let enabled=true;
 try{enabled=win.localStorage.getItem(key)!=='false'}catch{}
 const viewers=new Map();
 function restore(state){state.observer?.disconnect();for(const [pre,value]of state.original)if(pre.getAttribute('data-overflow')==='scroll')pre.setAttribute('data-overflow',value)}
 function syncViewers(){
  const hosts=new Set(enabled?[]:[...(doc.querySelectorAll?.(':is([data-tab-id^="text-editor:"],[data-tab-id^="file:"]) diffs-container')||[])].filter(el=>el.shadowRoot));
  for(const [host,state]of viewers)if(!hosts.has(host)){restore(state);viewers.delete(host)}
  for(const host of hosts){
   if(viewers.has(host))continue;
   const state={original:new Map(),observer:null};
   const sync=()=>{
    const nodes=new Set(host.shadowRoot.querySelectorAll('pre:is([data-file],[data-diff])[data-overflow]'));
    for(const pre of state.original.keys())if(!nodes.has(pre))state.original.delete(pre);
    for(const pre of nodes){const value=pre.getAttribute('data-overflow');if(value!=='wrap'&&value!=='scroll')continue;if(!state.original.has(pre)||value!=='scroll')state.original.set(pre,value);if(value!=='scroll')pre.setAttribute('data-overflow','scroll')}
   };
   // The native renderer uses this attribute for its complete grid/scroll mode,
   // including sticky line numbers. Reapply when it replaces virtualized rows.
   state.observer=new win.MutationObserver(sync);state.observer.observe(host.shadowRoot,{subtree:true,childList:true,attributes:true,attributeFilter:['data-overflow']});viewers.set(host,state);sync();
  }
 }
 const mounts=win.MutationObserver?new win.MutationObserver(syncViewers):null;
 mounts?.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-tab-id']});
 function apply(){root.toggleAttribute(attr,!enabled);syncViewers()}
 function storage(event){if(event.key===key||event.key===null){try{enabled=win.localStorage.getItem(key)!=='false'}catch{}apply()}}
 win.addEventListener('storage',storage);apply();
 return {get enabled(){return enabled},set(value){enabled=!!value;try{win.localStorage.setItem(key,String(enabled))}catch{}apply()},destroy(){mounts?.disconnect();for(const state of viewers.values())restore(state);viewers.clear();win.removeEventListener('storage',storage);if(original===null)root.removeAttribute(attr);else root.setAttribute(attr,original)}};
}
// Native pointer capture can outlive :hover as the pane moves under the cursor.
// Keep native sizing/capture, but prevent pointer overflow from entering full view.
function fadeInstallPanelDragState(doc){
 let active=null;
 function constrain(event){
  if(!active?.bounds||event.pointerId!==active.id||!Number.isFinite(event.clientX))return;
  const {x,size,min,max,scale}=active.bounds;
  const desired=size+(x-event.clientX)/scale,bounded=Math.max(min,Math.min(max,desired));
  if(desired!==bounded)Object.defineProperty(event,'clientX',{configurable:true,value:x+(size-bounded)*scale});
 }
 function clear(event){
  if(event?.pointerId!=null&&active&&event.pointerId!==active.id)return;
  if(event)constrain(event);active?.panel.removeAttribute('data-fade-panel-dragging');active=null;
 }
 function start(event){
  if(event.button!==0)return;
  const grip=event.target?.closest?.('[class~="group/panel-resizer"][class~="left-0"] [role="separator"][aria-orientation="vertical"]');
  const panel=grip?.closest('aside[data-app-shell-focus-area="right-panel"]');
  if(!panel||doc.documentElement?.hasAttribute('data-fade-nav-open'))return;
    clear();active={panel,id:event.pointerId};
  const size=Number(grip.getAttribute?.('aria-valuenow')),min=Number(grip.getAttribute?.('aria-valuemin')),max=Number(grip.getAttribute?.('aria-valuemax'));
  if(size>0&&max>min&&Number.isFinite(event.clientX))active.bounds={x:event.clientX,size,min,max:max-1,scale:(panel.getBoundingClientRect().width||size)/size};
  panel.setAttribute('data-fade-panel-dragging','');
 }
 const target=doc.defaultView||doc;
 target.addEventListener?.('pointermove',constrain,true);
 target.addEventListener?.('pointerdown',start,true);
 target.addEventListener?.('pointerup',clear,true);
 target.addEventListener?.('pointercancel',clear,true);
 target.addEventListener?.('blur',clear);
 return ()=>{clear();target.removeEventListener?.('pointermove',constrain,true);target.removeEventListener?.('pointerdown',start,true);target.removeEventListener?.('pointerup',clear,true);target.removeEventListener?.('pointercancel',clear,true);target.removeEventListener?.('blur',clear)};
}
// Adapt the mounted native viewer; never move React-owned nodes or replace editors.
function fadeFileMetadata(element){
 const key=Object.keys(element).find(k=>k.startsWith('__reactFiber$'));
 let fiber=key?element[key]:null;
 for(let depth=0;fiber&&depth<60;depth++,fiber=fiber.return){
  const p=fiber.memoizedProps;
  const path=p?.path||p?.openFilePathOverride||p?.reviewPath;
  const hostId=p?.hostId||p?.hostConfig?.id;
  if(typeof path==='string'&&typeof hostId==='string'&&path&&path!=='/dev/null'){
   return {path,hostId,cwd:typeof p.cwd==='string'?p.cwd:null,environmentId:p.environmentId??null};
  }
 }
 return null;
}
function fadeAbsoluteFile(meta){
 if(!meta)return null;
 if(/^\/[a-z]:[\\/]/i.test(meta.path))return meta.path.slice(1);
 if(/^(?:[a-z]:[\\/]|\\\\|\/)/i.test(meta.path))return meta.path;
 if(!meta.cwd||! /^(?:[a-z]:[\\/]|\\\\|\/)/i.test(meta.cwd))return null;
 return meta.cwd.replace(/[\\/]$/,'')+(meta.cwd.includes('\\')?'\\':'/')+meta.path;
}
function fadeFileTabMetadata(tabId){
 // These IDs are emitted by the native text editor and review-file tab types.
 const match=/^(?:text-editor|file):([^:]+):(.+)$/.exec(tabId||'');
 if(!match)return null;
 const path=match[2].replace(/^\/([a-z]:[\\/])/i,'$1');
 return {hostId:match[1],path,cwd:null,environmentId:null};
}
function fadePanelFileMetadata(panel,header){
 if(header?.hasAttribute?.('data-browser-sidebar-toolbar'))return null;
 if(header?.matches?.('[class*="group/diff-header"]'))return fadeFileMetadata(header);
 const owner=header?.closest?.('[data-app-shell-tab-panel-controller="right"][data-tab-id]');
 if(owner){const id=owner.getAttribute('data-tab-id');if(id==='diff'||id?.startsWith('browser'))return null;return fadeFileTabMetadata(id)||fadeFileMetadata(header)}
 // A header belongs to its own pane. Never borrow a path from a neighbouring
 // split or from a mounted, inactive file tab when showing a browser/review.
 return header?fadeFileMetadata(header):null;
}
// Panel close is a layout action. Tab close buttons remain owned by native tabs.
function fadePanelCloseControl(panel){
 const doc=panel.ownerDocument;
 const toggles=[...(doc?.querySelectorAll('button[data-app-shell-workspace-layout-toggle="main"]')||[])];
 const toggle=toggles.find(b=>!b.disabled&&b.getAttribute('aria-pressed')==='true'&&!b.closest('[hidden],[aria-hidden="true"],[data-app-shell-active-page="false"]'));
 if(toggle)return toggle;
 return [...panel.querySelectorAll('button')].find(b=>!b.closest('.fade-panel-chrome')&&!b.disabled&&/^(?:Close panel|关闭面板|关闭侧面板)$/i.test(b.getAttribute('aria-label')||''))||null;
}
function fadeCloseFilePanel(panel){const control=fadePanelCloseControl(panel);if(!control)return false;control.click();return true}
function fadeScrollHeaderActions(event,row,header){
 if(event.ctrlKey||header.getAttribute('data-fade-header-layout')!=='stacked'||row.scrollWidth<=row.clientWidth)return;
 const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
 if(!delta)return;
 const unit=event.deltaMode===1?16:event.deltaMode===2?row.clientWidth:1;
 row.scrollLeft+=delta*unit;
 event.preventDefault();event.stopPropagation();
}
// Windows shell.openExternal(fileURL) can fail silently in the native toolbar.
// For an already loaded local HTML page, reuse the native system-default file
// opener (shell.openPath), without changing URL handlers or other file types.
function fadeExternalHtmlPath(value){
 try{
  const url=new URL(value);
  if(url.protocol!=='file:'||url.hostname||url.search||url.hash)return null;
  const path=decodeURIComponent(url.pathname).replace(/^\/([a-z]:\/)/i,'$1');
  if(!/^[a-z]:\//i.test(path)||! /\.html?$/i.test(path)||/[\x00-\x1f\\]/.test(path))return null;
  return path;
 }catch{return null}
}
function fadeExternalHtmlTarget(button){
 let fiber=button[Object.keys(button).find(k=>k.startsWith('__reactFiber$'))];
 if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
 for(let depth=0;fiber&&depth<24;depth++,fiber=fiber.return){
  const props=fiber.memoizedProps;
  if(typeof props?.currentUrl==='string')return props.isAddressEditing===false?fadeExternalHtmlPath(props.currentUrl):null;
 }
 return null;
}
function installExternalHtmlOpen(doc,platform,report){
 let stopped=false;const pending=new WeakSet();
 const click=event=>{
  const button=event.target?.closest?.('[data-browser-sidebar-open-external]');
  if(!button||button.disabled||!button.closest('[data-browser-sidebar-toolbar]'))return;
  const path=fadeExternalHtmlTarget(button);if(!path)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(pending.has(button))return;pending.add(button);
  Promise.resolve().then(platform).then(async api=>{
   if(stopped)return;
   const result=await api.openIn.open({hostId:'local',path,target:'systemDefault'});
   if(result?.success!==true)throw Error('Open failed');
  }).catch(()=>{if(!stopped)report('无法用系统默认应用打开此 HTML 文件，请检查文件是否存在及默认应用设置')}).finally(()=>pending.delete(button));
 };
 doc.addEventListener('click',click,true);
 return ()=>{stopped=true;doc.removeEventListener('click',click,true)};
}
function installFilePanel(doc,report){
 const states=new Map(),panels=new Map(),headers=new Map();let stopped=false,platformPromise,frame=0;
 const win=doc.defaultView;const disposeDragState=fadeInstallPanelDragState(doc);
 const visible=el=>!el.closest('[hidden],[aria-hidden="true"],[data-app-shell-active-page="false"]')&&(!el.getClientRects||el.getClientRects().length>0);
 const icons={copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',folder:'<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11H3Z"/><path d="M3 10h18"/>',file:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h5"/>'};
 icons.close='<path d="m6 6 12 12M18 6 6 18"/>';
 icons.tree='<path d="M5 3v14h10M5 7h10M15 4h5v6h-5zM15 14h5v6h-5z"/>';
 const svg=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
 function platform(){
  // Follow the loaded asset URL; native builds change both hashes and exports.
  // Accept only an object exposing the two platform capabilities we use.
  if(!platformPromise){
   const url=[...doc.querySelectorAll('link[href]')].map(s=>s.href).find(s=>/\/assets\/app-shared-[\w-]+\.js(?:\?|$)/.test(s));
   if(!url)return Promise.reject(new Error('Native platform module unavailable'));
   platformPromise=import(url).then(m=>{
    const api=Object.values(m).find(v=>v&&typeof v==='object'&&v.openIn?.open&&v.clipboard?.writeText);
    if(!api)throw new Error('Unsupported native platform');return api;
   }).catch(error=>{platformPromise=null;throw error});
  }
  return platformPromise;
 }
 const disposeExternalHtml=installExternalHtmlOpen(doc,platform,report);
 function mark(state,el,name,value=''){
  if(!el)return;
  if(!state.attrs.some(a=>a[0]===el&&a[1]===name))state.attrs.push([el,name,el.getAttribute(name)]);
  if(el.getAttribute(name)!==value)el.setAttribute(name,value);
 }
 function restore(state){
  state.dispose?.();
  state.added?.remove();for(const[el,name,value]of state.attrs){if(value===null)el.removeAttribute(name);else el.setAttribute(name,value)}
 }
 function button(label,icon,fn){const b=doc.createElement('button');b.type='button';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=svg(icon);b.addEventListener('click',e=>{e.stopPropagation();fn(e)});return b}
 function create(header,panel){
  const state={header,panel,attrs:[],added:doc.createElement('div')};
  state.added.className='fade-file-heading';
  const act=async kind=>{
   // Resolve again at click time, including after tab switches and native rerenders.
   const metadata=fadePanelFileMetadata(panel,header),path=fadeAbsoluteFile(metadata);
   if(!header.isConnected||!path){report('当前文件路径不可用');return}
   if(kind==='folder'&&(metadata.hostId!=='local'||metadata.environmentId)){report('此文件不在本机，无法在资源管理器中打开');return}
   try{
    const api=await platform();if(stopped)return;
    if(kind==='copy'){await api.clipboard.writeText(path);report('已复制路径')}
    else {const result=await api.openIn.open({...metadata,path,target:'fileManager'});if(result?.success===false)throw new Error('Reveal failed')}
   }catch{if(!stopped)report(kind==='copy'?'复制路径失败':'无法在资源管理器中打开')}
  };
  state.explorer=button('在资源管理器中打开','folder',()=>act('folder'));
  state.copy=button('复制路径','copy',()=>act('copy'));
  state.explorer.className='fade-file-explorer';state.copy.className='fade-file-copy';
  state.added.append(state.copy,state.explorer);header.append(state.added);
  mark(state,header,'data-fade-file-header');
  return state;
 }
 function layoutHeader(state){
  const {header,leading,trailing}=state;
  if(!header.clientWidth)return;
  // Measure the children, not the stretched second row. Using the row width
  // would make a stacked toolbar stay stacked forever after widening.
  const boxes=el=>[...(el?.children||[])].flatMap(e=>win?.getComputedStyle(e).display==='contents'?boxes(e):[e]);
  const actionItems=boxes(trailing).map(e=>({element:e,width:e.getBoundingClientRect().width})).filter(item=>item.width>0);
  const actions=actionItems.reduce((total,{element:e,width})=>{const s=win?.getComputedStyle(e);return total+Math.max(e.scrollWidth,width)+(parseFloat(s?.marginInlineStart)||0)+(parseFloat(s?.marginInlineEnd)||0)},0)+Math.max(0,actionItems.length-1)*(parseFloat(win?.getComputedStyle(trailing).columnGap)||0);
  const middle=(state.middle?.getBoundingClientRect().width||0)+(state.auxiliary?.getBoundingClientRect().width||0);
  const close=header.hasAttribute('data-fade-close-host')?40:0;
  // Reserve useful title space; native trailing actions remain an intact group.
  const minimum=state.kind==='review'?150:180;
  const needed=state.kind==='browser'?160+(leading.scrollWidth||90)+actions+close+32:minimum+actions+middle+close+32;
  mark(state,header,'data-fade-header-layout',header.clientWidth<needed?'stacked':'inline');
 }
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{const targets=new Set(entries.map(entry=>entry.target));for(const state of headers.values())if(targets.has(state.header)||targets.has(state.trailing))layoutHeader(state)}):null;
 function adaptHeader(header){
  let state=headers.get(header);
  const nativeChildren=el=>[...el.children].filter(e=>!e.classList?.contains('fade-file-heading')&&!e.classList?.contains('fade-panel-chrome')&&!e.classList?.contains('fade-preview-freshness'));
  let children=nativeChildren(header);
  const flow=children.length===1&&children[0].tagName==='DIV'?children[0]:null;
  if(flow)children=nativeChildren(flow);
  // Reconciliation may change only a middle slot or wrapper. Release stale
  // geometry before falling back for an unsupported native structure.
  if(state&&(state.flow!==flow||state.children.length!==children.length||children.some((child,index)=>child!==state.children[index]))){resize?.unobserve(header);resize?.unobserve(state.trailing);restore(state);headers.delete(header);state=null}
  if(children.length<2||children.length>4)return null; // Unknown layouts retain native geometry.
  if(!state){
   const owner=header.closest('[data-app-shell-tab-panel-controller="right"]');
   const id=owner?.getAttribute('data-tab-id')||'';
   state={header,flow,children,leading:children[0],trailing:children.at(-1),middle:children.length>=3?children.at(-2):null,auxiliary:children.length===4?children[1]:null,kind:header.hasAttribute('data-browser-sidebar-toolbar')?'browser':id==='diff'?'review':'file',attrs:[]};headers.set(header,state);
   mark(state,header,'data-fade-viewer-header',state.kind);mark(state,state.leading,'data-fade-header-leading');mark(state,state.trailing,'data-fade-header-trailing');
   if(flow)mark(state,flow,'data-fade-header-flow');
   if(state.middle){mark(state,state.middle,'data-fade-header-middle');mark(state,header,'data-fade-header-three')}
   if(state.auxiliary){mark(state,state.auxiliary,'data-fade-header-auxiliary');mark(state,header,'data-fade-header-four')}
   if(state.kind!=='browser'){
    const row=state.trailing;
    const wheel=e=>fadeScrollHeaderActions(e,row,header);
    row.addEventListener('wheel',wheel,{passive:false});
    state.dispose=()=>row.removeEventListener('wheel',wheel);
   }
   resize?.observe(header);resize?.observe(state.trailing);
  }
  return state;
 }
 function sync(){
  if(stopped)return;
  // Full right-pane layout has no resizer and is not yet supported by the card.
  // Recover persisted state and alternative native entries through its own toggle.
  const windowMode=doc.documentElement?.hasAttribute('data-fade-window-mode');
  const full=!windowMode&&[...doc.querySelectorAll('button[data-app-shell-workspace-layout-toggle="right-panel"][aria-pressed="true"]')].find(el=>!el.closest('[hidden],[data-app-shell-active-page="false"]')&&visible(el.parentElement||el));
  if(full&&!full.disabled){full.click();return}
  const active=new Set(),activePanels=new Set();
  for(const panel of doc.querySelectorAll('aside[data-app-shell-focus-area="right-panel"],aside[data-fade-unified-preview]')){
   const unified=panel.hasAttribute('data-fade-unified-preview');
   // Window-mode source panels are invisible. Adapt only the portaled viewer,
   // whose close/tab controls already live in the unified preview's tab row.
   if(windowMode&&!unified)continue;
   activePanels.add(panel);
   let shell=panels.get(panel);
   if(!shell&&unified){shell={attrs:[]};mark(shell,panel,'data-fade-file-panel');panels.set(panel,shell)}
   if(!shell){
    const chrome=doc.createElement('div');chrome.className='fade-panel-chrome';
    const close=button('关闭预览面板','close',()=>{if(!fadeCloseFilePanel(panel))report('当前布局没有可用的原生关闭入口')});
    const title=doc.createElement('span');title.className='fade-panel-fallback-title';title.textContent='预览';chrome.append(title,close);panel.prepend(chrome);
    shell={added:chrome,attrs:[],close,title,host:null};mark(shell,panel,'data-fade-file-panel');panels.set(panel,shell);
   }
   // React can replace the pane's children without replacing the aside itself.
   if(!unified)for(const child of panel.children){
    if(child===shell.added)continue;
    const position=doc.defaultView?.getComputedStyle(child).position;
    if(position==='absolute')mark(shell,child,'data-fade-panel-absolute');
   }
   if(!unified)shell.close.disabled=!fadePanelCloseControl(panel);
   // Hide only the native informational read-only banner, using its message ID
   // rather than localized text. Keep actual errors and editor restrictions.
   for(const banner of panel.querySelectorAll('div.shrink-0.px-4.pt-3')){
    const content=banner.firstElementChild;
    if(!content)continue;
    const props=content[Object.keys(content).find(key=>key.startsWith('__reactProps$'))];
    if(props?.children?.props?.id==='textFileEditor.largeFileReadOnly')mark(shell,banner,'data-fade-readonly-notice');
    else if(banner.hasAttribute('data-fade-readonly-notice'))banner.removeAttribute('data-fade-readonly-notice');
   }
   const viewers=[...panel.querySelectorAll('[data-testid="viewer-header"],[data-browser-sidebar-toolbar]')].filter(visible);
   for(const header of viewers)adaptHeader(header);
   // Use the native tab strip when present; otherwise share the first header.
   // Only our own close node moves. React-owned controls are never reparented.
   if(!unified){
   const tabRow=[...panel.querySelectorAll('[data-app-shell-tab-row]')].find(visible);
   const host=tabRow||viewers.filter(h=>headers.has(h)).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top||b.getBoundingClientRect().right-a.getBoundingClientRect().right)[0]||null;
   if(shell.host!==host){if(shell.host)shell.host.removeAttribute('data-fade-close-host');shell.host=host}
   mark(shell,panel,'data-fade-panel-header',host?'integrated':'fallback');
   if(host){mark(shell,host,'data-fade-close-host');if(shell.added.parentElement!==host)host.append(shell.added)}
   else if(shell.added.parentElement!==panel)panel.prepend(shell.added);
   }
   for(const header of [...viewers,...panel.querySelectorAll('[class~="group/diff-header"]')]){
    if(!visible(header))continue;
    const meta=fadePanelFileMetadata(panel,header);if(!meta)continue;
    active.add(header);let state=states.get(header);
    if(!state){state=create(header,panel);states.set(header,state)}
    const trailing=headers.get(header)?.trailing||header;
    if(state.added.parentElement!==trailing)trailing.append(state.added);
    const path=fadeAbsoluteFile(meta);
    state.copy.disabled=!path;state.explorer.disabled=!path||meta.hostId!=='local'||!!meta.environmentId;
   }
  }
  for(const[h,state]of states)if(!active.has(h)){restore(state);states.delete(h)}
  for(const[h,state]of headers){if(!h.isConnected||!visible(h)||!activePanels.has(h.closest('aside'))){resize?.unobserve(h);resize?.unobserve(state.trailing);restore(state);headers.delete(h)}else layoutHeader(state)}
  for(const[panel,state]of panels)if(!activePanels.has(panel)){restore(state);panels.delete(panel)}
 }
 const observer=new MutationObserver(records=>{
  if(records.every(r=>r.target.closest?.('.fade-file-heading,.fade-panel-chrome')))return;
  if(!win?.requestAnimationFrame){sync();return}
  if(!frame)frame=win.requestAnimationFrame(()=>{frame=0;sync()});
 });
 observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','data-review-path','aria-hidden','hidden','data-tab-id','aria-pressed']});
 win?.addEventListener?.('fade-window-mode',sync);sync();
 return ()=>{stopped=true;disposeExternalHtml();win?.removeEventListener?.('fade-window-mode',sync);disposeDragState();observer.disconnect();resize?.disconnect();if(frame)win?.cancelAnimationFrame(frame);for(const state of states.values())restore(state);states.clear();for(const state of headers.values())restore(state);headers.clear();for(const state of panels.values())restore(state);panels.clear()};
}

// A viewport-anchored control for the existing native horizontal scrollport.
// It never moves editor nodes or changes document/selection state.
function installPreviewScrollbar(doc){
 const win=doc.defaultView,scope=':is([data-tab-id^="text-editor:"],[data-tab-id^="file:"])';
 const bar=doc.createElement('div'),slider=doc.createElement('input');
 bar.className='fade-preview-scrollbar';bar.setAttribute('data-visible','false');
 slider.type='range';slider.min='0';slider.step='1';slider.setAttribute('aria-label','预览代码横向滚动');slider.title='拖动以横向滚动代码';bar.append(slider);doc.body.append(bar);
 let pointer=null,active=null,dragging=false,frame=0,dead=false;
 const abort=new win.AbortController(),options={signal:abort.signal};
 const on=(el,name,fn,extra={})=>el.addEventListener(name,fn,{...options,...extra});
 const parent=el=>el.parentElement||el.getRootNode()?.host;
 function bounds(el){
  const r=el.getBoundingClientRect();let left=Math.max(0,r.left),right=Math.min(win.innerWidth,r.right),top=Math.max(0,r.top),bottom=Math.min(win.innerHeight,r.bottom);
  for(let p=parent(el);p;p=parent(p)){
   const s=win.getComputedStyle(p),b=p.getBoundingClientRect();
   if(/auto|scroll|hidden|clip/.test(s.overflowX)){left=Math.max(left,b.left);right=Math.min(right,b.right)}
   if(/auto|scroll|hidden|clip/.test(s.overflowY)){top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom)}
  }
  return {left,right,top,bottom,width:right-left,height:bottom-top};
 }
 function candidates(){
  const nodes=[...doc.querySelectorAll(scope+' .cm-scroller')];
  for(const host of doc.querySelectorAll(scope+' diffs-container'))nodes.push(...(host.shadowRoot?.querySelectorAll('[data-code]')||[]));
  return nodes.filter(el=>el.isConnected&&el.clientWidth>0&&el.scrollWidth>el.clientWidth+1&&!el.closest('[hidden],[aria-hidden="true"]'));
 }
 function bind(el){
  if(active===el)return;
  active?.removeEventListener('scroll',schedule);resize.disconnect();contents.disconnect();active=el;
  if(el){el.addEventListener('scroll',schedule,{passive:true});resize.observe(el);if(parent(el))resize.observe(parent(el));contents.observe(el.getRootNode() instanceof win.ShadowRoot?el.getRootNode():el,{subtree:true,childList:true})}
 }
 function update(){
  frame=0;if(dead)return;
  let rect=active&&bounds(active);
  const control=bar.getBoundingClientRect(),overControl=pointer&&bar.getAttribute('data-visible')==='true'&&pointer.x>=control.left&&pointer.x<=control.right&&pointer.y>=control.top&&pointer.y<=control.bottom;
  if(!dragging&&!overControl){
   const match=pointer&&candidates().map(el=>({el,rect:bounds(el)})).find(({rect:r})=>r.width>64&&r.height>32&&pointer.x>=r.left&&pointer.x<=r.right&&pointer.y>=r.top&&pointer.y<=r.bottom&&(pointer.y<=r.top+r.height*.2||pointer.x>=r.right-r.width*.25));
   bind(match?.el||null);rect=match?.rect;
  }
  if(!active?.isConnected||!rect||rect.width<=64||rect.height<=32||active.scrollWidth<=active.clientWidth+1){bar.setAttribute('data-visible','false');return}
  const width=Math.min(140,rect.width-32);
  bar.style.left=rect.right-width-16+'px';bar.style.top=Math.min(rect.top+64,rect.bottom-32)+'px';bar.style.width=width+'px';
  slider.max=String(active.scrollWidth-active.clientWidth);slider.value=String(active.scrollLeft);
  slider.setAttribute('aria-valuetext',Math.round(active.scrollLeft/(active.scrollWidth-active.clientWidth)*100)+'%');bar.setAttribute('data-visible','true');
 }
 function schedule(){if(!dead&&!frame)frame=win.requestAnimationFrame(update)}
 const resize=new win.ResizeObserver(schedule),contents=new win.MutationObserver(schedule),mounts=new win.MutationObserver(schedule);
 mounts.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','aria-hidden','data-tab-id','data-app-shell-active-page']});
 on(doc,'pointermove',e=>{pointer={x:e.clientX,y:e.clientY};schedule()},{passive:true});
 on(doc,'pointerleave',()=>{pointer=null;schedule()});on(win,'resize',schedule);on(doc,'scroll',schedule,{capture:true,passive:true});
 on(slider,'pointerdown',e=>{if(e.button!==0)return;dragging=true;slider.setPointerCapture(e.pointerId)});
 const end=()=>{dragging=false;schedule()};on(slider,'pointerup',end);on(slider,'pointercancel',end);on(slider,'lostpointercapture',end);
 on(slider,'input',()=>{if(active){active.scrollLeft=Number(slider.value);schedule()}});
 on(win,'blur',()=>{pointer=null;dragging=false;schedule()});
 return ()=>{dead=true;abort.abort();if(frame)win.cancelAnimationFrame(frame);mounts.disconnect();resize.disconnect();contents.disconnect();active?.removeEventListener('scroll',schedule);bar.remove()};
}

// Observe disk metadata without changing native editor state. Only an explicit
// refresh may apply a snapshot, through the editor's own conflict machinery.
function fadePreviewPath(path){
 if(typeof path!=='string')return null;
 const normalized=path.replace(/^\/([a-z]:[\\/])/i,'$1').replaceAll('\\','/');
 return /^[a-z]:\//i.test(normalized)?normalized.toLowerCase():normalized;
}
function fadePreviewController(pane,meta){
 const candidates=new Set([pane]);
 // Native editors create their inner DOM imperatively. Its nearest React-owned
 // ancestor, not the diffs-container itself, carries the editor's hook refs.
 for(const host of pane.querySelectorAll('diffs-container,.cm-editor,[contenteditable]'))for(let el=host;el;el=el.parentElement){candidates.add(el);if(el===pane)break}
 let client=null;
 for(const element of candidates){
  let fiber=element[Object.keys(element).find(k=>k.startsWith('__reactFiber$'))];
  if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
  for(let depth=0;fiber&&depth<70;depth++,fiber=fiber.return){
   for(let hook=fiber.memoizedState,count=0;hook&&typeof hook==='object'&&count++<100;hook=hook.next){
    const value=hook.memoizedState?.current;
    if(value?.queryClient?.getQueryCache)client=value.queryClient;
    const path=value?.options?.filePath??value?.filePath;
    const host=value?.options?.hostId??value?.hostId;
    if(fadePreviewPath(path)===fadePreviewPath(meta.path)&&host===meta.hostId&&typeof value.readFile==='function'&&typeof value.applyDiskSnapshot==='function'&&typeof value.resolveExternalChange==='function'&&typeof value.emitState==='function')return {editor:value};
   }
   for(let context=fiber.dependencies?.firstContext;context;context=context.next){const value=context.memoizedValue;if(value?.getQueryCache)client=value;if(value?.queryClient?.getQueryCache)client=value.queryClient}
  }
 }
 // Never refetch underneath an editor whose dirty-state controller is unknown.
 if(pane.querySelector('.cm-editor,[contenteditable="true"]'))return null;
 const query=client?.getQueryCache().getAll().find(q=>{
  if(!q.queryKey.includes('read-file')||typeof q.options?.queryFn!=='function')return false;
  try{const params=JSON.parse(q.queryKey.at(-1));return fadePreviewPath(params.path)===fadePreviewPath(meta.path)&&params.hostId===meta.hostId&&typeof q.state.data?.contents==='string'}catch{return false}
 });
 return query?{query}:null;
}
function fadePreviewContent(editor){return typeof editor.getContent==='function'?editor.getContent():editor.state?.file?.contents}
function fadePreviewDirty(editor){
 const document=typeof editor.getDocument==='function'?editor.getDocument():editor.document;
 return editor.isClosing||editor.isDisposed||editor.abortController?.signal.aborted||(editor.hasUnsavedChanges&&document?.kind!=='conflict')||editor.savePromise!=null||editor.pendingEditorChange!=null||editor.selectionEdit!=null||!['ready','conflict'].includes(document?.kind)||fadePreviewContent(editor)!==document.baseContent;
}
function fadePreviewDocument(editor){return typeof editor.getDocument==='function'?editor.getDocument():editor.document}
// Own external changes at the native controller, not by hiding its review DOM.
// Reads remain native (including remote storage); writes retain native mtime CAS.
function fadeOwnPreviewEditor(editor,notify,manualOnly=false){
 const originals=new Map(),wrappers=new Map();let released=false,manual=false,checking=null,generation=0;
 const state={stale:false,hint:true,error:null,snapshot:null,lastCheck:0,locked:true,saving:false};
 const nativeSaveKey=Symbol.for('fcodex.preview.nativeSave');
 function observe(snapshot){
  if(typeof snapshot?.content!=='string')throw Error('文件内容读取失败');
  generation++;
  state.snapshot=snapshot;state.hint=false;state.error=null;state.lastCheck=Date.now();
  state.stale=snapshot.content!==fadePreviewDocument(editor)?.baseContent;
  if(state.stale)editor.clearAutosaveTimeout?.();
  else if(snapshot.mtimeMs!=null)editor.baseMtimeMs=snapshot.mtimeMs;
  notify();
 }
 async function check(){
  if(released)return;
  if(checking)return checking;
  const version=generation;
  checking=(async()=>{try{const snapshot=await editor.readFile();if(!released&&generation===version)observe(snapshot)}catch(error){if(!released&&generation===version){state.error=error;state.hint=true;notify()}}finally{checking=null}})();
  return checking;
 }
 function wrap(name,fn){if(typeof editor[name]!=='function')return;originals.set(name,{own:Object.hasOwn(editor,name),value:editor[name]});wrappers.set(name,fn);editor[name]=fn}
 const apply=editor.applyDiskSnapshot,save=editor[nativeSaveKey]??editor.save;
 wrap('syncExternalChange',async function(){if(released)return;state.hint=true;editor.hasPendingExternalChange=false;notify();await check()});
 wrap('applyDiskSnapshot',function(snapshot,...args){if(manual)return apply.call(this,snapshot,...args);observe(snapshot)});
 async function saveChecked(...args){
  // Even a missed watcher event or an atomic replace cannot silently save over
  // a known external version. Read before saving; the native CAS handles races.
  await check();
  if(released||state.stale||state.error||state.hint){notify();return false}
  if(editor.isClosing||editor.abortController?.signal.aborted)return false;
  return save.apply(editor,args);
 }
 if(save)wrap('save',manualOnly?async()=>false:saveChecked);
 const onStateChange=editor.options?.onStateChange;
 const projected=typeof onStateChange==='function'?function(value){return onStateChange.call(this,{...value,isReadOnly:state.locked||value.isReadOnly})}:null;
 if(manualOnly){
  if(save)editor[nativeSaveKey]=save;
  editor.clearAutosaveTimeout?.();
  wrap('scheduleAutosave',function(){editor.clearAutosaveTimeout?.()});
  wrap('saveUntilClean',async()=>false);
  for(const [name,rejected]of [['updateContent',undefined],['completeEdit','reject'],['markPotentiallyDirty',undefined],['requestSelectionEdit','failed'],['resolveSelectionEdit',null]]){
   const original=editor[name];wrap(name,function(...args){if(state.locked)return rejected;const result=original.apply(this,args);notify();return result});
  }
  const emit=editor.emitState;wrap('emitState',function(...args){const result=emit.apply(this,args);notify();return result});
  if(projected)editor.options.onStateChange=projected;
 }

 // Invalidate a watcher read that began before we took ownership.
 if(typeof editor.externalSyncRevision==='number')editor.externalSyncRevision++;
 const document=fadePreviewDocument(editor);
 if(document?.kind==='conflict'&&editor.reviewDiskSnapshot){
  observe(editor.reviewDiskSnapshot);
  // Preserve the local buffer and its original base. Rejecting through the
  // native action would turn it into a save candidate against the new disk.
  editor.reviewDiskSnapshot=null;
  if(typeof editor.getDocument!=='function'){editor.document={kind:'ready',baseContent:document.baseContent};editor.hasUnsavedChanges=fadePreviewContent(editor)!==document.baseContent}
  editor.clearAutosaveTimeout?.();editor.emitState();editor.flushDraftSnapshot?.();
 }
 if(manualOnly)editor.emitState();
 return {state,check,
  get editable(){return manualOnly&&!!projected&&typeof save==='function'&&typeof editor.updateContent==='function'&&!editor.state?.isReadOnly},
  get dirty(){return editor.pendingEditorChange!=null||fadePreviewContent(editor)!==fadePreviewDocument(editor)?.baseContent},
  async setLocked(locked){
   if(released)return;
   // Let the native pending edit commit to its buffer before switching read-only.
   if(locked)await editor.waitForPendingEditorChange?.();
   if(released||editor.isClosing)return;
   state.locked=locked;editor.emitState();notify();
  },
  async saveNow(){
   if(!manualOnly||released||!save||state.saving)return false;
   state.saving=true;notify();
   try{await editor.waitForPendingEditorChange?.();if(editor.savePromise)await editor.savePromise;if(released)return false;return await saveChecked()}
   finally{state.saving=false;notify()}
  },
  async refresh(isCurrent,confirmDiscard){
   if(editor.savePromise||editor.pendingEditorChange||editor.selectionEdit||editor.isClosing||editor.isDisposed)throw Error('编辑或保存尚未完成，请稍后刷新');
   const content=fadePreviewContent(editor),document=fadePreviewDocument(editor),revision=editor.diskReadRevision;
   if(!document||typeof content!=='string')throw Error('编辑器尚未就绪');
   const dirty=content!==document.baseContent;
   if(dirty&&!confirmDiscard())return false;
   const snapshot=await editor.readFile();
   if(released||editor.isClosing||editor.isDisposed||editor.abortController?.signal.aborted||!isCurrent())throw Error('预览已切换，请在当前文件中重试');
   if(editor.savePromise||editor.pendingEditorChange||editor.selectionEdit||fadePreviewContent(editor)!==content||editor.diskReadRevision!==revision||fadePreviewDocument(editor)?.baseContent!==document.baseContent)throw Error('读取期间编辑器发生变化，请重试');
   if(typeof snapshot?.content!=='string')throw Error('文件内容读取失败');
   editor.diskReadRevision++;manual=true;
   try{
    apply.call(editor,snapshot,content);
    // Refresh also supports explicitly discarding local edits when the disk
    // itself has not changed; native "accept" needs a conflict snapshot.
    if(fadePreviewContent(editor)!==snapshot.content&&fadePreviewDocument(editor)?.kind!=='conflict'){
     editor.reviewDiskSnapshot=snapshot;
     if(typeof editor.getDocument!=='function')editor.document={kind:'conflict',baseContent:document.baseContent,diskContent:snapshot.content};
    }
    if(fadePreviewDocument(editor)?.kind==='conflict')editor.resolveExternalChange('accept');
    else {editor.emitState();editor.flushDraftSnapshot?.()}
   }finally{manual=false}
   if(fadePreviewContent(editor)!==snapshot.content)throw Error('原生预览未完成更新');
   observe(snapshot);return true;
  },
  release(){if(released)return;released=true;editor.clearAutosaveTimeout?.();if(projected&&editor.options.onStateChange===projected)editor.options.onStateChange=onStateChange;for(const [name,original]of originals)if(editor[name]===wrappers.get(name)){if(original.own)editor[name]=original.value;else delete editor[name]}
   // A native unmount can save after our cleanup. Keep disk writes disabled
   // for this controller's remaining lifetime; a new owner uses nativeSaveKey.
   if(manualOnly){editor.save=async()=>false;editor.saveUntilClean=async()=>false;editor.emitState()}
  },
 };
}
async function fadeRefreshPreviewEditor(editor,isCurrent){
 if(fadePreviewDirty(editor))throw Error('有未保存编辑或待处理更改，请先保存或处理后再刷新');
 const content=fadePreviewContent(editor),revision=editor.diskReadRevision;
 const snapshot=await editor.readFile();
 if(!isCurrent())throw Error('预览已切换，请在当前文件中重试');
 if(fadePreviewDirty(editor)||fadePreviewContent(editor)!==content||editor.diskReadRevision!==revision)throw Error('读取期间编辑器内容发生变化，请重试');
 if(typeof snapshot?.content!=='string')throw Error('文件内容读取失败');
 // No asynchronous gap between the final dirty check and native application.
 editor.diskReadRevision++;
 editor.applyDiskSnapshot(snapshot,content);
 const document=typeof editor.getDocument==='function'?editor.getDocument():editor.document;
 if(document?.kind==='conflict')editor.resolveExternalChange('accept');
 else {editor.emitState();editor.flushDraftSnapshot?.()}
 if(fadePreviewContent(editor)!==snapshot.content)throw Error('原生预览未完成更新');
 return snapshot;
}
function installPreviewFreshness(doc,report){
 const win=doc.defaultView,states=new Map(),owned=new Map(),pending=new Map();let stopped=false,running=false,scanTimer=0,positionFrame=0;
 if(!win?.electronBridge?.sendMessageFromView)return ()=>{};
 win.__fadePreviewFreshnessDispose?.();
 const svg=path=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
 const lockedIcon=svg('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>');
 const unlockedIcon=svg('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2M12 14v3"/>');
 const staleIcon=svg('<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 7v6" stroke="#fff" stroke-width="2"/><circle cx="12" cy="16.5" r="1" fill="#fff" stroke="none"/>');
 const dirtyIcon=svg('<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m8 14 6-6 2 2-6 6-3 1Z" stroke="#fff" stroke-width="1.5"/>');
 async function saveState(state){
  if(!current(state)||!state.owner)return;
  if(state.busy||state.owner.state.saving)return;
  try{const saved=await state.owner.saveNow();if(!current(state))return;
   if(!saved){if(state.owner.state.stale||state.owner.state.error)win.alert('文件已过期或无法确认磁盘版本，已阻止保存覆盖。请先复制并备份当前文档内容，再刷新文件并合并修改。');else report('文件未保存，请等待编辑完成后重试。')}
   else report('文件已保存');
  }catch(error){if(current(state))report('保存失败：'+error.message)}finally{if(current(state))render(state)}
 }
 function eventState(event){const path=event.composedPath();return [...states.values()].find(state=>current(state)&&visible(state.pane)&&(path.includes(state.pane)||state.pane.contains(doc.activeElement)||path.includes(state.bar.parentElement)))}
 function keydown(event){
  const state=eventState(event);if(!state)return;
  if((event.ctrlKey||event.metaKey)&&!event.altKey&&event.key.toLowerCase()==='s'){event.preventDefault();event.stopImmediatePropagation();void saveState(state);return}
  const close=(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='w'||event.key==='Delete'&&event.composedPath().some(el=>el?.getAttribute?.('role')==='tab');
  if(close&&!confirmClose([state])){event.preventDefault();event.stopImmediatePropagation()}
 }
 function confirmClose(list){return !list.some(state=>state.owner?.dirty)||win.confirm('文件有未保存的修改。关闭不会自动保存，请先按 Ctrl+S 保存，或复制备份内容。\n\n仍要关闭吗？')}
 function closeClick(event){
  const path=event.composedPath(),button=path.find(el=>el?.tagName==='BUTTON');if(!button)return;
  const tab=path.find(el=>el?.dataset?.fadePreviewPanel),native=path.find(el=>el?.dataset?.tabId);
  const all=button.classList.contains('fade-window-close-pane')&&button.title==='关闭所有预览';
  const closing=all||button.classList.contains('fade-gpt-close')&&tab||native&&/close|关闭/i.test(button.getAttribute('aria-label')||'');
  if(!closing)return;
  const list=[...states.values()].filter(state=>all||tab&&state.pane.closest('[data-fade-preview-panel]')?.dataset.fadePreviewPanel===tab.dataset.fadePreviewPanel||native&&state.tabId===native.dataset.tabId);
  if(!confirmClose(list)){event.preventDefault();event.stopImmediatePropagation()}
 }
 function beforeUnload(event){if([...states.values()].some(state=>state.owner?.dirty)){event.preventDefault();event.returnValue=''}}
 function receive(event){const data=event.data,entry=pending.get(data?.requestId);if(data?.type!=='fetch-response'||!entry)return;entry.finish(data.responseType==='success'&&(!data.status||data.status<400)?null:Error('文件可能已删除、移动或暂时无法读取'),data)}
 win.addEventListener('message',receive);
 function metadata(meta){return new Promise((resolve,reject)=>{
  const requestId=win.crypto.randomUUID();
  const finish=(error,data)=>{const entry=pending.get(requestId);if(!entry)return;win.clearTimeout(entry.timer);pending.delete(requestId);if(error)reject(error);else try{resolve(JSON.parse(data.bodyJsonString))}catch{reject(Error('文件状态返回格式无效'))}};
  const timer=win.setTimeout(()=>finish(Error('文件状态检查超时')),5000);pending.set(requestId,{finish,timer});
  Promise.resolve().then(()=>win.electronBridge.sendMessageFromView({type:'fetch',requestId,method:'POST',url:'vscode://codex/read-file-metadata',body:JSON.stringify({hostId:meta.hostId,path:meta.path})})).catch(finish);
 })}
 const visible=el=>el.isConnected&&!el.closest('[hidden],[aria-hidden="true"],[data-app-shell-active-page="false"]')&&el.getClientRects().length>0;
 const signature=data=>JSON.stringify([data.mtimeMs,data.sizeBytes]);
 function paint(state,message,stale=false){
  state.stale=stale;state.bar.title=message;state.bar.setAttribute('aria-label',message);state.bar.style.display=stale||state.owner?.dirty?'inline-flex':'none';
  const kind=stale?'stale':'dirty';if(state.bar.dataset.kind!==kind){state.bar.dataset.kind=kind;state.bar.innerHTML=kind==='stale'?staleIcon:dirtyIcon}const flag=String(stale);if(state.bar.dataset.stale!==flag)state.bar.dataset.stale=flag;
  state.button.disabled=state.busy||!state.target;
  state.button.title=state.busy?'正在刷新…':!state.target?'等待编辑器连接':'刷新文件预览';
  state.button.setAttribute('aria-busy',String(state.busy));state.button.dataset.stale=flag;schedulePosition();
 }
 function render(state){
  const locked=state.owner?.state.locked!==false;
  state.lock.disabled=!state.owner?.editable||state.busy||state.owner?.state.saving;
  state.lock.title=!state.owner?.editable?'当前文件只读，或编辑接口尚未就绪':locked?'已锁定 · 点击解锁编辑（Ctrl+S 保存）':'已解锁 · 点击锁定编辑（Ctrl+S 保存）';
  state.lock.setAttribute('aria-label',state.lock.title);state.lock.setAttribute('aria-pressed',String(locked));
  const lockFlag=String(locked);if(state.lock.dataset.locked!==lockFlag){state.lock.dataset.locked=lockFlag;state.lock.innerHTML=locked?lockedIcon:unlockedIcon}
  if(state.busy)return;
  const status=state.owner?.state;
  if(!state.target)paint(state,'等待原生编辑器连接…');
  else if(status?.error)paint(state,'无法读取文件 · 当前预览可能过期',true);
  else if(status?.stale)paint(state,fadePreviewDirty(state.target.editor)?'文件已更新 · 有本地编辑，刷新前需确认':'文件已更新 · 当前预览已过期',true);
  else if(state.owner?.dirty)paint(state,state.owner.state.saving?'正在保存…':'文件有未保存的修改 · Ctrl+S 保存');
  else if(status?.hint)paint(state,'正在检查文件内容…');
  else if(status)paint(state,'FCodex · 文件内容未变化');
 }
 function current(state){return !stopped&&state.pane.isConnected&&state.pane.getAttribute('data-tab-id')===state.tabId&&states.get(state.pane)===state}
 function positionButtons(){
  positionFrame=0;if(stopped)return;
  for(const state of states.values()){
   const rect=state.pane.getBoundingClientRect(),bottom=Math.min(rect.bottom,win.innerHeight),right=Math.min(rect.right,win.innerWidth);
   const show=(state.stale||state.busy)&&current(state)&&visible(state.pane)&&!doc.documentElement.hasAttribute('data-fade-nav-open')&&right-Math.max(0,rect.left)>80&&bottom-Math.max(0,rect.top)>110;
   if(state.button.hidden===show)state.button.hidden=!show;if(!show)continue;
   state.button.style.left=(right-60)+'px';state.button.style.top=(bottom-60)+'px';
  }
 }
 function schedulePosition(){if(!stopped&&!positionFrame)positionFrame=win.requestAnimationFrame(positionButtons)}
 function unbind(state){
  const editor=state.target?.editor,entry=owned.get(editor);
  if(entry){entry.users.delete(state);if(!entry.users.size){entry.owner.release();owned.delete(editor)}}
  state.target=null;state.owner=null;
 }
 function bind(state,target){
  if(state.target?.editor===target?.editor&&state.target?.query===target?.query)return;
  unbind(state);state.target=target;state.baseline=null;
  if(target?.editor){
   let entry=owned.get(target.editor);
   if(!entry){
    entry={users:new Set(),owner:null};owned.set(target.editor,entry);
    entry.owner=fadeOwnPreviewEditor(target.editor,()=>{if(!stopped){for(const user of entry.users)if(current(user))render(user)}},true);
   }
   entry.users.add(state);state.owner=entry.owner;
  }
  render(state);
 }
 async function refresh(state){
  if(state.busy||!current(state)||!visible(state.pane))return;
  bind(state,fadePreviewController(state.pane,state.meta));const target=state.target,owner=state.owner;
  if(!target){paint(state,'当前版本尚未连接安全刷新接口',true);return}
  const started=Date.now();state.busy=true;paint(state,'正在加载最新内容…',true);
  const roots=[state.pane,...[...state.pane.querySelectorAll('diffs-container')].map(el=>el.shadowRoot).filter(Boolean)];
  const scrolls=roots.flatMap(root=>[root,...root.querySelectorAll('*')]).filter(el=>el.scrollTop||el.scrollLeft).map(el=>[el,el.scrollTop,el.scrollLeft]);
  try{
   let applied=true;
   if(owner)applied=await owner.refresh(()=>current(state)&&visible(state.pane)&&fadePreviewController(state.pane,state.meta)?.editor===target.editor,()=>win.confirm('文件中有尚未保存的本地编辑。刷新会放弃这些编辑并加载磁盘上的内容。请先复制保留需要的内容。\n\n是否放弃本地编辑并刷新？'));
   else await target.query.fetch(undefined,{cancelRefetch:false});
   await new Promise(resolve=>win.setTimeout(resolve,Math.max(0,400-(Date.now()-started))));
   if(!current(state))return;
   state.busy=false;if(!applied){render(state);return}
   state.baseline=null;if(owner)render(state);else paint(state,'FCodex · 已刷新');
   win.requestAnimationFrame(()=>{if(current(state)&&visible(state.pane))for(const [el,top,left]of scrolls)if(el.isConnected){el.scrollTop=top;el.scrollLeft=left}});
  }catch(error){if(current(state)){state.busy=false;paint(state,error.message||'刷新失败，保留原有内容',true);report('预览刷新失败：'+(error.message||'请重试'))}}
  finally{state.busy=false}
 }
 function mount(pane,meta){
  const header=pane.querySelector('[data-fade-viewer-header],[data-testid="viewer-header"]');if(!header)return null;
  const bar=doc.createElement('span'),button=doc.createElement('button'),lock=doc.createElement('button'),lockGroup=doc.createElement('div');
  lock.type='button';lock.className='fade-preview-lock';lockGroup.className='fade-file-heading fade-preview-edit-actions';lockGroup.append(lock);
  bar.className='fade-preview-freshness fade-tab-status fade-tab-status-reply';bar.setAttribute('role','img');
  bar.style.display='none';
  // Same 24-unit circle, rounded white mark and 13px status slot as chat tabs.
  bar.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 7v6" stroke="#fff" stroke-width="2"/><circle cx="12" cy="16.5" r="1" fill="#fff" stroke="none"/></svg>';
  button.type='button';button.className='fade-preview-refresh';button.hidden=true;button.setAttribute('aria-label','刷新文件预览');
  button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 6.1A8 8 0 0 1 19.7 10M4.3 14A8 8 0 0 0 17.9 17.9"/></svg>';
  const state={pane,meta,header,bar,button,lock,lockGroup,tabId:pane.getAttribute('data-tab-id'),baseline:null,busy:false,target:null,owner:null};
  lock.addEventListener('click',event=>{event.stopPropagation();if(state.owner?.editable)void state.owner.setLocked(!state.owner.state.locked)});
  button.addEventListener('click',event=>{event.stopPropagation();void refresh(state)});doc.body.append(button);states.set(pane,state);resize?.observe(pane);render(state);return state;
 }
 function attachBadge(state){
  const key=state.pane.closest('[data-fade-preview-panel]')?.dataset.fadePreviewPanel;
  const tabRoot=doc.getElementById('fade-codex-layer')?.shadowRoot;
  // Native tabs remain mounted behind the unified strip. Prefer the visible
  // FCodex tab before considering the native aria-controls association.
  let tab=key&&[...(tabRoot?.querySelectorAll('.fade-gpt-tab[data-fade-preview-panel]')??[])].find(el=>el.dataset.fadePreviewPanel===key);
  if(!tab&&state.pane.id)tab=[...doc.querySelectorAll('[role="tab"][aria-controls]')].find(el=>el.getAttribute('aria-controls')===state.pane.id);
  const actions=state.header.querySelector('.fade-file-heading:not(.fade-preview-edit-actions)')??state.lockGroup;
  if(actions===state.lockGroup&&!state.lockGroup.isConnected)(state.header.querySelector('[data-fade-header-trailing]')??state.header).append(state.lockGroup);
  if(state.lock.parentNode!==actions)actions.append(state.lock);
  const slot=tab?.querySelector('.fade-gpt-select')??tab;
  if(slot&&state.bar.parentNode!==slot)slot.append(state.bar);
 }
 function scan(){
  if(stopped)return;
  for(const [pane,state]of states)if(!current(state)||!state.button.isConnected){unbind(state);resize?.unobserve(pane);state.bar.remove();state.button.remove();state.lock.remove();state.lockGroup.remove();states.delete(pane)}
  for(const pane of doc.querySelectorAll('[data-tab-id^="text-editor:"],[data-tab-id^="file:"]')){
   const meta=fadeFileTabMetadata(pane.getAttribute('data-tab-id'));if(!meta||!fadeAbsoluteFile(meta))continue;
   const state=states.get(pane)||mount(pane,meta);if(state&&!state.busy)bind(state,fadePreviewController(pane,meta));
  }
  for(const state of states.values())attachBadge(state);
  schedulePosition();
 }
 function scheduleScan(){if(!stopped&&!scanTimer)scanTimer=win.setTimeout(()=>{scanTimer=0;scan();void poll()},100)}
 async function poll(){
  if(stopped||running||doc.hidden)return;running=true;
  try{
   for(const state of states.values()){
    if(stopped)break;
    if(!current(state)||!visible(state.pane)||state.busy||!state.target)continue;
    const target=state.target,owner=state.owner;
    try{
     // Periodic content reads catch atomic replacements preserving timestamps.
     if(owner&&(owner.state.hint||Date.now()-owner.state.lastCheck>=12000))await owner.check();
     else {
      const data=await metadata(state.meta);if(!current(state)||state.busy||state.target!==target)continue;
      if(data.isFile===false||data.mtimeMs==null)throw Error('文件已移动、删除或状态不可用');
      if(owner){if(data.mtimeMs!==owner.state.snapshot?.mtimeMs||data.sizeBytes!==owner.state.snapshot?.sizeBytes)await owner.check()}
      else{
       const version=target.query.state.dataUpdatedAt;
       if(!state.baseline||state.baseline.version!==version)state.baseline={version,signature:signature(data)};
       const stale=state.baseline.signature!==signature(data)||(state.meta.hostId==='local'&&data.mtimeMs>version);
       paint(state,stale?'文件已更新 · 当前预览可能过期':'FCodex · 文件未检测到更新',stale);
      }
     }
     if(current(state)&&!state.busy&&state.owner===owner&&owner)render(state);
    }catch(error){if(current(state)&&!state.busy){if(owner){owner.state.error=error;owner.state.hint=true}paint(state,error.message,true)}}
   }
  }finally{running=false}
 }
 const resize=win.ResizeObserver?new win.ResizeObserver(schedulePosition):null;
 const observer=new win.MutationObserver(scheduleScan);observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-tab-id','hidden','data-app-shell-active-page']});
 const tabRoot=doc.getElementById('fade-codex-layer')?.shadowRoot;if(tabRoot)observer.observe(tabRoot,{subtree:true,childList:true});
 const rootObserver=new win.MutationObserver(schedulePosition);rootObserver.observe(doc.documentElement,{attributes:true,attributeFilter:['data-fade-nav-open']});
 win.addEventListener('keydown',keydown,true);win.addEventListener('click',closeClick,true);win.addEventListener('beforeunload',beforeUnload);
 win.addEventListener('resize',schedulePosition);doc.addEventListener('scroll',schedulePosition,true);
 const timer=win.setInterval(()=>{scan();void poll()},4000),wake=()=>{scan();void poll()};win.addEventListener('focus',wake);doc.addEventListener('visibilitychange',wake);scan();void poll();
 function dispose(){
  if(stopped)return;stopped=true;win.removeEventListener('keydown',keydown,true);win.removeEventListener('click',closeClick,true);win.removeEventListener('beforeunload',beforeUnload);observer.disconnect();rootObserver.disconnect();resize?.disconnect();win.cancelAnimationFrame(positionFrame);win.clearTimeout(scanTimer);win.clearInterval(timer);win.removeEventListener('focus',wake);doc.removeEventListener('visibilitychange',wake);win.removeEventListener('message',receive);win.removeEventListener('resize',schedulePosition);doc.removeEventListener('scroll',schedulePosition,true);
  for(const entry of [...pending.values()])entry.finish(Error('Disposed'));for(const state of states.values()){unbind(state);state.bar.remove();state.button.remove();state.lock.remove();state.lockGroup.remove()}states.clear();
  if(win.__fadePreviewFreshnessDispose===dispose)delete win.__fadePreviewFreshnessDispose;
 }
 win.__fadePreviewFreshnessDispose=dispose;return dispose;
}

 const disposeFilePanel=installFilePanel(document,announce);
 const disposePreviewFreshness=installPreviewFreshness(document,announce);
 function fadeMessageRailInset(parentRight,fileLeft){return Math.max(18,Number.isFinite(fileLeft)?parentRight-fileLeft+18:18)}
function fadeMessagePreviewPosition(anchor,width,height,viewportHeight){return {left:Math.max(8,anchor.left-width-8),top:Math.max(48,Math.min(anchor.top+anchor.height/2-height/2,viewportHeight-height-12))}}
function installMessageRail(doc){
 const saved=new Map(),attrs=new Map(),observed=new Set();let pending=0,dead=false;
 function style(el,key,value){if(!saved.has(el))saved.set(el,new Map());const values=saved.get(el);if(!values.has(key))values.set(key,[el.style.getPropertyValue(key),el.style.getPropertyPriority(key)]);if(el.style.getPropertyValue(key)!==value)el.style.setProperty(key,value)}
 function mark(el,key){if(!attrs.has(el))attrs.set(el,new Set());attrs.get(el).add(key);if(!el.hasAttribute(key))el.setAttribute(key,'')}
 function watch(el){if(el&&!observed.has(el)){observed.add(el);resize?.observe(el)}}
 function sync(){
  pending=0;if(dead)return;
  const panels=[...doc.querySelectorAll('[data-fade-file-panel]')].map(p=>{watch(p);return p.getBoundingClientRect()}).filter(r=>r.width>0&&r.height>0);
  const rails=[...doc.querySelectorAll('[data-thread-user-message-navigation-rail-list]')];
  for(const list of rails){
   const nav=list.closest('nav');if(!nav)continue;
   const parent=nav.parentElement;if(!parent)continue;watch(parent);watch(nav);
   const rect=parent.getBoundingClientRect(),file=panels.find(r=>r.left>rect.left&&r.top<rect.bottom&&r.bottom>rect.top);
   mark(nav,'data-fade-message-rail');style(nav,'--fade-rail-inset',fadeMessageRailInset(rect.right,file?.left)+'px');
  }
  for(const preview of doc.querySelectorAll('[data-thread-user-message-navigation-tooltip-preview]')){
   const tooltip=preview.closest('[role=tooltip],[role=dialog]');if(!tooltip||tooltip.hidden||tooltip.getAttribute('aria-hidden')==='true')continue;
   const anchor=rails.flatMap(l=>[...l.querySelectorAll('[aria-describedby]')]).find(b=>(b.getAttribute('aria-describedby')||'').split(/\s+/).includes(tooltip.id));
   if(!anchor)continue;
   watch(tooltip);mark(tooltip,'data-fade-message-preview');
   // Native zoomed tooltips can have a separate positioning plane.
   const plane=tooltip.parentElement;
   if(plane&&plane!==doc.body&&plane.hasAttribute('data-overlay-owner')&&plane.style.transform)mark(plane,'data-fade-message-preview-plane');
   const a=anchor.getBoundingClientRect();style(tooltip,'--fade-preview-width',Math.max(80,Math.min(320,a.left-16))+'px');
   const box=tooltip.getBoundingClientRect(),pos=fadeMessagePreviewPosition(a,box.width,box.height,doc.documentElement.clientHeight);
   style(tooltip,'--fade-preview-left',pos.left+'px');style(tooltip,'--fade-preview-top',pos.top+'px');
  }
  for(const el of observed)if(!el.isConnected){resize?.unobserve(el);observed.delete(el);saved.delete(el);attrs.delete(el)}
 }
 function schedule(){if(!pending&&!dead)pending=window.requestAnimationFrame(sync)}
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 const observer=new MutationObserver(schedule);observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-describedby','aria-hidden','hidden','data-fade-file-panel','data-side']});
 const abort=new AbortController();for(const event of ['resize','scroll'])window.addEventListener(event,schedule,{capture:true,passive:true,signal:abort.signal});
 doc.addEventListener('pointerover',schedule,{passive:true,signal:abort.signal});doc.addEventListener('focusin',schedule,{signal:abort.signal});sync();
 return ()=>{dead=true;observer.disconnect();resize?.disconnect();abort.abort();if(pending)window.cancelAnimationFrame(pending);for(const[el,values]of saved)for(const[key,[value,priority]]of values){if(value)el.style.setProperty(key,value,priority);else el.style.removeProperty(key)}for(const[el,keys]of attrs)for(const key of keys)el.removeAttribute(key)};
}

 const disposeMessageRail=installMessageRail(document);
 // Native row presentation props are read-only; status/count semantics match 26.1007.9446.0.
function fadeReadChatStatus(row){
 const key=Object.keys(row).find(k=>k.startsWith('__reactFiber$'));let fiber=key?row[key]:null;
 if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
 let state=null,pending=null;
 for(let i=0;fiber&&i<24;i++,fiber=fiber.return){
  const p=fiber.memoizedProps;if(!p)continue;
  if(!state&&p.statusState&&['loading','idle'].includes(p.statusState.type))state=p.statusState;
  if(Array.isArray(p.chips)){
   if(p.chips.some(c=>c.id==='needs-input'))pending='reply';
   else if(!pending&&p.chips.some(c=>c.id==='awaiting-approval'))pending='approval';
  }
  if(p.statusPill?.label?.props?.id==='codex.localTaskRow.needsInput')pending='reply';
  if(state)break; // The nearest row owns these values, never a parent list.
 }
 const labels=[...(row.querySelectorAll?.('[role="status"][aria-label]')||[])].map(e=>e.getAttribute('aria-label')||'');
 const working=state?.type==='loading'||labels.some(s=>/^(Working|正在工作|工作中|处理中)$/i.test(s));
 const count=Number.isSafeInteger(state?.unreadCount)&&state.unreadCount>0?state.unreadCount:null;
 return {kind:pending||(working?'working':state?.type==='idle'?'idle':'unknown'),unread:state?.unread===true||!!count,count};
}
function fadeChatStatusLabel(status){
 if(!status)return '';
 if(status.acknowledged&&['completed','reply'].includes(status.kind))return '';
 if(status.kind==='reply')return '待回复';
 if(status.kind==='approval')return '待批准';
 if(status.kind==='working')return '正在工作';
 if(status.unread)return status.count?'新消息 '+(status.count>99?'99+':status.count):'新消息';
 return status.kind==='completed'?'工作完成':'';
}
function appendFadeChatStatus(button,chat){
 if(chat.status?.completionPending)button.dataset.completionPending='true';
 const label=fadeChatStatusLabel(chat.status);if(!label)return;
 const badge=document.createElement('span');badge.className='fade-chat-status';badge.dataset.status=chat.status.kind;
 badge.textContent=label;badge.title=chat.status.unread&&chat.status.kind==='completed'?'工作完成 · '+label:label;
 button.append(badge);
}
function fadeProjectMoreButton(container){
 return container?.querySelector('[data-app-action-sidebar-project-show-all-toggle]')||[...(container?.querySelectorAll('button')||[])].find(b=>!b.closest('[data-app-action-sidebar-thread-row],[data-app-action-sidebar-project-row]')&&/^(展开显示|收起显示|显示更多|显示更少|Show more|Show less)$/i.test(b.textContent.trim()));
}
// Read the current React presentation props without writing native stores.
function fadeNativeSectionKey(row){
 const key=Object.keys(row).find(k=>k.startsWith('__reactFiber$'));let fiber=key?row[key]:null;
 if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
 for(let i=0;fiber&&i<16;i++,fiber=fiber.return){const p=fiber.memoizedProps;if(typeof p?.sectionKey==='string')return p.sectionKey}
 return null;
}
function createNativeAdapter(doc, changed) {
 const prefix='data-app-action-sidebar-', attr=(el,key)=>el?.getAttribute(prefix+key);
 const all=selector=>[...doc.querySelectorAll(selector)].filter(row=>!row.closest?.('[data-app-shell-active-page="false"]'));
 const sectionSelector='[data-app-action-sidebar-section]';
 const sectionKeys=new WeakMap();let sectionSequence=0;
 function nativeSections(){return all(sectionSelector).filter(row=>attr(row,'section-heading')!==null).map(row=>{let id=fadeNativeSectionKey(row);const title=attr(row,'section-heading')||'';if(!id)id=({Pinned:'pinned',Projects:'threads',Connections:'threads',Recents:'chats',Tasks:'chats',Chats:'chats',Agents:'agents'})[title];if(!id){if(!sectionKeys.has(row))sectionKeys.set(row,'custom:fallback-'+(++sectionSequence));id=sectionKeys.get(row)}return {id,title,custom:id.startsWith('custom:'),expanded:attr(row,'section-collapsed')!=='true',row,chats:[],items:[]}})}
 const projectSelector=`[${prefix}project-row]`, threadSelector=`[${prefix}thread-row]`;
 const key=el=>[attr(el,'thread-kind'),attr(el,'thread-host-id'),attr(el,'thread-id')].join(':');
 let observer=null,timer=0,signature='',disposed=false;const lastStatus=new Map(),completionPending=new Set(),completionEvents=new Set(),lastActive=new Map(),acknowledged=new Set();
 const projectContainer=row=>row.closest('[data-sidebar-project-container-id]:not([data-sidebar-project-drop-zone])')||row.parentElement;
 function snapshot(){
  const sections=nativeSections();
  const owner=row=>sections.find(s=>s.row===row.closest?.(sectionSelector))||sections.find(s=>s.row.contains?.(row));
  const projects=all(projectSelector).map(row=>({id:attr(row,'project-id'),title:attr(row,'project-label')||row.getAttribute('aria-label')||row.textContent.trim(),expanded:attr(row,'project-collapsed')==='false',chats:[],row,container:projectContainer(row)})).filter(p=>p.id);
  for(const p of projects)p.sectionId=owner(p.row)?.id||'threads';
  const pinned=[],recent=[],seen=new Set();
  for(const row of all(threadSelector)){
   const id=key(row);if(!attr(row,'thread-id'))continue;
   const status=fadeReadChatStatus(row),previous=lastStatus.get(id);
   if(status.kind==='idle'&&(status.unread||['working','completed'].includes(previous?.kind)))status.kind='completed';
   const active=attr(row,'thread-active')==='true';
   // Keep the real status for transition detection; acknowledgement only hides its badge.
   if(previous&&(status.kind!==previous.kind||(status.count||0)>(previous.count||0)||(status.unread&&!previous.unread)))acknowledged.delete(id);
   if(previous?.kind==='working'&&status.kind==='completed'){completionEvents.add(id);completionPending.add(id)}
   if(active&&lastActive.get(id)===false&&['completed','reply'].includes(status.kind))acknowledged.add(id);
   if(status.kind==='working'||acknowledged.has(id))completionPending.delete(id);
   status.acknowledged=acknowledged.has(id);
   lastActive.set(id,active);status.completionPending=completionPending.has(id);
   lastStatus.set(id,status);
   const chat={id,title:attr(row,'thread-title')||row.textContent.trim(),active:attr(row,'thread-active')==='true',pinned:attr(row,'thread-pinned')==='true',status,row};
   const group=projects.find(p=>p.container?.contains(row));
   const section=owner(row);chat.sectionId=section?.id||null;
   const occurrence=(section?.custom?section.id+':'+(group?.id||''):chat.pinned?'pinned':group?.id||'recent')+':'+id;if(seen.has(occurrence))continue;seen.add(occurrence);
   (section?.custom?(group?group.chats:section.chats):chat.pinned?pinned:group?group.chats:recent).push(chat);
  }
  for(const p of projects){const more=fadeProjectMoreButton(p.container);p.moreLabel=more?(/收起|更少|less/i.test(more.textContent)?'收起更多':'展开更多'):null}
  for(const section of sections){const more=sectionMoreButton(section);section.moreLabel=more?more.textContent.trim():null;section.items=[...projects.filter(p=>p.sectionId===section.id).map(project=>({kind:'project',project,row:project.row})),...section.chats.map(chat=>({kind:'chat',chat,row:chat.row}))].sort((a,b)=>a.row.compareDocumentPosition?.(b.row)&2?1:-1)}
  return {groups:projects,pinned,recent,sections,ready:sections.some(s=>s.custom)||projects.length>0||pinned.length>0||recent.length>0};
 }
 function refresh(){
  if(disposed)return;const data=snapshot();
  const next=JSON.stringify([data.sections.map(s=>[s.id,s.title,s.expanded,s.moreLabel,s.items.map(i=>i.kind==='project'?['project',i.project.id]:['chat',i.chat.id,i.chat.title,i.chat.active,i.chat.status])]),data.pinned.map(c=>[c.id,c.title,c.active,c.pinned,c.status]),data.groups.map(g=>[g.id,g.title,g.expanded,g.moreLabel,g.chats.map(c=>[c.id,c.title,c.active,c.pinned,c.status])]),data.recent.map(c=>[c.id,c.title,c.active,c.pinned,c.status])]);
  if(next!==signature||completionEvents.size){signature=next;data.completedIds=[...completionEvents];completionEvents.clear();changed(data)}
 }
 function click(el){if(!el?.isConnected||el.disabled||el.getAttribute('aria-disabled')==='true')return false;el.click();return true}
 function sectionMoreButton(s){return [...(s?.row.querySelectorAll('button')||[])].find(b=>!b.closest('[data-sidebar-project-container-id],'+projectSelector+','+threadSelector)&&/^(展开显示|收起显示|显示更多|显示更少|更多|Show more|Show less|Load more)$/i.test(b.textContent.trim()))}
 function sectionMore(id){return click(sectionMoreButton(nativeSections().find(s=>s.id===id)))}
 function toggleSection(id,open){const s=nativeSections().find(s=>s.id===id);return !!s&&(s.expanded===open||click(s.row.querySelector('[data-app-action-sidebar-section-toggle]')))}
 function sectionMenu(id){const s=nativeSections().find(s=>s.id===id);return [...(s?.row.querySelectorAll('button[aria-haspopup="menu"]')||[])].find(b=>!b.closest(projectSelector+','+threadSelector))||null}
 function toggle(id,open){const p=snapshot().groups.find(p=>p.id===id);if(!p)return false;if(p.expanded===open)return true;return click(p.row)}
 function select(id){
  snapshot();
  const ok=click(all(threadSelector).find(row=>key(row)===id));
  if(ok){if(['completed','reply'].includes(lastStatus.get(id)?.kind))acknowledged.add(id);completionPending.delete(id);refresh()}
  return ok;
 }
 function newChat(projectId){
  if(projectId){
   const project=snapshot().groups.find(p=>p.id===projectId);
   const buttons=project?.row.querySelectorAll('button')||[];
   return click([...buttons].find(el=>/^(?:在 .+ 中(?:开始|新建)新?聊天|(?:Start|New|Create).* (?:in|for) .+)$/i.test(el.getAttribute('aria-label')||'')));
  }
  const scope=doc.querySelector('.app-shell-left-panel')||doc;
  const candidates=[...scope.querySelectorAll('button,a,[role="button"]')];
  const names=/^(?:新聊天|新建聊天|新任务|新建任务|New chat|New thread|New task)(?:\s|$)/i;
  return click(candidates.find(el=>names.test((el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').trim())));
 }
 function ensureSidebar(){const frame=doc.querySelector('[data-app-shell-sidebar-open="false"]');const ok=frame?click(frame.querySelector('[data-app-shell-sidebar-trigger]')):true;for(const heading of ['Pinned','Projects']){const section=doc.querySelector('[data-app-action-sidebar-section-heading="'+heading+'"][data-app-action-sidebar-section-collapsed="true"]');if(section)click(section.querySelector('[data-app-action-sidebar-section-toggle]'))}return ok}
 function contextMenu(id,x,y){
  const row=all(threadSelector).find(row=>key(row)===id);
  if(!row?.isConnected)return false;
  row.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:x,clientY:y,view:doc.defaultView}));
  return true;
 }
 function more(id){const p=snapshot().groups.find(p=>p.id===id);return click(fadeProjectMoreButton(p?.container))}
 function chatAction(id,action){
  const row=all(threadSelector).find(row=>key(row)===id);
  const labels=action==='pin'?/^(置顶聊天|取消置顶聊天|取消置顶|Pin chat|Unpin chat|Pin thread|Unpin thread)$/i:action==='archive'?/^(归档聊天|Archive chat|Archive thread)$/i:null;
  if(!row||!labels)return false;
  return click([...row.querySelectorAll('button')].find(b=>labels.test(b.getAttribute('aria-label')||'')));
 }
 function start(){
  refresh();observer=new MutationObserver(records=>{
   if(!records.some(r=>(r.target.nodeType===1?r.target:r.target.parentElement)?.closest('.app-shell-left-panel,[data-slate-sidebar-content]')||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches?.('.app-shell-left-panel,[data-slate-sidebar-content]')||n.querySelector?.(projectSelector+','+threadSelector)))))return;
   clearTimeout(timer);timer=setTimeout(refresh,100);
  });
  observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-app-action-sidebar-section-heading','data-app-action-sidebar-section-collapsed','data-app-action-sidebar-thread-pinned','data-app-action-sidebar-project-collapsed','data-app-action-sidebar-project-label','data-app-action-sidebar-thread-title','data-app-action-sidebar-thread-active','aria-label','class','title']});
 }
 return {snapshot,refresh,start,toggleSection,sectionMore,sectionMenu,toggle,select,newChat,contextMenu,chatAction,ensureSidebar,more,destroy(){disposed=true;observer?.disconnect();clearTimeout(timer)}};
}

 const restored=new Set(),nativeFocus=new Map();
 function syncNativeFocus(){for(const el of document.querySelectorAll('.app-shell-left-panel')){if(!nativeFocus.has(el))nativeFocus.set(el,{inert:el.inert,aria:el.getAttribute('aria-hidden')});const hidden=!root.hasAttribute('data-fade-settings')&&root.hasAttribute('data-fade-shell')&&!root.hasAttribute('data-fade-native-tools')&&!root.hasAttribute('data-fade-account-access')&&!root.hasAttribute('data-fade-rail-open');el.inert=hidden||nativeFocus.get(el).inert;if(hidden)el.setAttribute('aria-hidden','true');else if(nativeFocus.get(el).aria===null)el.removeAttribute('aria-hidden');else el.setAttribute('aria-hidden',nativeFocus.get(el).aria)}}
 let settingsPage=false;
 function syncSettingsNavigation(){
  const visible=[...document.querySelectorAll('[data-settings-panel-slug]')].some(el=>!el.closest('[hidden],[data-app-shell-active-page="false"]'));
  if(visible===settingsPage)return;settingsPage=visible;
  root.toggleAttribute('data-fade-settings',visible);syncNativeFocus();
 }
 let settingsFrame=0;
 const settingsObserver=new MutationObserver(()=>{if(!settingsFrame)settingsFrame=requestAnimationFrame(()=>{settingsFrame=0;syncSettingsNavigation()})});
 settingsObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','data-app-shell-active-page']});
 syncSettingsNavigation();
 let chatPicker=null;
 const adapter=createNativeAdapter(document,data=>{
  groups=data.groups;recent=data.recent;pinned=data.pinned??[];sections=data.sections??[];for(const section of sections)if(section.custom)expanded[section.id]=section.expanded;
  if(data.completedIds?.length){
   if(!reduceMotion.matches){shakeCore();wakeParticles()}
  }
  if(data.ready)root.setAttribute('data-fade-shell','orb');else root.removeAttribute('data-fade-shell');
  syncNativeFocus();
  for(const g of groups){expanded[g.id]=g.expanded;if(!restored.has(g.id)){restored.add(g.id);if(Object.hasOwn(savedExpanded,g.id)&&savedExpanded[g.id]!==g.expanded)setTimeout(()=>adapter.toggle(g.id,savedExpanded[g.id]),0)}}
  if(navOpen)renderRows();
  chatPicker?.refresh();
 });
 const headerTabsScroll=$('#headerTabsScroll');
 function installFadeTabReorder(list,tabs,keyOf,refresh){
 let dragging=null,indicator=null,suppressClickUntil=0;
 function clearIndicator(){indicator?.removeAttribute('data-fade-drop');indicator=null}
 function reset(){clearIndicator();dragging=null;list.removeAttribute('data-fade-dragging')}
 function position(item,event){const rect=item.getBoundingClientRect();return event.clientX<rect.left+rect.width/2?'before':'after'}
 function bind(item,tab){
  item.draggable=true;
  item.ondragstart=event=>{
   if(event.target.closest?.('.fade-gpt-close')){event.preventDefault();return}
   dragging=keyOf(tab);list.setAttribute('data-fade-dragging','');
   event.stopPropagation();event.dataTransfer.effectAllowed='move';
   event.dataTransfer.setData('text/plain',dragging);
  };
  item.ondragover=event=>{
   if(dragging===null)return;
   event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='move';
   clearIndicator();if(keyOf(tab)!==dragging){indicator=item;item.setAttribute('data-fade-drop',position(item,event))}
   const viewport=list.closest?.('.fade-tabs-scroll');
   if(viewport){const rect=viewport.getBoundingClientRect();if(event.clientX<rect.left+28)viewport.scrollLeft-=18;else if(event.clientX>rect.right-28)viewport.scrollLeft+=18}
  };
  item.ondragleave=event=>{if(!item.contains(event.relatedTarget)&&indicator===item)clearIndicator()};
  item.ondrop=event=>{
   if(dragging===null)return;
   event.preventDefault();event.stopPropagation();
   const from=tabs.findIndex(t=>keyOf(t)===dragging),target=tabs.indexOf(tab),after=position(item,event)==='after';
   suppressClickUntil=Date.now()+350;reset();
   if(from<0||target<0||from===target)return;
   const [moving]=tabs.splice(from,1),destination=tabs.indexOf(tab)+(after?1:0);tabs.splice(destination,0,moving);refresh();
  };
  item.ondragend=()=>{suppressClickUntil=Date.now()+350;reset()};
 }
 const blockClick=event=>{if(dragging!==null||Date.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation()}};
 list.addEventListener('click',blockClick,true);
 return {bind,destroy(){reset();list.removeEventListener('click',blockClick,true)}};
}

// Read the mounted native router; never reload the app or emulate a ChatGPT backend.
function fadeNativeRouter(doc){
 const el=doc.querySelector('[data-app-shell-frame]');
 const key=el&&Object.keys(el).find(k=>k.startsWith('__reactFiber$'));
 let fiber=key?el[key]:null,navigator=null,location=null;
 if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
 for(let depth=0;fiber&&depth<100;depth++,fiber=fiber.return){
  const values=[fiber.memoizedProps?.value];
  for(let context=fiber.dependencies?.firstContext;context;context=context.next)values.push(context.memoizedValue);
  for(const value of values){
   if(!navigator&&typeof value?.navigator?.push==='function'&&typeof value.navigator.createHref==='function')navigator=value.navigator;
   if(!location&&typeof value?.location?.pathname==='string')location=value.location;
  }
 }
 return navigator&&location?{navigator,location}:null;
}
function fadeGptPath(path){return /^\/c\/[^/?#]+$/.test(path||'')?path:null}
function fadeHasMessageId(value,id,depth=0){
 if(!value||depth>12)return false;
 if(Array.isArray(value))return value.some(v=>fadeHasMessageId(v,id,depth+1));
 return value.props?.id===id||fadeHasMessageId(value.props?.children,id,depth+1);
}
function fadeNativeChatMode(doc){
 return [...doc.querySelectorAll('button[aria-pressed]')].find(button=>{
  if(button.disabled||button.closest('[hidden],[aria-hidden="true"],[data-app-shell-active-page="false"]'))return false;
  const key=Object.keys(button).find(k=>k.startsWith('__reactProps$'));
  return key&&fadeHasMessageId(button[key]?.children,'composer.home.modeToggle.chat');
 })||null;
}
// The product selector (Codex / ChatGPT) is separate from Chat / Work.
function fadeNativeProductMode(doc){
 for(const button of doc.querySelectorAll('button[aria-haspopup="menu"]')){
  const key=Object.keys(button).find(k=>k.startsWith('__reactProps$'));
  if(!key||!['codex','chatGpt','chatGptWork.unavailable'].some(id=>fadeHasMessageId(button[key]?.children,'sidebarElectron.productMode.'+id)))continue;
  const fiberKey=Object.keys(button).find(k=>k.startsWith('__reactFiber$'));
  let fiber=button[fiberKey];
  if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
  for(let depth=0;fiber&&depth<30;depth++,fiber=fiber.return){
   const props=fiber.memoizedProps;
   if(typeof props?.onModeSelect==='function'&&['codex','work'].includes(props.mode))return props;
  }
 }
 return null;
}
// Request native expiry, so React releases the page and runs its own cleanups.
// Never remove native DOM manually or dispatch a conversation deletion action.
function fadeRetainedChatPages(doc,job){
 const result=[];
 for(const element of doc.querySelectorAll('[data-app-shell-active-page]')){
  let fiber=element[Object.keys(element).find(k=>k.startsWith('__reactFiber$'))];
  if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
  for(let depth=0;fiber&&depth<80;depth++,fiber=fiber.return){
   const props=fiber.memoizedProps,view=props?.view;if(!view?.route)continue;
   const loc=view.location?.location,route=view.route;
   const matches=route.routeKind==='chatgpt-thread'&&job.ids.includes(route.conversationId)||route.routeKind==='home'&&loc?.state?.fadeChat===true&&loc.state.fadeDraftKey===job.draftKey;
   if(matches){let expiry;for(let sibling=fiber.return?.child;sibling;sibling=sibling.sibling){const p=sibling.memoizedProps;if(typeof p?.onExpire==='function'&&typeof p.ttlSeconds==='number'&&p.active===props.active){expiry=p.onExpire;break}}
    result.push({active:props.active!==false||element.getAttribute('data-app-shell-active-page')!=='false',expire:expiry});
   }break;
  }
 }
 return result;
}
function fadeChatQueryMatches(query,ids){
 const [kind,key]=query.queryKey;
 return kind==='chatgpt-conversation'&&ids.includes(key)||kind==='chatgpt-conversation-details'&&ids.includes(key?.clientConversationId);
}
function installChatCacheRelease(doc,scope,module,state,isOpen,report){
 const jobs=state.pendingCacheRelease??=[];let timer=0,disposed=false,running=false,lastError='';
 const supported=typeof module.DYn==='function'&&module.VZn&&module.mZn&&module.VQn;
 const identity=()=>JSON.stringify([scope.get(module.GMr),scope.get(module.YMr)]);
 // Release jobs may outlive the Fade UI after returning to classic mode.
 const schedule=(ms=80)=>{if(!disposed&&!timer&&jobs.length)timer=globalThis.setTimeout(run,ms)};
 async function run(){
  timer=0;if(disposed||running)return;running=true;
  try{for(const job of [...jobs]){
   const remove=()=>{const i=jobs.indexOf(job);if(i>=0)jobs.splice(i,1)};
   if(isOpen(job)||identity()!==job.identity){remove();continue}
   if(!supported){if(!job.warned){job.warned=true;report('标签已关闭，当前客户端无法安全释放聊天缓存')}continue}
   // A local draft can acquire a server ID while its background reply finishes.
   for(const id of [...job.ids]){const resolved=module.YQn(scope.get,id);if(resolved&&!job.ids.includes(resolved))job.ids.push(resolved)}
   if(isOpen(job)){remove();continue}
   const busy=job.ids.some(id=>!['idle','error'].includes(scope.get(module.VZn,id))||[3,5,6,7].includes(scope.get(module.mZn,id))||scope.get(module.VQn,id));
   if(busy)continue;
   const loc=fadeNativeRouter(doc)?.location;
   if(job.ids.some(id=>doc.defaultView?.__fadePreviewBridge?.retainsPath('/c/'+encodeURIComponent(id))))continue;
   if(loc?.state?.fadeDraftKey===job.draftKey||job.ids.some(id=>loc?.pathname==='/c/'+encodeURIComponent(id)))continue;
   const pages=fadeRetainedChatPages(doc,job);
   if(pages.length){if(pages.every(p=>!p.active&&p.expire))pages.forEach(p=>p.expire());continue}
   const cache=scope.queryClient.getQueryCache(),queries=cache.getAll().filter(q=>fadeChatQueryMatches(q,job.ids));
   // A different view still observing this chat owns its cache until it unmounts.
   if(queries.some(q=>q.getObserversCount()>0))continue;
   if(queries.some(q=>q.state.fetchStatus!=='idle')){
    await scope.queryClient.cancelQueries({predicate:q=>fadeChatQueryMatches(q,job.ids)});
    continue; // Recheck open tabs, generation and observers after the await.
   }
   for(const id of job.ids)module.DYn(scope,id);
   scope.queryClient.removeQueries({predicate:q=>fadeChatQueryMatches(q,job.ids)});
   remove();
  }lastError=''}catch(error){const message='聊天缓存释放暂未完成：'+error.message;if(message!==lastError){lastError=message;report(message)}}finally{running=false;schedule(500)}
 }
 schedule();
 return {enqueue(tab,id){jobs.push({draftKey:tab.id,ids:[...new Set([tab.conversationId,id].filter(Boolean))],identity:identity()});schedule()},destroy(){disposed=true;globalThis.clearTimeout(timer)}};
}
function fadeGptTabActivity(get,module,tab){
 const id=module.YQn(get,tab.conversationId)||tab.conversationId;
 const phase=get(module.VZn,id),asyncStatus=get(module.mZn,id),pending=get(module.VQn,id)||get(module.VQn,tab.conversationId);
 const node=get(module.SZn,id),message=get(module.kZn,id)?.[node]?.message;
 return {phase,asyncStatus,working:phase!=null&&!['idle','error'].includes(phase)||[3,5,6,7].includes(asyncStatus)||!!pending,
  completedId:message?.author?.role==='assistant'&&message.end_turn===true&&message.status==='finished_successfully'?(message.id||node):null};
}
function updateFadeGptTabActivity(tab,next){
 const previous=tab.activity;
 if(next.phase==='error'){tab.status=null}
 else if(next.working){tab.status='working';tab.completionSeen=false}
 else if(next.asyncStatus===4&&previous?.asyncStatus!==4||tab.status==='working'&&next.completedId&&next.completedId!==tab.lastCompletedMessage){tab.status='completed';tab.completionSeen=false}
 else if(tab.status==='working')tab.status=null;
 if(next.completedId&&(!next.working||!previous))tab.lastCompletedMessage=next.completedId;
 tab.activity=next;
}
function installGptTabs(doc,list,add,report,options={}){
 const state=window.__fadeChatSession??={tabs:[],codex:{pathname:'/',search:'',state:{sidebarProductMode:'codex'}},active:null};
 let scope,module,cacheRelease,disposed=false,pending=0,signature='',lastRender='',ready=false,releaseAfterDispose=false;
 const reorder=installFadeTabReorder(list,state.tabs,tab=>tab.id,render);
 const listeners=new Set(),nativeSubscriptions=[],activityWatches=new Map();
 const activitySupported=()=>module&&['VZn','mZn','VQn','SZn','kZn'].every(key=>module[key]!=null);
 function syncActivity(){
  for(const [tab,stop]of activityWatches)if(!state.tabs.includes(tab)){stop();activityWatches.delete(tab)}
  if(!activitySupported())return;
  for(const tab of state.tabs){
   if(!tab.conversationId)continue;
   if(typeof scope.watch==='function'){
    if(!activityWatches.has(tab))activityWatches.set(tab,scope.watch(({get})=>{updateFadeGptTabActivity(tab,fadeGptTabActivity(get,module,tab));schedule()}));
   }else updateFadeGptTabActivity(tab,fadeGptTabActivity(scope.get,module,tab));
  }
 }
 const router=()=>fadeNativeRouter(doc);
 const location=()=>router()?.location;
 const resolved=t=>t.conversationId&&module?module.YQn(scope.get,t.conversationId):t.conversationId;
 const pathFor=id=>'/c/'+encodeURIComponent(id);
 function save(){
  const loc=location();if(!loc)return;
  let tab=state.tabs.find(t=>t.id===loc.state?.fadeDraftKey);
  if(!tab&&fadeGptPath(loc.pathname))tab=state.tabs.find(t=>pathFor(resolved(t))===loc.pathname)||state.tabs.find(t=>t.id===state.active);
  if(tab&&((loc.pathname==='/'&&loc.state?.fadeChat)||fadeGptPath(loc.pathname)))tab.location={pathname:loc.pathname,search:loc.search,state:loc.state};
  else if(!fadeGptPath(loc.pathname)&&!loc.state?.fadeChat)state.codex={pathname:loc.pathname,search:loc.search,state:loc.state};
 }
 function upgrade(tab){
  const id=resolved(tab);
  if(id&&!id.startsWith('local-chatgpt:')&&(!tab.location||tab.location.pathname==='/'))tab.location={pathname:pathFor(id),search:tab.location?.search??'',state:{sidebarProductMode:'codex'}};
 }
 function go(target){const r=router();if(!r)throw Error('未找到原生导航');r.navigator.push({pathname:target.pathname,search:target.search??''},target.state)}
 let replacementHome=null;
 function activate(tab,skipSave=false){
  if(!ready){report('聊天入口仍在加载');return}
  try{if(!skipSave)save();if(!tab){state.active=null;go(state.codex);render();return}
   upgrade(tab);state.active=tab.id;
   if(tab.location)go(tab.location);else module.zYt(scope,{activeProject:null,fadeChat:true,fadeDraftKey:tab.id,initialChatGptConversationId:tab.conversationId,sidebarProductMode:'codex'});
   syncActivity();render();
  }catch(e){report('未能打开聊天：'+e.message)}
 }
 function newChat(internal=false){if(!ready)return;replacementHome=null;if(!internal&&options.beforeNew?.()===false)return;const tab={id:'fade-chat-'+crypto.randomUUID(),title:'新聊天',conversationId:module.ZQn()};state.tabs.push(tab);activate(tab)}
 function openHistory(chat){
  if(!ready)return false;if(options.beforeOpen?.(chat.id)===false)return false;
  save();
  const home=state.tabs.includes(replacementHome)&&replacementHome.location?.pathname==='/'?replacementHome:null;replacementHome=null;
  let tab=state.tabs.find(t=>resolved(t)===chat.id||t.location?.pathname===pathFor(chat.id));
  if(!tab){tab={id:home?.id??'fade-chat-'+crypto.randomUUID(),title:chat.title||'ChatGPT',conversationId:chat.id,location:{pathname:pathFor(chat.id),search:'',state:{sidebarProductMode:'codex'}}};if(home)state.tabs.splice(state.tabs.indexOf(home),1,tab);else state.tabs.push(tab)}
  else if(home&&home!==tab)state.tabs.splice(state.tabs.indexOf(home),1);
  activate(tab,true);return true;
 }
 function close(id){
  save();const index=state.tabs.findIndex(t=>t.id===id);if(index<0)return;
  const tab=state.tabs[index],conversationId=resolved(tab),wasActive=state.active===id;state.tabs.splice(index,1);
  if(wasActive){const next=state.tabs[Math.min(index,state.tabs.length-1)];if(next)activate(next);else{state.active=null;state.codex={pathname:'/',search:'',state:{sidebarProductMode:'codex'}};go(state.codex)}}
  cacheRelease?.enqueue(tab,conversationId);render();
 }
 function closeAllForClassic(){
  if(!ready)throw Error('聊天入口仍在加载，请稍后重试');
  save();
  // Navigate once, before clearing ownership. Never activate intermediate GPT tabs.
  go(state.codex);state.active=null;
  const tabs=state.tabs.splice(0);
  for(const tab of tabs)cacheRelease.enqueue(tab,resolved(tab));
  releaseAfterDispose=true;render();
 }
 function render(){
  const key=JSON.stringify([ready,state.active,state.tabs.map(t=>[t.id,t.title,resolved(t),t.location?.pathname,t.status,t.completionSeen])]);if(key===lastRender)return;lastRender=key;
  list.replaceChildren();const home=doc.createElement('button');home.className='fade-gpt-select fade-codex-tab';home.textContent='Codex';home.setAttribute('role','tab');home.setAttribute('aria-selected',String(state.active===null));home.onclick=()=>activate(null);if(!options.split)list.append(home);
  for(const tab of state.tabs){
   const item=doc.createElement('div');item.className='fade-gpt-tab';
   const button=doc.createElement('button');button.className='fade-gpt-select';const label=doc.createElement('span');label.className='fade-tab-title';label.textContent=tab.title;button.append(label);appendCodexTabStatus(doc,button,tab.status==='completed'&&tab.completionSeen?null:tab.status);button.title=tab.title;button.setAttribute('role','tab');button.setAttribute('aria-selected',String(state.active===tab.id));button.onclick=()=>activate(tab);
   const x=doc.createElement('button');x.className='fade-gpt-close';x.textContent='×';x.setAttribute('aria-label','关闭标签 '+tab.title);x.title='关闭标签';x.onclick=()=>close(tab.id);
   item.append(button,x);reorder.bind(item,tab);const chatId=resolved(tab);if(chatId&&!chatId.startsWith('local-chatgpt:')&&fadeGptPath(tab.location?.pathname))options.bindContextMenu?.(item,chatId);list.append(item);
  }add.disabled=!ready;
 }
 function sync(){
  pending=0;if(disposed||!ready)return;const loc=location();if(!loc)return;
  const key=JSON.stringify([loc.pathname,loc.search,loc.key]);if(key!==signature){signature=key;save();
   const tab=state.tabs.find(t=>t.id===loc.state?.fadeDraftKey||t.location?.pathname===loc.pathname&&fadeGptPath(loc.pathname));
   state.active=tab?.id??null;
  }
  syncActivity();
  for(const tab of state.tabs)if(tab.status==='completed'&&(loc.state?.fadeDraftKey===tab.id||fadeGptPath(loc.pathname)&&loc.pathname===pathFor(resolved(tab))))tab.completionSeen=true;
  const cached=scope.queryClient.getQueryCache().getAll();
  const historyTitles=new Map(cached.filter(q=>q.queryKey[0]==='chatgpt-conversations').flatMap(q=>(q.state.data?.pages??[]).flatMap(p=>p.items??[])).map(c=>[c.id,c.title]));
  const conversations=new Map();for(const query of cached)if(query.queryKey[0]==='chatgpt-conversation'&&!conversations.has(query.queryKey[1]))conversations.set(query.queryKey[1],query.state.data);
  for(const tab of state.tabs){upgrade(tab);const id=resolved(tab),entry=conversations.get(id);if(entry?.title||historyTitles.get(id))tab.title=entry?.title||historyTitles.get(id)}
  render();listeners.forEach(fn=>fn());
 }
 const schedule=()=>{if(!pending&&!disposed)pending=setTimeout(sync,80)};
 const observer=new MutationObserver(schedule);observer.observe(doc.body,{subtree:true,childList:true});
 async function init(){
  try{
   const links=[...doc.querySelectorAll('link[href]')],initial=links.find(l=>/app-initial-.*\.js$/.test(l.href)),shared=links.find(l=>/app-shared-.*\.js$/.test(l.href));
   if(!initial||!shared)throw Error('原生模块尚未加载');
   module=await import(initial.href);const common=await import(shared.href);
   if(!module.fadeStudyChat||!module.fadeStudyProduct)throw Error('请通过 Fade Codex 启动适配后的客户端');
   const candidates=[...doc.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width);
   for(const b of candidates){let f=b[Object.keys(b).find(k=>k.startsWith('__reactFiber$'))];for(let depth=0;f&&depth<40;depth++,f=f.return)for(let h=f.memoizedState;h&&typeof h==='object';h=h.next){const candidate=h.memoizedState?.current;if(candidate?.scope===common.Cot&&typeof candidate.get==='function'){scope=candidate;break}}if(scope)break}
   if(!scope)throw Error('未找到原生聊天作用域');
   if(disposed)return;
   cacheRelease=installChatCacheRelease(doc,scope,module,state,job=>state.tabs.some(t=>t.id===job.draftKey||job.ids.includes(resolved(t))),message=>{if(releaseAfterDispose)console.warn(message);else report(message)});
   ready=true;nativeSubscriptions.push(scope.queryClient.getQueryCache().subscribe(schedule));sync();
  }catch(e){if(!disposed){report('ChatGPT 入口不可用：'+e.message);render()}}
 }
 const query=()=>{const queries=scope?.queryClient.getQueryCache().getAll().filter(q=>q.queryKey[0]==='chatgpt-conversations'&&q.queryKey[1]===20)??[];return queries.find(q=>typeof q.options?.queryFn==='function')??queries[0]};
 const pinnedQuery=()=>scope?.queryClient.getQueryCache().getAll().find(q=>q.queryKey[0]==='chatgpt-pinned-conversations'&&q.queryKey[1]==='v2');
 const pinnedConversations=()=>{const data=pinnedQuery()?.state.data;return Array.isArray(data)?data.filter(entry=>entry.item_type==='conversation'&&entry.item?.id).map(entry=>entry.item):[]};
 function contextMenu(id,x,y,renameOnly=false){
  if(!ready||disposed||!window.electronBridge?.showContextMenu)return false;
  const conversation=query()?.state.data?.pages.flatMap(p=>p.items??[]).find(c=>c.id===id)
   ??pinnedConversations().find(c=>c.id===id)??scope.queryClient.getQueryData(['chatgpt-conversation',id]);
  if(!conversation)return false;
  const identity=JSON.stringify([scope.get(module.GMr),scope.get(module.YMr)]);
  const current=()=>!disposed&&identity===JSON.stringify([scope.get(module.GMr),scope.get(module.YMr)]);
  const fail=error=>report('聊天操作失败：'+error.message);
  const pinned=scope.get(module.Jan,id)??conversation.is_starred===true;
  const editable=module.mW(conversation,scope.get(module.qMr),scope.get(module.KMr));
  const title=conversation.title||'未命名聊天',messages=module.Don;
  const rename=()=>module.J4n(scope,module.cY,{initialValue:title,metadataThreadId:id,messages:{title:messages.renameDialogTitle,subtitle:messages.renameDialogSubtitle,placeholder:messages.renameDialogPlaceholder,ariaLabel:messages.renameDialogAriaLabel},requireNonEmpty:true,trimOnSave:true,onSave:value=>{if(current())return module.mon({scope,conversationId:id,previousTitle:title,title:value})}});
  if(renameOnly){if(!editable)return false;rename();return true}
  const remove=()=>{
   let deleting=false;
   const close=()=>module.U4n(scope,module.gW);
   const render=()=>module.J4n(scope,module.gW,{open:true,title,isDeleting:deleting,onOpenChange:open=>{if(!open&&!deleting)close()},onConfirm:async()=>{if(deleting||!current())return;deleting=true;render();try{await module.aon({scope,conversationId:id});close()}catch(error){deleting=false;render();fail(error)}}});
   render();
  };
  Promise.resolve().then(async()=>{
   const items=await module.$U(scope,{surface:'sidebar',conversation,conversationId:id,title,isPinned:pinned,projectId:conversation.gizmo_id?.startsWith('g-p-')?conversation.gizmo_id:null,onRename:editable?rename:undefined,onArchive:editable?()=>module.vW(scope,id):undefined,onDelete:editable?remove:undefined,onTogglePin:editable?()=>module.hon({scope,conversation,isPinned:!pinned}).catch(fail):undefined});
   if(!current())return;
   const actions=new Map(),intl=scope.get(module.oIr);
   const convert=items=>items.map(item=>{actions.set(item.id,item);return {id:item.id,type:['separator','radio'].includes(item.type)?item.type:undefined,checked:item.type==='radio'?item.checked===true:undefined,label:item.type==='separator'?'':(item.checked&&item.type!=='radio'?'✓ ':'')+(item.message?intl.formatMessage(item.message,item.messageValues):item.id),enabled:item.type==='label'?false:item.enabled??true,accelerator:item.accelerator,submenu:item.submenu?convert(item.submenu):undefined}});
   const result=await window.electronBridge.showContextMenu(convert(items),{x,y});
   const action=actions.get(result?.id);if(current()&&action?.enabled!==false)await action?.onSelect?.();
  }).catch(fail);
  return true;
 }

 async function chatAction(id,action){
  if(!ready||disposed)return false;
  const conversation=query()?.state.data?.pages.flatMap(p=>p.items??[]).find(c=>c.id===id)??scope.queryClient.getQueryData(['chatgpt-conversation',id]);
  if(!conversation||!module.mW(conversation,scope.get(module.qMr),scope.get(module.KMr)))return false;
  if(action==='pin')await module.hon({scope,conversation,isPinned:!(scope.get(module.Jan,id)??conversation.is_starred===true)});
  else if(action==='archive')await module.vW(scope,id);
  else return false;
  schedule();return true;
 }
 function history(){
  const q=query(),pq=pinnedQuery(),seen=new Set(),pages=q?.state.data?.pages??[],last=pages.at(-1);
  const items=[...pinnedConversations(),...pages.flatMap(p=>p.items??[])].filter(c=>!c.is_archived&&!c.is_temporary_chat&&!seen.has(c.id)&&seen.add(c.id)).map(c=>({id:c.id,title:c.title||'未命名聊天',pinned:scope.get(module.Jan,c.id)??c.is_starred===true})).sort((a,b)=>Number(b.pinned)-Number(a.pinned));
  return {ready:ready&&!!q,items,loading:q?.state.fetchStatus==='fetching'||pq?.state.fetchStatus==='fetching',loaded:!!q?.state.data,updatedAt:Math.max(q?.state.dataUpdatedAt??0,pq?.state.dataUpdatedAt??0),more:!!last&&last.offset+last.items.length<last.total,error:q?.state.error||pq?.state.error};
 }
 async function loadHistory(more=false){
  const q=query();
  // Native cache hydration can create a query before its request options exist.
  if(!ready||!q||typeof q.options?.queryFn!=='function')return {waiting:true};
  const pq=pinnedQuery();
  const requests=[q.fetch(undefined,more?{meta:{fetchMore:{direction:'forward'}},cancelRefetch:false}:{cancelRefetch:false})];
  if(pq?.options?.queryFn&&(!more||!pq.state.data))requests.push(pq.fetch(undefined,{cancelRefetch:false}));
  await Promise.all(requests);
  return {waiting:false};
 }
 const usageQuery=()=>scope?.queryClient.getQueryCache().getAll().find(q=>q.queryKey.length===1&&q.queryKey[0]==='rate-limit-status');
 function accountUsage(){const q=usageQuery();return q&&!q.state.error?q.state.data?.rate_limit:null}
 async function refreshAccountUsage(){const q=usageQuery();if(ready&&q?.options?.queryFn)await q.fetch(undefined,{cancelRefetch:false})}
 const create=()=>newChat();add.addEventListener('click',create);render();init();
 const dispose=()=>{disposed=true;reorder.destroy();if(!releaseAfterDispose)cacheRelease?.destroy();observer.disconnect();clearTimeout(pending);nativeSubscriptions.forEach(fn=>fn());activityWatches.forEach(stop=>stop());activityWatches.clear();add.removeEventListener('click',create);list.replaceChildren();listeners.clear()};
 Object.assign(dispose,{renameCurrent(){const tab=state.tabs.find(t=>t.id===state.active);return tab?contextMenu(resolved(tab),0,0,true):false},contextMenu,chatAction,accountUsage,refreshAccountUsage,closeAllForClassic,openHistory,history,loadHistory,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},home(){if(!ready)return false;state.active=null;go({pathname:'/',search:'',state:{sidebarProductMode:'codex'}});return true}});
 // Object.assign evaluates getters immediately: keep readiness live across async init.
 Object.assign(dispose,{activate,close,newChat,replaceHome(tab){replacementHome=tab&&(!tab.location||tab.location.pathname==='/')?tab:null},tabs:()=>state.tabs});
 Object.defineProperty(dispose,'ready',{get:()=>ready&&!disposed});
 return dispose;
}

// Native sidebar keys can remain temporary after the conversation receives its server ID.
function fadeCodexConversationId(row){
 if(!row)return null;
 let fiber=row[Object.keys(row).find(k=>k.startsWith('__reactFiber'))];
 if(fiber?.alternate){let top=fiber;while(top.return)top=top.return;if(top.stateNode?.current&&top.stateNode.current!==top)fiber=fiber.alternate}
 for(let depth=0;fiber&&depth<24;depth++,fiber=fiber.return){const id=fiber.memoizedProps?.conversationId;if(typeof id==='string'&&id&&!id.includes('client-new-thread:'))return id}
 return null;
}
// Only expire hidden native pages. Task stores, processes and query caches stay native-owned.
function fadeCodexPages(doc){
 const pages=[];
 for(const element of doc.querySelectorAll('[data-app-shell-active-page]')){
  let fiber=element[Object.keys(element).find(k=>k.startsWith('__reactFiber$'))];
  if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
  for(let depth=0;fiber&&depth<80;depth++,fiber=fiber.return){
   const props=fiber.memoizedProps,view=props?.view;if(!view?.route)continue;
   if(view.route.routeKind==='local-thread'){
    let expire;for(let sibling=fiber.return?.child;sibling;sibling=sibling.sibling){const p=sibling.memoizedProps;if(typeof p?.onExpire==='function'&&typeof p.ttlSeconds==='number'&&p.active===props.active){expire=p.onExpire;break}}
    const hasDraft=[...element.querySelectorAll('[contenteditable="true"],textarea')].some(e=>(e.value??e.textContent??'').trim());
    pages.push({hasDraft,location:view.location?.location,active:props.active!==false||element.getAttribute('data-app-shell-active-page')!=='false',expire});
   }break;
  }
 }return pages;
}
function fadeCodexReleaseReady(job,now,pathname,tabs,chat,pages){
 return now>=job.after&&pathname!==job.path&&!tabs.some(t=>t.path===job.path)&&['idle','completed'].includes(chat?.status?.kind)&&!chat?.active&&pages.length>0&&pages.every(p=>!p.active&&!p.hasDraft&&typeof p.expire==='function');
}
function appendCodexTabStatus(doc,button,status){
 const kind=status==='approval'?'reply':status;
 const labels={working:'工作中',completed:'已完成',reply:status==='approval'?'待批准':'待回复'};
 if(!labels[kind])return;
 const icon=doc.createElement('span');icon.className='fade-tab-status fade-tab-status-'+kind;icon.title=labels[kind];icon.setAttribute('role','img');icon.setAttribute('aria-label',labels[kind]);
 const paths={working:'<circle cx="12" cy="12" r="9" opacity=".2"/><path d="M12 3a9 9 0 0 1 9 9"/>',completed:'<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m7.5 12 3 3 6-6" stroke="#fff" stroke-width="2"/>',reply:'<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M8 7.5h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-5l-3 2v-2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z" stroke="#fff" stroke-width="1.5"/><path d="M10 11.5h4" stroke="#fff" stroke-width="1.5"/>'};
 icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[kind]+'</svg>';button.append(icon);
}
function installCodexTabs(doc,list,add,adapter,report,newChat,options={}){
 const state=window.__fadeCodexTabs??={tabs:[],jobs:[]};let timer=0,notificationTimer=0,dead=false,renderKey='',closingPath=null,closingKey=null,lastPath=null,pendingNativePath=null,lastHomeKey=null,replacementHome=null;
 const reorder=installFadeTabReorder(list,state.tabs,tab=>tab.path,sync);
 const router=()=>fadeNativeRouter(doc);
 const chats=()=>{const data=adapter.snapshot();return [...(data.pinned??[]),...data.recent,...data.groups.flatMap(g=>g.chats)]};
 function go(location){const r=router();if(!r)throw Error('未找到原生导航');r.navigator.push({pathname:location.pathname,search:location.search||''},location.state)}
 function cancelNotification(){clearTimeout(notificationTimer);notificationTimer=0;pendingNativePath=null}
 function activate(tab){cancelNotification();try{closingPath=null;state.jobs=state.jobs.filter(j=>j.path!==tab.path);go(tab.location);sync()}catch(e){report(e.message)}}
 function close(tab){
  cancelNotification();
  const index=state.tabs.indexOf(tab);if(index<0)return;
  if([tab.path,tab.nativePath,tab.windowKey].includes(router()?.location.state?.fadePaneHome||router()?.location.pathname)){try{const next=state.tabs[index+1]||state.tabs[index-1];go(next?.location||{pathname:'/',state:{sidebarProductMode:'codex'}})}catch(e){report(e.message);return}}
  closingPath=tab.path;closingKey=router()?.location.key;state.tabs.splice(index,1);state.jobs.push({path:tab.path,id:tab.id,after:Date.now()+15000});sync();
 }
 function sync(){
  if(dead)return;
  const loc=router()?.location;if(!loc)return;const rows=chats();
  const aliases=new Map();
  for(const row of rows){const raw=row.row?.getAttribute('data-app-action-sidebar-thread-id');const id=fadeCodexConversationId(row.row);if(raw&&id){const key=raw.startsWith('local:')?raw.slice(6):raw;aliases.set('/local/'+key,'/local/'+id);aliases.set('/local/'+encodeURIComponent(key),'/local/'+id)}}
  const canonical=path=>aliases.get(path)||path;
  const activePath=loc.pathname==='/'&&loc.state?.fadePaneHome||canonical(loc.pathname);
  const seen=new Map();
  for(let i=0;i<state.tabs.length;){const tab=state.tabs[i],path=canonical(tab.path);tab.path=path;if(tab.location&&path.startsWith('/local/'))tab.location.pathname=path;if(seen.has(path)){state.tabs.splice(i,1);continue}seen.set(path,tab);i++}
  // Route is authoritative: the sidebar may still mark the last Codex task active on GPT pages.
  if(closingPath&&(loc.pathname!==closingPath||loc.key!==closingKey))closingPath=null;
  const previousPath=lastPath;
  const replacementReady=replacementHome&&(loc.pathname!==replacementHome.routePath||loc.key!==replacementHome.routeKey);
  const sourceHome=replacementReady?replacementHome.path:previousPath==='/'?lastHomeKey:null;
  lastHomeKey=loc.pathname==='/'?loc.state?.fadePaneHome??null:null;
  const arrived=lastPath!==null&&lastPath!==loc.pathname||pendingNativePath===loc.pathname;lastPath=loc.pathname;
  const routeId=decodeURIComponent(activePath.slice('/local/'.length));
  const matching=rows.find(c=>[routeId,'local:'+routeId].includes(c.row?.getAttribute('data-app-action-sidebar-thread-id'))||fadeCodexConversationId(c.row)===routeId);
  const draft=routeId.includes('client-new-thread:')||matching?.id?.includes('client-new-thread:');
  if(loc.pathname!==closingPath&&/^\/local\/[^/?#]+$/.test(loc.pathname)){
   let tab=state.tabs.find(t=>t.path===activePath);
   const home=state.tabs.find(t=>t.path===sourceHome&&t.location?.pathname==='/');
   if(home&&(!tab||replacementReady)){
    if(tab&&tab!==home)state.tabs.splice(state.tabs.indexOf(home),1);
    else {tab=home;tab.windowKey??=home.path;tab.path=activePath}
   }
   if(replacementReady)replacementHome=null;
   if(!tab){tab={path:activePath,title:'新聊天',location:{}};state.tabs.push(tab)}
   tab.pendingCreation=!!draft;tab.nativePath=loc.pathname;
   tab.location={pathname:activePath,search:loc.search,state:loc.state};
   if(matching){tab.id=matching.id;if(matching.title?.trim())tab.title=matching.title}
   state.jobs=state.jobs.filter(j=>j.path!==tab.path);
  }
  for(const tab of state.tabs){
   const row=rows.find(c=>c.id===tab.id);
   if(row){
    if(row.title?.trim())tab.title=row.title;
    if(row.status?.kind==='working'||row.status?.kind==='completed'&&tab.status!=='completed')tab.completionSeen=false;
    tab.status=row.status?.kind;
   }
   if(tab.status==='completed'&&activePath===tab.path)tab.completionSeen=true;
  }
  const key=JSON.stringify([loc.pathname,state.tabs.map(t=>[t.path,t.id,t.title,t.status,t.completionSeen])]);
  if(key!==renderKey){renderKey=key;list.replaceChildren();for(const tab of state.tabs){
   const item=doc.createElement('div');item.className='fade-gpt-tab';
   const button=doc.createElement('button');button.className='fade-gpt-select fade-codex-select';const label=doc.createElement('span');label.className='fade-tab-title';label.textContent=tab.title;button.append(label);appendCodexTabStatus(doc,button,tab.status==='completed'&&tab.completionSeen?null:tab.status);button.title=tab.title;button.setAttribute('role','tab');button.setAttribute('aria-selected',String(activePath===tab.path));button.onclick=()=>activate(tab);
   const x=doc.createElement('button');x.className='fade-gpt-close';x.textContent='×';x.setAttribute('aria-label','关闭标签 '+tab.title);x.onclick=()=>close(tab);item.append(button,x);reorder.bind(item,tab);if(tab.id&&!tab.id.includes('client-new-thread:'))options.bindContextMenu?.(item,tab.id);list.append(item);
  }}
  if(arrived&&state.tabs.some(t=>t.path===loc.pathname)){
   pendingNativePath=null;options.onArrival?.();
   const selected=list.querySelector?.('[aria-selected="true"]'),viewport=options.viewport;
   if(selected&&viewport){const a=selected.getBoundingClientRect(),b=viewport.getBoundingClientRect();if(a.left<b.left)viewport.scrollLeft-=b.left-a.left+8;else if(a.right>b.right)viewport.scrollLeft+=a.right-b.right+8}
  }
  const pages=state.jobs.length?fadeCodexPages(doc):[];
  for(const job of [...state.jobs]){const matching=pages.filter(p=>p.location?.pathname===job.path);const chat=rows.find(c=>c.id===job.id);
   if(window.__fadePreviewBridge?.retainsPath(job.path))continue;
   if(fadeCodexReleaseReady(job,Date.now(),loc.pathname,state.tabs,chat,matching)){try{matching.forEach(p=>p.expire());state.jobs.splice(state.jobs.indexOf(job),1)}catch{/* Unsupported native lifecycle: leave to native expiry. */}}
   else if(Date.now()-job.after>600000)state.jobs.splice(state.jobs.indexOf(job),1);
  }
 }
 function schedule(){if(!timer&&!dead)timer=setTimeout(()=>{timer=0;sync()},100)}
 const observer=new MutationObserver(schedule);observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-app-shell-active-page','data-app-action-sidebar-thread-active','data-app-action-sidebar-thread-title']});
 // Let native navigation resolve host/context first. Only rescue a verified local
 // notification when the route has stayed unchanged; never override later input.
 function nativeNavigation(event){
  const message=event.data;if(message?.type!=='navigate-to-route'||typeof message.path!=='string')return;
  cancelNotification();
  const match=message.path.match(/^(\/local\/[^/?#]+)(\?[^#]*)?(#.*)?$/);if(!match)return;
  const path=match[1];pendingNativePath=path;schedule();
  const thread=message.notificationThread;let id;try{id=decodeURIComponent(path.slice(7))}catch{return}
  if(thread?.hostId!=='local'||thread.conversationId!==id)return;
  closingPath=null;closingKey=null;
  const initial=router()?.location;if(!initial)return;
  const initialPath=initial.pathname,initialKey=initial.key;
  notificationTimer=setTimeout(()=>{
   notificationTimer=0;if(dead)return;
   const r=router(),loc=r?.location;if(!loc)return;
   if(loc.pathname===path){sync();return}
   if(loc.pathname!==initialPath||loc.key!==initialKey)return;
   // Settings, onboarding and other special routes keep their native guards.
   if(!/^\/local\/[^/]+$/.test(loc.pathname)&&loc.pathname!=='/')return;
   try{r.navigator.push({pathname:path,search:match[2]||'',hash:match[3]||''},message.state);sync()}catch(e){report(e.message)}
  },300);
 }
 window.addEventListener?.('message',nativeNavigation);
 const interval=globalThis.setInterval(sync,1000);add.addEventListener('click',newChat);sync();
 const dispose=()=>{dead=true;cancelNotification();reorder.destroy();window.removeEventListener?.('message',nativeNavigation);observer.disconnect();clearTimeout(timer);globalThis.clearInterval(interval);add.removeEventListener('click',newChat);list.replaceChildren()};
 Object.assign(dispose,{activate,close,sync,replaceHome(tab){replacementHome=tab?.location?.pathname==='/'?{path:tab.path,routePath:router()?.location.pathname,routeKey:router()?.location.key}:null},tabs:()=>state.tabs,addHome(key,homeState={}){replacementHome=null;const tab={path:key,title:'新聊天',location:{pathname:'/',search:'',state:{...homeState,sidebarProductMode:'codex',fadePaneHome:key}}};state.tabs.push(tab);activate(tab);return tab}});return dispose;
}




 const disposeGptTabs=installGptTabs(document,$('#gptTabs'),$('#gptAdd'),announce,{split:true,beforeNew:()=>!windowMode.enabled||!windowMode.newChat('gpt'),beforeOpen:id=>windowMode.prepare('gpt',id),bindContextMenu:(row,id)=>bindChatContextMenu(row,id,(id,x,y)=>disposeGptTabs.contextMenu(id,x,y))});
 const disposeCodexTabs=installCodexTabs(document,$('#codexTabs'),$('#codexAdd'),adapter,announce,()=>{const data=adapter.snapshot();const project=data.groups.find(g=>g.chats.some(c=>c.active));createChat(project?.id)},{bindContextMenu:bindChatContextMenu,viewport:headerTabsScroll,onArrival(){chatPicker?.close();closeNav(false)}});
 // A continuous tangent at the fan edges avoids the old hard angle clamp.
function fadeArcAngle(y,half){return 20*Math.tanh(y/Math.max(1,half))}
function fadeAutoScrollSpeed(distance){const d=Math.max(0,Math.abs(distance)-10);return Math.sign(distance)*Math.min(1800,d*4+d*d*.025)}
function installFanAutoscroll(areas){
 let active=null,frame=0,last=0,target=0,origin=0,pointer=0;
 let wheelArea=null,wheelFrame=0,wheelTarget=0,wheelPosition=0,wheelLast=0,wheelDirection=0;
 function stopWheel(){if(wheelFrame)cancelAnimationFrame(wheelFrame);wheelFrame=0;wheelArea=null;wheelDirection=0}
 function wheelTick(now){
  wheelFrame=0;if(!wheelArea||!navOpen){stopWheel();return}
  const dt=Math.min(40,Math.max(0,now-wheelLast));wheelLast=now;
  wheelTarget=Math.max(0,Math.min(wheelArea.view.scrollHeight-wheelArea.view.clientHeight,wheelTarget));
  wheelPosition+=(wheelTarget-wheelPosition)*(1-Math.exp(-dt/55));
  const done=Math.abs(wheelTarget-wheelPosition)<.4;if(done)wheelPosition=wheelTarget;
  wheelArea.view.scrollTo({top:wheelPosition,behavior:'instant'});wheelArea.layout();
  if(done)stopWheel();else wheelFrame=requestAnimationFrame(wheelTick);
 }
 const marker=document.createElement('div');marker.className='fade-scroll-origin';marker.hidden=true;marker.textContent='↕';marker.setAttribute('aria-hidden','true');shadow.append(marker);
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;active=null;marker.hidden=true;host.removeAttribute('data-fan-scrolling')}
 function tick(now){
  frame=0;if(!active||!navOpen){stop();return}
  const dt=Math.min(32,Math.max(0,now-last));last=now;
  target=Math.max(0,Math.min(active.view.scrollHeight-active.view.clientHeight,target+fadeAutoScrollSpeed(pointer-origin)*dt/1000));
  active.view.scrollTo({top:target,behavior:'instant'});
  // Read the actual scroll position and render the arc before this frame paints.
  active.layout();frame=requestAnimationFrame(tick);
 }
 for(const area of areas){
  on(area.view,'wheel',event=>{
   if(event.ctrlKey||!navOpen)return;
   const delta=event.deltaY*(event.deltaMode===1?20:event.deltaMode===2?area.view.clientHeight:1);if(!delta)return;
   event.preventDefault();event.stopPropagation();stop();
   if(wheelArea!==area){stopWheel();wheelArea=area;wheelTarget=wheelPosition=area.view.scrollTop}
   const direction=Math.sign(delta);if(wheelDirection&&direction!==wheelDirection)wheelTarget=wheelPosition=area.view.scrollTop;wheelDirection=direction;
   wheelTarget=Math.max(0,Math.min(area.view.scrollHeight-area.view.clientHeight,wheelTarget+delta));
   if(reduceMotion.matches){area.view.scrollTo({top:wheelTarget,behavior:'instant'});area.layout();stopWheel();return}
   if(!wheelFrame){wheelLast=performance.now();wheelFrame=requestAnimationFrame(wheelTick)}
  },{passive:false});
  on(area.view,'mousedown',event=>{
   stopWheel();
   if(event.button!==1)return;event.preventDefault();event.stopPropagation();if(active){stop();return}
   active=area;origin=pointer=event.clientY;target=area.view.scrollTop;last=performance.now();marker.style.left=event.clientX+'px';marker.style.top=origin+'px';marker.hidden=false;host.setAttribute('data-fan-scrolling','');frame=requestAnimationFrame(tick);
  });
  on(area.view,'auxclick',event=>{if(event.button===1)event.preventDefault()});
 }
 on(window,'mousemove',event=>{pointer=event.clientY},{passive:true});
 on(window,'mousedown',event=>{if(active&&!areas.some(a=>event.button===1&&event.composedPath().includes(a.view))){event.preventDefault();event.stopPropagation();stop()}},{capture:true});
 on(window,'keydown',event=>{stopWheel();if(active){if(event.key==='Escape'){event.preventDefault();event.stopPropagation()}stop()}},{capture:true});
 on(window,'wheel',()=>{if(active)stop()},{passive:true});on(window,'blur',()=>{stop();stopWheel()});
 return ()=>{stop();stopWheel();marker.remove()};
}

function installHistoryCards(tabs){
 const view=document.createElement('div');view.id='historyViewport';view.className='arc-viewport history-viewport';view.tabIndex=0;view.setAttribute('aria-label','ChatGPT 历史聊天，可上下滚动');
 const guide=document.createElementNS('http://www.w3.org/2000/svg','svg');guide.id='historyGuides';guide.setAttribute('aria-hidden','true');
 const list=document.createElement('div');list.className='arc-list';list.id='historyList';view.append(guide,list);$('#navContent').prepend(view);
 let pinnedExpanded=true;
 let previous='',busy=false,error='',retryTimer=0,waitingSince=0,disposed=false,errorUpdatedAt=0;
 function layout(){
  if(!navOpen)return;const rows=[...list.querySelectorAll('.nav-row')],first=rows[0],last=rows.at(-1);
  centerArcEnds(view,list,rows);
  const spread=first&&last?(last.offsetTop+last.offsetHeight/2-first.offsetTop-first.offsetHeight/2)/2:1;
  const mid=view.scrollTop+view.clientHeight/2,half=Math.min(arcLayoutHeight(view)*.40,Math.max(1,spread)),radius=innerWidth<560?150:350;
  for(const row of rows){const y=row.offsetTop+row.offsetHeight/2-mid,angle=fadeArcAngle(y,half);row.style.setProperty('--arc-x',(radius*(Math.cos(angle*Math.PI/180)-1)).toFixed(2)+'px');row.style.setProperty('--arc-angle',angle.toFixed(2)+'deg')}
  updateChatGuides(rows,view,guide,list);updateFanMask(view);
 }
 function render(){
  if(!navOpen)return;const data=tabs.history(),loc=fadeNativeRouter(document)?.location;
  if(error&&data.loaded&&!data.error&&data.updatedAt>errorUpdatedAt)error='';
  const key=JSON.stringify([pinnedExpanded,data.items,loc?.pathname,busy,error,data.ready,data.loading,data.more]);if(key===previous){layout();return}previous=key;
  const top=view.scrollTop;list.replaceChildren();
  if(data.items.some(c=>c.pinned)){
   const row=document.createElement('div');row.className='nav-row project project-actions';
   const toggle=document.createElement('button');toggle.type='button';toggle.className='project-main history-pinned-toggle';toggle.innerHTML='<span class="row-title">置顶</span><span class="row-meta"></span>';toggle.querySelector('.row-meta').textContent=pinnedExpanded?data.items.filter(c=>c.pinned).length:'';toggle.setAttribute('aria-expanded',String(pinnedExpanded));toggle.setAttribute('aria-label',(pinnedExpanded?'收起':'展开')+'置顶聊天');row.onclick=()=>{pinnedExpanded=!pinnedExpanded;render();list.querySelector('.history-pinned-toggle')?.focus({preventScroll:true})};row.append(toggle);list.append(addCardSurface(row));
  }
  for(const chat of data.items){
   if(chat.pinned&&!pinnedExpanded)continue;
   const row=document.createElement('div');row.className='nav-row chat'+(loc?.pathname==='/c/'+encodeURIComponent(chat.id)?' selected':'');row.dataset.historyId=chat.id;
   const button=document.createElement('button');button.className='row-main';button.innerHTML='<span class="chat-dot"></span><span class="row-title"></span>';button.querySelector('.row-title').textContent=chat.title;button.title=chat.title;
   if(row.classList.contains('selected'))button.setAttribute('aria-current','page');button.onclick=()=>{if(!tabs.openHistory(chat))announce('聊天入口仍在加载')};
   row.append(button);appendFadeChatActions(row,chat,tabs,'gpt');bindChatContextMenu(row,chat.id,(id,x,y)=>tabs.contextMenu(id,x,y));list.append(addCardSurface(row));
  }
  if(!data.items.length||error){const note=document.createElement('button');note.className='nav-row project history-message';note.textContent=error||(!data.ready||busy||waitingSince||data.loading?'正在加载聊天记录…':'暂无聊天记录');note.dataset.label=note.textContent;note.disabled=!error;note.onclick=()=>load();list.append(addCardSurface(note))}
  if(data.more){const more=document.createElement('button');more.className='nav-row project history-message';more.textContent=busy?'加载中…':'更多';more.dataset.label=more.textContent;more.disabled=busy;more.onclick=()=>load(true);list.append(addCardSurface(more))}
  view.scrollTop=top;layout();
 }
 async function load(more=false){
  if(busy||disposed)return;clearTimeout(retryTimer);
  busy=true;error='';render();
  try{
   const result=tabs.ready?await tabs.loadHistory(more):{waiting:true};
   if(disposed)return;
   if(result?.waiting){
    waitingSince ||= Date.now();
    if(Date.now()-waitingSince>=30000){waitingSince=0;error='聊天服务尚未就绪，点击重试';errorUpdatedAt=tabs.history().updatedAt}
    else retryTimer=setTimeout(()=>{if(navOpen&&!disposed)load(more)},300);
   }else waitingSince=0;
  }catch(cause){waitingSince=0;errorUpdatedAt=tabs.history().updatedAt;error='无法加载，点击重试';console.warn('[Fade history] 加载失败',cause)}finally{busy=false;if(!disposed)render()}
 }
 const unsubscribe=tabs.subscribe(render);
 on(view,'scroll',()=>{layout();const data=tabs.history();if(navOpen&&data.more&&!busy&&view.scrollTop+view.clientHeight>=view.scrollHeight-100)load(true)},{passive:true});
 const disposeAutoscroll=installFanAutoscroll([{view,layout},{view:$('#arcViewport'),layout:layoutArc}]);
 on(window,'resize',layout);
 return {open(){waitingSince=0;render();load()},refresh:render,destroy(){disposeAutoscroll();disposed=true;unsubscribe();clearTimeout(retryTimer);view.remove()}};
}

 const historyCards=installHistoryCards(disposeGptTabs);
 function appendFadeChatActions(row,chat,provider,kind='codex'){
 const actions=document.createElement('span');actions.className='fade-chat-actions';
 for(const action of ['pin','archive']){
  const button=document.createElement('button');button.type='button';button.className='fade-chat-action';button.dataset.chatAction=action;button.dataset.pickerKey=action+':'+kind+':'+chat.id;
  const label=action==='pin'?(chat.pinned?'取消置顶':'置顶聊天'):'归档聊天';button.title=label;button.setAttribute('aria-label',label+'：'+chat.title);
  if(action==='pin')button.setAttribute('aria-pressed',String(!!chat.pinned));
  button.innerHTML=action==='pin'?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 3 6 6-4 2-2 6-3-3-7 7m3-10 6-2 1-6M8 11l7 6"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v11H4zM3 4h18v5H3zM9 13h6"/></svg>';
  button.onclick=async event=>{
   event.preventDefault();event.stopPropagation();
   const pending=appendFadeChatActions.pending??=new Set(),key=kind+':'+chat.id;
   if(pending.has(key))return;pending.add(key);button.disabled=true;
   try{if(!await provider.chatAction(chat.id,action))announce('当前聊天暂不支持此操作')}
   catch(error){announce('聊天操作失败：'+error.message)}
   finally{pending.delete(key);button.disabled=false}
  };
  actions.append(button);
 }
 row.append(actions);
}

function filterFadeChats(data,query){
 const q=query.trim().toLocaleLowerCase(),matches=s=>s.toLocaleLowerCase().includes(q);
 const sections=(data.sections??[]).filter(s=>s.custom).map(s=>({...s,items:s.items.flatMap(item=>{if(!q||matches(s.title))return [item];if(item.kind==='chat')return matches(item.chat.title)?[item]:[];const g=item.project,chats=matches(g.title)?g.chats:g.chats.filter(c=>matches(c.title));return matches(g.title)||chats.length?[{...item,project:{...g,chats}}]:[]})})).filter(s=>!q||matches(s.title)||s.items.length);
 return {sections,pinned:(data.pinned??[]).filter(c=>!q||matches(c.title)),groups:data.groups.map(g=>({...g,chats:q&&!matches(g.title)?g.chats.filter(c=>matches(c.title)):g.chats})).filter(g=>!q||matches(g.title)||g.chats.length),recent:data.recent.filter(c=>!q||matches(c.title))};
}
function installChatPicker(adapter){
 const trigger=$('#compactTitle'),panel=$('#chatPicker'),search=$('#chatSearch'),liveList=$('#chatPickerList');
 let list=liveList;
 const gptTrigger=$('#gptDirectory');let mode='codex',customAnchor=null,customRect=null;
 const pinnedExpanded={codex:true,gpt:true},projectsExpanded={codex:true,gpt:true},recentExpanded={codex:true,gpt:true};
 function sectionHeading(title,key,state){const button=document.createElement('button');button.type='button';button.className='chat-picker-section chat-picker-section-toggle';button.dataset.pickerKey=key+':'+mode;button.textContent=title;button.setAttribute('aria-expanded',String(state[mode]));button.setAttribute('aria-label',(state[mode]?'收起':'展开')+title);button.onclick=()=>{state[mode]=!state[mode];render();list.querySelector('[data-picker-key="'+key+':'+mode+'"]')?.focus({preventScroll:true})};if(key==='projects'&&mode==='codex'){const group=document.createElement('div');group.className='chat-picker-section-actions';const add=document.createElement('button');add.type='button';add.className='chat-picker-add-project';add.dataset.pickerKey='add-project';add.title='创建新项目';add.setAttribute('aria-label','创建新项目');add.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';add.onclick=()=>{adapter.ensureSidebar();const native=[...document.querySelectorAll('[data-app-action-sidebar-section-heading="Projects"] button')].find(b=>/^(添加新项目|创建新项目|Add new project|New project|Create project)$/i.test(b.getAttribute('aria-label')||''));if(!native||native.disabled){announce('创建项目入口尚未就绪');return}preserveForContextMenu(add);native.click()};group.append(button,add);list.append(group)}else list.append(button)}
 function pinnedHeading(){sectionHeading('置顶','pinned',pinnedExpanded)}

 const searchExpanded=new Set(),searchSections=new Set();let opened=false,contextMenuFocus=false;
 function position(){
  if(!opened)return;
  const anchor=customAnchor?(customAnchor.isConnected?customAnchor.getBoundingClientRect():customRect):(mode==='gpt'?gptTrigger:trigger).getBoundingClientRect();
  const bounds=panel.offsetParent?.getBoundingClientRect()??{left:0,top:0};
  const width=panel.getBoundingClientRect().width,viewport=document.documentElement;
  const left=Math.max(8,Math.min(anchor.left,viewport.clientWidth-width-8)),top=anchor.bottom+10;
  panel.style.left=(left-bounds.left)+'px';panel.style.top=(top-bounds.top)+'px';
  panel.style.maxHeight=Math.max(0,viewport.clientHeight-top-12)+'px';
 }
 function restoreSearch(){for(const id of searchSections)adapter.toggleSection(id,false);searchSections.clear();for(const id of searchExpanded)adapter.toggle(id,false);searchExpanded.clear()}
 function close(focus=false){if(!opened)return;opened=false;contextMenuFocus=false;document.documentElement.removeAttribute('data-fade-picker-open');panel.hidden=true;trigger.setAttribute('aria-expanded','false');gptTrigger.setAttribute('aria-expanded','false');restoreSearch();if(focus)(mode==='gpt'?gptTrigger:trigger).focus({preventScroll:true})}
 function preserveForContextMenu(row){if(opened&&panel.contains(row))contextMenuFocus=true}
 function row(title,kind,action,key){
  const b=document.createElement('button');b.type='button';b.className='chat-picker-row '+kind;b.dataset.pickerKey=key;
  const icon=document.createElement('span');icon.className='chat-picker-icon';icon.setAttribute('aria-hidden','true');
  icon.innerHTML=kind==='project'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7V5h6l2 2h10v13H3Z"/></svg>':kind==='new'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4H5v15h15v-7M11 13l2-5 6-6 3 3-6 6Z"/></svg>':'';
  const label=document.createElement('span');label.className='chat-picker-label';label.textContent=title;b.append(icon,label);b.onclick=action;return b;
 }
 function render(){
  if(!opened)return;
  position();
  const focus=shadow.activeElement,focusKey=focus?.dataset?.pickerKey,scroll=liveList.scrollTop;
  const draft=document.createElement('div');
  list=draft;
  try{buildList()}finally{list=liveList}
  // Background updates must leave unchanged hovered/focused rows mounted.
  const key=node=>node.dataset.pickerKey||node.querySelector('[data-picker-key]')?.dataset.pickerKey;
  // Keys identify each section occurrence, since a chat can also appear in Recents.
  const previous=new Map([...liveList.children].map(node=>[key(node),node]));
  let index=0;
  for(const fresh of [...draft.children]){
   const old=previous.get(key(fresh)),node=old&&old.isEqualNode(fresh)?old:fresh;
   if(liveList.children[index]!==node)liveList.insertBefore(node,liveList.children[index]||null);
   index++;
  }
  while(liveList.children.length>index)liveList.lastElementChild.remove();
  liveList.scrollTop=scroll;
  if(focusKey&&!liveList.contains(focus))[...liveList.querySelectorAll('button')].find(b=>b.dataset.pickerKey===focusKey)?.focus({preventScroll:true});
 }
 function buildList(){
  if(mode==='gpt'){const data=disposeGptTabs.history(),query=search.value.trim().toLocaleLowerCase();list.replaceChildren();const matches=data.items.filter(c=>c.title.toLocaleLowerCase().includes(query));if(matches.some(c=>c.pinned))pinnedHeading();let recentHeading=false;for(const chat of matches){if(chat.pinned&&!pinnedExpanded.gpt)continue;if(!chat.pinned&&!recentHeading){recentHeading=true;sectionHeading('最近','recent',recentExpanded)}if(!chat.pinned&&!recentExpanded.gpt)continue;const b=row(chat.title,'chat',()=>{close();disposeGptTabs.openHistory(chat)},'gpt:'+chat.id);bindChatContextMenu(b,chat.id,(id,x,y)=>disposeGptTabs.contextMenu(id,x,y));const item=document.createElement('div');item.className='chat-picker-chat';item.append(b);appendFadeChatActions(item,chat,disposeGptTabs,'gpt');list.append(item)}if(!data.items.length)list.append(row(data.loading?'正在加载…':'暂无聊天记录','more',()=>loadGpt(),'empty'));if(data.more&&recentExpanded.gpt)list.append(row(data.loading?'加载中…':'更多','more',()=>loadGpt(true),'more'));return}
 const data=adapter.snapshot(),query=search.value.trim();
  // Mount collapsed native groups for search; restore their state when search ends.
  if(query){for(const s of data.sections??[])if(s.custom&&!s.expanded&&!searchSections.has(s.id)){searchSections.add(s.id);adapter.toggleSection(s.id,true)}for(const g of data.groups)if(!g.expanded&&!searchExpanded.has(g.id)){searchExpanded.add(g.id);adapter.toggle(g.id,true)}}
  else restoreSearch();
  const filtered=filterFadeChats(data,query);list.replaceChildren();
  list.append(row('新聊天','new',()=>{close();createChat()},'new'));
  function chat(c,scope=''){const b=row(c.title,'chat',()=>{close();switchChat(c.id)},'chat:'+scope+c.id);bindChatContextMenu(b,c.id);if(c.active)b.setAttribute('aria-current','page');appendFadeChatStatus(b,c);const item=document.createElement('div');item.className='chat-picker-chat';item.append(b);appendFadeChatActions(item,c,adapter);list.append(item)}
  function pinnedList(){if(filtered.pinned.length){pinnedHeading();if(pinnedExpanded.codex)filtered.pinned.forEach(c=>chat(c,'pinned:'))}if(pinnedExpanded.codex)filtered.groups.filter(g=>g.sectionId==='pinned').forEach(project)}
  function project(g){
   const b=row(g.title,'project',()=>{if(query)return;adapter.toggle(g.id,!g.expanded);adapter.refresh();render()},'project:'+g.id);
   b.setAttribute('aria-expanded',String(!!query||g.expanded));
   const project=document.createElement('div');project.className='chat-picker-project'+(g.sectionId?.startsWith('custom:')?' chat-picker-nested-project':'');project.append(b);
   const menu=document.createElement('button');menu.type='button';menu.className='project-menu';menu.dataset.projectMenu=g.id;menu.dataset.pickerKey='menu:'+g.id;
   menu.title=g.title+' 的项目操作';menu.setAttribute('aria-label',menu.title);menu.setAttribute('aria-haspopup','menu');menu.setAttribute('aria-expanded','false');
   menu.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
   menu.onclick=()=>{preserveForContextMenu(menu);openProjectMenu(g.id,menu)};
   const add=document.createElement('button');add.type='button';add.className='project-new-chat';add.dataset.pickerKey='new:'+g.id;
   add.title='在 '+g.title+' 中新建聊天';add.setAttribute('aria-label',add.title);add.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
   add.onclick=()=>{close();createChat(g.id)};project.append(menu,add);list.append(project);
   if(query||g.expanded){g.chats.forEach(c=>chat(c,'project:'+g.id+':'));
    if(g.moreLabel)list.append(row(g.moreLabel,'more',()=>{adapter.more(g.id);adapter.refresh();render()},'more:'+g.id));
   }
  }
  function projectsList(){const groups=filtered.groups.filter(g=>!g.sectionId||g.sectionId==='threads');if(!query||groups.length)sectionHeading('项目','projects',projectsExpanded);if(projectsExpanded.codex)groups.forEach(project)}
  function recentList(){if(filtered.recent.length){sectionHeading('最近','recent',recentExpanded);if(recentExpanded.codex)filtered.recent.forEach(c=>chat(c))}}
  function customSection(s){
   const group=document.createElement('div');group.className='chat-picker-section-actions';
   const b=row(s.title,'section',()=>{adapter.toggleSection(s.id,!s.expanded);adapter.refresh();render()},'section:'+s.id);b.className+=' chat-picker-section-toggle native-section';b.setAttribute('aria-expanded',String(!!query||s.expanded));group.append(b);
   const menu=document.createElement('button');menu.type='button';menu.className='project-menu';menu.textContent='⋯';menu.dataset.pickerKey='section-menu:'+s.id;menu.setAttribute('aria-label',s.title+' 的分区操作');menu.onclick=()=>{preserveForContextMenu(menu);openProjectMenu(s.id,menu)};group.append(menu);list.append(group);
   if(query||s.expanded)for(const item of s.items){if(item.kind==='project')project(item.project);else chat(item.chat,s.id+':')}
   if((query||s.expanded)&&s.moreLabel)list.append(row(s.moreLabel,'more',()=>{adapter.sectionMore(s.id);adapter.refresh();render()},'section-more:'+s.id));
  }
  const rendered=new Set();for(const s of data.sections??[]){if(rendered.has(s.id))continue;rendered.add(s.id);if(s.custom){const match=filtered.sections.find(x=>x.id===s.id);if(match)customSection(match)}else if(s.id==='pinned')pinnedList();else if(s.id==='threads')projectsList();else if(s.id==='chats')recentList()}
  if(!rendered.has('pinned'))pinnedList();if(!rendered.has('threads'))projectsList();if(!rendered.has('chats'))recentList();
  if(query&&!filtered.pinned.length&&!filtered.groups.length&&!filtered.recent.length&&!filtered.sections.length){const empty=document.createElement('div');empty.className='chat-picker-empty';empty.textContent='无匹配聊天';list.append(empty)}
 }
 async function loadGpt(more=false){try{await disposeGptTabs.loadHistory(more);render()}catch(e){announce('聊天记录加载失败：'+e.message)}}
 function open(nextMode='codex'){
 close();mode=nextMode;
  closeNav();adapter.ensureSidebar();adapter.refresh();opened=true;document.documentElement.setAttribute('data-fade-picker-open','');search.value='';panel.hidden=false;
  (mode==='gpt'?gptTrigger:trigger).setAttribute('aria-expanded','true');panel.setAttribute('aria-label',mode==='gpt'?'GPT 聊天目录':'Codex 聊天目录');if(mode==='gpt')loadGpt();render();search.focus({preventScroll:true});
 }
 on(trigger,'click',()=>{customAnchor=null;opened&&mode==='codex'?close():open()});
 on(gptTrigger,'click',()=>{customAnchor=null;opened&&mode==='gpt'?close():open('gpt')});
 on(window,'resize',position);
 const header=$('#headerTabsScroll');
 if(header)on(header,'scroll',position);
 const layoutObserver=new ResizeObserver(position);
 if(header){layoutObserver.observe(header);for(const area of header.children)layoutObserver.observe(area)}
 const unsubscribe=disposeGptTabs.subscribe(render);
 on(search,'input',render);
 on(document,'pointerdown',e=>{if(contextMenuFocus&&e.target?.closest?.('[role="dialog"],[role="alertdialog"],.codex-dialog-overlay,[data-radix-popper-content-wrapper]'))return;if(opened&&!e.composedPath().includes(panel)&&!e.composedPath().includes(trigger)&&!e.composedPath().includes(gptTrigger))close()});
 on(panel,'keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   const items=[search,...list.querySelectorAll('button')],index=items.indexOf(shadow.activeElement);
   e.preventDefault();items[(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();
  }
 });
 // Native menus take focus outside the shadow root and may return it to their
 // hidden sidebar row. Keep the directory until its normal explicit dismissal.
 on(panel,'focusout',()=>setTimeout(()=>{if(opened&&!contextMenuFocus&&!panel.contains(shadow.activeElement)&&shadow.activeElement!==trigger&&shadow.activeElement!==gptTrigger)close()},0));
 return {refresh:render,close,openFor(type,anchor){customAnchor=anchor;customRect=anchor.getBoundingClientRect();open(type)},preserveForContextMenu,destroy(){layoutObserver.disconnect();unsubscribe();close()}};
}

 chatPicker=installChatPicker(adapter);
 const orbUsage=installOrbUsage(disposeGptTabs);
 const composerAutohide=installComposerAutohide();
 const wslImagePaths=installWslImagePaths();
 const previewCodeWrap=installPreviewCodeWrap(document);
 const disposePreviewScrollbar=installPreviewScrollbar(document);
 const disposePaperSurface=installPaperSurface(document);
 const backgroundSettings=installBackgroundSettings({doc:document,shadow,announce});
 const disposeConversationTitle=installConversationTitle();
 const windowMode=installFadeWindowMode();
 const disposeFadeSettings=installFadeSettings();
 on(window,'fade-window-mode',()=>{shadow.querySelector('[aria-label="窗口模式"]')?.setAttribute('aria-checked',String(windowMode.enabled))});
 function actionFailed(){announce('未找到对应入口，请点击 fade 打开侧栏')}
 function switchChat(id){if(!windowMode.prepare('codex',id))return;if(!adapter.select(id))actionFailed()}
 let creatingChat=false;
 function createChat(projectId){
  if(creatingChat)return;
  if(windowMode.enabled){if(projectId)windowMode.newProjectChat(projectId);else windowMode.newChat();closeNav(false);return}
  creatingChat=true;disposeHomeOrb.beginArrival();burstTime=performance.now();startSpin();
  // Let the compositor present the movement before native navigation blocks
  // the main thread. Do not restore focus to the chat that is about to unmount.
  requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{
   closeNav(false);
   if(!adapter.newChat(projectId)){disposeHomeOrb.cancelArrival();actionFailed()}
   else disposeHomeOrb.refresh();
   creatingChat=false;
  },0)));
 }
 function addCardSurface(row){
 row.insertAdjacentHTML('afterbegin','<svg class="card-surface" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path d="M 16 18 L 976 1 Q 999 0 999 15 L 999 85 Q 999 100 976 99 L 16 82 Q 1 81 1 68 L 1 32 Q 1 19 16 18 Z"/></svg>');
 return row;
}

 function bindChatContextMenu(row,id,openMenu=null){
  function open(event){
   event.preventDefault();event.stopPropagation();
   const rect=row.getBoundingClientRect(),keyboard=event.type==='keydown';
   const x=keyboard?rect.left+Math.min(24,rect.width/2):event.clientX,y=keyboard?rect.top+rect.height/2:event.clientY;
   // Native menus and dialogs own their focus without collapsing the fan.
   chatPicker?.preserveForContextMenu(row);
   if(!(openMenu?openMenu(id,x,y):adapter.contextMenu(id,x,y)))actionFailed();
  }
  row.oncontextmenu=open;
  row.onkeydown=event=>{if(event.key==='ContextMenu'||event.key==='F10'&&event.shiftKey)open(event)};
 }
 let projectMenu=null;
 function finishProjectMenu(restoreFocus=false){
  const state=projectMenu;if(!state)return;projectMenu=null;
  cancelAnimationFrame(state.frame);
  for(const [el,style]of state.styles){if(style===null)el.removeAttribute('style');else el.setAttribute('style',style)}
  root.removeAttribute('data-fade-project-menu');
  if(navOpen)syncNativeFocus();
  const buttons=$$('[data-project-menu]').filter(el=>el.dataset.projectMenu===state.id);buttons.forEach(button=>button.setAttribute('aria-expanded','false'));
  if(restoreFocus){const button=state.button.isConnected?state.button:buttons.find(b=>b.getBoundingClientRect().width);button?.focus({preventScroll:true})}
 }
 function dismissProjectMenu(){
  if(!projectMenu)return;
  document.getElementById(projectMenu.native.getAttribute('aria-controls'))?.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));
  finishProjectMenu();
 }
 function openProjectMenu(id,button){
  if(projectMenu){dismissProjectMenu();return}
  const native=id.startsWith('custom:')?adapter.sectionMenu(id):adapter.snapshot().groups.find(g=>g.id===id)?.row.querySelector('button[aria-haspopup="menu"]');
  if(!native||native.disabled){actionFailed();return}
  const anchor=button.getBoundingClientRect();
  unlock();root.setAttribute('data-fade-project-menu','');
  projectMenu={id,native,anchor,button,styles:new Map(),frame:0};
  button.setAttribute('aria-expanded','true');
  native.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',code:'ArrowDown',bubbles:true,cancelable:true}));
  function position(){
   const state=projectMenu;if(!state)return;
   const popup=document.getElementById(native.getAttribute('aria-controls'));
   if(native.getAttribute('aria-expanded')!=='true'){finishProjectMenu(true);return}
   if(popup){
    const wrapper=popup.closest('[data-radix-popper-content-wrapper]')||popup;
    if(!state.styles.has(wrapper))state.styles.set(wrapper,wrapper.getAttribute('style'));
    const size=popup.getBoundingClientRect(),x=Math.max(8,Math.min(anchor.right-size.width,innerWidth-size.width-8)),y=Math.max(8,Math.min(anchor.bottom+6,innerHeight-size.height-8));
    wrapper.style.setProperty('position','fixed','important');wrapper.style.setProperty('left','0','important');wrapper.style.setProperty('top','0','important');wrapper.style.setProperty('transform',`translate(${x}px, ${y}px)`,'important');
   }
   state.frame=requestAnimationFrame(position);
  }
  projectMenu.frame=requestAnimationFrame(position);
 }
 on(document,'click',event=>{if(projectMenu&&event.target.closest?.('[role="menuitem"]:not([aria-haspopup="menu"]),[role="menuitemcheckbox"],[role="menuitemradio"]')){finishProjectMenu()}},{capture:true});
 on(window,'resize',dismissProjectMenu);
 function projectRow(g){
  const row=document.createElement('div');row.className='nav-row project project-actions'+(g.custom?' native-section':'');
  const main=document.createElement('button');main.type='button';main.className='project-main';main.dataset.group=g.id;
  main.setAttribute('aria-expanded',String(expanded[g.id]));main.setAttribute('aria-label',(expanded[g.id]?'收起':'展开')+g.title);
  main.innerHTML=(g.id==='recent'?'<span class="project-letter">◷</span>':'')+'<span class="row-title"></span><span class="row-meta"></span>';
  main.querySelector('.row-title').textContent=g.title;
  const displayChats=g.custom?g.items.flatMap(i=>i.kind==='project'?i.project.chats:[i.chat]):g.chats;
  const completed=new Set(displayChats.filter(c=>c.status?.completionPending).map(c=>c.id)).size;
  main.querySelector('.row-meta').textContent=completed?'✓ '+completed:expanded[g.id]?displayChats.length:'';
  if(completed)row.dataset.completionPending='true';row.onclick=()=>toggleGroup(g.id);row.append(main);
  if(g.id!=='recent'&&g.id!=='pinned'){
   const menu=document.createElement('button');menu.type='button';menu.className='project-menu';menu.dataset.projectMenu=g.id;
   menu.title=g.title+(g.custom?' 的分区操作':' 的项目操作');menu.setAttribute('aria-label',menu.title);menu.setAttribute('aria-haspopup','menu');menu.setAttribute('aria-expanded',String(projectMenu?.id===g.id));
   menu.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
   menu.onclick=e=>{e.stopPropagation();openProjectMenu(g.id,menu)};row.append(menu);
   if(g.custom)return addCardSurface(row);
   const add=document.createElement('button');add.type='button';add.className='project-new-chat';add.dataset.newProject=g.id;
   add.title='在 '+g.title+' 中新建聊天';add.setAttribute('aria-label',add.title);
   add.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
   add.onclick=e=>{e.stopPropagation();createChat(g.id)};row.append(add);
  }
  return addCardSurface(row);
 }
 function chatRow(chat){const row=document.createElement('div');row.className='nav-row chat'+(chat.active?' selected':'');row.innerHTML='<button class="row-main"><span class="chat-dot"></span><span class="row-title"></span></button>';row.querySelector('.row-title').textContent=chat.title;const b=row.querySelector('button');b.onclick=()=>switchChat(chat.id);if(chat.active)b.setAttribute('aria-current','page');b.dataset.chat=chat.id;appendFadeChatStatus(b,chat);appendFadeChatActions(row,chat,adapter);bindChatContextMenu(row,chat.id);return addCardSurface(row)}
 function renderRows(){
  cancelReveal();const list=$('#arcList'),scroll=$('#arcViewport').scrollTop,focused=shadow.activeElement,focusKey=focused?.dataset.group,chatKey=focused?.dataset.chat,newProjectKey=focused?.dataset.newProject;
  list.replaceChildren();
  function group(g){list.append(projectRow(g));if(expanded[g.id]){for(const chat of g.chats)list.append(chatRow(chat));if(g.moreLabel){const more=document.createElement('button');more.className='nav-row project';const label=document.createElement('span');label.className='row-title';label.textContent=g.moreLabel;more.append(label);more.onclick=()=>adapter.more(g.id);list.append(addCardSurface(more))}}}
  const rendered=new Set();function builtin(id){if(id==='pinned'&&pinned.length)group({id:'pinned',title:'置顶',chats:pinned});if(id==='pinned')groups.filter(g=>g.sectionId==='pinned').forEach(group);if(id==='threads')groups.filter(g=>!g.sectionId||g.sectionId==='threads').forEach(group);if(id==='chats')group({id:'recent',title:'最近',chats:recent})}
  for(const section of sections){if(rendered.has(section.id))continue;rendered.add(section.id);if(!section.custom){builtin(section.id);continue}list.append(projectRow(section));if(section.expanded)for(const item of section.items){if(item.kind==='project')group(item.project);else list.append(chatRow(item.chat))}if(section.expanded&&section.moreLabel){const more=document.createElement('button');more.type='button';more.className='nav-row project';const label=document.createElement('span');label.className='row-title';label.textContent=section.moreLabel;more.append(label);more.onclick=()=>adapter.sectionMore(section.id);list.append(addCardSurface(more))}}
  for(const id of ['pinned','threads','chats'])if(!rendered.has(id))builtin(id);
  $('#arcViewport').scrollTop=scroll;layoutArc();
  if(focusKey||chatKey||newProjectKey)$$('[data-group],[data-chat],[data-new-project]').find(el=>newProjectKey?el.dataset.newProject===newProjectKey:focusKey?el.dataset.group===focusKey:el.dataset.chat===chatKey)?.focus({preventScroll:true});
 }
 function toggleGroup(id){if(id.startsWith('custom:')){if(adapter.toggleSection(id,!expanded[id]))adapter.refresh();else actionFailed();return}if(id==='recent'||id==='pinned'){expanded[id]=!expanded[id];persist();renderRows();return}const next=!expanded[id];if(adapter.toggle(id,next)){expanded[id]=next;persist();adapter.refresh()}else actionFailed()}
 let arcFrame=0;
function layoutArc(){
 const view=$('#arcViewport');if(!view.clientHeight)return;
 const rows=$$('#arcList .nav-row'),first=rows[0],last=rows.at(-1);
 centerArcEnds(view,$('#arcList'),rows);
 const spread=first&&last?(last.offsetTop+last.offsetHeight/2-first.offsetTop-first.offsetHeight/2)/2:1;
 const mid=view.scrollTop+view.clientHeight/2,half=Math.min(arcLayoutHeight(view)*.40,Math.max(1,spread)),radius=innerWidth<560?150:350;
 rows.forEach(row=>{const y=row.offsetTop+row.offsetHeight/2+Number(row.dataset.revealOffset||0)-mid;const angle=fadeArcAngle(y,half);row.style.setProperty('--arc-x',(radius*(Math.cos(angle*Math.PI/180)-1)).toFixed(2)+'px');row.style.setProperty('--arc-angle',angle.toFixed(2)+'deg')});updateChatGuides(rows);
}
function centerArcEnds(view,list,rows){
 if(!rows.length||!view.clientHeight)return;
 const style=getComputedStyle(view);
 list.style.paddingTop=Math.max(0,(view.clientHeight-rows[0].offsetHeight)/2-(parseFloat(style.paddingTop)||0))+'px';
 list.style.paddingBottom=Math.max(0,(view.clientHeight-rows.at(-1).offsetHeight)/2-(parseFloat(style.paddingBottom)||0))+'px';
}
function arcLayoutHeight(view){return Number(view.dataset?.layoutHeight)||view.clientHeight}
function updateChatGuides(rows,view=$('#arcViewport'),layer=$('#chatGuides'),list=$('#arcList')){
 if(!layer)return;
 const padding=getComputedStyle(view),height=list.offsetHeight+(parseFloat(padding.paddingTop)||0)+(parseFloat(padding.paddingBottom)||0);layer.setAttribute('viewBox',`0 0 ${view.clientWidth} ${height}`);layer.style.height=height+'px';
 const runs=[];let run=[];rows.forEach(row=>{if(row.classList.contains('chat'))run.push(row);else if(run.length){runs.push(run);run=[]}});if(run.length)runs.push(run);
 const ns='http://www.w3.org/2000/svg';layer.replaceChildren();
 // One common circle for all group segments, never a per-card spline.
 const sample=rows.find(row=>row.classList.contains('chat'));if(!sample)return;
 const inset=Math.min(13,Math.max(5,parseFloat(getComputedStyle(sample).marginLeft)/2));
 const radius=Math.max(350,arcLayoutHeight(view)*1.35),cx=sample.offsetLeft-inset-radius,cy=view.scrollTop+view.clientHeight/2;
 const point=y=>[cx+Math.sqrt(Math.max(0,radius*radius-(y-cy)*(y-cy))),y];
 runs.forEach(group=>{
  const first=group[0],last=group.at(-1);
  const top=Math.max(view.scrollTop-2,first.offsetTop+first.offsetHeight*.23+Number(first.dataset.revealOffset||0));
  const bottom=Math.min(view.scrollTop+view.clientHeight+2,last.offsetTop+last.offsetHeight*.77+Number(last.dataset.revealOffset||0));
  if(bottom<=top)return;
  const start=point(top),end=point(bottom),path=document.createElementNS(ns,'path');
  path.setAttribute('d',`M ${start[0]} ${start[1]} A ${radius} ${radius} 0 0 1 ${end[0]} ${end[1]}`);
  path.style.opacity=String(Math.min(...group.map(row=>row.style.opacity===''?1:Number(row.style.opacity))));layer.append(path);
 });
}
let revealFrame=0,revealRows=[];
function cancelReveal(){cancelAnimationFrame(revealFrame);revealFrame=0;revealRows.forEach(row=>{row.style.translate='';row.style.opacity='';delete row.dataset.revealOffset});revealRows=[]}
function revealCards(rows,delay=180,duration=650){
 cancelReveal();if(reduceMotion.matches||!rows.length){layoutArc();return}
 const view=$('#arcViewport'),start=performance.now()+delay,bleed=(view.clientHeight-arcLayoutHeight(view))/2;
 const entries=rows.filter(row=>row.offsetTop+row.offsetHeight>=view.scrollTop+bleed-30&&row.offsetTop<=view.scrollTop+view.clientHeight-bleed+30).map((row,index)=>({row,offset:view.scrollTop+view.clientHeight-bleed+45-row.offsetTop,at:start+index*65}));
 revealRows=entries.map(e=>e.row);entries.forEach(({row,offset})=>{row.style.translate=`0 ${offset}px`;row.style.opacity='0';row.dataset.revealOffset=offset});layoutArc();
 function frame(now){let finished=true;entries.forEach(({row,offset,at})=>{const p=Math.max(0,Math.min(1,(now-at)/duration)),eased=1-Math.pow(1-p,3),y=offset*(1-eased);row.style.translate=`0 ${y}px`;row.dataset.revealOffset=y;row.style.opacity=String(Math.min(1,p*5));if(p<1)finished=false});layoutArc();if(!finished&&navOpen)revealFrame=requestAnimationFrame(frame);else{cancelReveal();layoutArc()}}
 revealFrame=requestAnimationFrame(frame);
}

 function updateFanMask(view=$('#arcViewport')){
 const w=view.clientWidth,h=view.clientHeight;
 if(!w||!h)return;
 view.dataset.layoutHeight=String(innerWidth<=560?innerHeight*.72:Math.min(innerHeight*.75,620));
 // Match the shallow boundary marked in the reference (about 150 / 900).
 // Only the mask changes; card and guide-circle geometry stay independent.
 const slope=Math.tan(9.5*Math.PI/180),outer=Math.max(12,h*.025),inner=outer+w*slope;
 const feather=9;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><filter id="f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${feather}"/></filter></defs><path fill="white" filter="url(#f)" d="M -40 ${inner+40*slope} L ${w+40} ${outer-40*slope} L ${w+40} ${h-outer+40*slope} L -40 ${h-inner-40*slope} Z"/></svg>`;
 view.style.setProperty('--fan-mask',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}

 function lock(){inerted=[...document.body.children].filter(el=>el!==host&&!el.inert);for(const el of inerted)el.inert=true}
 function unlock(){for(const el of inerted)if(el.isConnected)el.inert=false;inerted=[]}
 let cardEntranceVersion=0;
 function revealAfterOrbArrives(){
  const version=++cardEntranceVersion;
  requestAnimationFrame(()=>{
   const orb=$('#orbButton');orb.getBoundingClientRect();
   const movement=orb.getAnimations().filter(animation=>animation.transitionProperty==='transform');
   const remaining=Math.max(0,...movement.map(animation=>{
    const timing=animation.effect?.getComputedTiming();
    return Math.max(0,(Number(timing?.endTime)||0)-(Number(animation.currentTime)||0));
   }));
   // Fade cards in during the final 180 ms, without exposing invisible controls.
   const reveal=()=>{
    if(disposed||!navOpen||version!==cardEntranceVersion)return;
    $('#navigation').classList.add('cards-ready');$('#navContent').inert=false;
   };
   if(remaining>180)setTimeout(reveal,remaining-180);else reveal();
  });
 }
 function openNav(spin=true){if(navOpen)return;chatPicker?.close();adapter.ensureSidebar();adapter.refresh();navOpen=true;returnFocus=document.activeElement;if(spin)startSpin();$('#navigation').classList.add('open');$('#navigation').setAttribute('role','dialog');root.setAttribute('data-fade-nav-open','');$('#navigation').setAttribute('aria-labelledby','navTitle');$('#navContent').inert=true;$('#orbButton').setAttribute('aria-expanded','true');renderRows();historyCards.open();$('#arcViewport').scrollTop=lastScroll;layoutArc();$('#orbButton').focus({preventScroll:true});revealAfterOrbArrives()}
 function closeNav(restoreFocus=true){if(!navOpen)return;cardEntranceVersion++;$('#navigation').classList.remove('cards-ready');dismissProjectMenu();cancelReveal();lastScroll=$('#arcViewport').scrollTop;navOpen=false;root.removeAttribute('data-fade-nav-open');$('#navigation').classList.remove('open');['role','aria-modal','aria-labelledby'].forEach(a=>$('#navigation').removeAttribute(a));$('#navContent').inert=true;$('#orbButton').setAttribute('aria-expanded','false');unlock();if(restoreFocus&&returnFocus?.isConnected&&!returnFocus.closest('[inert]'))returnFocus.focus({preventScroll:true})}
 on($('#orbButton'),'click',()=>{startSpin();if(!navOpen)openNav(false)});
 on($('#orbButton'),'contextmenu',e=>{e.preventDefault();e.stopPropagation();createChat()});
 on($('#orbButton'),'pointerenter',()=>host.classList.add('near-orb'));
 on(document,'pointermove',e=>{if(!navOpen){const windowMode=host.hasAttribute('data-window-mode'),left=windowMode?0:$('#navigation').getBoundingClientRect().left;const near=windowMode?Math.abs(e.clientX-innerWidth/2)<(innerWidth<=560?38:47)&&e.clientY>=0&&e.clientY<43:e.clientX>=left&&e.clientX<left+135&&Math.abs(e.clientY-innerHeight/2)<145;if(host.classList.contains('near-orb')!==near)host.classList.toggle('near-orb',near)}},{passive:true});
 on($('#navigation'),'click',event=>{
  if(!navOpen||event.button!==0)return;
  if(event.composedPath().some(el=>el.matches?.('.nav-row,button,input,textarea,select,a')))return;
  closeNav();
 });
 on($('#arcViewport'),'scroll',()=>{if(!arcFrame)arcFrame=requestAnimationFrame(()=>{arcFrame=0;layoutArc()})},{passive:true});
 on($('#fadeRailToggle'),'click',()=>{const visible=!root.hasAttribute('data-fade-rail-open');chatPicker.close();if(visible)adapter.ensureSidebar();if(visible)root.setAttribute('data-fade-rail-open','');else root.removeAttribute('data-fade-rail-open');$('#fadeRailToggle').setAttribute('aria-expanded',String(visible));const brandLabel='FCodex · '+(visible?'收起侧栏':'展开侧栏');$('#fadeRailToggle').setAttribute('aria-label',brandLabel);$('#fadeRailToggle').title=brandLabel;host.classList.remove('near-orb');syncNativeFocus();requestAnimationFrame(()=>{updateFanMask();layoutArc()})});

 on($('#headerMenuToggle'),'click',()=>{const open=!root.hasAttribute('data-fade-menu-open');if(open&&!document.getElementById('application-menu-trigger-file-menu')){announce('原生应用菜单尚未加载');return}root.toggleAttribute('data-fade-menu-open',open);host.toggleAttribute('data-menu-open',open);$('#headerMenuToggle').setAttribute('aria-expanded',String(open));$('#headerMenuToggle').setAttribute('aria-label',open?'收起应用菜单':'展开应用菜单');$('#headerMenuToggle').setAttribute('title',open?'收起应用菜单':'展开应用菜单')});
 const disposeFullscreen=installFullscreenControls();
 on($('#headerThemeToggle'),'click',()=>setTheme(!config.light));
 on(window,'storage',event=>{if(event.key==='fade-orb-usage')orbUsage.set(event.newValue!=='false',false);if(event.key==='fade-composer-autohide')composerAutohide.set(event.newValue==='true',false);if(event.key==='fade-codex-v1')try{const next=JSON.parse(event.newValue);if(typeof next?.light==='boolean'&&next.light!==config.light)setTheme(next.light,false)}catch{}});
 on(document,'keydown',e=>{
  if(projectMenu||!e.composedPath().includes(host))return;
  if(e.key==='Escape'&&!$('#chatPicker').hidden){e.preventDefault();e.stopPropagation();chatPicker.close(true);return}
  if(e.key==='Escape'){if(navOpen){e.preventDefault();e.stopPropagation()}}
  if(navOpen&&e.key==='Tab'){const targets=[$('#orbButton'),...$('#navContent button,#arcViewport,#historyViewport')].filter(el=>!el.disabled),i=targets.indexOf(shadow.activeElement);e.preventDefault();targets[(i+(e.shiftKey?-1:1)+targets.length)%targets.length]?.focus({preventScroll:true})}
 },{capture:true});
 // Selected candidate 05: flat monochrome core and independent particle orbits.
const canvas=$('#orbCanvas'),ctx=canvas.getContext('2d');
const canvasSize=240;
let raf=0,lastDraw=0,burstTime=-10000,orbClock=0;
const orbState={"config":{"count":360,"core":29,"min":46,"max":101,"size":[0.4,0.95],"speed":[0.08,0.68],"kind":"halo","gain":2.089655172413793,"boost":22.950000000000003,"spikes":[{"angle":3.3289530220962322,"length":6.514577205778939,"width":1.7580197050818243,"lean":-0.1123993437635363},{"angle":3.7646865913520156,"length":2.8002971864309085,"width":2.223162750845222,"lean":-0.21387571195009514},{"angle":4.471335947027946,"length":7.716405562647022,"width":2.219762124654335,"lean":0.259925041493625},{"angle":5.051999881190983,"length":5.27779640541568,"width":1.349086621522292,"lean":-0.18253838222444754},{"angle":5.339542174880122,"length":8.932607067607261,"width":1.648031550921587,"lean":0.16072759372636936},{"angle":5.429716198138715,"length":4.455811456885703,"width":2.0432368678353665,"lean":0.051943822803150394},{"angle":5.559729618327229,"length":6.60194937679845,"width":1.2971282963317208,"lean":0.10803445842934706},{"angle":6.009154916689592,"length":3.364849082767387,"width":0.9587978683015536,"lean":-0.021478618029505014},{"angle":6.328726441234005,"length":5.484336536585355,"width":2.1901137241671673,"lean":-0.3013715323009819},{"angle":6.968825255545643,"length":7.753985469610288,"width":1.0675624908166355,"lean":-0.09044211042346433},{"angle":7.091238504715848,"length":2.8160682458112483,"width":2.4741798312541503,"lean":0.1312349961237487},{"angle":7.839798835596396,"length":5.087774940087945,"width":2.344840272262081,"lean":-0.16969397440079773},{"angle":8.22441729086822,"length":9.922656482080328,"width":2.0559292213758456,"lean":-0.14639958562038372},{"angle":8.346041898088586,"length":5.465121141412252,"width":1.3762782279595285,"lean":-0.13867823939581284},{"angle":8.910564509681786,"length":7.838009727298571,"width":1.8709358693762623,"lean":-0.2432345533336047},{"angle":9.250554486930948,"length":8.359421021648057,"width":2.0623573283521184,"lean":0.15046805582296655}]},"trigger":-100,"baseScale":1,"currentScale":1,"currentBoost":0,"coreAngle":0,"particles":[{"angle":1.6354155060004076,"r":75.1518670982147,"radial":0.5300339472402672,"speed":0.5616657446154074,"size":0.7249114378027708,"opacity":0.5660078594368869},{"angle":3.027104763597296,"r":62.20255530576587,"radial":0.29459191465028856,"speed":0.2312042044207493,"size":1.0760543472160353,"opacity":0.7628047273984921},{"angle":0.13606055399491912,"r":48.058480745232465,"radial":0.03742692264059027,"speed":0.3603482471782233,"size":1.5023087258158825,"opacity":0.9703016300477069},{"angle":0.3792495983983773,"r":94.71721874378864,"radial":0.8857676135234299,"speed":0.4706965082424661,"size":0.30028876889933465,"opacity":0.2448800307735958},{"angle":5.153874017825441,"r":54.58656125404816,"radial":0.1561192955281485,"speed":0.2586334357956736,"size":1.3006726183791768,"opacity":0.8753280677284588},{"angle":0.9106293938860617,"r":46.96956616852848,"radial":0.017628475791426866,"speed":0.23247735795795677,"size":1.536701312857776,"opacity":0.9860258606631407},{"angle":1.1994769893368182,"r":84.10121856089216,"radial":0.6927494283798574,"speed":0.2394760836655983,"size":0.5105823845129593,"opacity":0.42424685787937805},{"angle":4.305602504836346,"r":56.49826896434846,"radial":0.19087761753360843,"speed":0.4145993426950643,"size":1.243168717404371,"opacity":0.8472696525034393},{"angle":5.028623667728972,"r":46.41016189114003,"radial":0.007457488929818721,"speed":0.13043613933998732,"size":1.554450982587211,"opacity":0.994091460401856},{"angle":0.30350247972772937,"r":46.59419158342684,"radial":0.010803483335033472,"speed":0.4771219718429466,"size":1.5486057441256251,"opacity":0.9914390008614007},{"angle":5.363900011338117,"r":82.60757925573648,"radial":0.6655923501042996,"speed":0.6341567331684351,"size":0.5444052237014041,"opacity":0.4483456413269779},{"angle":5.16555694891158,"r":99.4315268649546,"radial":0.9714823066355384,"speed":0.4438420463202914,"size":0.23321835731175541,"opacity":0.15581670481051157},{"angle":3.615208780489314,"r":53.53271512175565,"radial":0.1369584567591936,"speed":0.4805322321323047,"size":1.3326792410684136,"opacity":0.8907458648660566},{"angle":1.6208861459464252,"r":51.52673409346194,"radial":0.10048607442658067,"speed":0.13905603492544596,"size":1.3941917707966505,"opacity":0.9199996079826778},{"angle":5.3883393862046525,"r":72.3657917607965,"radial":0.47937803201448187,"speed":0.6716055541407369,"size":0.7967771014798344,"opacity":0.6090496052624587},{"angle":2.014227188648857,"r":50.77862110991625,"radial":0.08688402018029544,"speed":0.5000150141678891,"size":1.417326238763306,"opacity":0.9308789396772887},{"angle":3.686057774397415,"r":87.67258292545368,"radial":0.7576833259173397,"speed":0.6166187893195253,"size":0.4334160429366453,"opacity":0.3657127212118453},{"angle":5.581294418935965,"r":88.60686704741423,"radial":0.7746703099529858,"speed":0.5903904904894443,"size":0.41417473403062965,"opacity":0.3501543828014003},{"angle":5.782486801056471,"r":56.422629349098806,"radial":0.18950235180179648,"speed":0.19891189284521332,"size":1.2454300980968918,"opacity":0.8483820845581511},{"angle":5.647741147090784,"r":67.26101089279018,"radial":0.3865638344143668,"speed":0.6493662949552447,"size":0.9338861615459311,"opacity":0.6868590845076891},{"angle":1.1432850301952686,"r":47.78171561956131,"radial":0.032394829446569275,"speed":0.57601411167161,"size":1.5110302205896418,"opacity":0.9743012356606261},{"angle":0.17958494162947186,"r":47.057226268341765,"radial":0.019222295788032043,"speed":0.6715402599531601,"size":1.5339248722808234,"opacity":0.9847612054856317},{"angle":1.0096708029248125,"r":51.21920109913415,"radial":0.09489456543880284,"speed":0.08182640636509882,"size":1.4036892355943584,"opacity":0.9244738422914713},{"angle":2.5194243463459136,"r":76.83334837761811,"radial":0.5606063341385111,"speed":0.5536383998521031,"size":0.6826352320577624,"opacity":0.5398083620709484},{"angle":6.0481182259646316,"r":47.99987190496514,"radial":0.03636130736300256,"speed":0.27109761108746533,"size":1.5041544838640872,"opacity":0.9711487759581796},{"angle":5.100821378480656,"r":47.3753115976914,"radial":0.025005665412570897,"speed":0.17016999396511356,"size":1.523861595584658,"opacity":0.9801705217177342},{"angle":3.4732447668718227,"r":48.47044273796637,"radial":0.04491714069029773,"speed":0.15513129448064727,"size":1.4893522000482216,"opacity":0.9643443818514529},{"angle":0.5945463921288053,"r":64.98104735733946,"radial":0.3451099519516265,"speed":0.5502003197466958,"size":0.9972266470410083,"opacity":0.7212211138425023},{"angle":1.9227886643535677,"r":50.81091498714948,"radial":0.08747118158453604,"speed":0.5396765402328937,"size":1.416325442876971,"opacity":0.9304096467013535},{"angle":3.1220074457233187,"r":49.066396819500746,"radial":0.05575266944546804,"speed":0.5513213618577657,"size":1.4706629065976187,"opacity":0.9557182021305772},{"angle":3.1494245376779237,"r":46.2824725218255,"radial":0.005135864033190867,"speed":0.60219317827578,"size":1.5585101894163957,"opacity":0.9959313491802444},{"angle":4.495398989175642,"r":54.07699229494148,"radial":0.14685440536257247,"speed":0.18808765842401207,"size":1.316121943808316,"opacity":0.8827873979972283},{"angle":3.1250113139349986,"r":80.13566014919495,"radial":0.620648366348999,"speed":0.48381379276869246,"size":0.6021935206143829,"opacity":0.4878073765304636},{"angle":5.135778016677505,"r":46.54564442251877,"radial":0.009920807682159503,"speed":0.5427649449396552,"size":1.550147146985161,"opacity":0.9921388085356331},{"angle":3.41360701829896,"r":76.35102569679522,"radial":0.5518368308508221,"speed":0.27186802952724326,"size":0.6946743727735838,"opacity":0.5473416460027337},{"angle":4.639135035464201,"r":46.31192165237772,"radial":0.005671302770504033,"speed":0.5071341109901054,"size":1.5575737579902724,"opacity":0.9955070518677201},{"angle":0.15139626864327224,"r":49.10159722791087,"radial":0.056392676871106814,"speed":0.5895028533688773,"size":1.469561015422066,"opacity":0.9552083827517668},{"angle":0.000902222542030537,"r":97.4370596918838,"radial":0.9352192671251602,"speed":0.3610971668745365,"size":0.2584068233480759,"opacity":0.19495212382159405},{"angle":1.4776711705973338,"r":52.600810295794155,"radial":0.12001473265080286,"speed":0.4700244603771945,"size":1.3611606705384278,"opacity":0.9043511421722445},{"angle":2.195923384393932,"r":65.41024541482733,"radial":0.35291355299686056,"speed":0.5414987620725286,"size":0.9852084704031854,"opacity":0.714769576564672},{"angle":1.4839991895277582,"r":90.21633250476188,"radial":0.8039333182683978,"speed":0.1510502592577136,"size":0.38205174514086077,"opacity":0.32307015068987754},{"angle":5.212359218091823,"r":60.564845839511804,"radial":0.26481537890021467,"speed":0.4508750962008491,"size":1.123325170483377,"opacity":0.7871745087102585},{"angle":4.379948818002233,"r":64.07373496508112,"radial":0.3286133630014748,"speed":0.5773176803414876,"size":1.022773956538758,"opacity":0.7348343115721725},{"angle":5.348190787371254,"r":46.00000002046842,"radial":3.7215307557386456e-10,"speed":0.6678925872853888,"size":1.5674999993480807,"opacity":0.9999999997052548},{"angle":0.3927850431308714,"r":96.7624463410215,"radial":0.9229535698367545,"speed":0.5639434466175209,"size":0.26811794277155554,"opacity":0.20761126299886884},{"angle":0.31225385464291466,"r":66.84313509352225,"radial":0.3789660926094953,"speed":0.5494847276150107,"size":0.9454018856711632,"opacity":0.693173962395911},{"angle":4.734621746672208,"r":48.035360327409855,"radial":0.03700655140745187,"speed":0.3155002153995449,"size":1.5030367799524338,"opacity":0.9706358291796368},{"angle":4.006510249136257,"r":71.06868681909769,"radial":0.45579430580177627,"speed":0.4650052116299097,"size":0.8309712577547441,"opacity":0.628943351752388},{"angle":1.9942280481114683,"r":46.13957813956529,"radial":0.002537784355732517,"speed":0.19910456541842275,"size":1.5630561295403311,"opacity":0.9979898195147875},{"angle":5.951059872604241,"r":51.90999627312267,"radial":0.10745447769313946,"speed":0.6142040985209907,"size":1.3823803566647768,"opacity":0.9144197090085023},{"angle":1.5292657663045328,"r":61.62828300649474,"radial":0.2841506001180862,"speed":0.3917002458420585,"size":1.0925632920053545,"opacity":0.7713616285079503},{"angle":0.7477519422633132,"r":66.23025189328752,"radial":0.3678227616961366,"speed":0.16757490337600459,"size":0.9623680718257208,"opacity":0.7024218259493548},{"angle":3.3005816133633408,"r":46.83288121544989,"radial":0.015143294826361545,"speed":0.42323288988623115,"size":1.5410332041152008,"opacity":0.9879973786225764},{"angle":4.484329167057094,"r":76.51073269481348,"radial":0.5547405944511543,"speed":0.10390838444596938,"size":0.6906800670708624,"opacity":0.5448488667006843},{"angle":1.019005665642293,"r":47.282983643163526,"radial":0.023326975330245955,"speed":0.08186215881431677,"size":1.526780738653286,"opacity":0.9815033006890819},{"angle":4.070311272387241,"r":74.08166883529371,"radial":0.5105757970053402,"speed":0.2679448255411767,"size":0.7522551212299577,"opacity":0.5825935469503055},{"angle":5.861034211184535,"r":73.16555614768762,"radial":0.4939192026852295,"speed":0.6757136721310334,"size":0.7759229333955435,"opacity":0.5967388505845145},{"angle":5.773394118575567,"r":76.37122047836655,"radial":0.5522040086975736,"speed":0.6537580364325625,"size":0.6941688670702879,"opacity":0.5470265261014534},{"angle":2.333378043728804,"r":50.4520489918019,"radial":0.08094634530548907,"speed":0.20146265350418413,"size":1.4274576299807042,"opacity":0.9356229771433988},{"angle":0.7569023134558094,"r":61.686308075893834,"radial":0.28520560137988793,"speed":0.6169234413252431,"size":1.0908919106498172,"opacity":0.7704976001174687},{"angle":2.0290847573000645,"r":65.62947477760017,"radial":0.356899541410912,"speed":0.5894778224914128,"size":0.979086449567445,"opacity":0.7114712091889893},{"angle":6.242185661604454,"r":64.39427565362338,"radial":0.3344413755204251,"speed":0.4059710883963584,"size":1.0137266896378647,"opacity":0.7300288241395324},{"angle":3.4875236724245653,"r":49.82584982673885,"radial":0.0695609059407064,"speed":0.26929809191198845,"size":1.4469393876102625,"opacity":0.9447110754109848},{"angle":0.9276345145762891,"r":81.8648051272651,"radial":0.6520873659502744,"speed":0.25007726418792947,"size":0.561538788670473,"opacity":0.4602560469303923},{"angle":5.540468483179563,"r":50.2905556055828,"radial":0.07801010191968737,"speed":0.15503594167068224,"size":1.4324749795357443,"opacity":0.9379678205591446},{"angle":3.260671774464046,"r":48.914486204873484,"radial":0.05299065827042695,"speed":0.10622189365906817,"size":1.4754207886138788,"opacity":0.9579179787521394},{"angle":5.4811682736954435,"r":46.00927379796268,"radial":0.00016861450841226596,"speed":0.17363499786111994,"size":1.5672046370057446,"opacity":0.9998664561834061},{"angle":3.5855834868379026,"r":67.10291989205953,"radial":0.38368945258290044,"speed":0.5773131669660222,"size":0.9382377939761084,"opacity":0.6892490471731099},{"angle":5.13311049673925,"r":46.480017431197055,"radial":0.008727589658128282,"speed":0.6388677441318219,"size":1.5522315005626537,"opacity":0.9930847229290549},{"angle":0.6520900349118057,"r":65.21392218496209,"radial":0.34934403972658323,"speed":0.5239258802159931,"size":0.9907004455384647,"opacity":0.7177215904272625},{"angle":0.12978369330977418,"r":48.7453120828691,"radial":0.04991476514307447,"speed":0.3370007967362188,"size":1.4807242696953096,"opacity":0.9603669886793325},{"angle":2.1321194850460015,"r":46.6829030149869,"radial":0.012416418454307295,"speed":0.5242555840539332,"size":1.545790166382481,"opacity":0.9901600635763976},{"angle":5.4081435226877295,"r":47.84307260410347,"radial":0.033510410983699404,"speed":0.09345370590077128,"size":1.5090955467245188,"opacity":0.9734147295631541},{"angle":3.90166302733098,"r":50.006647599057956,"radial":0.07284813816469017,"speed":0.5852045326728416,"size":1.4413071821172516,"opacity":0.9420882850262194},{"angle":5.156893703107408,"r":63.82033591523246,"radial":0.3240061075496812,"speed":0.5731452636543153,"size":1.0299428532394082,"opacity":0.7386302708095813},{"angle":1.6552481840152373,"r":48.23581861955026,"radial":0.040651247628186574,"speed":0.22901874582191817,"size":1.4967275897635328,"opacity":0.9677377751614938},{"angle":4.474202488225128,"r":65.68418744852843,"radial":0.35789431724597154,"speed":0.4070677249199411,"size":0.9775603594396898,"opacity":0.7106477233531024},{"angle":1.273024543379008,"r":46.34511727449661,"radial":0.006274859536301915,"speed":0.4035152949798064,"size":1.5565183759701753,"opacity":0.9950287484430512},{"angle":6.106933916980445,"r":47.704690489082985,"radial":0.030994372528781535,"speed":0.30451259393665253,"size":1.5134598810010695,"opacity":0.9754139756697224},{"angle":3.2594283496863983,"r":58.65393637881752,"radial":0.23007157052395494,"speed":0.504448816035361,"size":1.1792111907898037,"opacity":0.8154853603246287},{"angle":6.075358003470355,"r":69.4249064398835,"radial":0.4259073898160635,"speed":0.13718927528447405,"size":0.8749457335901707,"opacity":0.65403095688179},{"angle":0.48191049498382627,"r":46.12505931967808,"radial":0.00227380581232874,"speed":0.605319570326544,"size":1.563518219922531,"opacity":0.9981989408860965},{"angle":4.719369974263321,"r":46.09509407405387,"radial":0.00172898316461573,"speed":0.2751240949287304,"size":1.564472039556204,"opacity":0.9986305268789499},{"angle":0.09151799293126511,"r":91.44685642331886,"radial":0.8263064804239794,"speed":0.46608964941100195,"size":0.35843550009106784,"opacity":0.3020907673314702},{"angle":5.287506897301425,"r":78.49008398486028,"radial":0.5907287997247324,"speed":0.642938354222978,"size":0.6418356836881329,"opacity":0.5138154396555901},{"angle":4.752998186290364,"r":65.04114677132011,"radial":0.34620266856945664,"speed":0.08241886554511159,"size":0.9955411754416568,"opacity":0.7203181878752539},{"angle":1.5948089084776704,"r":86.0575760302701,"radial":0.7283195641867292,"speed":0.2848879805997834,"size":0.46763079313833683,"opacity":0.3923549048214284},{"angle":4.9574522613050815,"r":98.61165158197471,"radial":0.956575483308631,"speed":0.6556097698357047,"size":0.24283411928249884,"opacity":0.17229307329324084},{"angle":3.075657443519374,"r":75.73717691991075,"radial":0.5406759439983774,"speed":0.14184885461055569,"size":0.710098893896358,"opacity":0.5569079469410606},{"angle":3.665756503240506,"r":46.401798802825176,"radial":0.007305432778639515,"speed":0.33541441371237346,"size":1.554716755572266,"opacity":0.9942119781301747},{"angle":1.1082976502378743,"r":61.81113811748406,"radial":0.28747523849971024,"speed":0.5960055830292456,"size":1.0872987565479384,"opacity":0.7686383726903194},{"angle":5.610590242954766,"r":62.42470462718221,"radial":0.2986309932214948,"speed":0.5142795127390694,"size":1.0696876691526402,"opacity":0.7594912194287907},{"angle":5.735336003346863,"r":84.719243799487,"radial":0.7039862508997635,"speed":0.2536745213844577,"size":0.49684343059857844,"opacity":0.41421402215281844},{"angle":1.9827757957999543,"r":59.01407204277095,"radial":0.23661949168674454,"speed":0.6048640055068434,"size":1.1686197463517927,"opacity":0.8101597571664679},{"angle":5.978488003738684,"r":74.55016511513855,"radial":0.5190939111843375,"speed":0.1875248943711863,"size":0.7402440625130549,"opacity":0.5753411712684928},{"angle":2.2398885521720144,"r":95.86260665876084,"radial":0.9065928483411062,"speed":0.1528395245716344,"size":0.28180490476177494,"opacity":0.22418970016647852},{"angle":0.21309084492746586,"r":57.25241053550259,"radial":0.20458928246368344,"speed":0.5417730914259079,"size":1.2206855852357308,"opacity":0.8361680905608797},{"angle":5.219231928237045,"r":46.00000029607897,"radial":5.383254044928943e-9,"speed":0.09613008837786512,"size":1.5674999905698845,"opacity":0.9999999957364628},{"angle":1.2414502156721179,"r":46.00160134839433,"radial":0.000029115425351482885,"speed":0.4050144908437641,"size":1.5674489972763879,"opacity":0.9999769405495521},{"angle":0.4271161931473294,"r":75.96665868691375,"radial":0.5448483397620681,"speed":0.5814720524674952,"size":0.7043192649164505,"opacity":0.5533344235848323},{"angle":6.1501132607565,"r":56.441983374782,"radial":0.18985424317785454,"speed":0.49828924204994857,"size":1.2448513654391788,"opacity":0.8480974628252859},{"angle":0.5242835836439405,"r":46.029378288795655,"radial":0.0005341507053756056,"speed":0.5647652802101945,"size":1.5665643764818062,"opacity":0.9995769413405767},{"angle":4.340386071046748,"r":52.66872692472784,"radial":0.12124958044959715,"speed":0.28800942900405213,"size":1.3590793607597003,"opacity":0.9033604891714703},{"angle":2.948163966019843,"r":46.81651595765144,"radial":0.014845744684571624,"speed":0.33430365479952073,"size":1.541552080471269,"opacity":0.9882333946404996},{"angle":3.7653328136462583,"r":46.1901653088874,"radial":0.0034575510706800878,"speed":0.56581897792017,"size":1.5614463786860888,"opacity":0.9972611455462497},{"angle":0.9517196818654696,"r":95.02857131420134,"radial":0.8914285693491154,"speed":0.1532248990547144,"size":0.29515519441966165,"opacity":0.23929621828866593},{"angle":1.814129405723819,"r":75.49026898631759,"radial":0.536186708842138,"speed":0.6745839969390854,"size":0.7163350218821589,"opacity":0.5607492103795229},{"angle":5.612221209361153,"r":65.25929966797496,"radial":0.350169084872272,"speed":0.32193109566525663,"size":0.9894302440222298,"opacity":0.7170394162113579},{"angle":3.2747345163153585,"r":47.56021326597782,"radial":0.028367513926869502,"speed":0.19275734576653444,"size":1.5180200733633513,"opacity":0.9775007257379736},{"angle":0.3051023942349376,"r":65.08986619696996,"radial":0.3470884763085448,"speed":0.3875164593826202,"size":0.9941754725120537,"opacity":0.7195861226595905},{"angle":1.3998299461368238,"r":46.36428472883091,"radial":0.006623358706016521,"speed":0.5669122194935682,"size":1.5559090763483434,"opacity":0.994752558463513},{"angle":4.65753305019821,"r":53.219678054552396,"radial":0.13126687371913448,"speed":0.6712801071920247,"size":1.3422279236068673,"opacity":0.8953189807371963},{"angle":2.977646388165664,"r":57.18324926727148,"radial":0.2033318048594815,"speed":0.38517548295219944,"size":1.2227426726826884,"opacity":0.8371869915552602},{"angle":0.48251946096741377,"r":95.53490318705624,"radial":0.9006346034010226,"speed":0.5929675775887143,"size":0.28697835781383235,"opacity":0.23015249166703716},{"angle":5.7129284402924805,"r":69.33295626041709,"radial":0.42423556837122,"speed":0.5667225289221132,"size":0.8774262730599682,"opacity":0.6554303950181909},{"angle":5.440313290237633,"r":62.803244537011864,"radial":0.3055135370365794,"speed":0.4518045760614841,"size":1.0588642649252498,"opacity":0.7538406357033846},{"angle":3.2651531050879137,"r":51.64186943203973,"radial":0.10257944421890411,"speed":0.5403267565931443,"size":1.3906406231247073,"opacity":0.9183238128655573},{"angle":6.054773599148121,"r":46.00194524571794,"radial":0.00003536810396257739,"speed":0.5752566304199926,"size":1.5674380442525766,"opacity":0.9999719884121253},{"angle":2.750590524314672,"r":46.003389937379254,"radial":0.00006163522507735899,"speed":0.6638794943726432,"size":1.5673920314926935,"opacity":0.9999511847512988},{"angle":0.2720110497367963,"r":62.251544649155974,"radial":0.2954826299846541,"speed":0.6591530894852738,"size":1.0746493971276696,"opacity":0.7620741815143888},{"angle":3.2378126407823715,"r":62.59801072693688,"radial":0.3017820132170342,"speed":0.22720706757829257,"size":1.0647284399707941,"opacity":0.7569049165047318},{"angle":0.3318586714633419,"r":86.52359783701795,"radial":0.736792687945781,"speed":0.37416503169961746,"size":0.4576381205537837,"opacity":0.38469810198575877},{"angle":1.2375612059499168,"r":68.92471780819588,"radial":0.41681305105810684,"speed":0.4725220549036955,"size":0.8884653634234148,"opacity":0.6616387023142163},{"angle":3.1173226202685997,"r":51.18017911383311,"radial":0.09418507479696567,"speed":0.28036280592937285,"size":1.4048956030205721,"opacity":0.925041367188725},{"angle":1.911284484301864,"r":60.85961784854098,"radial":0.27017486997347234,"speed":0.4497496586197519,"size":1.114773742737858,"opacity":0.7827955808749828},{"angle":0.11303401567144163,"r":57.85533930518034,"radial":0.21555162373055156,"speed":0.4050437788898533,"size":1.202793901207693,"opacity":0.827278739722084},{"angle":3.309395554358999,"r":50.63118730871701,"radial":0.08420340561303659,"speed":0.6315747024226699,"size":1.421897703266713,"opacity":0.9330210571173149},{"angle":3.001856029302653,"r":50.70083121047293,"radial":0.08546965837223505,"speed":0.2676888589818858,"size":1.419737761083524,"opacity":0.9320092546768997},{"angle":1.2626200183676604,"r":70.67858841601048,"radial":0.44870160756382693,"speed":0.5197882174139733,"size":0.841343154243736,"opacity":0.6349092878564108},{"angle":2.9164376791602455,"r":52.24413292863759,"radial":0.11352968961159256,"speed":0.4923804663423268,"size":1.3721054395796293,"opacity":0.9095514718774094},{"angle":5.162776626285965,"r":47.601225659935224,"radial":0.0291131938170041,"speed":0.43591676128647927,"size":1.5167252063767331,"opacity":0.976908422537628},{"angle":3.319264560651915,"r":100.95115974435984,"radial":0.9991119953519971,"speed":0.5478596397562508,"size":0.22014536792272907,"opacity":0.12157781611434286},{"angle":4.949998901418641,"r":74.25279824203987,"radial":0.5136872407643613,"speed":0.38408000760160393,"size":0.7478604665478541,"opacity":0.5799459190942418},{"angle":3.6391713815758635,"r":81.86874361655849,"radial":0.652158974846518,"speed":0.6361818001383747,"size":0.5614474053873785,"opacity":0.460193016596021},{"angle":3.7847061178287533,"r":55.53640900133445,"radial":0.17338925456971718,"speed":0.5089142268979124,"size":1.2720106450507531,"opacity":0.8614017623565838},{"angle":5.105509630089521,"r":75.85301954129098,"radial":0.5427821734780177,"speed":0.19590929591647288,"size":0.7071793539028132,"opacity":0.5551044364261712},{"angle":3.5416586019720877,"r":79.67803672449648,"radial":0.6123279404453904,"speed":0.32602476353386867,"size":0.613126776937883,"opacity":0.49505997773162574},{"angle":1.2145851792619273,"r":65.0762274316599,"radial":0.34684049875745265,"speed":0.2555052050347489,"size":0.9945577383888273,"opacity":0.7197910707465106},{"angle":4.604110169693908,"r":90.40570920474646,"radial":0.8073765309953902,"speed":0.3622657022460045,"size":0.37836191095423954,"opacity":0.3198577307918409},{"angle":0.4591679002822905,"r":63.00334098720828,"radial":0.3091516543128779,"speed":0.2749570919340077,"size":1.0531559734444473,"opacity":0.7508514736798696},{"angle":2.80959752112789,"r":47.720848820745864,"radial":0.03128816037719757,"speed":0.6446378471186738,"size":1.5129500994762475,"opacity":0.9751805584108852},{"angle":0.02649507905678019,"r":53.68993341557423,"radial":0.13981697119225878,"speed":0.1523985557187335,"size":1.3278906688824053,"opacity":0.8884479475141939},{"angle":3.618179376092168,"r":85.60771990124422,"radial":0.720140361840804,"speed":0.2007559651888497,"size":0.4773659702871715,"opacity":0.3997234742069606},{"angle":5.217469211428316,"r":49.84384959510119,"radial":0.06988817445638522,"speed":0.1709917431799618,"size":1.4463783915364299,"opacity":0.9444499986283132},{"angle":4.282250821266105,"r":49.00366275012871,"radial":0.05461205000234015,"speed":0.377971614355195,"size":1.4726272494409376,"opacity":0.9566267151503777},{"angle":3.7876757244989854,"r":66.7403040612779,"radial":0.37709643747778,"speed":0.4935991964615875,"size":0.9482421853452838,"opacity":0.6947267421148865},{"angle":6.222754671636204,"r":70.89098898675164,"radial":0.4525634361227571,"speed":0.5519815688878127,"size":0.8356908723623266,"opacity":0.6316619163534783},{"angle":2.384016634173656,"r":50.52056939230671,"radial":0.08219217076921287,"speed":0.5871950768187596,"size":1.4253302589249706,"opacity":0.9346278518904549},{"angle":5.487577993674836,"r":46.03564023126477,"radial":0.0006480042048139694,"speed":0.5753248065852792,"size":1.5663649689873613,"opacity":0.9994867640374209},{"angle":3.6050465790805144,"r":79.79809463431255,"radial":0.6145108115329553,"speed":0.5234071669759296,"size":0.6102515500677135,"opacity":0.4931587710785582},{"angle":3.1050473390224322,"r":47.16745224407023,"radial":0.021226404437640633,"speed":0.46053766338204755,"size":1.5304356280809537,"opacity":0.9831707050655051},{"angle":5.01547852954039,"r":73.0757451088884,"radial":0.49228627470706177,"speed":0.5119556697569375,"size":0.7782559353378504,"opacity":0.5981230550245107},{"angle":3.574205787757614,"r":99.61482155228782,"radial":0.9748149373143239,"speed":0.2708336590890155,"size":0.2312464309426075,"opacity":0.15202664196346152},{"angle":2.5166675649980514,"r":69.71157558182331,"radial":0.4311195560331511,"speed":0.640816345793024,"size":0.8672261856974328,"opacity":0.6496653662929455},{"angle":3.241553781670819,"r":86.15845518495922,"radial":0.7301537306356223,"speed":0.5502510587594016,"size":0.4654596539734531,"opacity":0.3906994968979539},{"angle":0.5483893927072386,"r":87.32811768433166,"radial":0.7514203215333028,"speed":0.2023092975302686,"size":0.4406145147826269,"opacity":0.3714211056355479},{"angle":5.6126230407737046,"r":88.27846414560203,"radial":0.7686993481018551,"speed":0.2070146940155092,"size":0.42089017064975304,"opacity":0.35563610928902434},{"angle":3.7732735008037186,"r":49.09515369762804,"radial":0.05627552177505533,"speed":0.35372882242661796,"size":1.4697627028321696,"opacity":0.9553017091574163},{"angle":4.299267460973299,"r":47.07315614267719,"radial":0.01951192986685801,"speed":0.21928782924943402,"size":1.533420473855179,"opacity":0.9845313662351605},{"angle":0.7029065366761157,"r":46.94822370624936,"radial":0.017240431022715583,"speed":0.3277222062160468,"size":1.537377493008799,"opacity":0.9863337331372484},{"angle":5.443706815457597,"r":47.4016013133039,"radial":0.025483660241889083,"speed":0.5463723350189369,"size":1.5230306664046922,"opacity":0.979790980611948},{"angle":5.286687961611561,"r":54.73701058324258,"radial":0.15885473787713783,"speed":0.4446281215964148,"size":1.2961209288311535,"opacity":0.8731241513693937},{"angle":2.1236626628346786,"r":54.1868515383335,"radial":0.1488518461515182,"speed":0.5841234482118147,"size":1.3127869091153197,"opacity":0.8811799102873805},{"angle":0.0973068182930397,"r":63.57322876787228,"radial":0.3195132503249505,"speed":0.5943576659395896,"size":1.036947877738963,"opacity":0.742329485406703},{"angle":0.5252879646813775,"r":48.765385056982645,"radial":0.05027972830877538,"speed":0.12969656434813195,"size":1.4800947274124432,"opacity":0.9600764484317554},{"angle":5.565626753545936,"r":46.228436787857554,"radial":0.004153396142864582,"speed":0.4631577007501924,"size":1.5602288255443302,"opacity":0.9967098260845326},{"angle":4.89270116346165,"r":61.52384316652749,"radial":0.2822516939368635,"speed":0.5366589645637749,"size":1.095573488170874,"opacity":0.7729164802106654},{"angle":2.9497476655430455,"r":60.28019954636616,"radial":0.2596399917521121,"speed":0.37382291174849774,"size":1.1316006179942717,"opacity":0.7913999871214711},{"angle":2.536360929324063,"r":49.859776412785834,"radial":0.07017775295974248,"speed":0.5091213305938257,"size":1.4458820521820754,"opacity":0.9442189811997213},{"angle":3.7624074719513105,"r":59.40376008294576,"radial":0.243704728780832,"speed":0.6230451170942235,"size":1.157189845391774,"opacity":0.804391990965733},{"angle":3.308570249123812,"r":46.39741903048513,"radial":0.007225800554275076,"speed":0.41827071714985253,"size":1.5548559464880916,"opacity":0.9942750928592393},{"angle":0.6691721870164867,"r":46.59091077447582,"radial":0.010743832263196777,"speed":0.554734568944885,"size":1.548709898875339,"opacity":0.9914862957128813},{"angle":1.8125024301579555,"r":98.41636637394518,"radial":0.9530248431626396,"speed":0.3286923947452497,"size":0.24529050400108626,"opacity":0.17612599936825682},{"angle":5.8464355088135305,"r":48.908656330034205,"radial":0.0528846605460765,"speed":0.6333740877670926,"size":1.4756034649270338,"opacity":0.9580023868019721},{"angle":2.8181993155951672,"r":71.88382152783377,"radial":0.47061493686970507,"speed":0.22681198992469537,"size":0.8094296280482867,"opacity":0.6164519113964463},{"angle":2.1210285471678776,"r":54.076149801496314,"radial":0.146839087299933,"speed":0.5910134195638945,"size":1.316147528729457,"opacity":0.8827997241151316},{"angle":2.022816744343471,"r":60.609844038955956,"radial":0.2656335279810174,"speed":0.10657185460121543,"size":1.1220185454437037,"opacity":0.7865062537956715},{"angle":1.4008168628582145,"r":85.06645954131353,"radial":0.7102992643875188,"speed":0.3216929711044701,"size":0.4891926831162452,"opacity":0.40856078470746837},{"angle":4.574814468560226,"r":46.089949897774055,"radial":0.001635452686801015,"speed":0.15699392268154205,"size":1.5646357988365815,"opacity":0.998704615490146},{"angle":5.127121032162718,"r":47.96644975866013,"radial":0.035753631975638835,"speed":0.5349467247491206,"size":1.5052073159546056,"opacity":0.9716318255446486},{"angle":1.424677779434815,"r":63.72512744008219,"radial":0.3222750443651307,"speed":0.31487451917945836,"size":1.0326401862376533,"opacity":0.7400558398881864},{"angle":4.8073870637875045,"r":88.14431950301231,"radial":0.7662603546002238,"speed":0.24827863796453797,"size":0.42364833746406827,"opacity":0.35787117339783525},{"angle":0.3985503330665649,"r":50.80031694778505,"radial":0.08727848995972823,"speed":0.18370905306535687,"size":1.4166538576590615,"opacity":0.9305636601964148},{"angle":1.2726863576804726,"r":46.16607383219439,"radial":0.0030195242217162174,"speed":0.5822622438168733,"size":1.5622129458787768,"opacity":0.9976081753619712},{"angle":3.6139467210611547,"r":49.85932991323527,"radial":0.07016963478609588,"speed":0.348444404349145,"size":1.445895966150434,"opacity":0.944225457743944},{"angle":5.66896131220417,"r":46.000508584334106,"radial":0.000009246987892876211,"speed":0.24410670211921143,"size":1.5674838016114268,"opacity":0.9999926763822028},{"angle":5.105453910465665,"r":46.00001267966365,"radial":2.3053933909359244e-7,"speed":0.5828909105834467,"size":1.5674995961527265,"opacity":0.9999998174128414},{"angle":5.12655513741326,"r":66.74348374141266,"radial":0.37715424984386664,"speed":0.3226423244575433,"size":0.9481543209208638,"opacity":0.6946787349720362},{"angle":2.1021200881313384,"r":46.276131188041965,"radial":0.005020567055308421,"speed":0.243943638618983,"size":1.5587118526524923,"opacity":0.9960227108885427},{"angle":1.3321241253517129,"r":100.6094595952973,"radial":0.9928992653690418,"speed":0.18246487800261463,"size":0.22216881766082922,"opacity":0.1302483895836212},{"angle":1.9332681288065137,"r":49.61469466458966,"radial":0.06572172117435748,"speed":0.6268188619677154,"size":1.4535248455724497,"opacity":0.9477730806320185},{"angle":2.0343920163622213,"r":49.90131464374167,"radial":0.07093299352257586,"speed":0.40987411602388524,"size":1.4445877833668388,"opacity":0.9436164380712664},{"angle":2.5130141114193574,"r":81.17389623067174,"radial":0.6395253860122136,"speed":0.5310763356937807,"size":0.5776562880807401,"opacity":0.4712933179618568},{"angle":6.113247502761086,"r":46.243331300721884,"radial":0.004424205467670667,"speed":0.23461318311711143,"size":1.5597550465979209,"opacity":0.9964952528949559},{"angle":3.7559651435279022,"r":53.2743243111009,"radial":0.13226044202001636,"speed":0.48827980405490834,"size":1.340559673211408,"opacity":0.8945208774209994},{"angle":1.8985385735316493,"r":88.20072013405084,"radial":0.7672858206191062,"speed":0.4789874037904548,"size":0.42248761891403974,"opacity":0.35693173430736286},{"angle":0.8114527175899038,"r":53.392440721925794,"radial":0.13440801312592354,"speed":0.3185480743260571,"size":1.3369557531562446,"opacity":0.8927954862098109},{"angle":5.250046331443607,"r":60.19806747998324,"radial":0.25814668145424063,"speed":0.3723009067702116,"size":1.133991655487171,"opacity":0.7926186600892807},{"angle":3.058815525970222,"r":53.6197816670005,"radial":0.13854148485455456,"speed":0.6211490506875786,"size":1.330026769720051,"opacity":0.8894733862603103},{"angle":3.5022792376496823,"r":46.12078811591701,"radial":0.002196147562127411,"speed":0.5265481312447676,"size":1.5636541664784531,"opacity":0.9982604599834805},{"angle":5.567595352667825,"r":49.225235237553036,"radial":0.05864064068278246,"speed":0.15828474219728705,"size":1.4656925071941354,"opacity":0.9534174175806256},{"angle":6.12262495394973,"r":83.8889217996392,"radial":0.6888894872661675,"speed":0.5154248031372436,"size":0.5153370050228494,"opacity":0.4276846923005673},{"angle":2.73746828957156,"r":57.1533756804826,"radial":0.20278864873604718,"speed":0.6010127570862069,"size":1.2236315144516234,"opacity":0.837627046912408},{"angle":2.7790694782839385,"r":56.46166599051254,"radial":0.19021210891840984,"speed":0.25954812746452927,"size":1.2442628844753936,"opacity":0.8478079961432502},{"angle":0.4691864636164256,"r":76.34790872005297,"radial":0.5517801585464177,"speed":0.5350273578195157,"size":0.6947524064529185,"opacity":0.5473902810891377},{"angle":1.752174435872946,"r":46.01752262176518,"radial":0.00031859312300335283,"speed":0.5723762313019264,"size":1.56694193116957,"opacity":0.9997476702266492},{"angle":4.399643850054856,"r":91.19151438660745,"radial":0.8216638979383174,"speed":0.22685667468873477,"size":0.36326490784403614,"opacity":0.306465296068384},{"angle":3.9528843945999403,"r":68.00436778555252,"radial":0.40007941428277305,"speed":0.12661019029711393,"size":0.9135067106610588,"opacity":0.6756061704692657},{"angle":1.938653674466837,"r":64.71637489409812,"radial":0.3402977253472386,"speed":0.5863000611088239,"size":1.0046593421969894,"opacity":0.7251957305012339},{"angle":2.9020363654000243,"r":72.5211785034763,"radial":0.48220324551775107,"speed":0.26893777121690826,"size":0.7927114884347775,"opacity":0.6066604616155007},{"angle":3.196910604027415,"r":69.91405768659496,"radial":0.43480104884718096,"speed":0.6481742894166841,"size":0.8617864229025542,"opacity":0.6465794234622998},{"angle":2.2432688643158745,"r":55.025544435404164,"radial":0.16410080791643938,"speed":0.10275327017787217,"size":1.287404061510495,"opacity":0.8688954415319421},{"angle":0.26399867081587725,"r":59.57911177259915,"radial":0.2468929413199845,"speed":0.43128370369904095,"size":1.152057075083743,"opacity":0.8017948532412122},{"angle":2.42107067557772,"r":46.83389908255065,"radial":0.01516180150092091,"speed":0.1188904141624369,"size":1.5410009332058225,"opacity":0.9879826989397233},{"angle":0.4569821192679878,"r":46.71174236286672,"radial":0.012940770233940406,"speed":0.4836558360826745,"size":1.5448751424835578,"opacity":0.9897442467368575},{"angle":2.663766889212339,"r":51.715576646693115,"radial":0.10391957539442027,"speed":0.11478636083638888,"size":1.3883685572711164,"opacity":0.9172507989997738},{"angle":5.758917502570063,"r":50.601653345931,"radial":0.08366642447147275,"speed":0.6576491899766487,"size":1.4228139428662416,"opacity":0.9334500909914536},{"angle":0.2784332074457094,"r":63.94408878651562,"radial":0.3262561597548295,"speed":0.18088811712422234,"size":1.026439931000571,"opacity":0.7367767568595075},{"angle":3.7487757116182236,"r":76.83633653908608,"radial":0.5606606643470196,"speed":0.27358350559471506,"size":0.6825608682567175,"opacity":0.5397616441121563},{"angle":3.3020762182495975,"r":66.61290744513039,"radial":0.37478013536600724,"speed":0.6719506946503657,"size":0.9517645599288127,"opacity":0.6966498234741656},{"angle":3.6470123445336027,"r":76.31865686412898,"radial":0.551248306620527,"speed":0.37289868873814,"size":0.6954848724300802,"opacity":0.5478466762742664},{"angle":0.5235889345483704,"r":54.34453351926881,"radial":0.15171879125943286,"speed":0.3745945139924014,"size":1.3080042062833028,"opacity":0.8788720087851876},{"angle":3.9634563856956504,"r":59.50349103489706,"radial":0.24551801881631016,"speed":0.5459355316925194,"size":1.1542697938873456,"opacity":0.8029150082130607},{"angle":2.5016881762324337,"r":90.71752768550252,"radial":0.8130459579182275,"speed":0.29546015889892374,"size":0.3723295261101911,"opacity":0.31455573874557297},{"angle":4.560926560048729,"r":79.02698996019936,"radial":0.6004907265490793,"speed":0.33649048216314104,"size":0.628802645791151,"opacity":0.5053513194353987},{"angle":5.251680369977964,"r":46.222017420418204,"radial":0.004036680371240067,"speed":0.34538356017822736,"size":1.5604330308588172,"opacity":0.9968023029152474},{"angle":3.020936811311582,"r":79.14661660141624,"radial":0.602665756389386,"speed":0.6290384052964285,"size":0.6259116986768819,"opacity":0.5034626491145173},{"angle":1.2411847135955005,"r":74.07357412339191,"radial":0.5104286204253075,"speed":0.5525601549004765,"size":0.7524632039679284,"opacity":0.5827187424780034},{"angle":2.6302694679133767,"r":46.081528405439414,"radial":0.001482334644352995,"speed":0.42244369430695083,"size":1.5649038978588257,"opacity":0.9988259039006282},{"angle":4.689874880321086,"r":73.8273992562242,"radial":0.505952713749531,"speed":0.2401742039995028,"size":0.7588003229893754,"opacity":0.5865243736226633},{"angle":0.0652891210776171,"r":46.00916303893094,"radial":0.0001666007078353802,"speed":0.6248447809972286,"size":1.5672081645035152,"opacity":0.9998680511401977},{"angle":4.8476468824309,"r":65.05735297266578,"radial":0.3464973267757416,"speed":0.580497585256116,"size":0.9950868215562299,"opacity":0.7200746821391452},{"angle":0.9211425347132238,"r":46.04919569701126,"radial":0.0008944672183864318,"speed":0.20734503236352003,"size":1.5659333273228997,"opacity":0.9992915502698064},{"angle":0.22029969268590982,"r":98.39052436374735,"radial":0.9525549884317701,"speed":0.0979937545377703,"size":0.24561984499081943,"opacity":0.17663099253933906},{"angle":5.052967110279452,"r":48.66826350745042,"radial":0.04851388195364405,"speed":0.434024068595864,"size":1.4831413931403594,"opacity":0.9614821015966585},{"angle":4.771765590765569,"r":48.3385915898486,"radial":0.04251984708815637,"speed":0.6166963568485309,"size":1.4934957163869564,"opacity":0.9662515449927185},{"angle":3.9657319518442335,"r":46.118816124385894,"radial":0.0021602931706526237,"speed":0.546935128129027,"size":1.5637169333345358,"opacity":0.9982888628543725},{"angle":4.284428061764652,"r":46.00011680860436,"radial":0.0000021237928065890596,"speed":0.5253744946470247,"size":1.5674962796471361,"opacity":0.9999983179559185},{"angle":0.08860229186646851,"r":55.927880013000774,"radial":0.18050690932728683,"speed":0.448168528534629,"size":1.2602498432773896,"opacity":0.8556537257405163},{"angle":5.882154154706053,"r":46.00008525237025,"radial":0.0000015500430953532137,"speed":0.558191331194892,"size":1.567497284712639,"opacity":0.9999987723657733},{"angle":0.2812134188895504,"r":48.47963859365268,"radial":0.04508433806641242,"speed":0.24339780154023116,"size":1.4890633300130667,"opacity":0.9642113503980945},{"angle":5.847980019687189,"r":47.49422421408604,"radial":0.027167712983382542,"speed":0.20719452830701557,"size":1.5201041435681828,"opacity":0.9784536477857391},{"angle":4.242707817853036,"r":84.50228703305925,"radial":0.700041582419259,"speed":0.27983370890825404,"size":0.501648954755465,"opacity":0.4177402992961202},{"angle":0.2862955641174599,"r":87.78527181476457,"radial":0.7597322148139014,"speed":0.5302068981995871,"size":0.43107314558195076,"opacity":0.3638420847278324},{"angle":0.40042209286318803,"r":79.85229687902975,"radial":0.6154963068914502,"speed":0.6218479346128627,"size":0.6089550764046661,"opacity":0.49230008562402794},{"angle":2.3458194715072245,"r":46.19813825387764,"radial":0.003602513706866111,"speed":0.17840090470239606,"size":1.5611927096442457,"opacity":0.9971462945310516},{"angle":2.703297033575479,"r":85.66672518152862,"radial":0.7212131851187022,"speed":0.25761992875264955,"size":0.47608413455624454,"opacity":0.39875821779741893},{"angle":3.6972216416676944,"r":46.196264273732496,"radial":0.0035684413405907695,"speed":0.5558941546789317,"size":1.5612523316300055,"opacity":0.9971732895397939},{"angle":4.05481040599093,"r":74.60034135072424,"radial":0.5200062063768043,"speed":0.40381669564528094,"size":0.7389614308931416,"opacity":0.574563679570113},{"angle":0.5969767467136637,"r":48.63184845592622,"radial":0.04785179010774946,"speed":0.31611929578345205,"size":1.484284156805413,"opacity":0.9620090742379387},{"angle":0.8401786882029207,"r":84.6535829269014,"radial":0.7027924168527526,"speed":0.09467723130684089,"size":0.4982957831575536,"opacity":0.41528172523842183},{"angle":3.781748106247229,"r":52.410533285816975,"radial":0.11655515065121777,"speed":0.37375624013483183,"size":1.3669963868796604,"opacity":0.9071258420512074},{"angle":0.6197977918601913,"r":84.59516982230753,"radial":0.7017303604055916,"speed":0.6103896701246404,"size":0.4995892944515601,"opacity":0.41623121282387077},{"angle":3.0358613026133066,"r":89.59799098230589,"radial":0.7926907451328343,"speed":0.2787915690045725,"size":0.39423406603397837,"opacity":0.33352045868699043},{"angle":3.5493439718886077,"r":67.59706224508025,"radial":0.3926738590014593,"speed":0.14020937306825945,"size":0.9246563031554718,"opacity":0.6817750530703041},{"angle":2.129090679932719,"r":47.16943399463681,"radial":0.021262436266123848,"speed":0.09236409285325939,"size":1.5303729146295002,"opacity":0.9831421065126146},{"angle":3.2699815744689698,"r":46.50057872965983,"radial":0.009101431448360531,"speed":0.09494093268638563,"size":1.5515783800729515,"opacity":0.9927883749855241},{"angle":3.795021445798889,"r":92.1759800539134,"radial":0.8395632737075164,"speed":0.6363254832814685,"size":0.34486010706091386,"opacity":0.2895337172571293},{"angle":5.884189869583645,"r":50.989234277473614,"radial":0.0907133504995202,"speed":0.5714358242335132,"size":1.4108027609345843,"opacity":0.9278177755642625},{"angle":0.4460482783108706,"r":71.02371867408225,"radial":0.45497670316513183,"speed":0.42935696986444016,"size":0.8321648092462939,"opacity":0.6296314628305326},{"angle":3.7807483919184692,"r":46.50959719854439,"radial":0.009265403609897966,"speed":0.5229797723358309,"size":1.5512919357445056,"opacity":0.9926583891659694},{"angle":0.5914341743524015,"r":47.00428795403062,"radial":0.018259780982374928,"speed":0.31690465133348916,"size":1.5356014150310564,"opacity":0.9855249607883726},{"angle":2.5986740420019276,"r":46.020679799764636,"radial":0.0003759963593570134,"speed":0.53468246289965,"size":1.5668413855283476,"opacity":0.9997022052842361},{"angle":1.083644349934573,"r":47.74936794116304,"radial":0.03180668983932795,"speed":0.20573948216227766,"size":1.5120504588277073,"opacity":0.9747685645128911},{"angle":3.4919761601555543,"r":66.2038246225617,"radial":0.36734226586475816,"speed":0.14795581930126606,"size":0.9631016778838282,"opacity":0.7028202214454264},{"angle":3.026381295015538,"r":73.29721104558018,"radial":0.49631292810145783,"speed":0.23198958735167013,"size":0.772507043706679,"opacity":0.5947089236681229},{"angle":1.5660265482243174,"r":49.548197737562674,"radial":0.0645126861375031,"speed":0.22994642357336958,"size":1.4556004192615795,"opacity":0.9487371057609495},{"angle":1.5162286704678773,"r":99.85121572550274,"radial":0.9791130131909589,"speed":0.5774799064895882,"size":0.22881794334280872,"opacity":0.14706268517649446},{"angle":5.512173833481766,"r":76.86310432866222,"radial":0.5611473514302221,"speed":0.13882824832464408,"size":0.6818948444033472,"opacity":0.5393431213751158},{"angle":3.63184634593762,"r":62.67555745754662,"radial":0.30319195377357494,"speed":0.1273580538736266,"size":1.0625115782280028,"opacity":0.7557472838708045},{"angle":4.937747155598554,"r":87.35771182013627,"radial":0.7519583967297503,"speed":0.4727572748556336,"size":0.43999391205436356,"opacity":0.3709312494112017},{"angle":1.0207139911567844,"r":46.07627998059025,"radial":0.0013869087380044898,"speed":0.1523685051988517,"size":1.5650709882096923,"opacity":0.9989014920695091},{"angle":2.895996172676128,"r":49.71525069580922,"radial":0.06755001265107666,"speed":0.12249875307315845,"size":1.4503877129520988,"opacity":0.946315053811072},{"angle":5.94822283264464,"r":59.085747322194564,"radial":0.23792267858535576,"speed":0.6778204327615168,"size":1.1665150478908124,"opacity":0.8090992957508559},{"angle":4.945611206329443,"r":46.00005406901445,"radial":9.830729900486388e-7,"speed":0.5430137603385503,"size":1.5674982779021436,"opacity":0.9999992214061537},{"angle":0.7855627745971759,"r":46.21963536185987,"radial":0.003993370215633997,"speed":0.5968605351977614,"size":1.560508807910925,"opacity":0.9968366183611826},{"angle":0.5409068680859428,"r":49.4466193567386,"radial":0.06266580648615636,"speed":0.5122872405241126,"size":1.4587725466921238,"opacity":0.9502094763930155},{"angle":0.685565190597581,"r":86.58524900425172,"radial":0.7379136182591222,"speed":0.6001443128475401,"size":0.45632331258274245,"opacity":0.38368333433842294},{"angle":0.21549585006782312,"r":81.17613375386594,"radial":0.6395660682521079,"speed":0.15293512073618837,"size":0.5776038155469417,"opacity":0.4712576363043556},{"angle":0.5896916019256426,"r":53.40034593597331,"radial":0.13455174429042388,"speed":0.4650928963954495,"size":1.3367146481539876,"opacity":0.8926799951387508},{"angle":1.509180767104992,"r":51.263743977823154,"radial":0.09570443596042102,"speed":0.29024240572959414,"size":1.4023125360662823,"opacity":0.9238259686791949},{"angle":1.5162261366937617,"r":92.62575080406424,"radial":0.8477409237102588,"speed":0.17932437585603855,"size":0.33665058518707797,"opacity":0.2817363149572964},{"angle":3.28661291666376,"r":76.22827909306513,"radial":0.549605074419366,"speed":0.19179352916012848,"size":0.6977495749755965,"opacity":0.5492564327333276},{"angle":6.02790538527986,"r":52.74780562040364,"radial":0.12268737491642982,"speed":0.5015014946847237,"size":1.3566570940736054,"opacity":0.9022068473698608},{"angle":3.236967717815723,"r":46.55527315819336,"radial":0.010095875603515549,"speed":0.5346503901059277,"size":1.5498413957910373,"opacity":0.9920000152031834},{"angle":2.1857534529259937,"r":63.489181577333355,"radial":0.31798511958787923,"speed":0.08468904143636026,"size":1.0393336266198985,"opacity":0.7435871215190254},{"angle":1.0250147069885809,"r":70.12323666290268,"radial":0.4386043029618669,"speed":0.15883012302110916,"size":0.856177898637436,"opacity":0.6433893047296578},{"angle":1.7596676661287558,"r":81.10754743810939,"radial":0.6383190443292617,"speed":0.5486004661662509,"size":0.5792130516107944,"opacity":0.472351195659124},{"angle":1.5347596790845972,"r":96.51605849553769,"radial":0.9184737908279579,"speed":0.6117871457261845,"size":0.2717863374991642,"opacity":0.21218286382176643},{"angle":2.3060657581513304,"r":50.579229422565305,"radial":0.08325871677391466,"speed":0.564596906774302,"size":1.4235097135054886,"opacity":0.9337758219763961},{"angle":2.7928294107217413,"r":58.246837792067744,"radial":0.2226697780375953,"speed":0.32009440666073413,"size":1.1912163676025695,"opacity":0.8214999911621613},{"angle":5.516990444448861,"r":61.32873597196751,"radial":0.2787042903994093,"speed":0.44687849300622806,"size":1.101203325588845,"opacity":0.7758200443001542},{"angle":4.7124186176420855,"r":56.03655760583614,"radial":0.1824828655606571,"speed":0.11483370014916519,"size":1.2569903068128783,"opacity":0.8540571101178939},{"angle":5.2968037855913686,"r":49.82399124801541,"radial":0.06952711360028024,"speed":0.1969456657180057,"size":1.4469973170260453,"opacity":0.9447380325544298},{"angle":0.011420986826294546,"r":56.98822138799919,"radial":0.19978584341816716,"speed":0.25935390535681874,"size":1.2285486981659883,"opacity":0.8400593255423804},{"angle":2.216500576530028,"r":59.1103467103725,"radial":0.23836994018859087,"speed":0.2179194178971643,"size":1.1657929514343517,"opacity":0.8087352972115056},{"angle":1.9351893761959682,"r":95.29087378963507,"radial":0.8961977052660921,"speed":0.5481016716809028,"size":0.29089209563260277,"opacity":0.2345694771562149},{"angle":5.045382672932987,"r":55.03832726135186,"radial":0.16433322293367017,"speed":0.5041019692496416,"size":1.287018259603938,"opacity":0.868708037031843},{"angle":4.5911346393017585,"r":98.46533722579392,"radial":0.9539152222871621,"speed":0.5752840138182826,"size":0.244669112186773,"opacity":0.17516764173810792},{"angle":1.7501797821800416,"r":89.24741471796187,"radial":0.7863166312356705,"speed":0.137093301934277,"size":0.4012302594619874,"opacity":0.3394200561114492},{"angle":5.272110641251223,"r":61.24434964525218,"radial":0.2771699935500396,"speed":0.6416887873613172,"size":1.1036408782333278,"opacity":0.7770754297280803},{"angle":5.223539622188086,"r":54.48882142059395,"radial":0.15434220764716272,"speed":0.3240708519370024,"size":1.3036320100241678,"opacity":0.8767594653325909},{"angle":0.8508945572918604,"r":58.29125691028401,"radial":0.22347739836880023,"speed":0.6616910367288543,"size":1.189904791994894,"opacity":0.8208440053618302},{"angle":3.6644326472267856,"r":46.100972990673974,"radial":0.0018358725577085476,"speed":0.30535550214849,"size":1.5642848962488043,"opacity":0.9985458553754124},{"angle":4.276663530424954,"r":46.04914509665218,"radial":0.0008935472118578765,"speed":0.5752822270759216,"size":1.5659349385119605,"opacity":0.9992922789801506},{"angle":1.325476350564733,"r":71.04563671837843,"radial":0.4553752130614262,"speed":0.6794720398443491,"size":0.8315829899588976,"opacity":0.629296081667001},{"angle":6.212573472773209,"r":58.501108676659086,"radial":0.22729288503016526,"speed":0.49529084641047844,"size":1.1837139785008108,"opacity":0.8177439704327089},{"angle":2.9548727825266554,"r":46.3337181644309,"radial":0.00606760298965269,"speed":0.2637616568280027,"size":1.5568807640074782,"opacity":0.9951929972723733},{"angle":0.7039409777542737,"r":46.02402586090745,"radial":0.0004368338346808838,"speed":0.2610714118006373,"size":1.566734826476548,"opacity":0.9996540200450997},{"angle":0.9454697915380591,"r":98.8839687457714,"radial":0.9615267044685708,"speed":0.373061836336797,"size":0.2395090435838784,"opacity":0.166894954825452},{"angle":4.634261110292543,"r":46.04846386130703,"radial":0.0008811611146731782,"speed":0.43734173483899036,"size":1.5659566300799401,"opacity":0.9993020896400215},{"angle":1.881566239761445,"r":48.25883901735708,"radial":0.04106980031558336,"speed":0.18578804500940077,"size":1.496003509366588,"opacity":0.9674048955927691},{"angle":4.721794752204457,"r":46.016173257919036,"radial":0.0002940592348915287,"speed":0.41046057571699907,"size":1.56698490445813,"opacity":0.9997671016613516},{"angle":4.137595073490289,"r":52.459286664226,"radial":0.11744157571319994,"speed":0.19447582004077346,"size":1.3655004867447953,"opacity":0.9064150033590863},{"angle":3.8347832198334073,"r":71.33043966856403,"radial":0.460553448519346,"speed":0.1927605278163781,"size":0.8240344678122833,"opacity":0.6249359021457075},{"angle":3.863599952809983,"r":71.61573880591521,"radial":0.4657407055620948,"speed":0.14092514680784676,"size":0.8164945582455743,"opacity":0.6205639278066521},{"angle":0.08748658276309554,"r":79.13856624592496,"radial":0.6025193862895448,"speed":0.40261607378964887,"size":0.6261060982419904,"opacity":0.5035897808433306},{"angle":6.023446454857644,"r":46.00425876519285,"radial":0.00007743209441550737,"speed":0.3753397509598544,"size":1.567364359904089,"opacity":0.9999386735437853},{"angle":2.125186994216333,"r":47.45421468767637,"radial":0.026440267048661294,"speed":0.165012372010399,"size":1.5213681024358021,"opacity":0.9790313524473075},{"angle":5.229477864150944,"r":69.29448396605831,"radial":0.4235360721101511,"speed":0.5177044908122201,"size":0.8784647816361877,"opacity":0.6560158044638089},{"angle":3.9589549399481743,"r":52.854033879012114,"radial":0.12461879780022021,"speed":0.37150818408607345,"size":1.3534050808803373,"opacity":0.9006568357361892},{"angle":3.2689768569603737,"r":86.07080249215021,"radial":0.728560045311822,"speed":0.30046243596865096,"size":0.46734587968810104,"opacity":0.39213792489029553},{"angle":3.231952767341093,"r":47.82954456724484,"radial":0.033264446677178885,"speed":0.38506982962141734,"size":1.509522047618677,"opacity":0.9736101959234457},{"angle":2.8067539741086667,"r":47.23803211133177,"radial":0.02250967475148672,"speed":0.20814113295463954,"size":1.5282025212384616,"opacity":0.9821521052625983},{"angle":0.5133898032355432,"r":81.60554946261233,"radial":0.6473736265929515,"speed":0.5796875721027028,"size":0.5675665729417394,"opacity":0.4644022529158231},{"angle":3.8744540881383953,"r":48.48578711420251,"radial":0.04519612934913654,"speed":0.10543999396771192,"size":1.4888701945861862,"opacity":0.9641224017889507},{"angle":3.995876882775393,"r":82.5678362014917,"radial":0.6648697491180309,"speed":0.38296790479027476,"size":0.5453168024869854,"opacity":0.4489841241584928},{"angle":5.62306030296586,"r":64.81104134585206,"radial":0.3420189335609464,"speed":0.32903534003443585,"size":1.0019989857579448,"opacity":0.7237744477053232},{"angle":3.6208012471346347,"r":47.457781494875086,"radial":0.0265051180886379,"speed":0.6316478705700933,"size":1.5212554103252778,"opacity":0.9789798524373762},{"angle":1.983339004631816,"r":50.225849621638595,"radial":0.07683362948433814,"speed":0.36739152689221466,"size":1.4344866406607464,"opacity":0.9389071255399213},{"angle":1.2440823183636398,"r":48.32200963281976,"radial":0.04221835696035925,"speed":0.4074420657450726,"size":1.4940170367232,"opacity":0.9664913611626466},{"angle":5.68666950254644,"r":79.87151795580057,"radial":0.6158457810145558,"speed":0.1704589178883088,"size":0.6084955631123368,"opacity":0.4919955277049575},{"angle":1.228714460479219,"r":51.04755999974817,"radial":0.09177381817723942,"speed":0.5799772316776004,"size":1.4089976503863206,"opacity":0.9269698106728478},{"angle":5.561924526278434,"r":70.12385780117958,"radial":0.4386155963850832,"speed":0.23557393474092148,"size":0.8561612615559784,"opacity":0.6433798287457635},{"angle":1.8536705717117783,"r":68.35310501331982,"radial":0.4064200911512695,"speed":0.38006408104679,"size":0.9039931059888158,"opacity":0.670318288326804},{"angle":5.845450669435815,"r":52.66962108245978,"radial":0.12126583786290507,"speed":0.5218848216923745,"size":1.359051965083064,"opacity":0.903347445781601},{"angle":5.915456744575038,"r":46.19912180655488,"radial":0.003620396482816017,"speed":0.37619592325407636,"size":1.5611614174743624,"opacity":0.9971321262473527},{"angle":2.86824240182861,"r":50.629235873579724,"radial":0.08416792497417679,"speed":0.6000853154250284,"size":1.4219582381610012,"opacity":0.9330494059949255},{"angle":2.9684297906716584,"r":49.32732198092694,"radial":0.06049676328958065,"speed":0.38103429891265406,"size":1.4625004042118728,"opacity":0.9519383121138646},{"angle":0.9593951624557644,"r":49.149319624396604,"radial":0.05726035680721098,"speed":0.2120218725428189,"size":1.468067501921505,"opacity":0.9545171479745053},{"angle":3.0679959074642245,"r":49.121112181864454,"radial":0.05674749421571732,"speed":0.15280853024945457,"size":1.4689502283167153,"opacity":0.9549257261984103},{"angle":3.762558585537367,"r":64.4800480220583,"radial":0.3360008731283327,"speed":0.20264885429539614,"size":1.0113097824050075,"opacity":0.7287422281763863},{"angle":0.19010429693264047,"r":58.11588230769023,"radial":0.2202887692307314,"speed":0.21647992800593374,"size":1.195085504945347,"opacity":0.8234335579781243},{"angle":5.721201724801408,"r":57.09551451738761,"radial":0.20173662758886574,"speed":0.17210128699625032,"size":1.2253535993934006,"opacity":0.8384792903419142},{"angle":3.7022875894666147,"r":72.74293664859539,"radial":0.4862352117926435,"speed":0.3316304837089316,"size":0.786920824928204,"opacity":0.6032485664434633},{"angle":4.695258983544182,"r":49.37266332287196,"radial":0.061321151324944694,"speed":0.10255300527676289,"size":1.461083253260201,"opacity":0.9512812807621367},{"angle":3.9901816373574,"r":53.20248668136087,"radial":0.13095430329747032,"speed":0.5750307034841095,"size":1.3427528632307526,"opacity":0.8955700402085353},{"angle":5.8653133431229705,"r":52.29211545966538,"radial":0.11440209926664333,"speed":0.3050467122765693,"size":1.3706316763469861,"opacity":0.9088521121773075},{"angle":4.0058453002035606,"r":47.56821149224186,"radial":0.028512936222579232,"speed":0.2673018698648567,"size":1.5177675253362797,"opacity":0.977385218492988},{"angle":2.5574237458945333,"r":49.162141484999594,"radial":0.05749348154544723,"speed":0.6010831329422845,"size":1.4676663010125213,"opacity":0.9543314189677292},{"angle":3.3350028118393342,"r":88.32384362792487,"radial":0.7695244295986339,"speed":0.6474967852118395,"size":0.41995908550707595,"opacity":0.3548794821796327},{"angle":5.704054888310874,"r":83.88618760466568,"radial":0.6888397746302852,"speed":0.255816308311947,"size":0.5153983563175573,"opacity":0.42772894064584793},{"angle":2.5067476403784212,"r":85.82332812012172,"radial":0.7240605112749402,"speed":0.31748672421787566,"size":0.47268926124162874,"opacity":0.3961945737038374},{"angle":2.5536786463497596,"r":50.194204530631474,"radial":0.07625826419329951,"speed":0.34258367678391166,"size":1.435470743243777,"opacity":0.9393664581855907},{"angle":1.0198823544121443,"r":86.3317707840589,"radial":0.7333049233465254,"speed":0.23697610448764278,"size":0.46173986309866155,"opacity":0.38785278773287085},{"angle":6.030203609103676,"r":46.223109339787285,"radial":0.004056533450677852,"speed":0.6208803380475196,"size":1.5603982955062674,"opacity":0.9967865728993928},{"angle":1.2976433656289852,"r":48.93537208960352,"radial":0.05337040162915489,"speed":0.5417435541578974,"size":1.474766389855203,"opacity":0.9576155739724279},{"angle":1.6086203297802393,"r":46.16318974983902,"radial":0.002967086360709395,"speed":0.6460589999203189,"size":1.5623047213274956,"opacity":0.9976497185998303},{"angle":4.617173437135026,"r":91.74233070875695,"radial":0.8316787401592173,"speed":0.4486583510308139,"size":0.35289524399268135,"opacity":0.2970140537737463},{"angle":1.2843118604544392,"r":59.46268431106876,"radial":0.24477607838306842,"speed":0.6670127115277693,"size":1.1554643316100441,"opacity":0.8035193852944433}]};
const ease=x=>x*x*(3-2*x),clamp=x=>Math.min(1,Math.max(0,x));
function envelope(age,config,startScale=1){
 if(age<0||age>=.78)return {scale:1,boost:0};
 const accelerate=ease(clamp(age/.09)),decelerate=1-ease(clamp((age-.28)/.50));
 const boost=config.boost*accelerate*decelerate;
 const peak=Math.max(config.gain,startScale);
 const scale=age<=.42?startScale+(peak-startScale)*ease(age/.42):peak+(1-peak)*ease((age-.42)/.36);
 return {scale,boost};
}

function drawSpikes(ctx,state,cx,cy,k,color){
 const radius=state.config.core*k*state.currentScale;
 ctx.save();ctx.translate(cx,cy);ctx.rotate(state.coreAngle);ctx.fillStyle=`rgb(${color})`;
 for(const spike of state.config.spikes){
  const length=spike.length*k*(.7+.3*state.currentScale),width=spike.width*k,root=radius-1.5*k;
  ctx.save();ctx.rotate(spike.angle);ctx.beginPath();ctx.moveTo(root,-width);ctx.lineTo(radius+length,spike.lean*width);ctx.lineTo(root,width);ctx.closePath();ctx.fill();ctx.restore();
 }
 ctx.restore();
}

// A covered orb owns no animation frames. Integrate its motion once on reveal.
let startupCovered=!!window.__fadeInPageState&&!window.__fadeInPageState.done;
let coveredAt=startupCovered&&!document.hidden?performance.now():null,coveredMotion=!reduceMotion.matches;
function spinArea(age){
 const t=clamp(age/.09),u=clamp((age-.28)/.5);
 return orbState.config.boost*(.09*(t*t*t-.5*t*t*t*t)+Math.max(0,Math.min(age-.09,.19))+.5*(u-u*u*u+.5*u*u*u*u));
}
function advanceCovered(now=performance.now()){
 if(!startupCovered||coveredAt===null)return;
 const dt=Math.max(0,(now-coveredAt)/1000);coveredAt=now;
 if(!coveredMotion)return;
 const age=orbClock-orbState.trigger,boost=spinArea(age+dt)-spinArea(age);
 orbClock+=dt;
 orbState.coreAngle=(orbState.coreAngle+.12*dt+.55*boost)%(Math.PI*2);
 for(const p of orbState.particles)p.angle=(p.angle+p.speed*(dt+boost))%(Math.PI*2);
 const motion=envelope(orbClock-orbState.trigger,orbState.config,orbState.baseScale);
 orbState.currentScale=motion.scale;orbState.currentBoost=motion.boost;
}
function setStartupCovered(covered){
 covered=!!covered;if(covered===startupCovered)return;
 if(covered){startupCovered=true;coveredMotion=!reduceMotion.matches;coveredAt=document.hidden?null:performance.now();cancelAnimationFrame(raf);raf=0}
 else{advanceCovered();startupCovered=false;coveredAt=null;if(!document.hidden)paint(performance.now());wakeParticles()}
 lastDraw=0;
}
function startSpin(){advanceCovered();if(!reduceMotion.matches){orbState.baseScale=orbState.currentScale;orbState.trigger=orbClock;}wakeParticles()}
function shakeCore(){
 if(reduceMotion.matches)return;
 const button=$('#orbButton');button.getAnimations().filter(a=>a.id==='core-impact').forEach(a=>a.cancel());
 const impact=button.animate([{translate:'0 0'},{translate:'-10px 3px',offset:.10},{translate:'10px -5px',offset:.21},{translate:'-8px -3px',offset:.33},{translate:'7px 4px',offset:.46},{translate:'-4px 2px',offset:.62},{translate:'3px -2px',offset:.78},{translate:'0 0'}],{duration:560,easing:'linear'});impact.id='core-impact';
}

function resizeCanvas(){
 if(!ctx)return;
 const dpr=Math.min(devicePixelRatio||1,2),size=Math.round(canvasSize*dpr);
 if(canvas.width!==size||canvas.height!==size){canvas.width=size;canvas.height=size;ctx.setTransform(dpr,0,0,dpr,0,0)}
 paint(performance.now());wakeParticles();
}
let particleExposure=null;
function particlesExposed(){
 const button=canvas.parentElement;
 if(!button)return true;
 const scope=canvas.getRootNode().host||document.body;
 return scope.classList.contains('near-orb')||scope.hasAttribute('data-home-orb')||scope.hasAttribute('data-orb-arriving-home')||button.matches(':focus-visible')||button.closest('.navigation')?.classList.contains('open');
}
function paint(now,dt=0){
 if(!ctx||startupCovered)return;
 const target=particlesExposed()?1:0;
 if(particleExposure===null||reduceMotion.matches)particleExposure=target;
 else{particleExposure+=(target-particleExposure)*(1-Math.exp(-dt*14));if(Math.abs(target-particleExposure)<.001)particleExposure=target}
 const state=orbState,motion=reduceMotion.matches?{scale:1,boost:0}:envelope(orbClock-state.trigger,state.config,state.baseScale);
 state.currentScale=motion.scale;state.currentBoost=motion.boost;
 state.coreAngle=(state.coreAngle+dt*(reduceMotion.matches?0:.12+motion.boost*.55))%(Math.PI*2);
 const s=canvasSize,cx=s/2,cy=s/2,k=s/260,color=document.documentElement.dataset.theme==='light'?'0,0,0':'255,255,255';
 const age=(now-burstTime)/1000,impact=!reduceMotion.matches&&age>=0&&age<.56?Math.pow(1-age/.56,2):0;
 ctx.clearRect(0,0,s,s);ctx.save();ctx.translate(Math.sin(age*117)*impact*4,Math.cos(age*93)*impact*3);
 for(const p of state.particles){
  if(!reduceMotion.matches)p.angle=(p.angle+dt*p.speed*(1+motion.boost))%(Math.PI*2);
  if(!particleExposure)continue;
  const origin=state.config.core*.65;
  const r=(origin+(p.r-origin)*particleExposure)*k;ctx.fillStyle=`rgba(${color},${p.opacity*particleExposure})`;ctx.beginPath();ctx.arc(cx+Math.cos(p.angle)*r,cy+Math.sin(p.angle)*r,p.size*k,0,Math.PI*2);ctx.fill();
 }
 // Paint the opaque core last so emerging particles remain behind it.
 ctx.fillStyle=`rgb(${color})`;ctx.beginPath();ctx.arc(cx,cy,state.config.core*k*state.currentScale,0,Math.PI*2);ctx.fill();
 drawSpikes(ctx,state,cx,cy,k,color);
 ctx.restore();
}
function tick(now){raf=0;if(document.hidden||startupCovered)return;const dt=lastDraw?Math.min(.04,(now-lastDraw)/1000):0;lastDraw=now;orbClock+=dt;paint(now,dt);if(!reduceMotion.matches)raf=requestAnimationFrame(tick)}
function wakeParticles(){if(!ctx||startupCovered)return;if(reduceMotion.matches){paint(performance.now());return}if(!raf&&!document.hidden){lastDraw=0;raf=requestAnimationFrame(tick)}}
on(document,'visibilitychange',()=>{if(startupCovered){advanceCovered();coveredAt=document.hidden?null:performance.now()}if(document.hidden){cancelAnimationFrame(raf);raf=0;lastDraw=0}else wakeParticles()});
on(reduceMotion,'change',()=>{advanceCovered();coveredMotion=!reduceMotion.matches;cancelAnimationFrame(raf);raf=0;orbState.trigger=-100;orbState.baseScale=1;wakeParticles()});

 const particleVisibilityObserver=new MutationObserver(()=>wakeParticles());
 particleVisibilityObserver.observe(host,{attributes:true,attributeFilter:['class','data-home-orb','data-orb-arriving-home']});
 particleVisibilityObserver.observe($('#navigation'),{attributes:true,attributeFilter:['class']});
 on($('#orbButton'),'focus',()=>wakeParticles());on($('#orbButton'),'blur',()=>wakeParticles());
 // Anchor the existing interactive orb to the native empty-chat emblem.
function installHomeOrb(){
 let anchor=null,pending=0,arrivalTimer=0,awaitingHome=false,homePosition=null;
 // The chat surface and welcome surface have different bounds. Store viewport
 // coordinates so switching surfaces cannot shift a previously measured target.
 function bounds(){return {left:0,top:0,width:innerWidth,height:innerHeight}}
 let targetX=null,targetY=null;
 function setTarget(x,y){
  if(targetX!==null&&Math.abs(x-targetX)<.5&&Math.abs(y-targetY)<.5)return;
  targetX=x;targetY=y;
  host.style.setProperty('--fade-home-x',`${x}px`);
  host.style.setProperty('--fade-home-y',`${y}px`);
 }
 function cancelArrival(){
  awaitingHome=false;clearTimeout(arrivalTimer);arrivalTimer=0;
  host.removeAttribute('data-orb-arriving-home');
 }
 function beginArrival(){
  if(host.hasAttribute('data-window-mode'))return;
  const button=$('#orbButton');
  button.getAnimations().filter(a=>a.id==='core-impact').forEach(a=>a.cancel());
  const r=bounds();
  // Start now using the last measured home position, scaled to this viewport.
  // On first use, estimate the native welcome emblem above the composer.
  setTarget(r.left+r.width*(homePosition?.x??.5),r.top+r.height*(homePosition?.y??.39));
  // Do not let an older 60 ms idle refresh delay the new home anchor.
  clearTimeout(pending);pending=0;
  awaitingHome=true;
  host.setAttribute('data-orb-arriving-home','');
  clearTimeout(arrivalTimer);arrivalTimer=setTimeout(cancelArrival,3000);
 }
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 function sync(){
  pending=0;
  if(host.hasAttribute('data-window-mode')){if(anchor){anchor.removeAttribute('data-fade-home-anchor');resize?.unobserve(anchor);anchor=null}cancelArrival();host.removeAttribute('data-home-orb');return}
  const next=[...document.querySelectorAll('[data-testid="home-icon"]')].find(el=>{
   const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).display!=='none';
  })||null;
  if(next!==anchor){
   if(anchor){anchor.removeAttribute('data-fade-home-anchor');resize?.unobserve(anchor)}
   anchor=next;
   if(anchor){anchor.setAttribute('data-fade-home-anchor','');resize?.observe(anchor)}
  }
  if(anchor){
   const r=anchor.getBoundingClientRect();
   const x=r.left+r.width/2,y=r.top+r.height/2,area=bounds();
   homePosition={x:(x-area.left)/area.width,y:(y-area.top)/area.height};
   setTarget(x,y);
  }
  host.toggleAttribute('data-home-orb',!!anchor);
  if(anchor&&awaitingHome)cancelArrival();
 }
 function schedule(){if(!pending)pending=setTimeout(sync,awaitingHome?0:60)}
 const observer=new MutationObserver(records=>{if(records.some(r=>!host.contains(r.target)))schedule()});
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden']});
 on(window,'resize',schedule);on(window,'fade-window-mode',schedule);on(document,'scroll',schedule,{capture:true,passive:true});
 sync();
 const dispose=()=>{observer.disconnect();resize?.disconnect();clearTimeout(pending);cancelArrival();anchor?.removeAttribute('data-fade-home-anchor')};
 dispose.beginArrival=beginArrival;dispose.cancelArrival=cancelArrival;
 dispose.refresh=()=>{clearTimeout(pending);sync()};
 dispose.startupTarget=()=>{
  dispose.refresh();
  if(host.hasAttribute('data-window-mode')){
   const r=$('#orbButton').getBoundingClientRect(),size=innerWidth<=560?76:94;
   if(Math.abs(r.left+r.width/2-innerWidth/2)>1||Math.abs(r.top+r.height/2)>1||Math.abs(r.width-size)>1)return null;
   return {x:.5,y:0,size:r.width,width:innerWidth,height:innerHeight};
  }
  if(!anchor||awaitingHome)return null;
  const r=$('#orbButton').getBoundingClientRect();
  // The element exists at the left edge before the welcome anchor mounts,
  // and CSS then interpolates toward home. Neither is a handoff destination.
  if(Math.abs(r.left+r.width/2-targetX)>1||Math.abs(r.top+r.height/2-targetY)>1||Math.abs(r.width-94)>1)return null;
  return {x:targetX/innerWidth,y:targetY/innerHeight,size:r.width,width:innerWidth,height:innerHeight};
 };
 return dispose;
}

 const disposeHomeOrb=installHomeOrb();
 let startupHomeRequested=false;
 function prepareStartupHome(){
  disposeHomeOrb.refresh();
  if(!disposeGptTabs.ready)return null;
  if(!startupHomeRequested){
   // Normalize the initial home route too: a visible emblem does not prove
   // that the restored home state is the Codex composer.
   if(!windowMode.enabled&&!disposeGptTabs.home())return null;
   startupHomeRequested=true;
   return null;
  }
  if(navOpen)closeNav(false);
  return disposeHomeOrb.startupTarget();
 }
 on(window,'resize',()=>{updateFanMask();layoutArc();resizeCanvas()});
 window.__fadeCodex={version:'2.0.0',prepareStartupHome,setStartupCovered,status:()=>({phase:'live',wslImageAttachments:{enabled:wslImagePaths.enabled,ready:wslImagePaths.ready},navigation:navOpen,projects:groups.length,chats:groups.reduce((n,g)=>n+g.chats.length,recent.length+pinned.length+sections.reduce((n,s)=>n+s.chats.length,0)),adapterReady:root.hasAttribute('data-fade-shell'),theme:config.light?'light':'dark'}),destroy(){
  if(disposed)return;
  // Preserve live stylesheet updates when switching through classic mode.
  // A bound startup string would resurrect stale preview clipping on return.
  styleText=document.getElementById('fade-codex-style')?.textContent??styleText;
  particleVisibilityObserver.disconnect();dismissProjectMenu();disposed=true;windowMode.destroy();abort.abort();settingsObserver.disconnect();themeController.destroy();nativeTheme.destroy();chatPicker.destroy();historyCards.destroy();disposeCodexTabs();disposeGptTabs();adapter.destroy();disposeHeader();disposeTabWheel();disposeFullscreen();disposeFadeSettings();orbUsage.destroy();composerAutohide.destroy();wslImagePaths.destroy();previewCodeWrap.destroy();disposePreviewScrollbar();disposePaperSurface();backgroundSettings.destroy();disposeConversationTitle();disposeConversation();disposeRailHistory();disposePreviewFreshness();disposeFilePanel();disposeMessageRail();timeouts.forEach(window.clearTimeout);frames.forEach(window.cancelAnimationFrame);clearInterval(editorStyleTimer);editorStyle.remove();unlock();
  for(const[n,t]of tokens){if(t.value)root.style.setProperty(n,t.value,t.priority);else root.style.removeProperty(n)}
  for(const[n,v]of originalAttrs){if(v===null)root.removeAttribute(n);else root.setAttribute(n,v)}
  for(const[el,state]of nativeFocus){el.inert=state.inert;if(state.aria===null)el.removeAttribute('aria-hidden');else el.setAttribute('aria-hidden',state.aria)}
  root.removeAttribute('data-fade-nav-open');disposeHomeOrb();host.remove();document.getElementById('fade-codex-style')?.remove();delete window.__fadeCodex;
 }};
 setTheme(config.light);updateFanMask();resizeCanvas();adapter.start();
})();
