import { useEffect, useRef, useState } from 'react'

export default function SoundMenu({ sound }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const rangeStyle = value => {
    const percent=Math.round(value*100)
    return {
      '--range-value':`${percent}%`,
      '--range-low-blend-start':`${Math.min(percent,10)}%`,
      '--range-low-blend-end':`${Math.min(percent,20)}%`,
      '--range-high-blend-start':`${Math.min(percent,75)}%`,
      '--range-high-blend-end':`${Math.min(percent,85)}%`
    }
  }

  useEffect(() => {
    if (!open) return
    const close = event => { if (!menuRef.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  return <div className="sound-menu" ref={menuRef}>
    <button className={`sound-trigger ${sound.enabled ? '' : 'muted'}`} onClick={() => setOpen(value => !value)} aria-label="Sound settings" aria-expanded={open} title="Sound settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path className="sound-wave" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>{!sound.enabled&&<path className="sound-slash" d="m5 5 14 14"/>}</svg></button>
    {open && <div className="sound-popover glass">
      <div className="sound-popover-title"><strong>SOUND</strong><button className={`sound-toggle ${sound.enabled ? 'on' : ''}`} onClick={() => sound.setEnabled(!sound.enabled)} aria-label={`${sound.enabled ? 'Disable' : 'Enable'} sound`}><i /></button></div>
      <label><span>BACKGROUND MUSIC <b>{Math.round(sound.musicVolume * 100)}%</b></span><input type="range" min="0" max="1" step="0.05" value={sound.musicVolume} style={rangeStyle(sound.musicVolume)} onChange={event => sound.setMusicVolume(Number(event.target.value))} disabled={!sound.enabled}/></label>
      <label><span>SOUND EFFECTS <b>{Math.round(sound.sfxVolume * 100)}%</b></span><input type="range" min="0" max="1" step="0.05" value={sound.sfxVolume} style={rangeStyle(sound.sfxVolume)} onChange={event => sound.setSfxVolume(Number(event.target.value))} disabled={!sound.enabled}/></label>
    </div>}
  </div>
}
