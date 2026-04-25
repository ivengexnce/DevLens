export const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', 'C#': '#178600', Go: '#00ADD8',
  Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', Swift: '#ffac45',
  Kotlin: '#A97BFF', Vue: '#41b883', CSS: '#563d7c', HTML: '#e34c26',
  Shell: '#89e051', Dart: '#00B4AB', Scala: '#c22d40', R: '#198CE7'
};

export const getLangColor = (lang) => LANG_COLORS[lang] || '#6b7280';

export const HEAT_COLORS = [
  '#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'
];

export const getHeatColor = (count) => {
  if (!count) return HEAT_COLORS[0];
  if (count < 3) return HEAT_COLORS[1];
  if (count < 6) return HEAT_COLORS[2];
  if (count < 10) return HEAT_COLORS[3];
  return HEAT_COLORS[4];
};

export const fmtNum = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

export const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const scoreColor = (score) => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-gray-400';
};

export const scoreRingColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#6b7280';
};

export const last365Days = () => {
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};
