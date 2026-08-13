export function linesFor(size) {
  const lines = []
  const winLength = size === 3 ? 3 : 4
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]

  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      for (const [rowStep, columnStep] of directions) {
        const endRow = row + (winLength - 1) * rowStep
        const endColumn = column + (winLength - 1) * columnStep
        if (endRow < 0 || endRow >= size || endColumn < 0 || endColumn >= size) continue
        lines.push(Array.from({ length: winLength }, (_, offset) =>
          (row + offset * rowStep) * size + column + offset * columnStep
        ))
      }
    }
  }
  return lines
}

export function getOutcome(board, size) {
  for (const line of linesFor(size)) {
    if (board[line[0]] && line.every(i => board[i] === board[line[0]])) return { winner: board[line[0]], line }
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null
}

export function getEmptyCells(board) {
  return board.flatMap((value, index) => value ? [] : [index])
}

export function createBoard(size) {
  return Array(size * size).fill(null)
}
