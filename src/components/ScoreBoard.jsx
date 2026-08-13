export default function ScoreBoard({ game }) {
  const { turn,result,names,score } = game
  return <div className="scorebar glass"><div className={turn==='X'&&!result?'active':''}><span className="score-x">X</span><p><small>{names.X}</small><strong>{score.X}</strong></p></div><div><span className="draw-icon">◇</span><p><small>DRAWS</small><strong>{score.draw}</strong></p></div><div className={turn==='O'&&!result?'active':''}><p><small>{names.O}</small><strong>{score.O}</strong></p><span className="score-o">O</span></div></div>
}
