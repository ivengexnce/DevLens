import { last365Days, getHeatColor } from '../utils/helpers.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Heatmap({ data = {} }) {
  const days = last365Days();
  const weeks = [];
  let week = [];

  // pad start
  const startDay = new Date(days[0]).getDay();
  for (let i = 0; i < startDay; i++) week.push(null);

  days.forEach(day => {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length) weeks.push(week);

  const totalContribs = Object.values(data).reduce((s, v) => s + v, 0);

  return (
    <div className="card fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Contribution Activity</h3>
        <span className="text-sm text-gray-400">{totalContribs} events in last year</span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((wk, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {wk.map((day, di) =>
                day ? (
                  <div
                    key={di}
                    className="heat-cell w-3 h-3 rounded-sm cursor-pointer"
                    style={{ background: getHeatColor(data[day]) }}
                    title={`${day}: ${data[day] || 0} events`}
                  />
                ) : (
                  <div key={di} className="w-3 h-3" />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-gray-500">Less</span>
        {[0,1,3,6,10].map(n => (
          <div key={n} className="w-3 h-3 rounded-sm" style={{ background: getHeatColor(n) }} />
        ))}
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  );
}
