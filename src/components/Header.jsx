import { useEffect, useRef, useState } from 'react'
import logo from '../../icon.png'
import SoundMenu from './SoundMenu'

export default function Header({ themes,theme,onThemeChange,profile,onProfile,sound }) {
  const avatar=profile.avatar
  const [themesOpen,setThemesOpen]=useState(false)
  const pickerRef=useRef(null)
  useEffect(()=>{if(!themesOpen)return;const close=event=>{if(!pickerRef.current?.contains(event.target))setThemesOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[themesOpen])
  const useCustomColor=value=>{const hex=value.slice(1),rgb=[0,2,4].map(index=>parseInt(hex.slice(index,index+2),16)).join(',');onThemeChange({name:'Custom',value,rgb})}
  const quickThemes=themes.slice(0,3),moreThemes=themes.slice(3)
  return <header><a className="brand" href="#"><img className="brand-logo" src={logo} alt="Nexus Tac" /><span>NEXUS <b>TAC</b></span></a><div className="header-actions"><span className="online"><i /> SYSTEM ONLINE</span><div className="theme-picker" ref={pickerRef}><span>THEME</span>{quickThemes.map(item => <button key={item.name} title={item.name} aria-label={`${item.name} theme`} className={theme.name === item.name ? 'active' : ''} style={{ background: item.value }} onClick={() => onThemeChange(item)} />)}<button className={`theme-more-trigger ${themesOpen?'open':''}`} onClick={()=>setThemesOpen(value=>!value)} aria-label="More theme colors" aria-expanded={themesOpen}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5"/></svg></button>{themesOpen&&<div className="theme-dropdown glass"><strong>MORE COLORS</strong><div className="theme-dropdown-colors">{moreThemes.map(item=><button key={item.name} title={item.name} aria-label={`${item.name} theme`} className={theme.name===item.name?'active':''} style={{background:item.value}} onClick={()=>{onThemeChange(item);setThemesOpen(false)}}/>)}</div><label className="custom-color"><span>COLOR PICKER</span><input type="color" value={theme.value} onChange={event=>useCustomColor(event.target.value)}/><b/></label></div>}</div><SoundMenu sound={sound}/><button className="profile-trigger" onClick={onProfile} aria-label="Edit player profile" title={profile.name}>{avatar.type==='custom'?<img src={avatar.value} alt=""/>:<span style={{background:avatar.value.color}}>{avatar.value.emoji}</span>}</button></div></header>
}
