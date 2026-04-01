// frontend/src/components/roleMatching/RoleCard.jsx

import RoleScoreHeader from './RoleScoreHeader';
import SkillsPanel     from './SkillsPanel';
import GrowthPath      from './GrowthPath';
import JobListings     from './JobListings';
import AIInsightPanel  from './AIInsightPanel';

export default function RoleCard({ match, rank }) {
  const isTopMatch = rank === 0;

  return (
    <div className={`rm-role-card ${isTopMatch ? 'rm-role-card--top' : ''}`}>
      {isTopMatch && (
        <div className="rm-top-badge">⭐ Best Match</div>
      )}

      <RoleScoreHeader match={match} />

      <SkillsPanel
        matchedSkills={match.matchedSkills}
        missingSkills={match.missingSkills}
      />

      <GrowthPath growthPath={match.growthPath} />

      <div className="rm-card-expandables">
        <JobListings jobs={match.jobs} roleName={match.role} />
        <AIInsightPanel
          explanation={match.aiExplanation}
          autoExpand={isTopMatch}
        />
      </div>
    </div>
  );
}
