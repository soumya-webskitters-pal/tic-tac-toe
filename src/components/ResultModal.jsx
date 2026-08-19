const CONFETTI = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 37) % 100}%`, delay: `${(i % 9) * .08}s`, duration: `${1.8 + (i % 5) * .22}s`, color: ['#8b5cf6','#22d3ee','#f59e0b','#f43f5e','#ffffff'][i % 5], rotate: `${(i * 47) % 180}deg`
}))

export default function ResultModal({ game, onNewMatch }) {
  const { result, mode, names, resetRound } = game
  if (!result) return null
  const draw = result.winner === 'draw'
  const aiWon = mode === 'ai' && result.winner === game.aiSymbol
  const humanWon = mode === 'ai' && result.winner === game.playerSymbol
  const title = draw ? 'Draw!' : aiWon ? 'AI wins' : humanWon ? 'You win!' : `${names[result.winner]} wins!`
  const copy = draw ? 'Perfectly balanced. Neither side gave an inch.' : aiWon ? 'Nexus found the winning line. Ready for a rematch?' : humanWon ? 'Brilliant strategy. You outplayed the machine.' : `${names[result.winner]} takes this round with a flawless line.`
  return <div className="modal-backdrop result-backdrop">
    {!draw && <div className="confetti" aria-hidden="true">{CONFETTI.map((piece, i) => <i key={i} style={{ '--left':piece.left,'--delay':piece.delay,'--duration':piece.duration,'--color':piece.color,'--rotate':piece.rotate }} />)}</div>}
    <section className={`modal-card result-modal glass ${draw ? 'is-draw' : ''}`} role="dialog" aria-modal="true" aria-labelledby="result-title">
      <div className="result-orbit"><span>{draw ? '◇' : result.winner}</span></div>
      <div className="modal-kicker">{draw ? 'ROUND COMPLETE' : 'VICTORY CONFIRMED'}</div>
      <h2 id="result-title">{title}</h2><p className="modal-copy">{copy}</p>
      <div className="result-score"><span>{names.X}<b>{game.score.X}</b></span><i>—</i><span><b>{game.score.O}</b>{names.O}</span></div>
      <button className="result-primary" onClick={() => resetRound()}>PLAY NEXT ROUND <span>→</span></button>
      <button className="result-secondary" onClick={onNewMatch}>⚙ NEW MATCH & SETTINGS</button>
    </section>
  </div>
}
