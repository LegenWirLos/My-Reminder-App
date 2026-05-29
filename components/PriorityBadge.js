// Color-coded pill that shows a reminder's priority level.
const STYLES = {
  urgent: 'bg-rose-100 text-rose-700 border border-rose-200',
  normal: 'bg-violet-100 text-violet-700 border border-violet-200',
  low:    'bg-slate-100 text-slate-500 border border-slate-200',
}

const LABELS = { urgent: '🔴 Urgent', normal: '🟣 Normal', low: '⚪ Low' }

export default function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[priority] ?? STYLES.normal}`}>
      {LABELS[priority] ?? priority}
    </span>
  )
}
