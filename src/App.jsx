import { useEffect, useRef, useState } from 'react'
import Footer from './components/Footer'
import GameArena from './components/GameArena'
import Header from './components/Header'
import Hero from './components/Hero'
import MatchSetupModal from './components/MatchSetupModal'
import LegalModal from './components/LegalModal'
import ProfileModal, { defaultAvatar } from './components/ProfileModal'
import ResultModal from './components/ResultModal'
import { THEMES } from './data/themes'
import { useGame } from './hooks/useGame'
import AnalyticsConsent from './components/AnalyticsConsent'
import { getAnalyticsConsent,initAnalytics,installErrorTracking,setAgeGroup,startPlayTimeTracking } from './analytics'

export default function App() {
  const [loading,setLoading]=useState(true)
  const [profile,setProfile]=useState(()=>{try{return JSON.parse(localStorage.getItem('nexus-player-profile'))||{name:'Alex',avatar:defaultAvatar}}catch{return{name:'Alex',avatar:defaultAvatar}}})
  const game = useGame(profile.name)
  const [theme, setTheme] = useState(THEMES[0])
  const [setupOpen, setSetupOpen] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [profileOpen,setProfileOpen]=useState(false)
  const [legalPage,setLegalPage]=useState(null)
  const [analyticsReady,setAnalyticsReady]=useState(()=>getAnalyticsConsent()==='granted')
  const [soundEnabled,setSoundEnabled]=useState(()=>localStorage.getItem('nexus-sound-enabled')!=='false')
  const [musicVolume,setMusicVolume]=useState(()=>Number(localStorage.getItem('nexus-music-volume')??0.35))
  const [sfxVolume,setSfxVolume]=useState(()=>Number(localStorage.getItem('nexus-sfx-volume')??0.7))
  const musicRef=useRef(null),clickRef=useRef(null),placementRef=useRef(null),previousBoardRef=useRef(''),soundEnabledRef=useRef(soundEnabled)

  useEffect(() => {
    setShowResult(false)
    if (!game.result) return
    const timer = setTimeout(() => setShowResult(true), game.result.winner === 'draw' ? 1200 : 2500)
    return () => clearTimeout(timer)
  }, [game.result])
  useEffect(()=>{const timer=setTimeout(()=>setLoading(false),4000);return()=>clearTimeout(timer)},[])
  useEffect(()=>{localStorage.setItem('nexus-player-profile',JSON.stringify(profile));game.rename(game.playerSymbol,profile.name);setAgeGroup(['under_13','13_17','18_24','25_34','35_plus'][profile.ageGroup??2])},[profile])
  useEffect(()=>{if(!analyticsReady)return;initAnalytics();const stopTimer=startPlayTimeTracking(()=>game.mode),stopErrors=installErrorTracking();return()=>{stopTimer();stopErrors()}},[analyticsReady,game.mode])
  useEffect(()=>{
    musicRef.current=new Audio('/music.mp3');musicRef.current.loop=true;musicRef.current.volume=musicVolume
    clickRef.current=new Audio('/click.mp3');clickRef.current.volume=sfxVolume
    placementRef.current=new Audio('/setting.mp3');placementRef.current.volume=sfxVolume
    const startMusic=()=>{if(soundEnabledRef.current)musicRef.current?.play().catch(()=>{})}
    const playClick=()=>{if(!soundEnabledRef.current||!clickRef.current)return;clickRef.current.currentTime=0;clickRef.current.play().catch(()=>{})}
    document.addEventListener('pointerdown',startMusic,{once:true});document.addEventListener('click',playClick)
    return()=>{document.removeEventListener('pointerdown',startMusic);document.removeEventListener('click',playClick);musicRef.current?.pause()}
  },[])
  useEffect(()=>{soundEnabledRef.current=soundEnabled;localStorage.setItem('nexus-sound-enabled',soundEnabled);if(!musicRef.current)return;if(soundEnabled)musicRef.current.play().catch(()=>{});else musicRef.current.pause()},[soundEnabled])
  useEffect(()=>{localStorage.setItem('nexus-music-volume',musicVolume);if(musicRef.current)musicRef.current.volume=musicVolume},[musicVolume])
  useEffect(()=>{localStorage.setItem('nexus-sfx-volume',sfxVolume);if(clickRef.current)clickRef.current.volume=sfxVolume;if(placementRef.current)placementRef.current.volume=sfxVolume},[sfxVolume])
  useEffect(()=>{const signature=game.board.map(cell=>cell||'-').join(''),oldCount=(previousBoardRef.current.match(/[XO]/g)||[]).length,newCount=game.board.filter(Boolean).length;if(previousBoardRef.current&&signature!==previousBoardRef.current&&newCount>oldCount&&soundEnabled&&placementRef.current){placementRef.current.currentTime=0;placementRef.current.play().catch(()=>{})}previousBoardRef.current=signature},[game.board,soundEnabled])

  const openFriends = () => { game.setMode('online'); setSetupOpen(true) }
  const exitFriends = () => { game.exitOnline(); setSetupOpen(true) }
  const closeSetup = () => { if (game.mode === 'online') game.resetOnline(); else if (!game.gameStarted) game.newMatch(); setSetupOpen(false) }
  const sound={enabled:soundEnabled,setEnabled:setSoundEnabled,musicVolume,setMusicVolume,sfxVolume,setSfxVolume}
  return <main style={{ '--accent':theme.value, '--accent-rgb':theme.rgb }}>{loading&&<div className="startup-loader" role="status" aria-label="Loading Nexus Tac"><div className="startup-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span/></div></div>}<div className="aurora a1"/><div className="aurora a2"/><div className="noise"/><Header themes={THEMES} theme={theme} onThemeChange={setTheme} profile={profile} onProfile={()=>setProfileOpen(true)} sound={sound}/><div className="desktop-stage"><Hero onPlayFriends={openFriends}/><section className="game-shell"><GameArena game={game} onNewMatch={() => setSetupOpen(true)} onPlayFriends={openFriends} onExitFriends={exitFriends}/></section></div><Footer onPrivacy={()=>setLegalPage('privacy')} onTerms={()=>setLegalPage('terms')}/>{setupOpen && <MatchSetupModal game={game} profile={profile} onClose={closeSetup} onStart={() => setSetupOpen(false)}/>} {!setupOpen && showResult && <ResultModal game={game} onNewMatch={() => setSetupOpen(true)}/>} {profileOpen&&<ProfileModal profile={profile} history={game.gameHistory} onSave={setProfile} onClose={()=>setProfileOpen(false)}/>} {legalPage&&<LegalModal page={legalPage} onClose={()=>setLegalPage(null)}/>}<AnalyticsConsent ageGroup={['under_13','13_17','18_24','25_34','35_plus'][profile.ageGroup??2]} onConsent={setAnalyticsReady}/></main>
}
