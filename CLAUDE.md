# Aetherchrome Director

Standalone browser app for Aetherchrome character (Actor) generation. Local-only
(no backend): drafts live in IndexedDB, and Actors move between systems via a
schema-versioned JSON export/import file. React 19 + TypeScript + Vite.

Companion repos: **Aetherchrome-core** (canonical rules source — this repo's
content is derived from it, not an independent design surface) and
**Aetherchrome-foundry** (the VTT system Director's exports are meant to feed —
see "The Foundry Bridge" below for the current gap).

Director depends on Core's generated registry data via the `aetherchrome-core-data`
package, vendored as a single tarball at `vendor/aetherchrome-core-data-0.2.5.tgz`
(`package.json`: `"aetherchrome-core-data": "file:./vendor/aetherchrome-core-data-0.2.5.tgz"`).
That tarball is produced in Core with `npm run pack-data` (a thin `npm pack`
wrapper — Core's own `package.json` already restricts `files` to
`generated/json`, `generated/csv`, and `schemas`) and copied into this repo's
`vendor/` directory, committed like any other source file. This is a
deliberate, simpler replacement for an earlier `file:../Aetherchrome-core`
sibling-checkout dependency: the vendored tarball is self-contained, needs no
network fetch, no registry, and no Core checkout present at install/build
time — `npm install`/`npm run build`/`npm test` work from a clean clone of
just this repo. Updating to newer Core data means re-running `npm run
pack-data` in Core, replacing the file in `vendor/`, bumping the version in
both the filename and this repo's `package.json` dependency line, and
`npm install` again — a deliberate, visible step, not an automatic one. See
Core's `00 Governance/AEC — External Consumer Stability Contract.md` for the
versioning scheme this tarball's version corresponds to.

## What Director Is / Isn't

- Director is the pre-session, no-Foundry-access-required path to build a
  character: point-buy Attributes/Skills/Traits, equipment selection within a
  Possession Allowance, legality/point-ledger validation, then export.
- It is not a play-tracking tool. Once an Actor is imported into Foundry, the
  Foundry system (Base/Current Attributes, HP/MP, Statuses) becomes the live
  record. Director doesn't need to model Current Attributes, Statuses, or
  anything else that only matters mid-session.
- PC creation only today — there is no NPC/GM-facing path yet.
- Campaign selection is real, not hardcoded (as of 2026-08-12): `App.tsx`'s
  home screen has a Campaign picker driven by `AVAILABLE_CAMPAIGNS`
  (`src/rules/campaigns/index.ts`), and a Draft Actor's chosen campaign
  travels with it as `draft.campaignId` — `ActorCreator` resolves the actual
  `CampaignProfile` via `getCampaign(draft.campaignId)` rather than any
  component hardcoding a specific campaign. Only **The Crownshard Realms**
  (`CROWNSHARD_REALMS_CAMPAIGN`) is listed today. Core also registers a
  second campaign, **OIT** (`CMP-OIT`), but its own record says so itself:
  "Everything [is open]... No Actor Creation controls, Wealth baseline, or
  setting content are established" — it's a structural stub proving the
  campaign-overlay pattern generalizes, not real content, so it's
  deliberately excluded from `AVAILABLE_CAMPAIGNS` rather than exposed
  half-working. Add a real second campaign by giving it its own file
  alongside `crownshard-realms.ts` and registering it in that array — the
  UI/validation plumbing already supports more than one.

## Rules Data — Source of Truth

- `src/rules/` is a mix of **data pulled live from Core** and
  **hand-maintained mechanics not yet in Core's structured registries**.
  Aetherchrome-core is canonical either way; Director must not invent or
  resolve rules ambiguity on its own.
- `src/rules/core-data.ts` is the one place that imports Core's generated JSON
  (`aetherchrome-core-data/generated/json/*.json`) and exposes it through
  minimal typed accessors. Read Core data through this module, not by
  importing the JSON directly elsewhere — it keeps the raw-shape knowledge
  (and the risk of Core's field shapes changing) in one spot.
- **Derived live from Core, not hand-typed:** `SKILL_REGISTRY` (the full Skill
  topology, via `core-data.ts` — Skill IDs are Core's real `SKL-*` codes, not
  ad hoc slugs); `ITEM_REGISTRY`'s stats (category/Item Rating/Load/Base
  Value, resolved per curated item ID); `CROWNSHARD_REALMS_CAMPAIGN`'s
  identity, Skill-max/refund-cap/economy baseline fields, and
  `availableSkillIds`/`availableTraitIds`; and, as of `aetherchrome-core-data`
  0.2.0, `ATTRIBUTE_LABELS`/`ATTRIBUTE_ABBREVIATIONS`/`ATTRIBUTE_DESCRIPTIONS`
  in `attributes.ts` (mapped from Director's fixed lowercase `AttributeKey`
  scheme to Core's `ATTR-*` records via `CORE_ATTRIBUTE_ID`).
- **Public/production-facing descriptions** now flow through end to end for
  every registry Director surfaces a details panel for: `SkillDefinition.description`
  (Core's `concept` field), `ItemDefinition.description` (Core's `description`
  field), and `ATTRIBUTE_DESCRIPTIONS` (Core's `description` field, added to
  the Attribute registry 2026-08-11 — it previously had no prose field at
  all). If you add a details panel for a registry that doesn't have one of
  these yet, check Core's schema for an existing prose field first (Traits
  use `summary`, Statuses/Situations use `description`, most reference tables
  use `definition` or `meaning`) before assuming one needs to be added there.
