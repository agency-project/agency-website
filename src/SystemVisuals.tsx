import { useState } from 'react'
import claude from './logos/claude-color.svg'
import codex from './logos/codex.svg'
import opencode from './logos/opencode.svg'
import grok from './logos/grok.svg'
import kimi from './logos/kimi-color.svg'
import openai from './logos/openai.svg'
import anthropic from './logos/anthropic.svg'
import bedrock from './logos/bedrock-color.svg'
import vllm from './logos/vllm-color.svg'
import linux from './logos/linux.svg'
import docker from './logos/docker.svg'
import podman from './logos/podman.svg'
import bird from './bird-blue.png'
import criticalPath from './agency-critical.png'
import { paperPage, source } from './research'
import './product-scenes.css'

type Mark = { name: string; image: string; mono?: boolean; bird?: boolean }

const harnesses: Mark[] = [
  { name: 'Claude Code', image: claude },
  { name: 'OpenAI Codex', image: codex, mono: true },
  { name: 'OpenCode', image: opencode, mono: true },
  { name: 'Grok', image: grok, mono: true },
  { name: 'Kimi', image: kimi, mono: true },
  { name: 'Agency Native', image: bird, bird: true },
]
const providers: Mark[] = [
  { name: 'OpenAI', image: openai, mono: true },
  { name: 'Anthropic', image: anthropic, mono: true },
  { name: 'Amazon Bedrock', image: bedrock },
  { name: 'vLLM endpoints', image: vllm },
]
const environments: Mark[] = [
  { name: 'Linux x86-64', image: linux, mono: true },
  { name: 'Docker', image: docker, mono: true },
  { name: 'Podman', image: podman, mono: true },
]

function BrandMark({ mark }: { mark: Mark }) {
  const css = mark.bird ? 'bird-blue' : mark.mono ? 'brand-mono' : ''
  return <img className={css} src={mark.image} alt="" width="36" height="36" loading="lazy" decoding="async" />
}

function MarkList({ items }: { items: Mark[] }) {
  return <ul className="mark-list">{items.map(mark => <li key={mark.name}><BrandMark mark={mark} /><span>{mark.name}</span></li>)}</ul>
}

