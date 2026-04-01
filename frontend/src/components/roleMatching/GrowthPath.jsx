// frontend/src/components/roleMatching/GrowthPath.jsx

export default function GrowthPath({ growthPath }) {
  if (!growthPath || growthPath.length === 0) return null;

  return (
    <div className="rm-growth-path">
      <span className="rm-growth-label">Career Path:</span>
      {growthPath.map((step, i) => (
        <span key={i} className="rm-growth-wrap">
          <span className="rm-growth-step">{step}</span>
          {i < growthPath.length - 1 && (
            <span className="rm-growth-arrow">→</span>
          )}
        </span>
      ))}
    </div>
  );
}
