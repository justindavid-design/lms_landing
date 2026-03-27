import React from 'react'
import { FolderOpen } from '@mui/icons-material'

export default function EmptyCoursesState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-token bg-surface p-16 text-center">
      <FolderOpen sx={{ fontSize: 72, opacity: 0.35 }} className="mb-4 text-muted" />
      <h2 className="text-2xl font-semibold text-main">No classes yet</h2>
      <p className="mt-2 max-w-md text-sm text-subtle">
        Create your first class or join one using a class code to start managing your learning space.
      </p>
    </div>
  )
}