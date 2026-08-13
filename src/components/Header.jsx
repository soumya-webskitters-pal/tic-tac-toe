export default function Header({ themes, theme, onThemeChange }) {
  return <header><a className="brand" href="#"><span className="brand-cube"><i /><i /></span><span>NEXUS <b>TAC</b></span></a><div className="header-actions"><span className="online"><i /> SYSTEM ONLINE</span><div className="theme-picker"><span>THEME</span>{themes.map(item => <button key={item.name} title={item.name} aria-label={`${item.name} theme`} className={theme.name === item.name ? 'active' : ''} style={{ background: item.value }} onClick={() => onThemeChange(item)} />)}</div></div></header>
}
