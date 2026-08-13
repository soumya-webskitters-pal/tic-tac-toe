import AnimatedWinLine from './AnimatedWinLine'

export default function GameBoard({ game }) {
  const { board,size,thinking,result,lastMove,hintIndex,playHumanMove } = game
  const winningLine = result?.winner !== 'draw' && result?.line
  const start = winningLine ? winningLine[0] : 0
  const end = winningLine ? winningLine[winningLine.length - 1] : 0
  const point = index => ({ x:index % size + .5, y:Math.floor(index / size) + .5 })
  const from = point(start), to = point(end)

  return <div className={`board glass n${size} ${thinking ? 'thinking' : ''} ${result ? 'round-locked' : ''}`} style={{ gridTemplateColumns:`repeat(${size}, minmax(0, 1fr))`, gridTemplateRows:`repeat(${size}, minmax(0, 1fr))` }}>{board.map((cell,i) => <button key={i} aria-label={`Cell ${i+1}${cell ? `, ${cell}` : ''}${hintIndex === i ? ', suggested move' : ''}`} onClick={() => playHumanMove(i)} className={`${cell ? 'filled' : ''} ${result?.line.includes(i) ? 'winner' : ''} ${lastMove === i ? 'latest' : ''} ${hintIndex === i ? 'hinted' : ''}`}>{cell && <span className={`mark ${cell.toLowerCase()}`}>{cell}</span>}{hintIndex === i && <span className="hint-marker" aria-hidden="true">✦</span>}</button>)}{winningLine && <AnimatedWinLine from={from} to={to} size={size}/>} {thinking && <div className="scanline" />}</div>
}
