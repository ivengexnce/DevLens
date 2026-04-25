const DIMS = [
  { key: 'repos', label: 'Repositories', icon: '📁' },
  { key: 'stars', label: 'Star Velocity', icon: '⭐' },
  { key: 'languages', label: 'Tech Diversity', icon: '💻' },
  { key: 'followers', label: 'Community Reach', icon: '👥' },
  { key: 'forks', label: 'Fork Adoption', icon: '🍴' }
];

export default function ScoreBreakdown({ breakdown = {} }) {
  return (
    <div className="card fade-in">
      <h3 className="font-semibold text-white mb-4">Score Breakdown</h3>
      <div className="space-y-3">
        {DIMS.map(d => {
          const val = breakdown[d.key] || 0;
          const color = val >= 80 ? '#10b981' : val >= 50 ? '#3b82f6' : val >= 30 ? '#f59e0b' : '#6b7280';
          return (
            <div key={d.key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">{d.icon} {d.label}</span>
                <span className="text-sm font-medium text-white">{val}/100</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${val}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
