import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Peer } from 'peerjs'
import { getEasyMove, getHardMove } from '../game/aiPlayer'
import { createBoard, getOutcome } from '../game/gameLogic'
import { trackEvent } from '../analytics'

export function useGame(localGamingName = 'Alex') {
  const initialStarter = useRef(Math.random() < .5 ? 'X' : 'O')
  const [size, setSize] = useState(3)
  const [mode, setMode] = useState('ai')
  const [difficulty, setDifficulty] = useState('hard')
  const [playerSymbol, setPlayerSymbolState] = useState('X')
  const [names, setNames] = useState({ X: localGamingName, O: 'Nexus AI' })
  const [board, setBoard] = useState(() => createBoard(3))
  const [roundStarter, setRoundStarter] = useState(initialStarter.current)
  const [turn, setTurn] = useState(initialStarter.current)
  const [gameStarted, setGameStarted] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 })
  const [lastMove, setLastMove] = useState(null)
  const [hintIndex, setHintIndex] = useState(null)
  const [onlineStatus, setOnlineStatus] = useState('idle')
  const [roomCode, setRoomCode] = useState('')
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [networkQuality, setNetworkQuality] = useState('good')
  const [forfeitWinner, setForfeitWinner] = useState(null)
  const [forfeitReason, setForfeitReason] = useState('disconnect')
  const [receivedReaction, setReceivedReaction] = useState(null)
  const [receivedMessage, setReceivedMessage] = useState(null)
  const [gameHistory, setGameHistory] = useState(() => { try { return JSON.parse(localStorage.getItem('nexus-game-history'))||[] } catch { return [] } })
  const scoredRef = useRef(false)
  const peerRef = useRef(null), connectionRef = useRef(null), boardRef = useRef(board), turnRef = useRef(turn), sizeRef = useRef(size), playerSymbolRef = useRef(playerSymbol), roundStarterRef = useRef(roundStarter), localNameRef = useRef(localGamingName), localReadyRef = useRef(false), remoteReadyRef = useRef(false), isHostRef = useRef(false), remotePeerRef = useRef(''), retryTimerRef = useRef(null), retryCountRef = useRef(0), playingRef = useRef(false), resettingOnlineRef = useRef(false), lastMessageAtRef = useRef(0)
  const result = useMemo(() => forfeitWinner ? { winner:forfeitWinner, reason:forfeitReason } : getOutcome(board, size), [board, size, forfeitWinner, forfeitReason])
  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X'
  useEffect(() => { boardRef.current=board; turnRef.current=turn; sizeRef.current=size; playerSymbolRef.current=playerSymbol; roundStarterRef.current=roundStarter; localNameRef.current=localGamingName }, [board,turn,size,playerSymbol,roundStarter,localGamingName])
  useEffect(() => localStorage.setItem('nexus-game-history',JSON.stringify(gameHistory)),[gameHistory])
  useEffect(() => () => { clearInterval(retryTimerRef.current); peerRef.current?.destroy() }, [])

  const finishReconnectFailure = () => {
    clearInterval(retryTimerRef.current); retryTimerRef.current=null; setOnlineStatus('failed')
    const local = playerSymbolRef.current, opponent = local === 'X' ? 'O' : 'X'
    setForfeitReason('disconnect'); setForfeitWinner(navigator.onLine ? local : opponent); trackEvent('online_connection_failed',{retry_attempts:5,game_mode:'online'})
  }
  const reconnect = () => {
    if (resettingOnlineRef.current || retryTimerRef.current) return
    setOnlineStatus('reconnecting'); retryCountRef.current=0; setRetryAttempt(0)
    const attempt = () => {
      retryCountRef.current += 1; setRetryAttempt(retryCountRef.current)
      if (retryCountRef.current > 5) { finishReconnectFailure(); return }
      const target = remotePeerRef.current
      if (peerRef.current?.disconnected && !peerRef.current.destroyed) peerRef.current.reconnect()
      if (peerRef.current?.open && target) wireConnection(peerRef.current.connect(target, { reliable:true }), isHostRef.current, true)
    }
    attempt(); retryTimerRef.current=setInterval(attempt, 2500)
  }

  const startOnlineGame = ({ symbol, starter, gridSize, hostName }) => {
    setPlayerSymbolState(symbol); setSize(gridSize); setBoard(createBoard(gridSize)); setRoundStarter(starter); setTurn(starter); setGameStarted(true); setLastMove(null); setHintIndex(null); setOnlineStatus('connected'); scoredRef.current=false
    setNames(symbol === 'X' ? { X:localNameRef.current, O:'Friend' } : { X:hostName||'Friend', O:localNameRef.current })
    if (symbol === 'O') connectionRef.current?.send({ type:'profile', name:localNameRef.current })
  }
  const wireConnection = (connection, isHost, restoring=false) => {
    connectionRef.current = connection
    connection.on('open', () => {
      remotePeerRef.current=connection.peer; clearInterval(retryTimerRef.current); retryTimerRef.current=null; retryCountRef.current=0; setRetryAttempt(0)
      if (restoring || playingRef.current) {
        setOnlineStatus('playing'); connection.send({ type:'sync', board:boardRef.current, turn:turnRef.current, gridSize:sizeRef.current, starter:roundStarterRef.current }); return
      }
      if (!isHost) return
      const starter = Math.random() < .5 ? 'X' : 'O'
      startOnlineGame({ symbol:'X', starter, gridSize:size })
      connection.send({ type:'start', symbol:'O', starter, gridSize:size, hostName:localNameRef.current })
    })
    connection.on('data', data => {
      if (data.type === 'start') startOnlineGame(data)
      if (data.type === 'move' && !boardRef.current[data.index]) {
        setBoard(current => { const next=[...current]; next[data.index]=data.symbol; return next })
        setLastMove(data.index); setHintIndex(null); setTurn(data.symbol === 'X' ? 'O' : 'X')
      }
      if (data.type === 'reset') {
        setBoard(createBoard(data.gridSize)); setRoundStarter(data.starter); setTurn(data.starter); setLastMove(null); setHintIndex(null); scoredRef.current=false
      }
      if (data.type === 'ready') {
        remoteReadyRef.current=true
        if (localReadyRef.current) { playingRef.current=true; setOnlineStatus('playing') }
      }
      if (data.type === 'sync') { setBoard(data.board); setTurn(data.turn); setSize(data.gridSize); setRoundStarter(data.starter); setOnlineStatus('playing'); playingRef.current=true }
      if (data.type === 'reaction') setReceivedReaction({ emoji:data.emoji, id:`${Date.now()}-${Math.random()}` })
      if (data.type === 'chat' && typeof data.text === 'string') {
        const text=data.text.replace(/[\u0000-\u001F\u007F]/g,'').trim().slice(0,80)
        if (text) setReceivedMessage({ text, id:`${Date.now()}-${Math.random()}` })
      }
      if (data.type === 'forfeit' && (data.winner === 'X' || data.winner === 'O')) { resettingOnlineRef.current=true; setBoard(createBoard(sizeRef.current)); setLastMove(null); setHintIndex(null); setForfeitReason('quit'); setForfeitWinner(data.winner); setOnlineStatus('ended') }
      if (data.type === 'profile' && typeof data.name === 'string') { const name=data.name.replace(/[\u0000-\u001F\u007F]/g,'').trim().slice(0,18); if(name)setNames(current=>({...current,[playerSymbolRef.current==='X'?'O':'X']:name})) }
    })
    connection.on('close', reconnect)
    connection.on('error', reconnect)
  }
  const hostOnline = () => {
    resettingOnlineRef.current=false
    peerRef.current?.destroy()
    localReadyRef.current=false; remoteReadyRef.current=false; playingRef.current=false; isHostRef.current=true; setForfeitWinner(null)
    const code = `nexus-${Math.random().toString(36).slice(2,8)}`
    const peer = new Peer(code); peerRef.current=peer; setRoomCode(code); setOnlineStatus('creating')
    peer.on('open', () => setOnlineStatus('waiting'))
    peer.on('connection', connection => wireConnection(connection, true))
    peer.on('disconnected', reconnect)
    peer.on('error', () => setOnlineStatus('error'))
  }
  const joinOnline = code => {
    resettingOnlineRef.current=false
    const clean=code.trim().toLowerCase(); if (!clean) return
    localReadyRef.current=false; remoteReadyRef.current=false; playingRef.current=false; isHostRef.current=false; setForfeitWinner(null)
    peerRef.current?.destroy(); const peer=new Peer(); peerRef.current=peer; setRoomCode(clean); setOnlineStatus('joining')
    peer.on('open', () => wireConnection(peer.connect(clean, { reliable:true }), false))
    peer.on('disconnected', reconnect)
    peer.on('error', () => setOnlineStatus('error'))
  }
  const readyOnline = () => {
    localReadyRef.current=true; connectionRef.current?.send({ type:'ready' })
    if (remoteReadyRef.current) playingRef.current=true
    setOnlineStatus(remoteReadyRef.current ? 'playing' : 'ready-wait')
  }
  const sendReaction = emoji => {
    if (mode === 'online' && onlineStatus === 'playing') connectionRef.current?.send({ type:'reaction', emoji })
  }
  const sendChat = value => {
    const text=String(value).replace(/[\u0000-\u001F\u007F]/g,'').trim().slice(0,80), now=Date.now()
    if (!text || mode!=='online' || onlineStatus!=='playing' || now-lastMessageAtRef.current<1500) return false
    lastMessageAtRef.current=now; connectionRef.current?.send({ type:'chat', text }); return true
  }
  const resetOnline = () => {
    resettingOnlineRef.current=true; clearInterval(retryTimerRef.current); retryTimerRef.current=null
    connectionRef.current?.close(); peerRef.current?.destroy(); connectionRef.current=null; peerRef.current=null
    localReadyRef.current=false; remoteReadyRef.current=false; playingRef.current=false; remotePeerRef.current=''; retryCountRef.current=0
    setRoomCode(''); setOnlineStatus('idle'); setRetryAttempt(0); setNetworkQuality('good'); setForfeitWinner(null); setForfeitReason('disconnect'); setBoard(createBoard(size)); setTurn(roundStarter); setLastMove(null); setHintIndex(null); setScore({ X:0,O:0,draw:0 }); scoredRef.current=false; setGameStarted(true); setMode('ai')
  }
  const exitOnline = () => {
    if (mode !== 'online') return
    const winner=playerSymbol === 'X' ? 'O' : 'X'
    resettingOnlineRef.current=true; connectionRef.current?.send({ type:'forfeit', winner }); trackEvent('online_game_quit',{game_mode:'online',quit_result:'loss'})
    setGameHistory(history=>[{ id:Date.now(), winner, reason:'quit', mode:'online', x:names.X, o:names.O, playedAt:new Date().toLocaleString() },...history].slice(0,20))
    setRoomCode(''); setOnlineStatus('idle'); setRetryAttempt(0); setForfeitWinner(null); setBoard(createBoard(size)); setTurn(roundStarter); setLastMove(null); setHintIndex(null); setScore({ X:0,O:0,draw:0 }); scoredRef.current=false; setGameStarted(true); setMode('ai')
    setTimeout(() => { connectionRef.current?.close(); peerRef.current?.destroy(); connectionRef.current=null; peerRef.current=null },250)
  }

  useEffect(() => {
    if (mode !== 'online' || onlineStatus !== 'playing') return
    const timer=setInterval(async () => {
      const pc=connectionRef.current?.peerConnection; if (!pc) return
      let rtt=0, lost=0
      for (const report of (await pc.getStats()).values()) { if (report.type==='candidate-pair'&&report.state==='succeeded') rtt=report.currentRoundTripTime||0; if (report.type==='inbound-rtp') lost+=report.packetsLost||0 }
      setNetworkQuality(!navigator.onLine||rtt>.45||lost>20?'weak':rtt>.2||lost>5?'fair':'good')
    }, 2000)
    return () => clearInterval(timer)
  }, [mode,onlineStatus])
  useEffect(() => {
    if (!receivedReaction) return
    const timer=setTimeout(() => setReceivedReaction(null), 2400)
    return () => clearTimeout(timer)
  }, [receivedReaction])
  useEffect(() => {
    if (!receivedMessage) return
    const timer=setTimeout(() => setReceivedMessage(null),4000)
    return () => clearTimeout(timer)
  }, [receivedMessage])

  const resetRound = useCallback((nextSize = size) => {
    if (mode === 'online' && playerSymbol !== 'X') return
    setBoard(createBoard(nextSize)); setRoundStarter(current => { const next = current === 'X' ? 'O' : 'X'; setTurn(next); if (mode === 'online') connectionRef.current?.send({ type:'reset', starter:next, gridSize:nextSize }); return next }); setThinking(false); setLastMove(null); setHintIndex(null); scoredRef.current = false
  }, [size, mode, playerSymbol])

  useEffect(() => { setBoard(createBoard(size)); setTurn(roundStarter); setThinking(false); setLastMove(null); setHintIndex(null); scoredRef.current = false }, [size, mode, difficulty, playerSymbol])
  useEffect(() => setNames(n => {
    if (mode === 'ai') return {
      ...n,
      [playerSymbol]: localGamingName,
      [aiSymbol]: 'Nexus AI'
    }
    if (mode === 'pvp') return {
      ...n,
      [playerSymbol]: localGamingName,
      [aiSymbol]: ['Nexus AI',localGamingName].includes(n[aiSymbol]) ? 'Player 2' : n[aiSymbol]
    }
    return n
  }), [mode, playerSymbol, aiSymbol, localGamingName])
  useEffect(() => {
    if (mode === 'online' || !peerRef.current) return
    resettingOnlineRef.current=true; clearInterval(retryTimerRef.current); retryTimerRef.current=null
    connectionRef.current?.close(); peerRef.current.destroy(); connectionRef.current=null; peerRef.current=null
    setOnlineStatus('idle'); setRoomCode(''); setRetryAttempt(0); setForfeitWinner(null)
  }, [mode])
  useEffect(() => {
    if (result && !scoredRef.current) {
      scoredRef.current=true; setScore(s=>({ ...s,[result.winner]:s[result.winner]+1 }))
      setGameHistory(history=>[{ id:Date.now(), winner:result.winner, reason:result.reason||'line', mode, x:names.X, o:names.O, playedAt:new Date().toLocaleString() },...history].slice(0,20))
      trackEvent('game_complete',{game_mode:mode,result:result.winner==='draw'?'draw':result.winner===playerSymbol?'win':'loss',finish_reason:result.reason||'line',grid_size:size})
    }
  }, [result,mode,names])
  useEffect(()=>{trackEvent('game_mode_selected',{game_mode:mode})},[mode])
  useEffect(() => {
    if (!gameStarted || mode !== 'ai' || turn !== aiSymbol || result) return
    setThinking(true)
    const timer = setTimeout(() => {
      const move = difficulty === 'hard' ? getHardMove(board, size, aiSymbol, playerSymbol) : getEasyMove(board, size, aiSymbol, playerSymbol)
      setBoard(current => { const next = [...current]; next[move] = aiSymbol; return next })
      setLastMove(move); setHintIndex(null); setTurn(playerSymbol); setThinking(false)
    }, 620 + Math.random() * 420)
    return () => clearTimeout(timer)
  }, [turn, mode, difficulty, board, size, result, aiSymbol, playerSymbol, gameStarted])

  const playHumanMove = index => {
    if (!gameStarted || board[index] || result || thinking || (mode === 'ai' && turn === aiSymbol) || (mode === 'online' && (turn !== playerSymbol || onlineStatus !== 'playing'))) return
    setBoard(current => { const next = [...current]; next[index] = turn; return next })
    if (mode === 'online') connectionRef.current?.send({ type:'move', index, symbol:turn })
    setLastMove(index); setHintIndex(null); setTurn(current => current === 'X' ? 'O' : 'X')
  }
  const showHint = () => {
    if (result || thinking || (mode === 'ai' && turn === aiSymbol)) return
    const opponent = turn === 'X' ? 'O' : 'X'
    setHintIndex(getHardMove(board, size, turn, opponent))
  }
  const rename = (symbol, value) => setNames(current => ({ ...current, [symbol]: value }))
  const setPlayerSymbol = symbol => {
    if (symbol === playerSymbol) return
    setNames(current => ({ X: current.O, O: current.X }))
    setPlayerSymbolState(symbol)
  }
  const newMatch = () => {
    setScore({ X: 0, O: 0, draw: 0 })
    if (gameStarted) resetRound()
    else { setBoard(createBoard(size)); setTurn(roundStarter); setThinking(false); setLastMove(null); setHintIndex(null); scoredRef.current = false }
    setGameStarted(true)
  }
  const status = onlineStatus === 'reconnecting' ? `Connection lost · retry ${Math.min(retryAttempt,5)}/5` : result?.winner === 'draw' ? 'A strategic draw' : result ? `${names[result.winner]} wins!` : thinking ? `${names[aiSymbol]} is thinking…` : `${names[turn]}'s turn`

  return { size, setSize, mode, setMode, difficulty, setDifficulty, playerSymbol, setPlayerSymbol, aiSymbol, names, rename, board, turn, roundStarter, gameStarted, thinking, score, lastMove, hintIndex, result, status, onlineStatus, retryAttempt, networkQuality, roomCode, receivedReaction, receivedMessage, gameHistory, hostOnline, joinOnline, readyOnline, resetOnline, exitOnline, sendReaction, sendChat, playHumanMove, showHint, resetRound, newMatch }
}
