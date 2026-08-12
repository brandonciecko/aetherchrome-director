import { useState, type ReactNode } from "react";
import { SKILL_REGISTRY, getSkill, skillCumulativeCost, type SkillDefinition } from "../../rules/skills";
import type { CampaignProfile } from "../../rules/campaigns";
import type { DraftActor } from "../../rules/types";
import type { DraftUpdater } from "./types";

function descendantsOf(skillId: string): string[] {
  const direct = SKILL_REGISTRY.filter(skill => skill.parentId === skillId).map(skill => skill.id);
  return direct.flatMap(id => [id, ...descendantsOf(id)]);
}

export function SkillsStep({
  draft,
  onChange,
  campaign
}: {
  draft: DraftActor;
  onChange: DraftUpdater;
  campaign: CampaignProfile;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const availableIds = new Set(campaign.availableSkillIds);
  const availableSkills = SKILL_REGISTRY.filter(skill => availableIds.has(skill.id));
  // A skill is a display root if it has no parent, or its registered parent isn't
  // purchasable in this campaign (e.g. Stealth under the unavailable Subterfuge).
  const roots = availableSkills.filter(skill => !skill.parentId || !availableIds.has(skill.parentId));

  function setSkillRating(skillId: string, rating: number) {
    onChange(d => {
      const skills = { ...d.skills, [skillId]: rating };
      for (const descendantId of descendantsOf(skillId)) {
        if ((skills[descendantId] ?? 0) > rating) {
          skills[descendantId] = rating;
        }
      }
      return { ...d, skills };
    });
  }

  function maxRatingFor(skill: SkillDefinition): number {
    const parentCaps = skill.parentId && availableIds.has(skill.parentId);
    const parentRating = parentCaps ? (draft.skills[skill.parentId!] ?? 0) : campaign.startingSkillMax;
    return Math.min(campaign.startingSkillMax, parentRating);
  }

  function renderSkillRow(skillId: string, depth: number): ReactNode {
    const skill = getSkill(skillId);
    if (!skill) return null;
    const rating = draft.skills[skillId] ?? 0;
    const max = maxRatingFor(skill);
    const cost = skillCumulativeCost(rating);
    const children = SKILL_REGISTRY.filter(child => child.parentId === skillId && availableIds.has(child.id));

    return (
      <div key={skillId}>
        <div
          className={`skill-row ${skillId === selectedId ? "selected" : ""}`}
          style={{ paddingLeft: depth * 20 }}
          onClick={() => setSelectedId(skillId)}
        >
          <span className="skill-name">{skill.name}</span>
          <button disabled={rating <= 0} onClick={event => { event.stopPropagation(); setSkillRating(skillId, rating - 1); }}>
            -
          </button>
          <span className="rating-value">{rating}</span>
          <button disabled={rating >= max} onClick={event => { event.stopPropagation(); setSkillRating(skillId, rating + 1); }}>
            +
          </button>
          <span className="cost">{cost} pts</span>
        </div>
        {children.map(child => renderSkillRow(child.id, depth + 1))}
      </div>
    );
  }

  const selectedSkill = selectedId ? getSkill(selectedId) : undefined;

  function renderDetails() {
    if (!selectedSkill) {
      return <p className="empty-hint">Select a Skill to see details.</p>;
    }
    const rating = draft.skills[selectedSkill.id] ?? 0;
    const max = maxRatingFor(selectedSkill);
    const cost = skillCumulativeCost(rating);
    const parent = selectedSkill.parentId ? getSkill(selectedSkill.parentId) : undefined;
    const nextRankCost = rating < max ? skillCumulativeCost(rating + 1) - cost : null;

    return (
      <div className="item-details">
        <h4>{selectedSkill.name}</h4>
        <p>{selectedSkill.description}</p>
        <p>Parent: {parent ? parent.name : "None (root Skill)"}</p>
        <p>
          Rating: {rating} / {max}
        </p>
        <p className="detail-cost">{cost} pts spent</p>
        {nextRankCost !== null && <p className="detail-limit">{nextRankCost} pts for next rank</p>}
      </div>
    );
  }

  return (
    <div className="step skills-step">
      <h2>Skills</h2>
      <p>Starting Skill max {campaign.startingSkillMax}. A Skill can never exceed its parent's rating.</p>
      <div className="step-layout">
        <div className="step-list">{roots.map(root => renderSkillRow(root.id, 0))}</div>
        <div className="pane details-pane">
          <h3>Details</h3>
          {renderDetails()}
        </div>
      </div>
    </div>
  );
}
