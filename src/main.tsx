import { StrictMode, useEffect, useRef } from 'react'
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
  const element = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ id: number; x: number; angle: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const string = useRef<SVGPathElement>(null)
  const motion = useRef({ angle: 0, velocity: 0, frame: 0, time: 0 })

  useEffect(() => {
    const bird = element.current
    if (!bird) return
    const state = motion.current
    const reset = () => {
      drag.current = null
      delete bird.dataset.dragging
      cancelAnimationFrame(state.frame)
      Object.assign(state, { angle: 0, velocity: 0, frame: 0, time: 0 })
      bird.style.transform = ''
      bird.style.setProperty('--string-drop', bird.offsetTop + 'px')
      string.current?.setAttribute('d', 'M32 0 C32 33 32 70 32 100')
    }
    const observer = new ResizeObserver(reset)
    observer.observe(bird)
    if (bird.offsetParent) observer.observe(bird.offsetParent)
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.addEventListener('change', reset)
    reset()
    return () => {
      drag.current = null
      delete bird.dataset.dragging
      cancelAnimationFrame(state.frame)
      observer.disconnect()
      preference.removeEventListener('change', reset)
    }
  }, [])

  const nudge = (kick = true) => {
    const bird = element.current
    if (!bird || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const state = motion.current
    const length = Math.max(bird.offsetTop + bird.offsetHeight * .31, 60)
    const impulse = Math.min(18, 1800 / length)
    if (kick) state.velocity = Math.max(-24, Math.min(24, state.velocity - impulse))
    if (state.frame) return
    state.time = performance.now()
    const step = (now: number) => {
      const elapsed = Math.min((now - state.time) / 1000, .032)
      state.time = now
      const stiffness = Math.max(14, Math.min(32, 6000 / length))
      state.velocity += (-stiffness * state.angle - 3.8 * state.velocity) * elapsed
      state.angle += state.velocity * elapsed
      bird.style.transform = 'rotate(' + state.angle + 'deg)'
      const bend = Math.max(-8, Math.min(8, state.velocity * .45 - state.angle * .3))
      string.current?.setAttribute('d',
        'M32 0 C' + (32 + bend) + ' 33 ' + (32 - bend * .4) + ' 70 32 100')
      if (Math.abs(state.angle) < .015 && Math.abs(state.velocity) < .04) {
        bird.style.transform = ''
        string.current?.setAttribute('d', 'M32 0 C32 33 32 70 32 100')
        Object.assign(state, { angle: 0, velocity: 0, frame: 0 })
        return
      }
      state.frame = requestAnimationFrame(step)
    }
    state.frame = requestAnimationFrame(step)
  }

  return (
    <button ref={element} type="button" className={'hanging-bird ' + style} aria-label={label}
      onDragStart={event => event.preventDefault()}
      onPointerDown={event => {
        if (event.button !== 0 || drag.current) return
        const bird = event.currentTarget
        const state = motion.current
        cancelAnimationFrame(state.frame)
        state.frame = 0
        state.velocity = 0
        suppressClick.current = false
        drag.current = { id: event.pointerId, x: event.clientX, angle: state.angle, moved: false }
        bird.dataset.dragging = 'true'
        bird.setPointerCapture(event.pointerId)
      }}
      onPointerMove={event => {
        const active = drag.current
        if (!active || active.id !== event.pointerId) return
        const bird = event.currentTarget
        const distance = event.clientX - active.x
        active.moved ||= Math.abs(distance) > 4
        const length = Math.max(bird.offsetTop + bird.offsetHeight * .31, 60)
        // Keep the bird's upper corners below its string's anchor.
        const maxAngle = Math.max(0, Math.min(85,
          Math.atan2(Math.max(0, bird.offsetTop - 8), bird.offsetWidth * .57) * 180 / Math.PI))
        const angle = Math.max(-maxAngle, Math.min(maxAngle,
          active.angle - distance / length * 180 / Math.PI))
        motion.current.angle = angle
        bird.style.transform = 'rotate(' + angle + 'deg)'
        const bend = Math.max(-10, Math.min(10, -angle * .35))
        string.current?.setAttribute('d',
          'M32 0 C' + (32 + bend) + ' 33 ' + (32 - bend * .4) + ' 70 32 100')
      }}
      onLostPointerCapture={event => {
        if (!drag.current || drag.current.id !== event.pointerId) return
        suppressClick.current = drag.current.moved
        drag.current = null
        delete event.currentTarget.dataset.dragging
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          motion.current.angle = 0
          event.currentTarget.style.transform = ''
          string.current?.setAttribute('d', 'M32 0 C32 33 32 70 32 100')
        } else {
          nudge(false)
        }
      }}
      onPointerUp={event => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      }}
      onPointerCancel={event => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      }}
      onClick={event => {
        if (event.detail === 0 || !suppressClick.current) nudge()
        suppressClick.current = false
      }}>
      <svg className="bird-string" viewBox="0 0 64 100" preserveAspectRatio="none" aria-hidden="true">
        <path ref={string} d="M32 0 C32 33 32 70 32 100" vectorEffect="non-scaling-stroke" />
      </svg>
      <img draggable={false} className={image === blueBird ? 'bird-blue' : 'bird-navy'} src={image} alt="" width={width} height={height} />
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
