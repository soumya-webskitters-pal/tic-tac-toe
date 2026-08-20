import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import LegalPage from './components/LegalPage'
import './styles.css'

const legalPage=window.location.pathname.replace(/^\/+|\/+$/g,'')
const RootComponent=['privacy','terms'].includes(legalPage)?<LegalPage page={legalPage}/>:<App/>

createRoot(document.getElementById('root')).render(
  <React.StrictMode>{RootComponent}</React.StrictMode>
)
