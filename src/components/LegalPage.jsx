import logo from '../../icon.png'
import { LEGAL_CONTENT } from './LegalModal'

export default function LegalPage({ page }) {
  const content=LEGAL_CONTENT[page]
  return <main className="legal-page"><div className="noise"/><header className="legal-page-header"><a className="brand" href="/"><img className="brand-logo" src={logo} alt="Nexus Tac"/><span>NEXUS <b>TAC</b></span></a><a className="legal-back-link" href="/">← BACK TO GAME</a></header><article className="legal-page-content glass"><div className="modal-kicker">{content.kicker}</div><h1>{content.title}</h1>{content.sections.map(([heading,text])=><section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}<div className="legal-page-footer"><a href="/">← Return to Nexus Tac</a><a href={page==='privacy'?'/terms':'/privacy'}>{page==='privacy'?'Terms & Conditions':'Privacy Policy'} →</a></div></article></main>
}
