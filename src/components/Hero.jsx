export default function Hero({ onPlayFriends }) {
  return <section className="hero">
    <h1>Think ahead. <em>Play beyond.</em></h1>
    <p>A timeless game, rebuilt with adaptive intelligence.</p>
    <button className="hero-friends-cta" onClick={onPlayFriends}>
      <span className="hero-friends-icon">♟♟</span>
      <span><b>PLAY WITH FRIENDS</b><small>Challenge someone in real time</small></span>
      <i>→</i>
    </button>
  </section>
}
