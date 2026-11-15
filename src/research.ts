export const repository = 'https://github.com/agency-project/agency'
export const docs = 'https://agency-project.github.io/Agency/'
export const source = repository + '/blob/ac43098beb3496d169679f440a7cf4308acb85bd/'
export const paper = 'https://arxiv.org/abs/2611.12122'
export const paperPage = (page: number) => 'https://arxiv.org/pdf/2611.12122#page=' + page

export const install = `git clone https://github.com/agency-project/agency.git
cd agency
uv sync --locked --python 3.12`

export const firstRun = `export OPENAI_API_KEY="your-api-key"
export OPENAI_MODEL="gpt-6-luna"

AGENCY_PROFILE=1 AGENCY_PROFILE_SCOPE=workload \\
  uv run python examples/quickstart.py --webui`

export const baseline = `uv run agency install-harnesses codex
uv run python examples/12_swebench_live.py \\
  --task-file /path/to/task.json \\
  --env-file /path/to/.env \\
  --run-dir /path/to/baseline \\
  --image agency/profiler-swebench-requests-1963:20261002 \\
  --model gpt-6-luna`

export const variant = baseline.split('\n').slice(1).join('\n').replace('/path/to/baseline', '/path/to/batched')

export const viewer = `uv run python -m agency.observability.agwebui.server \\
  --run-dir /path/to/baseline/logs --port 7865`

export const observations = [
  { title: 'Cached context still costs money', text: 'Every model turn reads prior context again. In the public traces, cache reads grew from 30% of LLM cost in the shortest token bucket to 73% in the longest.', ref: '§3.2 · Figure 2', page: 3 },
  { title: 'Tool calls add model turns', text: 'A cheap shell operation can trigger an expensive context read. Across trace buckets with similar token counts, runs with more tool calls cost 1.6× to 26× as much.', ref: '§3.3 · Figure 3', page: 4 },
  { title: 'Most tool output goes unused', text: 'Agents later referenced 27% of tool-output tokens in analyzed benchmark traces. File reads were only slightly higher, at 29%.', ref: '§3.4 · Figure 4', page: 4 },
  { title: 'Finding files takes turns', text: 'Filesystem searches accounted for about 43% of turns and 28% of cost across benchmark traces. In OfficeQA Pro, deeper trees and opaque file names increased search work.', ref: '§3.5 · Figure 5', page: 5 },
  { title: 'Independent subtasks share a history', text: 'A linear session repeatedly carries completed side work. In a retrospective replay, pruning unrelated subtasks saved 33% of input tokens and 30% of modeled cost for sessions above 100K context tokens.', ref: '§3.6 · Figure 6', page: 5 },
]

export const techniques = [
  {
    group: 'Context optimization', title: 'Tool Output Compaction',
    mechanism: 'Strip formatting and replace repeated lines with references before tool results enter the prompt. Each later turn reads fewer tokens and the already-cached prefix stays intact.',
    result: '14% average compaction in isolation (§4.2.1).',
    availability: 'Paper prototype. The public native harness has its own near-limit compaction mechanism.',
    page: 7,
  },
  {
    group: 'Context optimization', title: 'Context Garbage Collection',
    mechanism: 'Predict which old lines will be read again. Rewrite context only when expected future cache-read savings exceed the cost of rewriting the prefix and retrieving any information the agent needs again.',
    result: '47% fewer tokens per compaction in isolation at the tested 0.3 reuse threshold (§4.2.1).',
    availability: 'Paper prototype. The public patch_history API can replace or remove message blocks.',
    page: 7,
  },
  {
    group: 'Context optimization', title: 'Subtask Stack Machine',
    mechanism: 'Group turns into phases such as search, edit, and test. Replace closed segments with a small result summary so unrelated future turns carry less history.',
    result: '91% token reduction per compaction in isolation with six segments, firing about once every 20 turns (§4.2.1).',
    availability: 'Paper prototype. The evaluated phase classifier and stack policy have no documented public switch.',
    page: 7,
  },
  {
    group: 'Agent turn reduction', title: 'Metadata-Assisted Search',
    mechanism: 'Build a SQLite index of file paths and structural metadata offline. A lookup can jump to useful files or line ranges in place of several directory listings and searches.',
    result: 'Up to 80% fewer search calls in isolation on OfficeQA Pro. In the Table 4 ablation, cost was 0.68× baseline.',
    availability: 'Paper prototype. Appendix D describes the index and agent instructions.',
    page: 8,
  },
  {
    group: 'Agent turn reduction', title: 'Tool Call Batching',
    mechanism: 'Ask the model to issue independent calls in one response and keep dependent calls in later turns. This can reuse one context read across several tools.',
    result: 'Up to 30% fewer turns (§4.2.2). In the Luna coding ablation, steps fell from 32.0 to 26.0 while cost rose to 1.02× baseline (Table 4).',
    availability: 'Runnable as a prompt experiment. Appendix C gives the prompt used in the paper.',
    page: 18,
  },
]
