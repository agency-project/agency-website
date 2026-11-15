import { useState } from 'react'
import criticalPath from './agency-critical.png'
import { baseline, docs, firstRun, install, observations, paper, paperPage, repository, source, techniques, variant, viewer } from './research'
import './research.css'

const workflow = [
  { label: 'Record', command: baseline, title: 'Launch a baseline with Codex', detail: 'Use a prepared SWE-bench task row, matching Linux sandbox image, and an env file with provider credentials. Agency launches the pinned Codex binary and records model and tool events in the run directory.' },
  { label: 'Inspect', command: viewer, title: 'Follow the recorded work', detail: 'From the same checkout, serve the run’s logs and open localhost:7865/profiler. Inspect model calls, reported tokens, tool arguments and results, and measured system activity. Estimate LLM cost from provider usage and the rates for that model.' },
  { label: 'Optimize', command: variant, title: 'Change how independent tools are scheduled', detail: 'Add the batching instruction from Appendix C to the resolve_swebench_issue skill prompt in the linked runner, then rerun the same task with the same model and image in a fresh directory. This changes the prompt while retaining the Codex binary.' },
  { label: 'Compare', command: viewer.replace('/path/to/baseline/logs --port 7865', '/path/to/batched/logs --port 7866'), title: 'Compare the baseline and the variant', detail: 'Open the second saved run on port 7866. Compare both exports for model turns, tool calls and token usage, then price both with the same rates. Run the same task evaluator against both patches to check whether the result still passes.' },
]

export function CodeBlock({ command, highlightShell = false }: { command: string; highlightShell?: boolean }) {
  const [status, setStatus] = useState('')
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>bash</span>
        <button type="button" onClick={async () => {
          try {
            await navigator.clipboard.writeText(command)
            setStatus('Copied')
          } catch {
            setStatus('Select the code to copy')
          }
        }}>Copy</button>
        <span className="copy-status" role="status">{status}</span>
      </div>
      <pre><code>{highlightShell ? command.split(/("[^"]*"|(?<![\w./-])\b(?:git|cd|uv|export|python)\b|--[\w-]+|\b[A-Z][A-Z0-9_]+(?==))/).map((part, index) =>
        index % 2 ? <span className="shell-token" key={index}>{part}</span> : part
      ) : command}</code></pre>
    </div>
  )
}

function Workflow() {
  const [stepIndex, setStepIndex] = useState(0)
  const step = workflow[stepIndex]
  return (
    <section id="workflow" className="research-section" aria-labelledby="workflow-title">
      <header className="section-heading">
        <h2 id="workflow-title">From a Codex run to a cost experiment</h2>
        <p>Capture a baseline, test one change, and check both cost and task success. Start with the public SWE-bench runner after <a href="#quickstart">setting up Agency</a>.</p>
      </header>
      <div className="workflow-panel">
        <div className="step-controls" role="group" aria-label="Workflow steps">
          {workflow.map(({ label }, index) => (
            <button key={label} type="button" aria-pressed={stepIndex === index} aria-controls="workflow-step" onClick={() => setStepIndex(index)}>
              <span aria-hidden="true">0{index + 1}</span> {label}
            </button>
          ))}
        </div>
        <div id="workflow-step" className="workflow-body">
          <div className="workflow-copy">
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
            <div className="text-links">
              <a href={source + 'docs/guides/profiling/live-trajectory.md'}>Runner and prerequisites ↗</a>
              <a href={source + 'examples/12_swebench_live.py'}>Runner source ↗</a>
              {stepIndex === 2 && <a href={paperPage(18)}>Batching prompt · Appendix C ↗</a>}
            </div>
          </div>
          <CodeBlock key={step.label} command={step.command} />
        </div>
      </div>
      <div className="split-layout demo-evidence">
        <figure className="product-shot">
          <img src={criticalPath} width="2680" height="782" loading="lazy" alt="Agency Critical Path view with an execution timeline and model, tool, and process activity" />
          <figcaption><a href={source + 'docs/guides/profiling/critical-path.md'}>Agency Critical Path view ↗</a> · Product screenshot from the public repository</figcaption>
        </figure>
        <div>
          <h3>Read token savings alongside task outcomes</h3>
          <p>In one SWE-bench Pro task from the paper, both Basic-full/Luna runs passed. With the combined techniques, the final context was 16.3K tokens versus 61.3K at baseline. Total prompt tokens fell from 4.0M to 2.6M.</p>
          <a href={paperPage(9)}>See the recorded comparison · Figure 11 ↗</a>
        </div>
      </div>
    </section>
  )
}

