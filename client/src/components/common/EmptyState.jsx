export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-slate-100 dark:bg-dark-card2 rounded-2xl
                        flex items-center justify-center mb-4">
          <Icon size={28} className="text-light-muted dark:text-dark-muted" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-light-text dark:text-dark-text max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}
