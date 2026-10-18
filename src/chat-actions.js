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
