<!-- CANONICAL-DEVELOPMENT-RUNBOOK:START -->

## Canonical Development Runbook

Before development work, resolve the local `peggy-product-engineering-pro`
checkout to an absolute path and treat it as `<peggy-root>`. It normally sits
beside this repository under the current user's projects directory, whatever
that directory happens to be named. Never hardcode an absolute home path from
another machine: it resolves for one operator and fails silently for everyone
else.

Read `<peggy-root>/operations/development-quick-reference.md` for development
work. Read `<peggy-root>/operations/development-runbook.md` for
Normal-or-higher, approval-gated, incident, or conflicting-instruction work.
If either file is missing, refresh the Peggy checkout from its canonical Git
remote and verify both files before relying on the bridge. Do not copy the
runbooks into this repository.

Local rules may add stricter requirements but may not weaken canonical safety,
authorization, evidence, or rollback rules.

<!-- CANONICAL-DEVELOPMENT-RUNBOOK:END -->
