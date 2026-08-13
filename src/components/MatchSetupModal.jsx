import GameControls from './GameControls'

export default function MatchSetupModal({ game, onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="modal-card setup-modal glass" role="dialog" aria-modal="true" aria-labelledby="setup-title">
      <button className="modal-close" onClick={onClose} aria-label="Close setup">×</button>
      <div className="modal-kicker">MATCH CONTROL</div>
      <h2 id="setup-title">Create a new match</h2>
      <p className="modal-copy">Choose your arena, opponent, and intelligence level.</p>
      <GameControls game={game} onStart={onClose} />
    </section>
  </div>
}
