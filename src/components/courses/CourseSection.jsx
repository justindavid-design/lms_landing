import React from 'react'
import CourseGrid from './CourseGrid'

export default function CourseSection({
  title,
  items,
  emptyText,
  user,
  profileName,
  onCopyCode,
  onEdit,
  onDelete,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-[-0.03em] text-main">{title}</h2>
        <span className="rounded-full border border-token bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
          {items.length} class{items.length === 1 ? '' : 'es'}
        </span>
      </div>

      {items.length > 0 ? (
        <CourseGrid
          items={items}
          user={user}
          profileName={profileName}
          onCopyCode={onCopyCode}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <div className="rounded-lg border border-token bg-surface p-5 text-sm text-muted">
          {emptyText}
        </div>
      )}
    </section>
  )
}