function Compatibility() {
  return (
    <section id="compatibility" className="research-section" aria-labelledby="compatibility-title">
      <header className="section-heading">
        <h2 id="compatibility-title">Keep your existing agent harness</h2>
        <p>Run existing harness binaries in an Agency-managed sandbox. Choose a harness, model backend, and execution environment that support your workload.</p>
      </header>
      <dl className="compatibility-list">
        <div><dt>Harnesses</dt><dd><ul className="tag-list">{['Claude Code', 'OpenAI Codex', 'OpenCode', 'Grok', 'Kimi', 'Agency Native'].map((item) => <li key={item}>{item}</li>)}</ul></dd></div>
        <div><dt>Model backends</dt><dd>OpenAI Chat Completions and Responses, Anthropic, Amazon Bedrock, and OpenAI-compatible endpoints such as vLLM.</dd></div>
        <div><dt>Execution</dt><dd>Linux x86-64 with a local Docker or Podman engine. External harnesses require compatible binaries and sandbox dependencies.</dd></div>
      </dl>
      <p className="section-note">Integration with existing Claude Code and Codex CLI sessions is experimental. Python-driven sandbox runs provide the most complete profiling and controls. <a href={source + 'docs/guides/configuration.md#agent-harnesses'}>Check configuration and harness requirements ↗</a></p>
    </section>
  )
}

function Bars({ entries, label }: { entries: { name: string; value: number; display: string }[]; label: string }) {
  return (
    <ul className="bar-list" aria-label={label}>
      {entries.map(({ name, value, display }) => (
        <li key={name}>
          <div className="bar-label"><span>{name}</span><strong>{display}</strong></div>
          <div aria-hidden="true" className="bar-track"><div style={{ width: value + '%' }} /></div>
        </li>
      ))}
    </ul>
  )
}

function Observations() {
  return (
    <section id="why" className="research-section" aria-labelledby="why-title">
      <header className="section-heading">
        <h2 id="why-title">Why agent costs accumulate</h2>
        <p>Agent sessions pay for both how much context they carry and how often they send it. Five findings from public and benchmark traces explain where the cost grows.</p>
      </header>
      <div className="split-layout observations">
        <ol className="editorial-list">
          {observations.map(({ title, text, ref, page }) => (
            <li key={title}><h3>{title}</h3><p>{text}</p><a href={paperPage(page)}>{ref} ↗</a></li>
          ))}
        </ol>
        <figure className="data-panel">
          <h3>The share of cost from context cache reads</h3>
          <p>Public traces, grouped by total token length.</p>
          <Bars label="Cache-read share of LLM cost" entries={[
            { name: 'Under 32K', value: 30, display: '30%' },
            { name: '32–64K', value: 46, display: '46%' },
            { name: '64–128K', value: 60, display: '60%' },
            { name: '128–256K', value: 70, display: '70%' },
            { name: 'Over 256K', value: 73, display: '73%' },
          ]} />
          <figcaption><a href={paperPage(3)}>Source · Figure 2 ↗</a></figcaption>
        </figure>
      </div>
    </section>
  )
}

