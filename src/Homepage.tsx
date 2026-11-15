import { useEffect, useRef, useState } from 'react'
import flightBird from './agency-flight-bird.svg'
import { ProfilerShowcase } from './ProfilerShowcase'
import { CodeBlock } from './ResearchSections'
import { firstRun, install, repository, source } from './research'
import { Capabilities, Integrations, Interposition } from './SystemVisuals'
import './homepage.css'
import './visuals.css'
import './research-findings.css'
import './optimization-reveal.css'

const costObservations = [
  { value: '73%', qualifier: 'Up to', title: 'Cached context reads', detail: 'Share of LLM cost in the longest public-trace bucket, above 256K total tokens.' },
  { value: '36%', qualifier: null, title: 'Tool outputs never reused', detail: 'Share of whole tool outputs with no later references in the analyzed benchmark traces.' },
  { value: '28%', qualifier: 'Average', title: 'Cost spent searching files', detail: 'Share of execution cost across benchmark traces, including directory listings and pattern matching.' },
]

const findingNotes = [
  'The longer the cached prefix, the more tokens a later request can reread, even when it adds little new text.',
  'Some tool results stay in the prompt even though the agent never refers to anything in them again.',
  'Listing directories and searching file contents can take multiple turns before the agent reaches the file it needs.',
]

