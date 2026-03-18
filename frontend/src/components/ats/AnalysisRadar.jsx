// frontend/src/components/ats/AnalysisRadar.jsx

import {
  RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import './AnalysisRadar.css';

function AnalysisRadar({ analysis }) {
  const data = [
    { subject: 'Structure',   score: analysis.structure_score   ?? 0 },
    { subject: 'Skills',      score: analysis.skills_score      ?? 0 },
    { subject: 'Impact',      score: analysis.impact_score      ?? 0 },
    { subject: 'Keywords',    score: analysis.keyword_score     ?? 0 },
    { subject: 'Readability', score: analysis.readability_score ?? 0 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item  = payload[0];
    const score = item.value;
    const color = score >= 75 ? '#4caf50' : score >= 50 ? '#ff9800' : '#f44336';
    return (
      <div className="radar-tooltip">
        <div className="radar-tooltip__label">{item.payload.subject}</div>
        <div className="radar-tooltip__score" style={{ color }}>{score}/100</div>
      </div>
    );
  };

  return (
    <div className="analysis-radar">
      <h3 className="analysis-radar__title">Skill Radar</h3>
      <p className="analysis-radar__subtitle">
        Visual overview of your resume's performance across all dimensions
      </p>
      <div className="analysis-radar__chart">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
            <PolarGrid
              stroke="#e8e8e8"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fontSize: 12,
                fontWeight: 600,
                fill: '#555',
                fontFamily: 'inherit',
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: '#bbb' }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#2196f3"
              fill="#2196f3"
              fillOpacity={0.12}
              strokeWidth={2}
              dot={{ fill: '#2196f3', r: 4, strokeWidth: 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalysisRadar;
