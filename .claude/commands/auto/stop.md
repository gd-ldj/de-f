# /auto:stop

Pause the AUTO v2 runtime safely without cleaning artifacts.

## Required flow
1. Read `.auto/STATE.json` and determine whether runtime is `idle`, `starting`, `running`, or `paused`.
2. If runtime is already idle or paused, return `already stopped` without mutating artifacts.
3. Stop new task dispatch, wait for critical writes to complete, and end the coordinator loop cleanly.
4. Persist the paused state and keep pid/log/heartbeat/evidence available for later resume.
5. Return a stop summary with previous state, new state, and whether any task stayed in flight.

## Constraints
- Do not treat stop as reset or cleanup.
- Do not delete runtime artifacts on repeated stop.
- Surface ambiguous pid or session mismatches as explicit state-conflict errors.