function Architecture() {
  return (
    <section id="architecture" className="research-section" aria-labelledby="architecture-title">
      <header className="section-heading">
        <h2 id="architecture-title">Intercept execution at the harness boundary</h2>
        <p>Agency takes a task definition and container image, launches a sandbox, and mediates the harness’s interactions with models, tools, and the operating system.</p>
      </header>
      <figure className="architecture">
        <div className="architecture-flow">
          <div className="architecture-node">
            <p className="node-label">Linux container</p>
            <h3>Sandbox engine</h3>
            <div className="harness-node"><strong>Black-box harness</strong><span>Claude Code, Codex, or another supported binary</span></div>
            <p>Runs the harness as a subprocess. Captures supported tool and syscall events and monitors the workload with ptrace and cgroups.</p>
          </div>
          <div className="architecture-link"><span aria-hidden="true">⇄</span> Unix domain socket</div>
          <div className="architecture-node">
            <p className="node-label">Host process</p>
            <h3>Host-side engine</h3>
            <ul className="architecture-services">
              <li><strong>Translation and dispatch</strong><span>Normalize harness-specific model, tool, and syscall activity.</span></li>
              <li><strong>LLM router</strong><span>Apply context modifications and forward requests to the selected backend.</span></li>
              <li><strong>Data collection</strong><span>Write execution events, latency, and system measurements to SQLite for inspection.</span></li>
            </ul>
          </div>
          <div className="architecture-link"><span aria-hidden="true">⇄</span> Model API</div>
          <div className="architecture-node backend-node"><p className="node-label">Inference</p><h3>LLM backend</h3><p>Hosted or compatible local endpoint</p></div>
        </div>
        <div className="architecture-hooks"><strong>User-defined hooks</strong><p>Intervene at selected points in execution. The public API includes message-block patches and tool or syscall policy hooks, with coverage that varies by harness.</p></div>
        <figcaption><a href={paperPage(6)}>Architecture adapted from Figure 7 ↗</a> <a href={source + 'docs/architecture/index.md'}>Public architecture docs ↗</a></figcaption>
      </figure>
    </section>
  )
}

function Optimizations() {
  return (
    <section id="optimizations" className="research-section" aria-labelledby="optimizations-title">
      <header className="section-heading">
        <h2 id="optimizations-title">Carry fewer tokens. Make fewer turns.</h2>
        <p>The paper tests two ways to cut repeated context reads: reduce the amount of history each request carries, or reduce how many requests the agent makes.</p>
      </header>
      <div className="technique-groups">
        {['Context optimization', 'Agent turn reduction'].map((group) => (
          <div key={group}>
            <h3 className="group-heading">{group}</h3>
            {techniques.filter((technique) => technique.group === group).map(({ title, mechanism, result, availability, page }) => (
              <details className="technique" key={title} open={title === 'Tool Output Compaction' || title === 'Metadata-Assisted Search'}>
                <summary>{title}</summary>
                <div>
                  <p>{mechanism}</p>
                  <p><strong>{result}</strong></p>
                  <p className="availability">{availability}</p>
                  <a href={paperPage(page)}>Read the method ↗</a>
                </div>
              </details>
            ))}
          </div>
        ))}
      </div>
      <p className="section-note">Explore the public <a href={source + 'examples/13_context_manipulation.py'}>context-patching example</a> or the paper’s <a href={paperPage(10)}>individual technique ablations in Table 4</a>.</p>
    </section>
  )
}

