export default function AIInsightCard({ insight, loading, fallback }) {
  return (
    <div className="card fade-in border-blue-800/40 bg-blue-950/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🤖</span>
        <h3 className="font-semibold text-white">AI Recruiter Assessment</h3>
        {fallback && <span className="badge bg-gray-700 text-gray-400 ml-auto">Rule-based</span>}
        {!fallback && !loading && <span className="badge bg-blue-900 text-blue-300 ml-auto">Claude AI</span>}
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-700 rounded w-4/6" />
        </div>
      ) : (
        <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
      )}
    </div>
  );
}
