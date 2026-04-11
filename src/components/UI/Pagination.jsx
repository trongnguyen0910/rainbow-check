import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange, total, limit }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} records
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-icon disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-8 h-8 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700">1</button>
            {pages[0] > 2 && <span className="px-1 text-slate-400">…</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
              p === page
                ? 'bg-primary-600 text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-icon disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
