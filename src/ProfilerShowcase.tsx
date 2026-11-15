import { useState } from 'react'
import type { CSSProperties } from 'react'
import liveExecution from './agency-trajectory.webp'
import criticalPath from './agency-critical.png'
import { source } from './research'
import './product-scenes.css'

type Detail = {
  name: string
  crop: [number, number, number, number]
  text: string
  alt: string
}

const frameAspect = 2.08

const views = [
  {
    name: 'Live execution', image: liveExecution, width: 1280, height: 720,
    alt: 'The Agency Profiler shows model requests, tool activity, tokens, CPU usage, and memory for three agents.',
    details: [
      { name: 'Run counters', crop: [316, 49, 564, 32], text: 'See how many agents are active, how often they call tools and models, and how many tokens the models received and returned.', alt: 'Live counters: 3 active agents, 3 tool calls, 4 LLM requests, and 30.1K input and 269 output tokens.' },
      { name: 'Replay controls', crop: [0, 116, 645, 62], text: 'Freeze the view or replay recorded events to inspect how work progressed.', alt: 'The recorded timeline shows Freeze view, Jump to live, and Replay.' },
      { name: 'Agent activity', crop: [867, 232, 407, 196], text: 'An agent lane groups resource usage and in-flight activity so you can see what the agent is doing or waiting for.', alt: 'The validator agent is waiting for its model and has a validation tool running.' },
    ] satisfies Detail[],
  },
  {
    name: 'Critical path', image: criticalPath, width: 2680, height: 782,
    alt: 'Agency Critical Path shows measured time, coverage, elapsed gaps and the longest recorded operations.',
    details: [
      { name: 'Wall time', crop: [47, 103, 406, 214], text: 'Wall time is the recorded elapsed span of the run. If the execution boundary was unavailable, it measures the available trace span.', alt: 'Recorded wall time in this capture is 136.77 seconds.' },
      { name: 'Dependencies', crop: [473, 103, 405, 215], text: 'Recorded dependencies form a candidate path. Gaps in the trace prevent it from proving what caused a wait.', alt: 'The recorded dependency chain spans 125.21 seconds and is labeled incomplete causality.' },
      { name: 'Coverage', crop: [894, 103, 419, 211], text: 'Coverage is the share of the candidate path backed by measurements. In this run, only 1.47% is measured.', alt: 'Measured path coverage in this capture is 1.47 percent, or 2.01 seconds.' },
    ] satisfies Detail[],
  },
]

export function ProfilerShowcase({ videoSrc }: { videoSrc?: string }) {
  const [viewIndex, setViewIndex] = useState(0)
  const [detailIndex, setDetailIndex] = useState(0)
  const view = views[viewIndex]
  const detail = view.details[detailIndex]
  const [x, y, width, height] = detail.crop
  const highlight: CSSProperties = {
    left: x / view.width * 100 + '%', top: y / view.height * 100 + '%',
    width: width / view.width * 100 + '%', height: height / view.height * 100 + '%',
  }
  const imageAspect = view.width / view.height
  const fittedWidth = Math.min(1, imageAspect / frameAspect)
  const fittedHeight = Math.min(1, frameAspect / imageAspect)
  const anchorX = ((1 - fittedWidth) / 2 + (x + width / 2) / view.width * fittedWidth) * 100
  const anchorY = ((1 - fittedHeight) / 2 + (y + height) / view.height * fittedHeight) * 100
  const screenFit = { width: fittedWidth * 100 + '%', height: fittedHeight * 100 + '%' }
  const showingVideo = Boolean(videoSrc && viewIndex === 0)

  return (
    <section id="product" className="landing-band product-band" aria-labelledby="product-title">
      <div className="landing-shell profiler-scene">
        <header className="profiler-intro">
          <p className="section-label">Agency Profiler</p>
          <h2 id="product-title">See the <br />whole run.</h2>
          <p>Follow model calls, tool executions, and system activity on the same timeline.</p>
          <div className="profiler-views" role="group" aria-label="Profiler screenshots">
            {views.map(({ name }, index) => (
              <button key={name} type="button" aria-pressed={viewIndex === index} aria-controls="profiler-screen" onClick={() => {
                setViewIndex(index)
                setDetailIndex(0)
              }}>{name}</button>
            ))}
          </div>
          <a className="landing-link" href={source + 'docs/guides/profiling/views.md'}>Profiler documentation ↗</a>
        </header>
        <div className="profiler-workspace">
          <figure className="profiler-screen" id="profiler-screen" data-view={viewIndex}>
            <div className="screen-bezel">
              <span>{view.name}</span>
              <span className="preview-status">{showingVideo ? 'Profiler video' : 'Video placeholder · recorded screenshot'}</span>
            </div>
            <div className="screen-stage" style={{ aspectRatio: frameAspect }}>
              {showingVideo ? (
                <video controls playsInline preload="none" poster={view.image} aria-label="Agency Profiler video">
                  <source src={videoSrc} type="video/mp4" />
                </video>
              ) : (
                <a className="screen-image" style={screenFit} href={view.image} aria-label={'Open full-size ' + view.name.toLowerCase() + ' screenshot'}>
                  <img src={view.image} width={view.width} height={view.height} alt={view.alt} decoding="async" loading="lazy" />
                  <span className="screen-region" style={highlight} aria-hidden="true" />
                </a>
              )}
              {!showingVideo && (
                <svg className="screen-tether" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d={'M' + anchorX + ' ' + anchorY + 'V100'} />
                </svg>
              )}
            </div>
          </figure>
          {!showingVideo && (
            <aside className="profiler-inspector" aria-label="Inspect screenshot details">
              <span className="inspector-anchor" style={{ left: anchorX + '%' }} aria-hidden="true" />
              <div className="inspector-select" role="group" aria-label="Screenshot detail">
                {view.details.map(({ name }, index) => (
                  <button key={name} type="button" aria-pressed={detailIndex === index} aria-controls="inspector-detail" onClick={() => setDetailIndex(index)}>{name}</button>
                ))}
              </div>
              <figure id="inspector-detail" aria-live="polite">
                <div className="detail-crop">
                  <svg viewBox={detail.crop.join(' ')} width={width} height={height}
                    style={{ width: 'min(100%, calc(var(--crop-height) * ' + width / height + '))' }}
                    role="img" aria-label={detail.alt}>
                    <image href={view.image} width={view.width} height={view.height} />
                  </svg>
                </div>
                <figcaption>{detail.text}</figcaption>
              </figure>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}
