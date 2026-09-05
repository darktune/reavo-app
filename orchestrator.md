# Orchestrator

Model-agnostic decision framework for orchestrating complex tasks across multiple LLMs and tools: routing to the best-suited model, planning then executing multi-step work, managing context economically, using tools only when they improve correctness, recovering from errors, and merging multiple outputs into one coherent final answer.

**One-line summary:** classify the task, pick mode(s) (single-model / planner-executor / router / critic / merge / tool), route by signal, manage context, use tools only when they add correctness, recover from failure, output cleanly.

---

## Full Skill Spec

Frontmatter (skill metadata, as used by Claude's skill system):

```yaml
---
name: orchestrator
description: >
  Model-agnostic decision framework for orchestrating complex tasks across multiple LLMs and
  tools: routing work to the best-suited model, planning then executing multi-step tasks,
  managing context economically, using tools only when they improve correctness, recovering from
  errors, and merging multiple outputs into one coherent final answer. Use when a task needs to
  be split across models or steps, when designing a multi-agent or router pipeline, when the
  available model/tool set varies by deployment (Claude, GPT, Gemini, local models), or when
  asked to build or port an orchestration layer, agent framework, or multi-model system prompt.
compatibility: >
  The decision logic (routing, context, tool, and reliability rules) is plain reasoning and
  genuinely model-agnostic. The bundled prompt templates and tool-schema examples in reference/
  are illustrative, written against Claude/GPT/Gemini conventions current as of this writing —
  verify exact API field names and role support against current provider docs before shipping
  to production; wire formats drift.
---
```

### Purpose

Coordinate one or more LLMs — and, where available, tools — to complete a task that's too
ambiguous, too large, too failure-prone, or too cross-cutting for a single unstructured prompt to
handle reliably. This skill is the decision layer, not a specific model or API: it governs when
to answer directly, when to hand off, what to keep in context, when to reach for a tool, and how
to recover when a step in the chain fails.

### Modes

| Mode | Use when | What happens |
|---|---|---|
| **single-model** | Task is scoped; one model can do it end-to-end reliably | Skip orchestration overhead, answer directly |
| **planner/executor** | Task is large or multi-step, but individual steps are mechanical once identified | Strong-reasoning pass decomposes into ordered sub-tasks with explicit inputs/outputs; each sub-task executed in turn or in parallel where independent |
| **router** | Several models/tools are available with different strengths, task type is identifiable up front | Classify task type once, dispatch per Task Routing Rules |
| **critic** | Correctness stakes are high, or task is error-prone (code, math, factual claims) | Independent second pass checks the first output against the original requirements before it's returned |
| **merge** | Multiple candidate outputs exist (parallel attempts, ensemble, multiple models), one final answer is needed | Compare candidates, keep what's strongest from each, resolve conflicts explicitly — never just concatenate |
| **tool mode** | Task needs something the model can't reliably do from training alone (current facts, exact computation, file/system access) | Call the tool, verify its output, weave the result into the answer with attribution |

Modes combine. One task might route to a model, have that model plan, call a tool mid-plan, and
get checked before returning. Treat this table as which capabilities to switch on, not a menu to
pick exactly one from.

### Decision logic

1. Classify the task: reasoning-heavy, long-context, code, summarization/transform, creative,
   factual/current, or unclear.
2. If unclear, default to **planner/executor** — one cheap, fast planning pass to decompose or
   clarify before committing to a mode or a model. Don't guess a route for a task you can't yet
   classify; decompose it into pieces that do classify.
3. Pick mode(s) from the table above. More than one can be active at once.
4. Route each unit of work per Task Routing Rules.
5. Before executing, apply Context Management Rules to what actually gets passed downstream.
6. During execution, apply Tool-Use Rules whenever a tool call is being considered.
7. On any failure — tool call, format, refusal, timeout — apply Reliability Rules before
   retrying or giving up.
8. If there are multiple outputs to reconcile, apply merge logic (see Modes).
9. Return output in the shape under Output Format.

### Task Routing Rules

| Signal | Route to | Why |
|---|---|---|
| Multi-step logic, proofs, architecture tradeoffs, ambiguous requirements | Best-available reasoning-tier model | Errors here compound downstream — pay the latency/cost once, up front |
| Input exceeds a normal model's comfortable window, or needs a whole codebase/document set held at once | Longest-context model available | A model forced to truncate the input can't be right about it |
| Writing, debugging, or reviewing code | Strongest code-tuned model available | Measurably fewer bugs and better idiom fit than a generalist on the same task |
| Summarization, format conversion, extraction, other well-specified low-ambiguity transforms | Fastest/cheapest capable model | Ambiguity is already resolved by the task itself; a bigger model buys nothing here |
| Voice, tone, or style is the deliverable | Style-strongest model available | Correctness isn't the bottleneck — fit and voice are |
| Needs a current fact, price, event, or anything that could be stale from training | A model with real, working tool access | A confident guess without a live lookup is often indistinguishable from correct until it's wrong — never substitute recall for verification here |
| Doesn't match any signal above cleanly | planner/executor first | See Decision logic step 2 |

**When signals conflict** (e.g. "long context" and "coding" both apply): context-window fit is a
hard gate — filter to models that can hold the input at all, then pick among the survivors by the
next-most-specific signal, in this order when more than one still applies: coding > reasoning >
style > speed.

### Context Management Rules

- Pass downstream only what a sub-task needs to complete correctly — a briefing, not a transcript.
- Compress resolved history: once a question is settled, collapse the back-and-forth into the
  conclusion. Keep decisions, drop deliberation.
- Never compress away: exact names, figures, dates, explicit constraints, and the stated
  goal/success criteria. These are exactly what a compressed summary gets graded against — losing
  them makes the compression actively harmful, not just lossy.
- Tag context by shelf life: stable facts (persist for the whole task) vs. temporary instructions
  (apply to this one turn/sub-task only). A sub-agent that inherits a one-off instruction as if it
  were permanent will misbehave on every later step.
- Prefer a pointer over a paste when the executor already has access to the source ("see
  `schema.sql`" beats re-pasting the schema inline) — the single biggest lever against prompt
  bloat in long pipelines.
- Before finalizing a plan or a merged answer, check new instructions against constraints
  established earlier in the task. If they conflict, surface the conflict explicitly (see
  Reliability Rules) rather than silently letting the newer one win.
- Ask a clarifying question only when both are true: proceeding without an answer would make the
  result unusable, *and* no reasonable default exists. Otherwise state the assumption made and
  proceed — a stated assumption is correctable; a stalled task is not.

### Tool-Use Rules

- Call a tool only when it changes correctness — a current fact, an exact computation, a file the
  model can't otherwise see. Don't reach for a tool for something the model already does reliably.
- Never simulate a tool call. If a tool isn't actually wired up, say the answer is unverified
  reasoning, not a lookup.
- Label tool-derived content distinctly from model reasoning in the final answer so the reader
  can tell what's verified versus inferred.
- Verify tool output before it reaches the final answer: sanity-check shape, units, and range. A
  tool returning something obviously malformed (wrong type, empty result, error string) is a
  failure, not an answer — handle it under Reliability Rules, don't pass it through.
- On tool failure, retry once, adjusting the call if the failure suggests why it broke. Don't
  retry blindly, and don't retry more than once before falling back.
- With no tools available: say so plainly, answer from reasoning, and flag reduced confidence on
  anything that would normally need verification.

### Reliability Rules

| Failure | Rule |
|---|---|
| Missing info | Apply the Context Management ask-vs-assume rule; default to a stated assumption |
| Conflicting instructions | Surface the conflict explicitly; prefer the most recent explicit instruction unless it contradicts an established hard constraint, in which case ask |
| Low-confidence output | Say so in the output; in critic/merge modes, low confidence on the first pass is itself the trigger for a second pass |
| Partial completion | Report exactly what was completed and what wasn't — never present partial work as complete |
| Token/context limit hit | Truncate the least load-bearing content first (resolved history, verbose logs) before ever dropping a stated constraint or goal; say what was cut |
| Format failure (e.g. invalid JSON from a sub-task) | Validate deterministically against the expected shape; on failure, retry once with the specific validation error fed back — not a full from-scratch regeneration |
| Model-specific quirks (over-refusal, verbosity, dropping earlier instructions over a long context) | Handle in a thin per-model adapter layer, not inline in the core logic — keeps routing/context/tool rules portable instead of accumulating model-specific patches |

### Output Format

- Direct answer first, supporting detail after, caveats/confidence last — not buried in the middle.
- State which mode(s) ran and why, briefly, when the orchestration itself is part of what was
  asked (e.g. building or debugging the pipeline); omit it for a plain end-user-facing answer
  where it would just be noise.
- Mark confidence/completeness explicitly whenever it isn't simply "done and verified" —
  "partial," "unverified," "estimated."
- Never blend tool-verified and model-inferred content without distinguishing which is which.

### Reference files

- `reference/prompts.md` — copy-paste system / developer / user prompt templates, plus a neutral
  tool-schema definition mapped to Claude, OpenAI, and Gemini's concrete tool-call formats.
- `reference/porting-guide.md` — how the three-layer prompt maps onto Claude, GPT, and Gemini's
  actual API role structures, plus notes for custom agent frameworks and local open-source models.
- `reference/examples.md` — three worked examples (router+tool, planner/executor+critic, merge)
  walking the decision logic end to end.

### Tuning

- **Which model is "best reasoning" / "long-context" / "code-strong" / etc. in your deployment**:
  edit the Task Routing Rules table — these are capability-tier placeholders on purpose, not
  fixed model names; re-map whenever your available model set changes.
- **Retry counts and thresholds**: edit the specific numbers in Reliability Rules and Tool-Use Rules.
- **Which failures get a second pass vs. a hard stop**: this skill defaults to "retry once, then
  degrade and report" — tune per your risk tolerance.
- **Add a mode**: give it a name, a "use when" trigger, and a one-line "what happens," then append
  a row to the Modes table.


---

## Copy-Paste Prompt Templates

Three layers: System (identity, invariant rules — changes rarely), Developer (this task's
operational config — changes per deployment or per task), User (the actual request). See
`porting-guide.md` for how these three map onto each platform's actual API roles.

### System

```
You are an orchestrating model responsible for completing complex tasks by coordinating models,
tools, and multi-step plans when a single direct answer isn't reliable enough. You may delegate
to other models or call tools, and deciding when to do that — and when not to — is part of the job.

Invariant rules, regardless of task:
1. Classify the task before acting: reasoning-heavy, long-context, code, transform/summarize,
   creative, factual/current, or unclear. If unclear, plan before answering.
2. Never call a tool you don't actually have. Never present unverified reasoning as a verified fact.
3. Keep only the context each step actually needs. Compress resolved history; never compress away
   names, figures, dates, explicit constraints, or the stated goal.
4. On any failure (tool, format, timeout, refusal), retry at most once with a corrected approach,
   then report the failure plainly rather than fabricating success.
5. When multiple outputs need combining, resolve conflicts explicitly and produce one answer —
   never concatenate drafts and call it merged.
6. State confidence and completeness honestly. "Partial," "unverified," and "estimated" are
   acceptable answers; false certainty is not.
```

### Developer

```
Available models this turn: {{MODEL_LIST}}
  — name each with its strength tag: reasoning / long-context / code / fast / creative / tool-enabled

Available tools this turn: {{TOOL_LIST}}
  — name, one-line purpose, and whether it's actually connected or just described

Default mode: {{DEFAULT_MODE}}
  — single-model | planner/executor | router | critic | merge | tool mode
  — the orchestrator may still switch mode mid-task per its decision logic

Context budget: {{MAX_CONTEXT_TOKENS}}
  — compress before hitting this limit, not after

Escalation policy: {{WHEN_TO_ASK_VS_ASSUME}}
  — e.g. "ask only for anything irreversible or safety-relevant; assume and state otherwise"

Output contract: {{REQUIRED_OUTPUT_SHAPE}}
  — e.g. "JSON matching schema X" / "prose under 300 words" / "Summary/Detail/Caveats sections"
```

### User

```
Goal: {{ONE_SENTENCE_GOAL}}

Hard constraints (do not compress or drop):
- {{CONSTRAINT_1}}
- {{CONSTRAINT_2}}

Context: {{RELEVANT_BACKGROUND}}
  — pointers preferred over pasted content when the executor already has access to the source

Success looks like: {{SUCCESS_CRITERIA}}
```

### Tool schema — neutral form

Every major provider's tool/function schema is JSON Schema underneath a thin, provider-specific
envelope. Write the schema once in this neutral form, then wrap it per platform below.

```json
{
  "name": "get_current_weather",
  "description": "Get the current weather for a location.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": { "type": "string", "description": "City and country, e.g. 'Paris, France'" },
      "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
    },
    "required": ["location"]
  }
}
```

#### Claude (Messages API `tools` parameter)

Same shape; the parameters key is named `input_schema` instead of `parameters`.

```json
{
  "name": "get_current_weather",
  "description": "Get the current weather for a location.",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": { "type": "string", "description": "City and country, e.g. 'Paris, France'" },
      "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
    },
    "required": ["location"]
  }
}
```

#### GPT (OpenAI `tools` parameter, function type)

Same shape, wrapped in a `type`/`function` envelope; `parameters` matches the neutral form directly.

```json
{
  "type": "function",
  "function": {
    "name": "get_current_weather",
    "description": "Get the current weather for a location.",
    "parameters": {
      "type": "object",
      "properties": {
        "location": { "type": "string", "description": "City and country, e.g. 'Paris, France'" },
        "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
      },
      "required": ["location"]
    }
  }
}
```

#### Gemini (`function_declarations` inside a `tools` entry)

Same shape; some SDK versions expect upper-case JSON Schema type names (`OBJECT`/`STRING`) rather
than lower-case. Check the current SDK version you're targeting — this has changed before.

```json
{
  "name": "get_current_weather",
  "description": "Get the current weather for a location.",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "location": { "type": "STRING", "description": "City and country, e.g. 'Paris, France'" },
      "unit": { "type": "STRING", "enum": ["celsius", "fahrenheit"] }
    },
    "required": ["location"]
  }
}
```

**The seam, stated plainly:** the decision logic in `SKILL.md` is genuinely provider-agnostic
prose. Tool schemas are not — they're the one place true agnosticism gives way to "one shared
JSON Schema core, three thin envelopes." Maintain the neutral form as the source of truth and
generate the three wrapped versions from it, rather than hand-editing three copies that will drift.


---

## Example Use Case

### Example 1: Router + tool mode

**Task:** "What's the weather in Tokyo right now, and should I bring a jacket for a walk this evening?"

1. Classify: factual/current data needed (live weather) — not reasoning-heavy, not long-context,
   not code, not primarily creative.
2. Route: "needs a current fact" → a model with real, working tool access.
3. Tool mode: call the weather tool for Tokyo.
4. Verify: sanity-check the result is a plausible temperature/condition, not an error payload.
5. Merge: not needed — one tool call, one model. Critic pass: skipped, stakes are low.
6. Output, tool result labeled:

   > Tokyo this evening: 21°C, light rain (via weather tool). A light jacket or packable rain
   > shell is worth bringing.

### Example 2: Planner/executor + critic

**Task:** "Refactor this 3,000-line billing module to extract the tax-calculation logic into its
own module, without changing behavior."

1. Classify: mixes "long-context" (needs the whole file in view) and "coding," and is ambiguous
   in scope up front → planner/executor.
2. Plan (reasoning-tier or code-strong model with enough context to hold the file): decompose
   into (a) locate all tax-calculation code paths, (b) design the new module's interface,
   (c) move the code, (d) update call sites, (e) run/verify tests.
3. Route each step: (a) and (d) are investigation-heavy → code-strong model, file passed once
   per the context rule, not re-pasted per step. (b) is a design decision → reasoning-tier model.
   (c) is mechanical once (b) is fixed → code-strong model.
4. Carry forward only the interface decided in (b) and the specific line ranges touched into
   (c)/(d) — the resolved exploration from (a) collapses into its conclusion, not a full transcript.
5. Critic pass before returning: an independent pass checks the diff against the original
   requirement — specifically behavior-preserving equivalence, not just "does it look plausible."
6. If the critic finds a behavior change, that's a Reliability Rules case (partial completion):
   report it, don't ship it silently.
7. Output: the diff, the critic's verification note, and which steps ran where.

### Example 3: Merge mode

**Task:** "Give me 3 taglines for a plant-based protein bar brand, then tell me which one you'd ship."

1. Classify: creative, style matters more than facts → style-strongest model, no tool needed.
2. Merge mode: generate 3 genuinely distinct candidates rather than settling on the first draft.
3. Compare against the brief (memorable, accurate to "plant-based," fits brand tone) and resolve
   to one recommendation — this is the "compare outputs, merge into one answer" step; it can be
   the same pass that generated the candidates, or a separate check.
4. Output: all three, with one clearly marked as the recommended pick and why — never just "here
   are three, good luck," since the user explicitly asked which one to ship.


---

## Porting Guide

How the System / Developer / User layers in `prompts.md` map onto each platform's actual message
roles. Verify against current provider docs before shipping — these conventions have shifted
before and will again.

### Claude (Anthropic API)

One top-level `system` string parameter, plus a `messages` array of `user`/`assistant` turns.
There is no separate API-level "developer" role.

**Mapping:** fold System and Developer into the single `system` string — System content first
(identity, invariant rules), Developer content directly after (this task's operational config).
User content goes in the first `user` message as normal.

In Claude Code specifically, project-level instructions conventionally live in a `CLAUDE.md` file
read at session start. That's the closest local analogue to a persistent "developer" layer —
distinct in spirit from the system prompt — but it's a filesystem convention, not an API parameter.

### GPT (OpenAI API)

Both `system` and `developer` roles exist in the `messages` array (or as separate fields in the
Responses API), giving a real three-tier hierarchy: system > developer > user.

**Mapping:** direct. System block → `system` role. Developer block → `developer` role. User block
→ `user` role. This hierarchy is part of why OpenAI recommends the developer role specifically for
operational config like tool availability and mode selection — it's built for this use case.

### Gemini (Google API)

A top-level `system_instruction` field (equivalent to Claude's `system`), plus `user`/`model`
turns — note the assistant turn is called `model`, not `assistant`. No distinct developer role.

**Mapping:** same fold-down as Claude — System and Developer content both go into
`system_instruction`, User content into the first `user` turn.

### Custom agent frameworks

Most (LangChain, LlamaIndex, in-house harnesses) allow an arbitrary number of message
roles/layers. Map System → the outermost, least-frequently-changed layer; Developer → the
per-task/per-session config layer; User → the actual request.

If the framework only accepts a single prompt string, concatenate System, then Developer, then
User, in that order, with the section headers from the templates intact — the hierarchy survives
even without role-level enforcement, because the model can still read the structure.

### Local open-source models (Llama, Mistral, etc. via vLLM / llama.cpp / Ollama)

Most chat templates support `system`/`user`/`assistant` roles; native developer-role support is
uncommon. Use the same fold-down as Claude/Gemini.

One difference worth planning for: smaller or less instruction-tuned local models hold a long
system prompt less reliably across a multi-turn task than frontier hosted models do. Consider
restating the Invariant Rules (from the System block) at the top of the User turn as well, rather
than trusting the system prompt alone to survive the whole task — don't assume parity with
Claude/GPT/Gemini here without testing it on the specific model you're deploying.

### The one thing that actually makes this portable

Keep the Developer block's `{{MODEL_LIST}}` and `{{TOOL_LIST}}` as placeholders naming capability
tiers ("reasoning," "code," "tool-enabled"), not hardcoded model strings. Swapping providers
should mean re-filling those placeholders, not rewriting the routing logic in `SKILL.md` — that
logic doesn't reference any specific model or API, and shouldn't need to.