function ResearchFindings() {
  const list = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    const strip = list.current
    if (!strip) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const narrow = window.matchMedia('(max-width: 47rem)')
    let frame = 0

    function update() {
      frame = 0
      if (!strip || reducedMotion.matches) {
        setActive(null)
        return
      }

      const viewport = window.innerHeight
      const bounds = strip.getBoundingClientRect()
      if (bounds.top >= viewport * .88 || bounds.bottom <= viewport * .16) {
        setActive(null)
        return
      }

      if (narrow.matches) {
        const focus = viewport * .58
        const nearby = Array.from(strip.children, (card, index) => {
          const { top, bottom } = card.getBoundingClientRect()
          return { index, top, bottom, distance: Math.abs((top + bottom) / 2 - focus) }
        }).filter(card => card.top < viewport * .88 && card.bottom > viewport * .16)
        nearby.sort((a, b) => a.distance - b.distance)
        setActive(nearby[0]?.index ?? null)
        return
      }

      const start = viewport * .88
      const finish = viewport * .34 - Math.min(bounds.height / 2, viewport * .2)
      const progress = (start - bounds.top) / (start - finish)
      setActive(Math.min(costObservations.length - 1, Math.floor(progress * costObservations.length)))
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reducedMotion.addEventListener('change', schedule)
    schedule()
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reducedMotion.removeEventListener('change', schedule)
    }
  }, [])

  return (
    <ul ref={list} className="evidence-strip evidence-story" data-following={active !== null}
      aria-label="Observed sources of agent execution cost">
      {costObservations.map(({ value, qualifier, title, detail }, index) => (
        <li key={title} data-active={index === active}>
          <p className="evidence-value">{qualifier && <span>{qualifier}</span>}<strong>{value}</strong></p>
          <h3>{title}</h3>
          <p>{detail}</p>
          <div className="evidence-explanation">
            <div className={'evidence-illustration evidence-illustration-' + index} aria-hidden="true">
              {index === 0 && <><span /><span /><span /></>}
              {index === 1 && <><span /><span /></>}
              {index === 2 && <span>List files → Search contents → Read file</span>}
            </div>
            <p>{findingNotes[index]}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

const harnessRatios = [['Basic-full', 0.73], ['OpenAI Codex', 0.75], ['Claude Code', 0.81]] as const

function ResearchProblem() {
  return (
    <section className="landing-band research-editorial" aria-labelledby="cost-title">
      <div className="landing-shell">
        <div className="cost-composition">
          <div className="cost-story">
            <p className="section-label">Harness cost study</p>
            <h2 id="cost-title">Same model.<br />Same tasks.</h2>
          </div>
          <figure className="cost-statement">
            <div className="comparison-heading"><strong>Up to 2.6×</strong><span>execution cost across harness choices</span></div>
            <div className="comparison-bars" role="img" aria-label="Lower-cost configuration at 1 times and higher-cost configuration at up to 2.6 times.">
              <div><span>Lower-cost configuration</span><strong>1×</strong><i /></div>
              <div><span>Higher-cost configuration</span><strong>2.6×</strong><i /></div>
            </div>
            <figcaption>Relative costs normalized to the lower-cost configuration.</figcaption>
          </figure>
        </div>
        <ResearchFindings />
      </div>
    </section>
  )
}

type ResultFlight = { path: string; width: number; height: number }

function ResearchResults() {
  const section = useRef<HTMLElement>(null)
  const number = useRef<HTMLElement>(null)
  const [flight, setFlight] = useState<ResultFlight | null>(null)
  const [approaching, setApproaching] = useState(false)

  useEffect(() => {
    const results = section.current
    const metric = number.current
    if (!results || !metric) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let armed = metric.getBoundingClientRect().bottom > 0
    let previousY = window.scrollY
    let frame = 0
    let cleanupTimer = 0

    function update(initial = false) {
      frame = 0
      if (!results || !metric) return

      const y = window.scrollY
      const movingDown = initial || y > previousY
      previousY = y

      if (motion.matches) {
        window.clearTimeout(cleanupTimer)
        setApproaching(false)
        setFlight(null)
        return
      }

      const viewport = window.innerHeight
      const metricBounds = metric.getBoundingClientRect()
      if (metricBounds.top >= viewport) {
        armed = true
        window.clearTimeout(cleanupTimer)
        setFlight(null)
      }

      setApproaching(armed && movingDown && metricBounds.top >= viewport * .76 && metricBounds.top < viewport * 1.16)
      if (!armed || !movingDown || metricBounds.top >= viewport * .76 || metricBounds.bottom <= viewport * .12) return

      armed = false
      setApproaching(false)
      window.clearTimeout(cleanupTimer)

      const bounds = results.getBoundingClientRect()
      const headline = metric.getBoundingClientRect()
      const width = Math.round(bounds.width)
      const height = Math.round(bounds.height)
      const narrow = width <= 752
      const center = Math.round(headline.top - bounds.top + headline.height / 2)
      const exit = width + (narrow ? 54 : 112)
      const cross = Math.round(headline.right - bounds.left)
      const path = narrow
        ? `M -52 ${center + 22} C 18 ${center + 38}, ${cross * .5} ${center - 26}, ${cross} ${center - 8} S ${width} ${center - 23}, ${exit} ${center - 62}`
        : `M -108 ${center + 40} C 24 ${center + 108}, ${cross * .5} ${center - 52}, ${cross} ${center - 15} S ${width * .82} ${center + 30}, ${exit} ${center - 120}`

      setFlight({ path, width, height })
      cleanupTimer = window.setTimeout(() => setFlight(null), 1950)
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(() => update())
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', schedule)
    update(true)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', schedule)
      window.cancelAnimationFrame(frame)
      window.clearTimeout(cleanupTimer)
    }

  }, [])

  return (
    <section ref={section} id="benchmarks" className="landing-band results-band" data-swoosh={flight ? 'playing' : approaching ? 'ready' : 'idle'} aria-labelledby="benchmarks-title">
      {flight && (
        <div className="result-flight" aria-hidden="true">
          <svg className="result-flight-trail" viewBox={'0 0 ' + flight.width + ' ' + flight.height} preserveAspectRatio="none">
            <defs>
              <linearGradient id="result-trail-color" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop stopColor="#437ee9" stopOpacity=".25" />
                <stop offset=".34" stopColor="#84c7ff" />
                <stop offset=".63" stopColor="#ffc17e" />
                <stop offset="1" stopColor="#f5a524" stopOpacity=".15" />
              </linearGradient>
            </defs>
            <path d={flight.path} pathLength="1" stroke="url(#result-trail-color)" />
          </svg>
          <img className="result-flight-bird" src={flightBird} alt="" width="530" height="483"
            style={{ offsetPath: 'path("' + flight.path + '")' }} />
        </div>
      )}
      <div className="landing-shell">
        <div className="benchmark-stage">
          <div className="benchmark-feature">
            <p className="section-label">Optimization experiment</p>
            <h2 id="benchmarks-title"><span>Up to</span> <strong ref={number}>35%</strong> <span>lower end-to-end cost.</span></h2>
            <p>Five combined research prototypes produced the best-case reduction in a separate evaluation of Claude Code, Codex, and Basic-full across coding and document-retrieval benchmarks.</p>
            <dl className="benchmark-summary">
              <div><dt>Mean cost</dt><dd>0.77×</dd></div>
              <div><dt>Mean accuracy</dt><dd>0.97×</dd></div>
            </dl>
          </div>
          <figure className="benchmark-chart">
            <h3>Best evaluated configuration</h3>
            <p>Execution cost as a share of the corresponding unoptimized baseline.</p>
            <div className="benchmark-columns" role="img" aria-label="Baseline 100 percent. Optimized 65 percent.">
              <div className="benchmark-column baseline-column"><div aria-hidden="true"><b>100%</b></div><span>Baseline</span></div>
              <div className="benchmark-column optimized-column"><div aria-hidden="true"><b>65%</b></div><span>With prototypes</span></div>
            </div>
            <figcaption>
              <h4>Mean cost by harness</h4>
              <dl className="harness-ratios">{harnessRatios.map(([name, ratio]) => (
                <div key={name}><dt>{name}</dt><dd>{ratio.toFixed(2)}×</dd></div>
              ))}</dl>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}

function GettingStarted() {
  const [step, setStep] = useState(0)
  const commands = [install, firstRun]
  return (
    <section id="quickstart" className="landing-band quickstart-band" aria-labelledby="start-title">
      <div className="landing-shell start-layout">
        <div className="start-copy">
          <p className="section-label">Quickstart</p>
          <h2 id="start-title">Record your first run.</h2>
          <p>Use Linux x86-64, Python 3.12+, Git, uv, Docker or Podman, and an OpenAI API key. Profiling requires readable <code>/proc</code> and cgroup v2.</p>
          <div className="start-links">
            <a className="button button-primary" href={source + 'docs/getting-started.md'}>Setup guide ↗</a>
            <a className="button button-secondary" href={repository}>GitHub ↗</a>
          </div>
        </div>
        <div className="terminal-guide">
          <div className="terminal-steps" role="group" aria-label="Quickstart steps">
            {['Install from source', 'Launch the profiler'].map((title, index) => (
              <button key={title} type="button" aria-pressed={step === index} aria-controls="quickstart-command" onClick={() => setStep(index)}>{title}</button>
            ))}
          </div>
          <div id="quickstart-command"><CodeBlock key={step} command={commands[step]} highlightShell /></div>
          <p>{step === 0 ? 'Run these commands in a Linux shell.' : <>After launch, open <a className="landing-link" href="http://localhost:7860/profiler">localhost:7860/profiler ↗</a>.</>}</p>
        </div>
      </div>
    </section>
  )
}

export function Homepage() {
  return (
    <div className="landing-experience">
      <ResearchProblem />
      <ProfilerShowcase />
      <Integrations />
      <Interposition />
      <Capabilities />
      <ResearchResults />
      <GettingStarted />
    </div>
  )
}
