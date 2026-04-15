# Validation Rules

> Used by Session 3 validation agents. Each rule is checked against the merged developer branch before the batch PR is opened.

## Global Rules

_Rules that apply to every repo. Edit the copy inside each repo if you need overrides._

- No `TODO` / `FIXME` / `XXX` comments introduced in the diff without a linked ticket ID
- No committed secrets (API keys, tokens, private keys)
- No `console.log` / `print` debug statements left in production code
- No commented-out code blocks larger than 5 lines
- All new public functions have a one-line purpose comment or clear name
- No files larger than 1 MB added to the repo

## Per-Language Rules

### Swift
- No `// swiftlint:disable` added without a `// reason:` annotation
- No force unwraps (`!`) in non-test code unless justified in a comment
- `@Environment` / `@State` declarations grouped at the top of each view

### TypeScript / JavaScript
- No `any` types added (use `unknown` + type guards instead)
- No `eslint-disable` without a reason comment
- Imports sorted per project config

### Python
- No bare `except:` clauses
- No `import *`

## Per-Project Overrides

_Edit this section in each repo's `.flow.json` sibling `VALIDATION_RULES.md` to add project-specific rules. This file in `~/.claude/workflows/sub-agents/` is only the template — it is copied on `flow init` if the repo has no existing rules file._
