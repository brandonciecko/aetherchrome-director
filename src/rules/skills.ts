import { CORE_SKILLS } from "./core-data";

export interface SkillDefinition {
  id: string;
  name: string;
  parentId: string | null;
}

/**
 * Full skill topology, derived from Core's Skill Registry (aetherchrome-core-data,
 * generated/json/skills.json) rather than hand-typed — this used to be a
 * ~22-entry hand-mirrored subset using non-canonical lowercase slug IDs
 * ("fight", "swords", ...) that had drifted from Core's real SKL-* IDs.
 * Deliberately excludes "technique"-kind records (e.g. SKL-MELEE-DISARM):
 * those aren't part of the Skill point-buy hierarchy this module validates.
 * A skill not available in a given campaign is still included here for
 * hierarchy validation (e.g. Subterfuge for Stealth's parent chain); only
 * campaign-available Skills are purchasable — see campaigns/crownshard-realms.ts.
 */
export const SKILL_REGISTRY: SkillDefinition[] = CORE_SKILLS.filter(skill => skill.record_kind !== "technique").map(
  skill => ({
    id: skill.id,
    name: skill.name,
    parentId: skill.parent_skill_id ?? null
  })
);

const SKILL_BY_ID = new Map(SKILL_REGISTRY.map(skill => [skill.id, skill]));

export function getSkill(skillId: string): SkillDefinition | undefined {
  return SKILL_BY_ID.get(skillId);
}

/** Cumulative cost from 0 (source: AEC — Skill Costs v0.1, revised: step x->x+1 costs x+1 pts). */
export const SKILL_CUMULATIVE_COST_TABLE = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55];

export function skillCumulativeCost(rating: number): number {
  if (!Number.isInteger(rating) || rating < 0 || rating > 10) {
    throw new Error(`Skill rating must be an integer 0-10 (got ${rating})`);
  }
  return SKILL_CUMULATIVE_COST_TABLE[rating];
}

/**
 * Child Base Skill rating may never exceed its immediate parent's rating.
 * Ancestors not purchased default to rating 0.
 *
 * When `availableSkillIds` is provided, a parent that isn't itself in that
 * set imposes no cap at all — this is how Stealth (registered under the
 * Alpha-unavailable Subterfuge) stays purchasable 0-6 like any other Alpha
 * skill instead of being pinned to 0 by an ancestor nobody can buy (see plan
 * Assumption 4). Without the set (the default), every registered parent
 * constrains its children.
 */
export function validateSkillHierarchy(ratings: Record<string, number>, availableSkillIds?: Set<string>): string[] {
  const issues: string[] = [];
  for (const skill of SKILL_REGISTRY) {
    if (!skill.parentId) continue;
    if (availableSkillIds && !availableSkillIds.has(skill.parentId)) continue;
    const rating = ratings[skill.id] ?? 0;
    const parentRating = ratings[skill.parentId] ?? 0;
    if (rating > parentRating) {
      const parent = getSkill(skill.parentId);
      issues.push(`${skill.name} (${rating}) cannot exceed its parent ${parent?.name ?? skill.parentId} (${parentRating})`);
    }
  }
  return issues;
}
