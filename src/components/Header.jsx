import logo from '../../icon.png'

export default function Header({ themes,theme,onThemeChange,profile,onProfile }) {
  const avatar=profile.avatar
  return <header><a className="brand" href="#"><img className="brand-logo" src={logo} alt="Nexus Tac" /><span>NEXUS <b>TAC</b></span></a><div className="header-actions"><span className="online"><i /> SYSTEM ONLINE</span><div className="theme-picker"><span>THEME</span>{themes.map(item => <button key={item.name} title={item.name} aria-label={`${item.name} theme`} className={theme.name === item.name ? 'active' : ''} style={{ background: item.value }} onClick={() => onThemeChange(item)} />)}</div><button className="profile-trigger" onClick={onProfile} aria-label="Edit player profile" title={profile.name}>{avatar.type==='custom'?<img src={avatar.value} alt=""/>:<span style={{background:avatar.value.color}}>{avatar.value.emoji}</span>}</button></div></header>
}
