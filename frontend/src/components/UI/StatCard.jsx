export default function StatCard({ icon: Icon, label, value, sub, color = 'blue', trend }) {
  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-600 dark:text-blue-400',   border: 'border-blue-100 dark:border-blue-800/30' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800/30' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800/30' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',     icon: 'text-red-600 dark:text-red-400',     border: 'border-red-100 dark:border-red-800/30' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-800/30' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`card card-hover p-5 border ${c.border}`}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={c.icon} size={22} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
