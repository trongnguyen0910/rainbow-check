const STATUS_MAP = {
  'on-time':  { label: 'On Time',  cls: 'badge-success' },
  'late':     { label: 'Late',     cls: 'badge-warning' },
  'absent':   { label: 'Absent',   cls: 'badge-danger'  },
  'pending':  { label: 'Pending',  cls: 'badge-info'    },
  'approved': { label: 'Approved', cls: 'badge-success' },
  'rejected': { label: 'Rejected', cls: 'badge-danger'  },
  'active':   { label: 'Active',   cls: 'badge-success' },
  'inactive': { label: 'Inactive', cls: 'badge-neutral' },
  'annual':   { label: 'Annual',   cls: 'badge-info'    },
  'sick':     { label: 'Sick',     cls: 'badge-warning' },
  'personal': { label: 'Personal', cls: 'badge-neutral' },
};

const DOT_COLORS = {
  'on-time':  'bg-emerald-500',
  'late':     'bg-amber-500',
  'absent':   'bg-red-500',
  'pending':  'bg-blue-500',
  'approved': 'bg-emerald-500',
  'rejected': 'bg-red-500',
  'active':   'bg-emerald-500',
  'inactive': 'bg-slate-400',
};

export default function Badge({ status, withDot = false, custom }) {
  const config = STATUS_MAP[status] || { label: status, cls: 'badge-neutral' };

  return (
    <span className={config.cls}>
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[status] || 'bg-slate-400'}`} />
      )}
      {custom || config.label}
    </span>
  );
}
