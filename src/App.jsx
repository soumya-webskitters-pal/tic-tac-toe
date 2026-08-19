import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import GameArena from './components/GameArena'
import Header from './components/Header'
import Hero from './components/Hero'
import MatchSetupModal from './components/MatchSetupModal'
import ResultModal from './components/ResultModal'
import { THEMES } from './data/themes'
import { useGame } from './hooks/useGame'

export default function App() {
  const game = useGame()
  const [theme, setTheme] = useState(THEMES[0])
  const [setupOpen, setSetupOpen] = useState(true)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    setShowResult(false)
    if (!game.result) return
    const timer = setTimeout(() => setShowResult(true), game.result.winner === 'draw' ? 1200 : 2500)
    return () => clearTimeout(timer)
  }, [game.result])

  const openFriends = () => { game.setMode('online'); setSetupOpen(true) }
  const closeSetup = () => { if (game.mode === 'online') game.resetOnline(); setSetupOpen(false) }
  return <main style={{ '--accent':theme.value, '--accent-rgb':theme.rgb }}><div className="aurora a1"/><div className="aurora a2"/><div className="noise"/><Header themes={THEMES} theme={theme} onThemeChange={setTheme}/><Hero/><section className="game-shell"><GameArena game={game} onNewMatch={() => setSetupOpen(true)} onPlayFriends={openFriends}/></section><Footer/>{setupOpen && <MatchSetupModal game={game} onClose={closeSetup} onStart={() => setSetupOpen(false)}/>} {!setupOpen && showResult && <ResultModal game={game} onNewMatch={() => setSetupOpen(true)}/>}</main>
}
