import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/chat-picker.js',import.meta.url),'utf8');
test('search matches chat or project titles without mutating native groups',()=>{
 const c=vm.createContext({});vm.runInContext(source,c);
 const data={groups:[{id:'a',title:'Fade',chats:[{id:'1',title:'UI设计'},{id:'2',title:'检查代码'}]},{id:'b',title:'项目B',chats:[]}],recent:[{id:'3',title:'UI notes'}]};
 const byChat=c.filterFadeChats(data,' ui ');assert.equal(byChat.groups.length,1);assert.equal(byChat.groups[0].chats.length,1);assert.equal(byChat.recent.length,1);
 const byProject=c.filterFadeChats(data,'fade');assert.equal(byProject.groups[0].chats.length,2);
 assert.equal(c.filterFadeChats(data,'无匹配').groups.length,0);assert.equal(data.groups[0].chats.length,2);
});
test('picker preserves its search and groups during native menu focus, then dismisses normally',async()=>{
 const shadow={activeElement:null};
 class El{
  constructor(){this.style={};this.rect={left:82,top:6,bottom:38,width:360};this.children=[];this.dataset={};this.attrs={};this.events={};this.hidden=true;this.value='';this.scrollTop=0}
  getBoundingClientRect(){return this.rect}
  setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k]}append(...items){this.children.push(...items)}replaceChildren(){this.children=[]}
  querySelectorAll(){return this.children.flatMap(x=>[...(x.type==='button'?[x]:[]),...x.querySelectorAll()])}
  querySelector(){return this.querySelectorAll().find(x=>x.dataset.pickerKey)}
  isEqualNode(other){const shape=e=>[e.className,e.type,e.textContent,e.innerHTML,e.dataset,e.attrs,e.children.map(shape)];return JSON.stringify(shape(this))===JSON.stringify(shape(other))}
  insertBefore(node,before){node.remove();const i=before?this.children.indexOf(before):this.children.length;this.children.splice(i,0,node);node.parent=this}
  remove(){if(this.parent){this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}}
  get lastElementChild(){return this.children.at(-1)}
  focus(){shadow.activeElement=this}contains(el){return el===this||this.children.some(x=>x.contains(el))}
 }
 const ids=Object.fromEntries(['gptDirectory','compactTitle','chatPicker','chatSearch','chatPickerList'].map(k=>[k,new El()]));
 ids.chatPicker.append(ids.chatSearch,ids.chatPickerList);
 const group={id:'a',title:'Fade',expanded:false,chats:[{id:'chat1',title:'界面设计',active:true}]};let selected=null,toggles=[],created=null,menuProject=null,moreProject=null;group.moreLabel='展开更多';
 const adapter={snapshot:()=>({groups:[group],recent:group.chats}),toggle(id,state){group.expanded=state;toggles.push(state)},refresh(){},ensureSidebar(){},more(id){moreProject=id}};
 const doc=new El();doc.documentElement=Object.assign(new El(),{clientWidth:1200,clientHeight:800});doc.createElement=()=>new El();
 const win=new El();let layoutChanged;
 const gptData={items:[{id:'g1',title:'GPT chat'}]};let notifyGpt;
 const bindings=[];const c=vm.createContext({window:win,ResizeObserver:class{constructor(fn){layoutChanged=fn}observe(){}disconnect(){}},bindChatContextMenu:(row,id)=>bindings.push(id),document:doc,shadow,disposeGptTabs:{subscribe:fn=>{notifyGpt=fn;return()=>{}},history:()=>gptData,loadHistory:async()=>{}},$:q=>ids[q.slice(1)],on:(el,name,fn)=>el.events[name]=fn,setTimeout,closeNav(){},closeTools(){},createChat(id){created=id},openProjectMenu(id){menuProject=id},appendFadeChatStatus(){},appendFadeChatActions(){},switchChat:id=>selected=id});
 vm.runInContext(source,c);const picker=c.installChatPicker(adapter);
 ids.compactTitle.events.click();assert.equal(ids.chatPicker.hidden,false);assert.equal(shadow.activeElement,ids.chatSearch);
 ids.chatSearch.value='设计';ids.chatSearch.events.input();assert.equal(group.expanded,true);
 picker.refresh();const chat=ids.chatPickerList.querySelectorAll().find(x=>x.dataset.pickerKey==='chat:project:a:chat1');assert(chat);
 const find=key=>ids.chatPickerList.querySelectorAll().find(x=>x.dataset.pickerKey===key);
 chat.focus();ids.chatPickerList.scrollTop=120;
 for(let i=0;i<20;i++)notifyGpt();
 assert.equal(find('chat:project:a:chat1'),chat,'unrelated GPT notifications retain Codex row identity');
 assert.equal(shadow.activeElement,chat);assert.equal(ids.chatPickerList.scrollTop,120);
 assert(find('chat:chat1'));
 assert.notEqual(find('chat:chat1'),chat,'project and recent occurrences must keep separate nodes');
 assert.equal(ids.chatPickerList.children.filter(x=>x.className==='chat-picker-chat').length,2,'refresh must not move the project chat into Recents');
 group.title='Renamed project';picker.refresh();
 assert.equal(find('chat:project:a:chat1'),chat,'changing another row retains hovered chat');
 assert.equal(find('project:a').children[1].textContent,'Renamed project');
 picker.preserveForContextMenu(chat);shadow.activeElement=null;ids.chatPicker.events.focusout();
 await new Promise(resolve=>setTimeout(resolve,5));
 assert.equal(ids.chatPicker.hidden,false);assert.equal(ids.compactTitle.attrs['aria-expanded'],'true');
 assert.equal(group.expanded,true);assert.equal(ids.chatSearch.value,'设计');
 chat.onclick();
 assert(bindings.includes('chat1'));assert.equal(selected,'chat1');assert.equal(ids.chatPicker.hidden,true);assert.equal(group.expanded,false);assert.deepEqual(toggles,[true,false]);
 ids.compactTitle.events.click();ids.chatPicker.events.keydown({key:'Escape',preventDefault(){},stopPropagation(){}});assert.equal(shadow.activeElement,ids.compactTitle);assert.equal(ids.compactTitle.attrs['aria-expanded'],'false');
 ids.compactTitle.events.click();picker.preserveForContextMenu(ids.chatSearch);
 doc.events.pointerdown({composedPath:()=>[doc]});assert.equal(ids.chatPicker.hidden,true);
 ids.compactTitle.events.click();shadow.activeElement=null;ids.chatPicker.events.focusout();
 await new Promise(resolve=>setTimeout(resolve,5));assert.equal(ids.chatPicker.hidden,true);
 ids.gptDirectory.rect={left:570,top:6,bottom:38,width:42};
 ids.gptDirectory.events.click();assert.equal(ids.chatPicker.style.left,'570px');assert.equal(ids.chatPicker.style.top,'48px');
 const gptChat=find('gpt:g1');gptChat.focus();ids.chatPickerList.scrollTop=90;
 for(let i=0;i<20;i++)notifyGpt();
 assert.equal(find('gpt:g1'),gptChat);assert.equal(shadow.activeElement,gptChat);assert.equal(ids.chatPickerList.scrollTop,90);
 gptData.items[0].title='Updated GPT chat';notifyGpt();
 assert.notEqual(find('gpt:g1'),gptChat);assert.equal(shadow.activeElement,find('gpt:g1'));assert.equal(ids.chatPickerList.scrollTop,90);
 ids.gptDirectory.rect.left=1000;win.events.resize();assert.equal(ids.chatPicker.style.left,'832px');
 ids.gptDirectory.rect.left=620;layoutChanged();assert.equal(ids.chatPicker.style.left,'620px');
 ids.compactTitle.events.click();assert.equal(ids.chatPicker.style.left,'82px');
 assert.equal(ids.chatPicker.style.maxHeight,'740px');
 const projectRow=ids.chatPickerList.children.find(x=>x.className==='chat-picker-project');
 projectRow.children[1].onclick();assert.equal(menuProject,'a');assert.equal(group.expanded,false);
 projectRow.children[2].onclick();assert.equal(created,'a');assert.equal(ids.chatPicker.hidden,true);
 ids.compactTitle.events.click();ids.chatSearch.value='设计';ids.chatSearch.events.input();
 ids.chatPickerList.children.find(x=>x.dataset.pickerKey==='more:a').onclick();assert.equal(moreProject,'a');
 picker.destroy();
});

test('directory search includes pinned chats even when there are no matching projects',()=>{
 const c=vm.createContext({});vm.runInContext(source,c);
 const data={pinned:[{id:'pinned',title:'置顶聊天'}],groups:[],recent:[]};
 assert.equal(c.filterFadeChats(data,'置顶').pinned.length,1);assert.equal(c.filterFadeChats(data,'无匹配').pinned.length,0);
});
