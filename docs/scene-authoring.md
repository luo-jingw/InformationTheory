# Scene authoring contracts

## Explanation before geometry

Each storyboard defines the concrete question, prerequisites, visual experiment, proof and return to the opening problem. Illustrative finite assignments and theorem claims retain their distinct conditions. A displayed graph supports the calculation or derivation shown; it does not replace the proof.

Episode helpers own finite objects such as guessing trees, code inventories or channel mappings. The scene owns their sentence-anchored transitions. Shared rendering layers own fonts, formulas, captions and Three.js objects. A new episode is registered explicitly; runtime loaders do not read `build/preparation/`.

## Time and reproducibility

`draw(ctx)` derives visible state from the requested time and explicit chapter timing. `Cues` reads sentence starts and ends from the measured timeline. Thinking time is declared with `StorySentence.hold_after_s`; it is not inferred from silence in speech. Questions, holds, answers and musical transitions refer to the same sentence boundaries.

Seeking directly to a frame, playing forward and visiting later times before returning must recover the same semantic state. Experiments with random assignments use fixed deterministic data or seeds. Scene setup allocates objects; drawing updates their state without depending on the order of earlier calls.

## Formula and caption space

English captions appear above Chinese in the lower safe region. Formulas and object labels occupy the remaining space, with enough separation for subscripts, fractions, underbraces and dense proof lines. Background panels have explicit depth so they do not occlude curves. Tick labels, units and curve annotations have separate positions.

Numerical answers remain hidden while the corresponding question and thinking hold are active. Intermediate expressions may remain visible when they define the problem being computed. Boundary examples preserve strict inequalities and enough displayed digits to distinguish opposite sides of a threshold.

## Observation and revision

Preview review selects each spoken midpoint, chapter transitions and explicit thinking holds. Contact pages expose the full progression; native-resolution checks cover dense formulas, new experiments and suspected collisions. Forward/reverse/history checks retain actual differences for inspection.

The encoded MP4 has its own selection and review record. Exact-frame extraction seeks to an integer second and selects the remainder on the verified 30-fps grid. Source preview inspection does not substitute for encoded inspection. Full audio/video decode, stream/chapter metadata and source hashes are separate observations.

Confirmed issues are recorded before local repair, with location, evidence, earliest affected production phase and downstream scope. Unchanged speech and music can remain valid after scene-only changes. A changed spoken sentence invalidates its waveform, measured timing and timing-dependent downstream outputs. Earlier delivered versions and pre-repair evidence remain retained.
