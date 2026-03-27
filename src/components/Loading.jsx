import React from 'react'

export default function Loading({ message = 'Loading…', className = '', children }){
  return (
    <div role="status" aria-live="polite" className={`text-sm text-muted ${className}`}>
      <span className="sr-only">{message}</span>
      {children ? children : (
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-token-muted animate-pulse" />
          <div>{message}</div>
        </div>
      )}
    </div>
  )
}
