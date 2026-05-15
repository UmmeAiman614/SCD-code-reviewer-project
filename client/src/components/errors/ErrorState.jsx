import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'

export function ErrorState({ title = 'Something went wrong', message, onRetry, type = 'error' }) {
  const isNetwork = message?.toLowerCase().includes('network') || message?.toLowerCase().includes('timeout')

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
        ${type === 'error' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
        {isNetwork
          ? <WifiOff size={28} className="text-amber-500" />
          : <AlertTriangle size={28} className={type === 'error' ? 'text-red-500' : 'text-amber-500'} />
        }
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{message}</p>
      )}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm gap-2">
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  )
}
