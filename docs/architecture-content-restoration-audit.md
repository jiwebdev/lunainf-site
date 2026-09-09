# Architecture prose restoration audit

Authoritative source: `e45dae8e876a8c0e204a1c28ca95b2bef14d0418:src/pages/architecture.astro`. Compared directly with current main (`8db89e0`) and the proposed page. Whitespace wrapping and HTML entity encoding are ignored when comparing visible prose.

## A. Restored verbatim

### Persistent cognition is a systems problem.

- Persistent cognition is a systems problem.
- LUNA is not one model and not one memory database. It is an attempt to build interacting cognitive infrastructure around inference so that history can remain causally relevant over time.
- Capability boundary: this page describes the accepted research architecture at a public level.
- A design document is never treated as proof of an active capability.

### From event to consequence to a different future.

- THE LONGITUDINAL LOOP
- From event to consequence to a different future.
- The central idea is simple: a present event should be able to leave effects that alter how a later event is perceived, remembered, valued, or acted on.
- World / input User interaction, tools, internal cognition, and eventually continuous sensory events.
- Appraisal What changed? How relevant, expected, consequential, controllable, or self-related is it?
- Activation Which memories, intentions, questions, or cognitive products become near the surface?
- Choice / action Foreground reasoning, contemplation, planning, speech, tools, waiting, or other action.
- Consequence Outcome, feedback, changed world state, and evidence that can affect what happens next.
- Continuity Persistent autobiographical state and provenance connect the loop across time.
- Development Some consequences may alter slower structures instead of surviving only as recallable episodes.
- Prospection Future events and unresolved commitments can remain active beyond the current interaction.
- Compute discipline Lightweight state and scheduling stay cheap; expensive inference is invoked only when cognition justifies it.

### The architecture is deliberately modular.

- MAJOR RESEARCH SYSTEMS
- The architecture is deliberately modular.
- Each mechanism owns a different causal role. The goal is not to ask a language model to narrate these processes, but to give them persistent state and explicit architectural boundaries where possible.
- {copy}
- **Memory & continuity**: Autobiographical history, provenance, salience, relationships, and continuity are treated as persistent system state rather than a transcript pasted into the next prompt.
- **Cognitive activation**: Relevant memories, goals, intentions, appraisals, and cognitive products compete for limited access to the foreground.
- **Associative cognition**: A memory or completed thought can itself become a cue, allowing cognition to make other cognition more available without requiring a new external prompt.
- **Appraisal & homeostasis**: Events can alter short- and middle-timescale operating conditions so later cognition occurs in a state shaped by what happened before.
- **Developmental plasticity**: The architecture separates remembering an event from the slower structural changes that consequential experience may leave behind.
- **Prospective cognition**: Expected events, unresolved threads, intentions, deadlines, and future opportunities can persist beyond the turn that created them.
- **Perception & world continuity**: Continuous sensors are intended to update a persistent world model in which stable conditions become quiet and violated expectations become meaningful.
- **Volition & motivational dynamics**: Requests, goals, preferences, commitments, consequences, and competing reasons can participate in action selection rather than collapsing directly into behavior.
- **Architectural self-model**: LUNA is designed to distinguish what the project intends, what the current runtime can actually do, and what remains unresolved.
- **ChronoForge**: Controlled timelines let researchers manipulate developmental conditions, then compare the histories that emerge: checkpoint, branch, live through consequences, compare, and return.

### The past becomes progressively available.

- PROGRESSIVE RECALL
- The past becomes progressively available.
- LUNA separates long-term storage from current cognitive availability. Detailed history can remain dormant, compact cues can keep selected recent or unresolved material easy to reach, multiple candidates can become near the surface, and only a very small amount crosses into foreground reasoning.
- Persistent memory, recent-life cueing, activation, bounded competition, and selected admission can shape what reaches inference. The Stack is therefore more than passive storage around a model.
- The active model reasons over the resulting foreground state. It does not need to own the entire persistent memory system or make every cognitive-state decision itself.
- The implemented Reverie workspace path can contribute zero or one eligible internally propagated memory to the foreground without a language-model call deciding admission. (Original clause retained as a standalone sentence; initial letter capitalized.)

### Retrieval is not development.