- **Still hand-maintained, not yet derivable from Core:** `attributes.ts`'s
  cost-curve formulas (`attributeStepCost`/`attributeCumulativeCost` — pure
  game-math, not per-registry content); `TRAIT_REGISTRY`'s mechanics —
  cost/rank/effect text (Core sometimes expresses a Trait's max rank as a
  dynamic reference like `"Base Health"` rather than a plain number, which
  needs per-trait judgment to translate — flagged as follow-up, not
  resolved); `ITEM_REGISTRY`'s *membership* (which 20 items are curated in,
  and their hand-authored `notes`) — Core's per-campaign item availability is
  category-level only and explicitly states category approval doesn't imply
  approval of every Item in it, so this stays a hand-curated allowlist by
  design, not something to auto-expand from Core.
- Every hand-maintained constant/derivation that encodes a rule cites its core
  source in a comment (e.g. `source: AEC — Attribute Costs v0.1, resolves
  OD-012`). Keep doing this for new rules content — an uncited number is a
  maintenance trap.
- Where the ruleset doesn't fully specify behavior, existing code calls this
  out explicitly as a numbered `Assumption` in a comment (see `attributes.ts`
  Assumption 1, `creation.ts` Assumption 2, `campaigns/crownshard-realms.ts`
  Assumption 3, `skills.ts` Assumption 4) instead of silently picking an
  interpretation. Follow the same pattern; don't quietly resolve an ambiguity
  you find.
