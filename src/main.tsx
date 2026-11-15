import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import agencyLogo from './agency-logo.png'
import blueBird from './bird-blue.png'
import navyBird from './bird-navy.png'
import './style.css'

const repository = 'https://github.com/agency-project/agency'
const docs = 'https://agency-project.github.io/Agency/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="Agency home">
        <span className="wordmark-logo"><img src={agencyLogo} alt="" width="1442" height="1091" /></span>
        <span>Agency</span>
      </a>
      <nav aria-label="Main navigation">
        <a href={docs}>Docs</a>
        <a href={repository}>GitHub</a>
      </nav>
    </header>
    <main className="hero">
      <div className="hero-copy">
        <h1>The performance <br className="hero-break" />toolkit <em>for AI agents</em></h1>
        <p>Profile every LLM call, tool execution, and system bottleneck in one unified timeline. Find out where your agents spend time, memory, and money.</p>
        <div className="hero-actions">
          <a className="button button-primary" href={docs}>Read the docs <span aria-hidden="true">→</span></a>
          <a className="button button-secondary" href={repository}>View on GitHub <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="bird-mobile" aria-hidden="true">
        <div className="hanging-bird hanging-bird-navy"><img className="bird-navy" src={navyBird} alt="" width="249" height="207" /></div>
        <div className="hanging-bird hanging-bird-blue"><img className="bird-blue" src={blueBird} alt="" width="144" height="119" /></div>
        <div className="hanging-bird hanging-bird-navy hanging-bird-navy-low"><img className="bird-navy" src={navyBird} alt="" width="249" height="207" /></div>
      </div>
    </main>
  </StrictMode>,
)