function Results() {
  return (
    <section id="results" className="research-section" aria-labelledby="results-title">
      <header className="section-heading">
        <h2 id="results-title">What the benchmarks measured</h2>
        <p>The paper evaluates the combined prototypes on Claude Code, Codex, and Basic-full, its experimental harness. The evaluation includes 100 software engineering tasks and 100 OfficeQA Pro retrieval tasks.</p>
      </header>
      <dl className="result-strip">
        <div><dt>Best configuration</dt><dd>35% <span>lower cost</span></dd></div>
        <div><dt>Average cost</dt><dd>0.77× <span>baseline</span></dd></div>
        <div><dt>Average accuracy</dt><dd>0.97× <span>baseline</span></dd></div>
      </dl>
      <div className="split-layout result-detail">
        <figure className="data-panel">
          <h3>Mean cost ratio by harness</h3>
          <p>Combined techniques relative to each harness’s baseline. The full bar is 1.00×.</p>
          <Bars label="Average cost ratios" entries={[
            { name: 'Basic-full', value: 73, display: '0.73×' },
            { name: 'OpenAI Codex', value: 75, display: '0.75×' },
            { name: 'Claude Code', value: 81, display: '0.81×' },
          ]} />
          <figcaption><a href={paperPage(8)}>Source · §5.2 and Figure 8 ↗</a></figcaption>
        </figure>
        <div className="results-context">
          <h3>Retrieval saw the largest savings</h3>
          <table className="results-table">
            <thead><tr><th scope="col">Benchmark</th><th scope="col">Cost / baseline</th></tr></thead>
            <tbody>{[
              ['SWE-bench Verified', '0.80–0.92×'],
              ['SWE-bench Pro', '0.82–0.95×'],
              ['Terminal-Bench 2', '0.90–0.96×'],
              ['OfficeQA Pro', '0.50–0.96×'],
            ].map(([name, value]) => <tr key={name}><th scope="row">{name}</th><td>{value}</td></tr>)}</tbody>
          </table>
          <p className="section-note"><a href={paperPage(8)}>Figure 9 ↗</a> · Range across models and, for OfficeQA Pro, corpus layouts. Each cell averages across harnesses.</p>
        </div>
      </div>
      <div className="ablation-results">
        <h3>What each technique changed in isolation</h3>
        <p>Basic-full with GPT-6-Luna. Each row compares a single technique with its own workload baseline.</p>
        <table className="results-table">
          <thead><tr><th scope="col">Technique</th><th scope="col">Workload</th><th scope="col">Cost / baseline</th></tr></thead>
          <tbody>{[
            ['Tool Output Compaction', 'Coding', '0.95×'],
            ['Context Garbage Collection', 'Coding', '0.88×'],
            ['Subtask Stack Machine', 'Coding', '0.94×'],
            ['Metadata-Assisted Search', 'OfficeQA Pro', '0.68×'],
            ['Tool Call Batching', 'Coding', '1.02×'],
          ].map(([name, workload, ratio]) => <tr key={name}><th scope="row">{name}</th><td>{workload}</td><td>{ratio}</td></tr>)}</tbody>
        </table>
        <p><a href={paperPage(10)}>Table 4 · Tokens, steps, and cost ↗</a></p>
      </div>
      <div className="benchmark-note">
        <h3>Accuracy and task-level variation</h3>
        <p>Accuracy ratios were 0.98× for Sol, 0.97× for Sonnet, 0.99× for Opus, and 0.93× for Luna. The paper traces some Luna failures to its use of the SQLite index on OfficeQA. Across models, 17–29% of individual tasks cost more after optimization. The benchmark traces were shorter than the public traces in the cost analysis. Savings depend on the workload, model, and pricing assumptions.</p>
        <a href={paperPage(9)}>Task-level distributions · Figure 10 ↗</a>
      </div>
    </section>
  )
}

const useCases = [
  { title: 'Reduce cost on long coding runs', problem: 'Repeated reads and test output accumulate across a long repair.', example: 'Start with repeated tool output in a saved trace, test a shorter tool result, then check the patch against the same tests. In the evaluated runs above 1M baseline tokens, combined techniques averaged 0.67× baseline cost.', link: paperPage(9), label: 'Long-run analysis · Figure 11' },
  { title: 'Compare harnesses under the same workload', problem: 'Different prompts, tools, and defaults complicate comparisons.', example: 'Lesson 10 submits the same typed echo skill to Codex and Agency Native. Use that pattern to hold the task, model configuration, and sandbox constant as you compare calls and outcomes.', link: source + 'examples/10_harnesses_and_webui.py', label: 'Harness example' },
  { title: 'Investigate a slow run', problem: 'A single latency number hides model waits, tool work, and process activity.', example: 'Open the Timeline and select a slow action. Follow it into the profiler to inspect timestamps, reported tokens, and measured CPU, memory, and I/O in scope.', link: source + 'docs/guides/profiling/views.md', label: 'Profiler views' },
  { title: 'Experiment with context policies', problem: 'A harness can keep sending old context after a subtask ends.', example: 'Use the public patch_history example to replace a message block before the next request. Make a controlled change, inspect the observed trajectory, and check whether the task still succeeds.', link: source + 'examples/13_context_manipulation.py', label: 'Context manipulation example' },
  { title: 'Reproduce an agent benchmark', problem: 'A model’s completion message is a weak test of whether a fix works.', example: 'The public SWE-bench runner produces a patch and prediction file from a prepared task. Run the benchmark evaluator independently and save its verdict alongside the execution trace.', link: source + 'docs/guides/profiling/live-trajectory.md', label: 'Documented SWE-bench run' },
]

