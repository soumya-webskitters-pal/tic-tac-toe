import { getEmptyCells, getOutcome, linesFor } from './gameLogic'

function tacticalMove(board, size, mark) {
  for (const i of getEmptyCells(board)) {
    const next = [...board]; next[i] = mark
    if (getOutcome(next, size)?.winner === mark) return i
  }
  return null
}

function scoreBoard(board, size, ai, human) {
  let score = 0
  for (const line of linesFor(size)) {
    const a = line.filter(i => board[i] === ai).length
    const h = line.filter(i => board[i] === human).length
    if (!h) score += Math.pow(7, a)
    if (!a) score -= Math.pow(7, h) * 1.12
  }
  const center = (size - 1) / 2
  board.forEach((value, i) => {
    if (!value) return
    const distance = Math.abs(Math.floor(i / size) - center) + Math.abs(i % size - center)
    score += (size - distance) * (value === ai ? 1 : -1)
  })
  return score
}

function orderedMoves(board, size, ai, human) {
  const center = (size - 1) / 2
  const priority = i => {
    const r = Math.floor(i / size), c = i % size
    const next = [...board]; next[i] = ai
    if (getOutcome(next, size)?.winner === ai) return 10000
    next[i] = human
    if (getOutcome(next, size)?.winner === human) return 9000
    const corner = (r === 0 || r === size - 1) && (c === 0 || c === size - 1)
    return 100 - Math.abs(r - center) - Math.abs(c - center) + (corner ? 2 : 0)
  }
  return getEmptyCells(board).sort((a, b) => priority(b) - priority(a))
}

export function getHardMove(board, size, ai = 'O', human = 'X') {
  const win = tacticalMove(board, size, ai)
  if (win !== null) return win
  const block = tacticalMove(board, size, human)
  if (block !== null) return block
  const open = getEmptyCells(board)
  if (open.length === size * size) {
    const centers = open.filter(i => Math.abs(Math.floor(i / size) - (size - 1) / 2) <= .5 && Math.abs(i % size - (size - 1) / 2) <= .5)
    return centers[Math.floor(Math.random() * centers.length)]
  }
  const maxDepth = size === 3 ? open.length : size === 4 ? Math.min(5, open.length) : Math.min(3, open.length)
  let best = -Infinity, bestMoves = [], visited = 0
  const cap = size <= 3 ? 150000 : 45000

  function minimax(state, depth, maximizing, alpha, beta) {
    visited++
    const end = getOutcome(state, size)
    if (end?.winner === ai) return 100000 + depth
    if (end?.winner === human) return -100000 - depth
    if (end?.winner === 'draw') return 0
    if (!depth || visited > cap) return scoreBoard(state, size, ai, human)
    const candidates = orderedMoves(state, size, ai, human).slice(0, size > 4 ? 10 : 16)
    let value = maximizing ? -Infinity : Infinity
    for (const i of candidates) {
      state[i] = maximizing ? ai : human
      const child = minimax(state, depth - 1, !maximizing, alpha, beta)
      state[i] = null
      value = maximizing ? Math.max(value, child) : Math.min(value, child)
      if (maximizing) alpha = Math.max(alpha, value); else beta = Math.min(beta, value)
      if (beta <= alpha) break
    }
    return value
  }

  for (const i of orderedMoves(board, size, ai, human).slice(0, 16)) {
    const state = [...board]; state[i] = ai
    const value = minimax(state, maxDepth - 1, false, -Infinity, Infinity)
    if (value > best) { best = value; bestMoves = [i] }
    else if (value === best) bestMoves.push(i)
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? open[0]
}

export function getEasyMove(board, size, ai = 'O', human = 'X') {
  const open = getEmptyCells(board)
  if (Math.random() < .48) { const win = tacticalMove(board, size, ai); if (win !== null) return win }
  if (Math.random() < .32) { const block = tacticalMove(board, size, human); if (block !== null) return block }
  return open[Math.floor(Math.random() * open.length)]
}
