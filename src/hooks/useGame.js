import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getEasyMove, getHardMove } from '../game/aiPlayer'
import { createBoard, getOutcome } from '../game/gameLogic'

export function useGame() {
  const [size, setSize] = useState(3)
  const [mode, setMode] = useState('ai')
  const [difficulty, setDifficulty] = useState('hard')
  const [names, setNames] = useState({ X: 'Alex', O: 'Nexus AI' })
  const [board, setBoard] = useState(() => createBoard(3))
  const [turn, setTurn] = useState('X')
  const [thinking, setThinking] = useState(false)
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 })
  const [lastMove, setLastMove] = useState(null)
  const [hintIndex, setHintIndex] = useState(null)
  const scoredRef = useRef(false)
  const result = useMemo(() => getOutcome(board, size), [board, size])

  const resetRound = useCallback((nextSize = size) => {
    setBoard(createBoard(nextSize)); setTurn('X'); setThinking(false); setLastMove(null); setHintIndex(null); scoredRef.current = false
  }, [size])

  useEffect(() => { resetRound(size) }, [size, mode, difficulty])
  useEffect(() => setNames(n => ({ ...n, O: mode === 'ai' ? (n.O === 'Player 2' ? 'Nexus AI' : n.O) : (n.O === 'Nexus AI' ? 'Player 2' : n.O) })), [mode])
  useEffect(() => {
    if (result && !scoredRef.current) { scoredRef.current = true; setScore(s => ({ ...s, [result.winner]: s[result.winner] + 1 })) }
  }, [result])
  useEffect(() => {
    if (mode !== 'ai' || turn !== 'O' || result) return
    setThinking(true)
    const timer = setTimeout(() => {
      const move = difficulty === 'hard' ? getHardMove(board, size) : getEasyMove(board, size)
      setBoard(current => { const next = [...current]; next[move] = 'O'; return next })
      setLastMove(move); setHintIndex(null); setTurn('X'); setThinking(false)
    }, 620 + Math.random() * 420)
    return () => clearTimeout(timer)
  }, [turn, mode, difficulty, board, size, result])

  const playHumanMove = index => {
    if (board[index] || result || thinking || (mode === 'ai' && turn === 'O')) return
    setBoard(current => { const next = [...current]; next[index] = turn; return next })
    setLastMove(index); setHintIndex(null); setTurn(current => current === 'X' ? 'O' : 'X')
  }
  const showHint = () => {
    if (result || thinking || (mode === 'ai' && turn === 'O')) return
    const opponent = turn === 'X' ? 'O' : 'X'
    setHintIndex(getHardMove(board, size, turn, opponent))
  }
  const rename = (symbol, value) => setNames(current => ({ ...current, [symbol]: value }))
  const newMatch = () => { setScore({ X: 0, O: 0, draw: 0 }); resetRound() }
  const status = result?.winner === 'draw' ? 'A strategic draw' : result ? `${names[result.winner]} wins!` : thinking ? `${names.O} is thinking…` : `${names[turn]}'s turn`

  return { size, setSize, mode, setMode, difficulty, setDifficulty, names, rename, board, turn, thinking, score, lastMove, hintIndex, result, status, playHumanMove, showHint, resetRound, newMatch }
}
