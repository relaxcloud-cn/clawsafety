# ClawSafety Registry Skill

name: clawsafety-registry
description: Search, inspect, save, share, and verify agent skills before installation.

## Purpose

Use the ClawSafety Registry web app to:

- search a skill by GitHub URL, publisher handle, or name
- inspect the score, trust state, and tree hash
- save a versioned package into the registry
- share a verified version with time-bounded links
- re-verify a package on consumer install

## Suggested Commands

- `clawsafety scan ./my-skill --format json`
- `clawsafety registry save ./my-skill --version 1.0.0`
- `clawsafety registry share @publisher/my-skill --version 1.0.0`
- `clawsafety registry install @publisher/my-skill@1.0.0`

## Web Surfaces

- Hub: `/`
- Registry: `/skills`
- Scan: `/scan`
- Docs: `/docs`
- Dashboard: `/dashboard`

## Verification Model

1. Publisher saves a package and records a tree hash.
2. Registry scan runs static analysis and IOC correlation.
3. Consumer install replays the package and recomputes the tree hash.
4. Install is verified only if the hashes and verdicts still match.
