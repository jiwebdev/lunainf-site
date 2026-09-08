# Architecture overview review

The architecture page now presents an organic family overview above the preserved full explorer. Both use public-architecture.json, which is unchanged.

## Representatives and counts

| Family | Canonical count | Overview representatives | Additional systems |
| --- | ---: | --- | ---: |
| Memory | 4 | Working Memory; Recent Experience; Recent-Life Horizon; Long-Term Memory | 0 |
| Cognition | 13 | Foreground Cognition; Cognitive Activation Field; Cognitive Scheduler; Inference Fabric | 9 |
| Background Cognition | 9 | Memory Formation; Reflection | 7 |
| Evaluation | 9 | Appraisal; Adaptive Dispositions | 7 |
| Perception | 2 | Foreground Input; Perceptual Continuity | 0 |
| Interfaces | 3 | Workbench; Expression; Realtime Conversation | 0 |
| Inference | 2 | Cloud AI Provider (ORBIT); Local AI Provider (LANDED) | 0 |
| Infrastructure | 4 | Turn Observation; Development Awareness; ChronoForge | 1 |

Inference Fabric belongs to Cognition in the canonical artifact. The canonical inference annotation spans it and both providers; the overview preserves that membership and displays the approved annotation inside the provider region and below the diagram.

## Derived corridors

Directions in this table are from the first family to the second and back. Only cross-family public relationships contribute; same-family edges remain in the full explorer.

| First family | Second family | Forward | Reverse | Total |
| --- | --- | ---: | ---: | ---: |
| Background Cognition | Cognition | 2 | 0 | 2 |
| Background Cognition | Evaluation | 1 | 0 | 1 |
| Background Cognition | Infrastructure | 1 | 0 | 1 |
| Background Cognition | Memory | 1 | 2 | 3 |
| Cognition | Evaluation | 0 | 4 | 4 |
| Cognition | Inference | 2 | 0 | 2 |
| Cognition | Infrastructure | 1 | 2 | 3 |
| Cognition | Interfaces | 1 | 1 | 2 |
| Cognition | Memory | 2 | 5 | 7 |
| Cognition | Perception | 0 | 2 | 2 |
| Evaluation | Interfaces | 1 | 0 | 1 |
| Evaluation | Memory | 0 | 4 | 4 |
| Evaluation | Perception | 0 | 1 | 1 |
| Interfaces | Perception | 2 | 0 | 2 |

There are 14 corridors containing 35 relationships. Ribbon width in SVG units is 3 + 3 * sqrt(count), rendered as one plain band, with tiny chevrons for the canonical directions. All corridors are derived, with no authored connectivity.

## Interaction and accessibility

Hover or keyboard focus previews a region, its connected families, every touching corridor, and details. Click, tap, Enter or Space selects persistently. Escape on a region or Clear selection clears selection. Unrelated regions, labels and ribbons fade. Details contain canonical copy, representatives, total and omitted counts, and incoming/outgoing cross-family counts.

Explore these systems clears the explorer search, sets its existing family control, dispatches its normal change event, focuses that control, and follows the full-architecture anchor. Without JavaScript the anchor works and all eight family details and all 46 fallback subsystem entries remain available.

At widths up to 700px, numbered lobes pair with readable family buttons and details instead of shrinking the desktop descriptions. Focus has a visible outline or region stroke; numbers and text supplement color; transitions respect reduced motion.

## Full explorer changes

Default relationship opacity is reduced from .32 to .045; unrelated selected-state edges use .025. Family regions use .35 opacity at rest, restoring full opacity on family focus. The inference boundary remains dashed; its duplicate map label is removed to avoid covering nodes, with the existing full annotation retained above the map. All 46 nodes, 57 relationships, search, directory, inspector and selection logic remain.

## Validation

- npm ci: passed after stopping the site's dev process that held a Windows Rollup file lock. Existing audit advisories remain outside this change: one low and two high.
- Canonical and overview validation: passed, including invalid representative, wrong family and duplicate rejection, deterministic bundle order, directions, counts and no-edge fixtures.
- Astro check: zero errors, warnings or hints.
- Static build: 15 pages; static boundary: 23 files; internal links: 298 passed.
- Desktop 1440px and touch-enabled 390px Chrome smoke: eight regions, selection, connected/muted corridors, details, family handoff, full explorer direct edges, search and no horizontal page overflow passed. Mobile inspector remains below the map.
- Keyboard focus, Space, Escape, desktop hover and no-JavaScript overview/full directories passed.
- Screenshots visually reviewed at desktop and 390px. Browser tooling reused an existing Puppeteer/Chrome installation without adding dependencies.

Human review should assess the lobe composition, ribbon prominence and numbered mobile treatment. Automated smoke does not substitute for assistive-technology or physical-device review. No merge or manual deployment is part of this delivery.


## Final band treatment

There is one smooth band per canonical family pair. Bands are fully hidden at rest and all unrelated bands stay hidden during selection. Width remains 3 + 3 * sqrt(count). Active opacity is .85 (with an additional .85 mobile layer multiplier). There are no strands, halos, or looped routes.

Named boundary ports and cubic handles remain presentation-only metadata. Every route progresses monotonically along at least one axis; validation rejects routes that double back, preventing loops and self-crossings. Rendering still iterates the unchanged 14 canonical bundles / 35 cross-family relationships.

Tiny white chevrons follow the curve tangent. A bundle with one canonical direction gets one chevron; a bidirectional bundle gets two opposing chevrons. Counts and directions come directly from the projection, and validation verifies each chevron's direction and finite position/angle.

Only the active family's network is revealed. Existing hover/focus previews and click/tap/Enter/Space persistence remain. Clear selection and Escape hide every band again. Region emphasis is restrained, with no selected-border glow. The lobe composition, content, canonical annotation, representatives and Full Explorer are unchanged.

Static-build browser checks at 1440px and 390px cover rest, Cognition, Memory and Inference. Exactly one band per pair is present, inactive bands have zero opacity, and active sets match the canonical network. Cognition reveals seven bands, Memory three, and Inference only Cognition?Inference. Desktop curve sampling checks the band radius plus a two-pixel margin against heading, description, pill and additional-count rectangles; no text crossings remain. This clearance result applies to the tested desktop viewport and font rendering.

Hover, focus/Space/Escape, touch selection, family handoff, full-explorer search and direct-edge highlighting, mobile inspector placement and no-JavaScript checks pass. Astro check, build, architecture validation, static boundary, internal links and diff checks pass. Human review remains the final judge of the simpler band appearance.
