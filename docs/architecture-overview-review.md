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

There are 14 corridors containing 35 relationships. Ribbon width in SVG units is 3 + 3 * sqrt(count), with an eight-unit wider translucent band and five parallel inner highlights formed by alternating nested strokes. All corridors are derived, with no authored connectivity.

## Interaction and accessibility

Hover or keyboard focus previews a region, its connected families, every touching corridor, and details. Click, tap, Enter or Space selects persistently. Escape on a region or Show all connections clears selection. Unrelated regions, labels and ribbons fade. Details contain canonical copy, representatives, total and omitted counts, and incoming/outgoing cross-family counts.

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


## Final ribbon visual pass

The same 14 corridors and 35 cross-family relationships now use presentation-only named boundary ports and hand-authored cubic handles in `src/lib/architectureOverviewRoutes.ts`. Rendering still iterates the canonical projection. No lobe geometry, family content, representative IDs, canonical annotation, directional counts, bundle widths, or Full Explorer implementation changed in this pass.

Route validation rejects unknown port families, routes without canonical bundles, missing canonical routes, missing ports, empty/non-finite curves, and endpoints that miss their named ports. It also verifies that removing the rendered path leaves the exact original bundle data, including direction counts and width.

Resting corridor opacity is .035; unrelated corridors during interaction use .012. Active corridors use .92, with an outer band at .22 opacity, a blue core, and five pale strands that follow each bend. Mobile applies an additional .85 multiplier to the ribbon layer. The width formula remains unchanged.

The layer order is lobe backgrounds, cables, region border emphasis, copy/pills, then mobile numbers and keyboard focus rings. The active family uses a four-unit canonical-color border with a small glow and 1.22 saturation. Connected families use a softer two-unit edge and 1.08 saturation. Unrelated lobes and copy are gently muted. Keyboard focus has a separate dashed ring; it is not used to mark connected families.

Final static-build Chrome captures reviewed at 1440px and 390px include rest, Cognition, Memory and Inference. Cognition activates all seven touching corridors through separate boundary ports; Memory activates three, with its seven-relationship Cognition cable the strongest; Inference activates only Cognition?Inference. No central knot remains. The desktop clearance check sampled every curve against the rendered heading, description, pill and additional-count rectangles, including the outer band's radius and a two-pixel margin: no intersections. This check is specific to the tested desktop viewport and font rendering.

The existing hover, focus/Space/Escape, touch-enabled selection, family handoff, search, direct-edge highlighting, mobile inspector placement and no-JavaScript checks pass against the static build. All required npm/install/check/build/static/link checks pass; Astro reports zero diagnostics. Final human review should assess cable prominence and the subtle strands at phone scale. No remaining text obstruction was observed in the reviewed states.
