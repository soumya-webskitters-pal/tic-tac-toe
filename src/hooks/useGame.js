import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getEasyMove, getHardMove } from '../game/aiPlayer'
import { createBoard, getOutcome } from '../game/gameLogic'

export function useGame() {
  const initialStarter = useRef(Math.random() < .5 ? 'X' : 'O')
  const [size, setSize] = useState(3)
  const [mode, setMode] = useState('ai')
  const [difficulty, setDifficulty] = useState('hard')
  const [playerSymbol, setPlayerSymbolState] = useState('X')
  const [names, setNames] = useState({ X: 'Alex', O: 'Nexus AI' })
  const [board, setBoard] = useState(() => createBoard(3))
  const [roundStarter, setRoundStarter] = useState(initialStarter.current)
  const [turn, setTurn] = useState(initialStarter.current)
  const [gameStarted, setGameStarted] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 })
  const [lastMove, setLastMove] = useState(null)
  const [hintIndex, setHintIndex] = useState(null)
  const scoredRef = useRef(false)
  const result = useMemo(() => getOutcome(board, size), [board, size])
  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X'

  const resetRound = useCallback((nextSize = size) => {
    setBoard(createBoard(nextSize)); setRoundStarter(current => { const next = current === 'X' ? 'O' : 'X'; setTurn(next); return next }); setThinking(false); setLastMove(null); setHintIndex(null); scoredRef.current = false
  }, [size])

  useEffect(() => { setBoard(createBoard(size)); setTurn(roundStarter); setThinking(false); setLastMove(null); setHintIndex(null); scoredRef.current = false }, [size, mode, difficulty, playerSymbol])
  useEffect(() => setNames(n => {
    if (mode === 'ai') return {
      ...n,
      [playerSymbol]: n[playerSymbol] === 'Nexus AI' || n[playerSymbol] === 'Player 2' ? 'Alex' : n[playerSymbol],
      [aiSymbol]: n[aiSymbol] === 'Player 2' || n[aiSymbol] === 'Alex' ? 'Nexus AI' : n[aiSymbol]
    }
    return { ...n, [aiSymbol]: n[aiSymbol] === 'Nexus AI' ? 'Player 2' : n[aiSymbol] }
  }), [mode, playerSymbol, aiSymbol])
  useEffect(() => {
    if (result && !scoredRef.current) { scoredRef.current = true; setScore(s => ({ ...s, [result.winner]: s[result.winner] + 1 })) }
  }, [result])
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
    if (!gameStarted || board[index] || result || thinking || (mode === 'ai' && turn === aiSymbol)) return
    setBoard(current => { const next = [...current]; next[index] = turn; return next })
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
  const status = result?.winner === 'draw' ? 'A strategic draw' : result ? `${names[result.winner]} wins!` : thinking ? `${names[aiSymbol]} is thinking…` : `${names[turn]}'s turn`

  return { size, setSize, mode, setMode, difficulty, setDifficulty, playerSymbol, setPlayerSymbol, aiSymbol, names, rename, board, turn, roundStarter, thinking, score, lastMove, hintIndex, result, status, playHumanMove, showHint, resetRound, newMatch }
}
