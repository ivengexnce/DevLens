import { getLangColor, fmtNum, fmtDate } from '../utils/helpers.js';

export default function RepoList({ repos = [] }) {
  if (!repos.length) return null;
  return (
    <div className="card fade-in">
      <h3 className="font-semibold text-white mb-4">Top Repositories</h3>
      <div className="space-y-3">
        {repos.map(repo => (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-blue-400 group-hover:text-blue-300 truncate">{repo.name}</p>
                {repo.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{repo.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                <span title="Stars">⭐ {fmtNum(repo.stars)}</span>
                <span title="Forks">🍴 {fmtNum(repo.forks)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {repo.language && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: getLangColor(repo.language) }} />
                  {repo.language}
                </span>
              )}
              <span className="text-xs text-gray-500">Updated {fmtDate(repo.updatedAt)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
