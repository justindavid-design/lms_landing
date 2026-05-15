import React from 'react'

/**
 * LoadingSkeleton Component
 * Provides smooth skeleton loading states for various content sizes
 */
export function SkeletonLoader({ className = 'h-4 w-full' }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <SkeletonLoader className="h-6 w-48 mb-4" />
      <SkeletonLoader className="h-4 w-full mb-2" />
      <SkeletonLoader className="h-4 w-5/6 mb-6" />
      <div className="flex gap-3">
        <SkeletonLoader className="h-8 w-20" />
        <SkeletonLoader className="h-8 w-20" />
      </div>
    </div>
  )
}

export function TextSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          className={i === lines - 1 ? 'h-4 w-4/5' : 'h-4 w-full'}
        />
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonLoader className="h-10 w-full" />
      <SkeletonLoader className="h-10 w-full" />
      <SkeletonLoader className="h-24 w-full" />
      <div className="flex gap-3 pt-4">
        <SkeletonLoader className="h-10 flex-1" />
        <SkeletonLoader className="h-10 flex-1" />
      </div>
    </div>
  )
}

export function GridSkeleton({ columns = 3 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {Array.from({ length: columns }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export default SkeletonLoader
