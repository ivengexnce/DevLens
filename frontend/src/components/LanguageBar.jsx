import { getLangColor } from '../utils/helpers.js';

export default function LanguageBar({ languages = [] }) {
  if (!languages.length) return null;
  return (
    <div className="card fade-in">
      <h3 className="font-semibold text-white mb-4">Language Distribution</h3>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
        {languages.map(l => (
          <div
            key={l.name}
            style={{ width: `${l.pct}%`, background: getLangColor(l.name) }}
            title={`${l.name} ${l.pct}%`}
          />
        ))}
      </div>

      <div className="space-y-2">
        {languages.map(l => (
          <div key={l.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: getLangColor(l.name) }} />
            <span className="text-sm text-gray-300 flex-1">{l.name}</span>
            <div className="flex-1 bg-gray-800 rounded-full h-1.5 mx-2">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${l.pct}%`, background: getLangColor(l.name) }}
              />
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{l.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
