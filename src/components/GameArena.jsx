import EmojiReactions from './EmojiReactions'
import GameBoard from './GameBoard'
import ScoreBoard from './ScoreBoard'

export default function GameArena({ game,onNewMatch,onPlayFriends,onExitFriends }) {
  const onlineJoined=game.mode==='online'&&['connected','ready-wait','playing','reconnecting','failed','ended'].includes(game.onlineStatus)
  const onlinePlaying=game.mode==='online'&&['playing','reconnecting'].includes(game.onlineStatus)
  return <div className="arena"><div className="arena-toolbar">
    {!onlineJoined&&<button className="board-friends-trigger" onClick={onPlayFriends}><span>♟♟</span> PLAY WITH FRIENDS</button>}
    {onlinePlaying&&<button className="exit-online" onClick={onExitFriends}>↪ EXIT</button>}
    {game.mode==='online'&&game.onlineStatus==='playing'&&<EmojiReactions game={game}/>}<button className="hint-trigger" onClick={game.showHint} disabled={game.thinking||game.result||(game.mode==='ai'&&game.turn===game.aiSymbol)} title="Suggest the best move"><span className="bulb-icon">💡</span> HINT</button>{!onlineJoined&&<button className="setup-trigger" onClick={onNewMatch}>⚙ <span>NEW MATCH</span></button>}
  </div>{game.receivedReaction&&<div key={game.receivedReaction.id} className="reaction-burst" aria-live="polite"><span>{game.receivedReaction.emoji}</span><small>Friend reacted!</small></div>}{game.receivedMessage&&<div key={game.receivedMessage.id} className="message-burst" aria-live="polite"><small>FRIEND</small><p>{game.receivedMessage.text}</p></div>}<div className="status-row"><span className={`pulse ${game.turn.toLowerCase()}`}/><strong>{game.status}</strong>{game.mode==='online'&&game.onlineStatus==='playing'?<span className={`network-signal ${game.networkQuality}`} title={`${game.networkQuality} connection`}><i/><i/><i/><em>{game.networkQuality}</em></span>:<small>{game.result?'ROUND COMPLETE':`${game.size} × ${game.size} GRID`}</small>}</div><GameBoard game={game}/><ScoreBoard game={game}/></div>
}
