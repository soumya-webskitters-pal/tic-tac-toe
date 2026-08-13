import { useEffect, useState } from 'react'
import Icon from './Icon'
export default function EditableName({ value, onChange, symbol, muted }) {
  const [editing, setEditing] = useState(false), [draft, setDraft] = useState(value)
  const save = () => { onChange(draft.trim() || value); setEditing(false) }
  useEffect(() => setDraft(value), [value])
  return <div className={`player-name ${muted ? 'muted' : ''}`}><span className={`mini-mark ${symbol.toLowerCase()}`}>{symbol}</span><div><small>{symbol === 'X' ? 'PLAYER ONE' : 'PLAYER TWO'}</small>{editing ? <input autoFocus value={draft} maxLength={18} onChange={e => setDraft(e.target.value)} onBlur={save} onKeyDown={e => e.key === 'Enter' && save()} /> : <strong>{value}</strong>}</div><button className="edit-btn" onClick={() => setEditing(true)} aria-label={`Rename ${value}`}><Icon>✎</Icon></button></div>
}