- ONE OF THE CORE DISTINCTIONS
- Retrieval is not development.
- A system may perfectly preserve an experience and still remain behaviorally identical to a version that never had it. LUNA treats storage, retrieval, causal use, and developmental integration as different measurements.
- Did the event enter durable autobiographical history?
- Can the event or its meaning become available again when relevant?
- Did available history actually alter current reasoning, attention, creation, or choice?
- Can consequences remain active even when the original episode is not consciously retrieved?

### Continuity is intended to survive the model.

- STACK & SLEEVE
- Continuity is intended to survive the model.
- LUNA uses a simple conceptual separation. The Stack is the persistent identity-and-continuity state: autobiographical history, durable dispositions, goals, relationships, intentions, provenance, and other longitudinal state. The Sleeve is the active computational substrate through which that state currently runs.
- The research objective is that changing provider, model, machine, or embodiment should not require recreating the persistent instance from a prompt. The inference model is therefore important, but it is not intended to be the whole identity of the system.
- Architecture before theatrical behavior.
- LUNA does not treat a model saying “I remember,” “I want,” or “I changed” as proof that the corresponding architecture exists. Claims about memory, motivation, self-modeling, or development are separated from fluent self-description and should ultimately be traceable to system state, history, and controlled experiments.
- That is why public material distinguishes implemented behavior, accepted architecture, observation, interpretation, and prediction rather than blending them into one marketing claim.

Existing unchanged headings and links are included above for completeness; comparison-card titles and measurement questions remain unchanged. The five bold distinctions in the final paragraph are restored. The current callout capitalization remains: "The Sleeve can change. The Stack persists."

## B. Restored with minimal current-truth edit

### Capability-boundary status sentence

**Old:** "Some foundations are operating today; other mechanisms are partial or still being built."

**Final:** "Current maturity is described as Working, Working + Growing, Experimental, or Architectural."

**Reason:** replace the old partial/building status framing with the reviewed visitor-facing maturity vocabulary. The surrounding architecture explanation and exact design-document principle are retained.

### Progressive Recall capability cutaway

**Old:** "Current capability cutaway: persistent memory and the Recent-Life Horizon are active; the broader Cognitive Activation Field remains partial; the implemented Reverie workspace path can contribute zero or one eligible internally propagated memory to the foreground without a language-model call deciding admission."

**Final:** "Current capability cutaway: persistent memory and the Recent-Life Horizon are Working. Cognitive Activation and Reverie are Working + Growing; their implemented paths remain bounded rather than claiming a finished theory of cognition. The implemented Reverie workspace path can contribute zero or one eligible internally propagated memory to the foreground without a language-model call deciding admission."

**Reason:** retain current main's reviewed Working / Working + Growing status and bounded-implementation explanation, then restore the original zero-or-one Reverie admission clause. No research card requires a capability edit.

## C. Intentionally not restored

None of the intentional conceptual content remains absent. The former hero's navigational eyebrow ("PUBLIC ARCHITECTURE OVERVIEW") and metadata description remain superseded by C2; the thesis moves from h1 to h2 beneath the accepted hero and Overview. These are presentation/metadata choices, not missing conceptual prose. Existing C2 visuals, code, canonical artifact, maturity legend, and static boundaries are unchanged.

## Validation and browser review

- `npm ci`: passed; reported three dependency vulnerabilities (one low, one high, one critical). Dependency files unchanged.
- `npm run validate`: passed: artifact validation, Astro check (31 files, zero errors/warnings/hints), build (15 pages), static boundary (23 files), internal links (298).
- `git diff --check`: passed.
- Current main has 46 subsystems, **59** relationships, and 8 families, rather than the brief's 57 relationships. Canonical artifact preserved unchanged.
- Headless Chrome smoke at 1440px and 390px: Overview, family selection, active/muted relationships, Explorer connections, search, family handoff, inspector positioning, and no page/section horizontal overflow passed.
- Keyboard focus/Space/Escape, desktop hover, no-JavaScript directory (46 systems), and no browser errors passed.
- Five stages, four rails, ten conceptual cards and unique h1/h2 headings verified. Restored section screenshots reviewed at desktop and 390px. Existing responsive styles reused.
- Audit comparison confirms every original heading/paragraph (except the replaced navigational eyebrow) and all ten original system title/body pairs are present; status changes are exhaustively recorded in B.