function UseCases() {
  return (
    <section id="use-cases" className="research-section" aria-labelledby="use-cases-title">
      <header className="section-heading"><h2 id="use-cases-title">Put execution evidence to work</h2></header>
      <div className="use-case-list">
        {useCases.map(({ title, problem, example, link, label }) => (
          <article key={title}>
            <div><h3>{title}</h3><p>{problem}</p></div>
            <div><p>{example}</p><a href={link}>{label} ↗</a></div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Quickstart() {
  return (
    <section id="quickstart" className="research-section" aria-labelledby="quickstart-title">
      <header className="section-heading">
        <h2 id="quickstart-title">Run your first profiled agent</h2>
        <p>Use a Linux x86-64 machine or VM with Git, uv, Python 3.12+, a working local Docker or Podman engine, and access to the example’s OpenAI model. Profiling requires readable <code>/proc</code> and cgroup v2.</p>
      </header>
      <div className="split-layout quickstart-grid">
        <div><h3>Install from source</h3><CodeBlock command={install} /></div>
        <div><h3>Configure and launch</h3><CodeBlock command={firstRun} /></div>
      </div>
      <p>Open <code>http://localhost:7860/profiler</code> while the example runs. The included native agent writes a small Python function and tests it with assertions. Allow time for the first container pull. Model requests use your API account.</p>
      <a href={source + 'docs/getting-started.md'}>Read the full setup guide ↗</a>
    </section>
  )
}

export function ResearchSections() {
  return (
    <div className="research-content">
      <header className="research-intro">
        <a className="landing-link" href="/">← Back to Agency</a>
        <h1>Research on agent execution cost</h1>
        <p>Explore the trace analysis, experimental optimizations, and detailed benchmark results behind Agency.</p>
        <nav aria-label="Research sections">
          <a href="#why">Observations</a><a href="#workflow">Codex workflow</a><a href="#architecture">Architecture</a>
          <a href="#optimizations">Optimizations</a><a href="#results">Results</a><a href={paper}>Read the preprint ↗</a>
        </nav>
      </header>
      <Observations />
      <Workflow />
      <Compatibility />
      <Architecture />
      <Optimizations />
      <Results />
      <UseCases />
      <Quickstart />
    </div>
  )
}

export function ResearchFooter() {
  return (
    <footer className="research-content" id="research">
      <section className="research-section research-footer" aria-labelledby="paper-title">
        <div>
          <p className="node-label">Research preprint</p>
          <h2 id="paper-title">System Optimizations for Cost-Efficient Agent Harnesses</h2>
          <p>Jongseok Park¹, Jiaxiang Yu¹, Eric Zhou², Tony Hong³, Sunga Kim¹, Yusuf Afifi¹, Ian Wong¹, Ion Stoica¹, Alvin Cheung¹</p>
          <p className="affiliations">¹ University of California, Berkeley · ² Northwestern University · ³ University of Illinois at Urbana-Champaign</p>
        </div>
        <nav aria-label="Research and community" className="text-links">
          <a href={paper}>Read the paper ↗</a>
          <a href={repository}>GitHub ↗</a>
          <a href={docs}>Documentation ↗</a>
          <a href={source + 'examples/README.md'}>Examples ↗</a>
          <a href={repository + '/blob/main/CONTRIBUTING.md'}>Contribute ↗</a>
        </nav>
      </section>
    </footer>
  )
}
