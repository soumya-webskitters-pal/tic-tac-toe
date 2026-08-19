import { useEffect, useState } from 'react'
export default function OnlineLobby({ game, onReady }) {
  const [code,setCode]=useState('')
  useEffect(() => { if (game.onlineStatus === 'playing') onReady() }, [game.onlineStatus, onReady])
  const shareRoom = async () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(game.roomCode)}`
    const shareData = { title:'Nexus Tac', text:'Play Tic-Tac-Toe with me live!', url }
    if (navigator.share) { try { await navigator.share(shareData); return } catch (error) { if (error.name === 'AbortError') return } }
    await navigator.clipboard?.writeText(url)
  }
  if (game.onlineStatus === 'ready-wait' || game.onlineStatus === 'playing') return <div className="joining-state"><span className="joining-spinner"/><strong>JOINING…</strong><small>Waiting until both players are on the game board</small></div>
  if (game.onlineStatus === 'connected') return <div className="online-lobby connected"><span className="live-dot"/><div><strong>FRIEND CONNECTED</strong><small>Room {game.roomCode} · ready to play live</small></div><button onClick={game.readyOnline}>ENTER GAME</button></div>
  return <div className="online-lobby"><button className="host-room" onClick={game.hostOnline}>CREATE A ROOM</button>{game.roomCode && <div className="room-code"><span>{game.roomCode}</span><button onClick={() => navigator.clipboard?.writeText(game.roomCode)}>COPY</button><button className="share-room" onClick={shareRoom} aria-label="Share game link" title="Share game link">↗</button></div>}{game.onlineStatus==='waiting'&&<p>Share the code or link with your friend. Waiting for them…</p>}<div className="join-row"><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter room code"/><button onClick={()=>game.joinOnline(code)}>JOIN</button></div>{game.onlineStatus==='joining'&&<p>Connecting…</p>}{game.onlineStatus==='error'&&<p className="online-error">Could not connect. Check the code and retry.</p>}</div>
}
