import { Link } from 'react-router-dom'

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center text-center py-20 px-4">
      {Icon && (
        <div className="h-16 w-16 rounded-full bg-stone flex items-center justify-center mb-5">
          <Icon size={28} className="text-ink-soft" />
        </div>
      )}
      <h3 className="font-display text-xl mb-2">{title}</h3>
      {description && <p className="text-ink-soft text-sm max-w-xs mb-6">{description}</p>}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="px-5 py-2.5 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