export function Integrations() {
  return (
    <section className="landing-band integrations-band" aria-labelledby="integrations-title">
      <div className="landing-shell integration-layout">
        <div className="integration-copy">
          <h2 id="integrations-title">Bring your own harness.</h2>
          <p>Run the agents you already use in a local Linux sandbox.</p>
        </div>
        <div className="integration-marks">
          <h3>Agent harnesses</h3>
          <MarkList items={harnesses} />
          <details className="integration-details" open>
            <summary>Model providers and runtimes</summary>
            <div className="integration-extra">
              <div><h3>Inference</h3><MarkList items={providers} /></div>
              <div><h3>Execution</h3><MarkList items={environments} /></div>
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}
const flows: { label: string; detail: string; route: string; title: string; text?: string }[] = [
  {
    label: 'LLM routing', detail: 'Model requests', route: 'Harness ⇄ Sandbox ⇄ Agency host ⇄ Model provider', title: 'Route requests and patch context',
  },
  {
    label: 'Tool and syscall interception', detail: 'Tool activity', route: 'Sandbox ⇄ Agency host policy hooks', title: 'Intercept tool and system activity',
    text: 'The sandbox observes supported tool calls and syscalls and forwards events to the host. Where a policy hook applies, the host returns an allow or deny decision to the sandbox. The sandbox uses ptrace and cgroups to observe and manage the workload.',
  },
  {
    label: 'Data collection', detail: 'Profiling data', route: 'Sandbox → Agency host → SQLite → Profiler', title: 'Turn execution events into a profile',
    text: 'Model and tool events and system measurements feed the host data collector. It records them in SQLite, which the Profiler reads for live inspection, replay, and critical path analysis.',
  },
]

function StackPlanes({ active }: { active: number }) {
  return (
    <svg className="stack-planes" viewBox="0 0 1200 620" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="stack-floor" x1="0" x2="1" y1="1" y2="0">
          <stop stopColor="#182b47" /><stop offset="1" stopColor="#0d192a" />
        </linearGradient>
      </defs>
      <path className="stack-base" d="M25 365 641 157 1176 359 574 595Z" />
      <path className="stack-floor" d="M25 349 641 141 1176 343 574 579Z" />
      <path className="stack-seams" d="M25 349 25 365 574 595 574 579 1176 343 1176 359M179 297l549 224m-395-276 549 217M487 194l549 209M164 405l613-213M301 464l609-223M437 520l608-227" />
      <path className="stack-wire wire-workflow" d="M223 271H305Q319 271 319 285V318Q319 330 331 330H378" />
      <path className="stack-arrow workflow-arrow" d="m351 325 8 5-8 5Z" />
      <path className="stack-wire stack-wire-active" d={active === 2 ? 'M592 187V286' : 'M586 187V286M598 187V286'} />
      <path className="stack-arrow stack-arrow-active" d={active === 2 ? 'm586 264 6 10 6-10Z' : 'm581 260 5 9 5-9Zm12-3 5-9 5 9Z'} />
      <path className={'stack-wire' + (active === 0 ? ' stack-wire-active' : '')} d="M878 351H899Q913 351 913 337V130Q913 116 927 116H941" />
      <path className={'stack-arrow' + (active === 0 ? ' stack-arrow-active' : '')} d="m908 189 5-9 5 9Zm0 38 5 9 5-9Z" />
      <path className={'stack-wire' + (active === 2 ? ' stack-wire-active' : '')} d="M878 462H941" />
      <path className={'stack-arrow' + (active === 2 ? ' stack-arrow-active' : '')} d="m915 457 9 5-9 5Z" />
    </svg>
  )
}

export function Interposition() {
  const [active, setActive] = useState(0)
  const flow = flows[active]
  return (
    <section id="how" className="landing-band architecture-band" aria-labelledby="how-title">
      <div className="landing-shell">
        <header className="landing-heading architecture-heading">
          <div>
            <p className="section-label">Architecture</p>
            <h2 id="how-title">One layer across the agent stack.</h2>
          </div>
        </header>

        <div className="agent-stack" data-flow={active}>
          <StackPlanes active={active} />
          <div className="stack-workflow">
            <p className="stack-kicker">User interface</p>
            <strong>Agent workflow</strong>
            <span>Python driver or supported harness terminal</span>
          </div>

          <section className="sandbox-stage" aria-labelledby="sandbox-stage-title">
            <header><p className="stack-kicker">Isolated Linux container</p><h3 id="sandbox-stage-title">Sandbox engine</h3></header>
            <div className="sandbox-interior">
              <div className="sandbox-harness">
                <strong>Black-box harness</strong>
                <div className="stack-marks">{harnesses.slice(0, 3).map(mark => <BrandMark key={mark.name} mark={mark} />)}</div>
              </div>
              <div className="sandbox-runtime">
                <strong>Runtime observation</strong>
                <span>ptrace · cgroups · tools · filesystem</span>
              </div>
            </div>
          </section>

          <div className="stack-socket"><span aria-hidden="true">{active === 2 ? '↓' : '⇅'}</span> Unix domain socket</div>

          <section className="host-rack" aria-labelledby="host-rack-title">
            <header>
              <BrandMark mark={harnesses[5]} />
              <div><p className="stack-kicker">Agency host</p><h3 id="host-rack-title">Interposition engine</h3></div>
            </header>
            <div className="rack-modules" role="group" aria-label="Explore activity through the host">
              {flows.map(({ label, detail }, index) => (
                <button type="button" key={label} aria-pressed={active === index} aria-controls="architecture-detail" onClick={() => setActive(index)}>
                  <span className="rack-port" aria-hidden="true" /><strong>{label}</strong><span>{detail}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="stack-endpoint provider-endpoint" aria-labelledby="provider-endpoint-title">
            <p className="stack-kicker">Request ⇄ response</p>
            <h3 id="provider-endpoint-title">Model providers</h3>
            <div className="stack-marks">{providers.map(mark => <BrandMark key={mark.name} mark={mark} />)}</div>
          </section>

          <section className="stack-endpoint profiler-endpoint" aria-labelledby="profiler-endpoint-title">
            <p className="stack-kicker">Events and metrics → SQLite</p>
            <h3 id="profiler-endpoint-title">Agency Profiler</h3>
            <span>Live inspection · replay · critical path</span>
          </section>
        </div>
        <div className="stack-narration" id="architecture-detail" data-flow={active} aria-live="polite">
          <div><h3>{flow.title}</h3><p className="stack-route">{flow.route}</p></div>{flow.text && <p>{flow.text}</p>}
        </div>
      </div>
    </section>
  )
}
export function Capabilities() {

  return (
    <section className="landing-band capabilities-band" aria-labelledby="capabilities-title">
      <div className="landing-shell">
        <div className="capability-heading">
          <h2 id="capabilities-title">Observe. Intervene. Compare.</h2>
        </div>
        <div className="capability-scenes">
          <article className="capability-monitor">
            <div className="capability-copy"><p className="workflow-stage">01 · Observe</p><h3>Monitor</h3><p>When a run stalls, trace model calls, tool results, and system activity on one clock to see what held it up.</p></div>
            <figure className="trace-panel"><a href={criticalPath} aria-label="Open full-size Critical Path view"><img src={criticalPath} width="2680" height="782" loading="lazy" decoding="async" alt="Agency Critical Path shows measured run metrics and an execution timeline with model, tool, and process activity." /></a><figcaption>Critical Path in Agency · recorded product view</figcaption></figure>
          </article>
          <article className="capability-modify">
            <div className="capability-copy"><p className="workflow-stage">02 · Intervene</p><h3>Modify</h3><p>Test whether changing a specific piece of context changes the result. Agency can patch a message block before it reaches the model.</p></div>
            <figure className="context-panel">
              <div><b>Original block</b><span className="context-old">Alice has a blue car.<br />Bob has a red car.</span></div>
              <svg viewBox="0 0 40 28" aria-hidden="true"><path d="M2 14h33m-9-9 9 9-9 9" /></svg>
              <div><b>Sent to model</b><span className="context-new">Alice has a red car.<br />Bob has a blue car.</span></div>
              <figcaption>The host substitutes a complete block before the next model request. <a className="landing-link" href={source + 'examples/13_context_manipulation.py'}>Repository example ↗</a></figcaption>
            </figure>
          </article>
          <article className="capability-benchmark">
            <div className="capability-copy"><p className="workflow-stage">03 · Compare</p><h3>Benchmark</h3><p>Run the same task with and without the change, then compare the traces and check both outcomes with the same evaluator.</p></div>
            <figure className="context-bars">
              <h4>Final context on one SWE-bench Pro task</h4>
              <div><span>Baseline</span><strong>61.3K tokens</strong><i aria-hidden="true" /></div>
              <div><span>Compacted</span><strong>16.3K tokens</strong><i aria-hidden="true" /></div>
              <figcaption>Research experiment · both runs passed. <a className="landing-link" href={paperPage(9)}>Paper · Figure 11 ↗</a></figcaption>
            </figure>
          </article>
        </div>
      </div>
    </section>
  )
}
