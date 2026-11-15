import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import agencyLogo from './agency-logo.png'
import blueBird from './bird-blue.png'
import navyBird from './bird-navy.png'
import docsIcon from './logos/docs-book.svg'
import githubIcon from './logos/github-mark.svg'
import './style.css'
import { Homepage } from './Homepage'
import { ResearchFooter, ResearchSections } from './ResearchSections'
import { docs, paper, repository } from './research'

const isResearch = new URLSearchParams(window.location.search).get('view') === 'research'

if (isResearch) document.title = 'Agency | Research'

function HangingBird({ style, image, label, width, height }: {
  style: string
  image: string
  label: string
  width: number
  height: number
}) {
  return (
    <button type="button" className={'hanging-bird ' + style} aria-label={label} onClick={(event) => {
      const hangingBird = event.currentTarget
      const bird = hangingBird.firstElementChild
      if (!bird) return

      hangingBird.getAnimations({ subtree: true }).forEach(animation => animation.cancel())
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bird.animate([{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }], { duration: 300 })
        return
      }

      const drop = hangingBird.offsetTop
      const angle = Math.min(9, Math.atan2(24, Math.max(drop, 1)) * 180 / Math.PI)
      const pivot = '57% ' + -drop + 'px'
      const frames = [0, -1, 0.67, -0.33, 0.14, 0].map(swing => ({
        transform: 'rotate(' + swing * angle + 'deg)',
        transformOrigin: pivot,
      }))
      hangingBird.animate(frames, { duration: 1050, easing: 'ease-out' })
    }}>
      <img className={image === blueBird ? 'bird-blue' : 'bird-navy'} src={image} alt="" width={width} height={height} />
    </button>
  )
}

function App() {
  useEffect(() => {
    const anchor = window.location.hash.slice(1)
    if (anchor) document.getElementById(anchor)?.scrollIntoView()
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Agency home">
          <span className="wordmark-logo"><img src={agencyLogo} alt="" width="1442" height="1091" /></span>
          <span>Agency</span>
        </a>
        <nav className="brand-nav" aria-label="Main navigation">
          <a href={docs} aria-label="Docs" title="Docs"><img src={docsIcon} alt="" width="24" height="24" /></a>
          <a href={repository} aria-label="GitHub" title="GitHub"><img src={githubIcon} alt="" width="24" height="24" /></a>
        </nav>
      </header>
      <main id="main">
        {isResearch ? <ResearchSections /> : <>
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <h1 id="hero-title">The performance <br className="hero-break" />toolkit <em>for AI agents</em></h1>
              <p>See what your agents do and where they spend resources. Monitor, debug, and benchmark existing harnesses, then test changes without replacing the harness or model.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#quickstart">Get started <span aria-hidden="true">→</span></a>
                <a className="button button-secondary" href={paper}>Research paper <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <div className="bird-mobile" role="group" aria-label="Hanging origami birds">
              <HangingBird style="hanging-bird-navy" image={navyBird} label="Nudge the left navy bird" width={249} height={207} />
              <HangingBird style="hanging-bird-blue" image={blueBird} label="Nudge the blue bird" width={144} height={119} />
              <HangingBird style="hanging-bird-navy hanging-bird-navy-low" image={navyBird} label="Nudge the right navy bird" width={249} height={207} />
            </div>
          </section>
          <Homepage />
        </>}
      </main>
      <ResearchFooter />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
