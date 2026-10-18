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
