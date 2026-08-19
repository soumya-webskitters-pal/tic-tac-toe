import { useEffect, useRef, useState } from 'react'
const EMOJIS=['😀','😂','😍','🥳','😎','🤩','😮','😱','🤔','😅','😢','😭','😡','😤','👏','🙌','👍','👎','🔥','💯','❤️','💔','🎉','🤝']
export default function EmojiReactions({ game }) {
  const [open,setOpen]=useState(false),[message,setMessage]=useState(''),[notice,setNotice]=useState('')
  const pickerRef=useRef(null)
  useEffect(()=>{const close=e=>{if(!pickerRef.current?.contains(e.target))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[])
  const submit=event=>{event.preventDefault();if(game.sendChat(message)){setMessage('');setNotice('Sent')}else if(message.trim())setNotice('Please wait…');setTimeout(()=>setNotice(''),900)}
  return <div className="emoji-reactions" ref={pickerRef}><button className={`emoji-trigger ${open?'active':''}`} onClick={()=>setOpen(v=>!v)} aria-label="Send a reaction or message" aria-expanded={open}>😊 <span>REACT</span></button>{open&&<div className="emoji-picker" aria-label="Reactions and messages"><div className="emoji-grid" role="menu" aria-label="Emoji reactions">{EMOJIS.map(emoji=><button key={emoji} onClick={()=>game.sendReaction(emoji)} role="menuitem" aria-label={`Send ${emoji}`}>{emoji}</button>)}</div><form className="quick-message" onSubmit={submit}><input value={message} onChange={e=>setMessage(e.target.value.slice(0,80))} maxLength="80" placeholder="Write a message…" aria-label="Message your friend" autoComplete="off"/><button type="submit" disabled={!message.trim()} aria-label="Send message">➤</button></form><small className="message-notice" aria-live="polite">{notice||`${message.length}/80`}</small></div>}</div>
}