- `SKILL_REGISTRY` includes Skills that aren't purchasable in the current
  campaign (e.g. `SKL-SUBTERFUGE`, Stealth's parent) so hierarchy validation
  still works for Skills whose registered parent isn't campaign-available.
  Don't delete these as "unused" — check `validateSkillHierarchy`'s
  `availableSkillIds` handling first.

## Architecture

- `src/rules/types.ts` — `DraftActor` (id/name/concept/campaignId/attributes/
  skills/traits/equipment) and `createBlankDraftActor`. This is Director's
  actor shape, distinct from Foundry's `actor-data.mjs` model — the two are
  reconciled only at the export/import boundary, not by sharing a type.
- `src/rules/creation.ts` — `evaluateDraftActor`, the single pure function
  that validates a draft against a `CampaignProfile` and returns legality,
  itemized issues, the point ledger, equipment ledger, and derived stats
  (`maxHP = 2 × Base Health`, `maxMP = Base Essence` — matches the Foundry
  system's rule). Extend this rather than duplicating validation logic
  elsewhere.
- `src/rules/core-data.ts` — typed read layer over Core's generated JSON (see
  "Rules Data — Source of Truth" above).
- `src/rules/attributes.ts`, `skills.ts`, `traits.ts`, `items.ts` — registries
  and their cost/validation functions.
- `src/rules/campaigns/crownshard-realms.ts` — the Crownshard Realms profile
  itself (point budget, ranges, per-campaign availability lists). New
  campaigns are new files here, not edits to Crownshard Realms' values.
- `src/rules/campaigns/index.ts` — the `CampaignProfile` type, `AVAILABLE_CAMPAIGNS`
  (the list the UI's Campaign picker renders), and `getCampaign(id)`. This is
  what everything outside `campaigns/` should import from, not a specific
  campaign's own file — see "What Director Is / Isn't" above.
- `src/storage/actor-store.ts` — `ActorStore` interface with an IndexedDB
  implementation (`indexedDbActorStore`). Call sites depend on the interface,
  not IndexedDB directly, so a future sync backend can swap in without
  touching rules/UI code — keep new storage consumers going through it too.
- `src/storage/export.ts` — schema-versioned JSON export/import
  (`ACTOR_EXPORT_SCHEMA_VERSION`). Import re-validates the Actor against the
  *current* ruleset via `evaluateDraftActor` and throws `ActorImportError`
  loudly rather than accepting a stale/invalid Actor silently — preserve that
  behavior on any format change, and bump the schema version rather than
  reinterpreting an old one in place.
- `src/ui/ActorCreator/` — the six-step wizard (Concept → Attributes → Skills
  → Traits → Equipment → Review), driven by a single `DraftActor` held in
  `ActorCreator.tsx` and passed down with an `onChange` updater; each step is
  a controlled, mostly presentational component that reads from
  `evaluateDraftActor`'s result rather than re-deriving legality itself.
- `src/ui/components/PointLedger.tsx` — shared ledger display, used by the
  creator sidebar.
- `App.tsx` — top-level `View` state machine (`home` | `creator`), IndexedDB
  list/save/delete, and file download/upload for export/import.

## The Foundry Bridge

- Director exports an Actor to a `.aetherchrome.json` file, and as of
  2026-08-12 Aetherchrome-foundry has a working import side: the entry point
  is `scripts/apps/director-import-dialog.mjs`, backed by
  `scripts/import/director-import.mjs` (`parseDirectorExport()`,
  `buildImportPayload()`, a `SUPPORTED_SCHEMA_VERSION` constant checked
  against the export's `schemaVersion` — an unrecognized/future version is
  rejected, not silently accepted) plus per-registry field mapping in
  `scripts/import/item-mapper.mjs` and `scripts/import/trait-mapper.mjs`.
  Real test coverage exists under `scripts/import/__fixtures__/`, including
  a `bad-schema-version.aetherchrome.json` fixture for the rejection path
  and a `real-director-export.aetherchrome.json` fixture from an actual
  Director export.
- The contract on this side is still `ActorExportFile`/
  `ACTOR_EXPORT_SCHEMA_VERSION` in `src/storage/export.ts` — bumping it is a
  breaking change for Foundry's importer (`SUPPORTED_SCHEMA_VERSION` there
  would need a matching update), so treat the two as versioned in lockstep,
  not independently.

## Deployment

- Deployed via Cloudflare Workers (Workers Builds, git-connected — not
  Cloudflare Pages). `wrangler.jsonc` declares this as a pure static-assets
  Worker: `assets.directory` points at `dist/` (Vite's build output) with
  `not_found_handling: "single-page-application"` for client-side routing
  fallback; there's no server-side Worker script. `wrangler` is a
  devDependency so Workers Builds resolves the same version pinned here.
- Workers Builds runs the configured build command (`npm run build`) against
  this repo directly — the vendored `vendor/*.tgz` dependency (see above)
  matters here specifically: a git-connected CI build has no access to a
  sibling Aetherchrome-core checkout, which is exactly why the tarball is
  committed rather than referenced via a sibling `file:` path.
- `npm run deploy` (`wrangler deploy`) deploys manually if needed; normal
  deploys happen through the Cloudflare-side build trigger, not this script.
- **Build/version identity is visible in the running app** (`src/version.ts`,
  rendered by `VersionFooter` on both the home screen and the Actor Creator
  sidebar): `APP_VERSION` is `package.json`'s `version` field — bump it by
  hand for a notable release — and `BUILD_COMMIT`/`BUILD_DATE` are generated
  automatically at build time in `vite.config.ts` from the current git
  commit, so the on-page label always changes on a new deploy even if
  `version` wasn't bumped. This exists so it's possible to tell from the
  live site alone whether a given change has actually shipped.

## Working Conventions

- Stack: React 19 + TypeScript + Vite, no external state or routing library —
  keep it that way unless the task genuinely needs one. Styling is plain CSS
  per component (`*.css` alongside the matching `*.tsx`), no CSS-in-JS or UI
  framework.
- Lint with `oxlint` (`npm run lint`), not ESLint — `.oxlintrc.json` is the
  config. Test with Vitest (`npm test`); tests live alongside their module as
  `*.test.ts`. Run both before considering a rules or storage change done.
- Rules-layer functions (`creation.ts`, `attributes.ts`, `skills.ts`, etc.)
  are pure and unit-tested directly — don't route new rule logic through a
  component just to reuse it; add it to `src/rules/` with its own test file.
- `npm run build`'s main JS chunk is ~900 kB (pre-gzip) since `core-data.ts`
  imports Core's full `skills.json`/`items.json` wholesale — those registries
  carry far more per-record detail (rules text, provenance, playtest notes,
  ...) than this app reads. Not fixed yet; a real fix means either Core
  publishing a slimmer consumer-facing view or trimming fields at import time
  here, not something to silently work around.
