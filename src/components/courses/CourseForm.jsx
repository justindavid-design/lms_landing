import React, { useEffect, useState } from 'react'

export default function CourseForm({ initial = {}, onSave, onCancel }) {
  const [title, setTitle] = useState(initial.title || '')
  const [slug, setSlug] = useState(initial.slug || '')
  const [description, setDescription] = useState(initial.description || '')
  const [published, setPublished] = useState(!!initial.published)

  useEffect(() => {
    setTitle(initial.title || '')
    setSlug(initial.slug || '')
    setDescription(initial.description || '')
    setPublished(!!initial.published)
  }, [initial])

  const handleSave = () => {
    onSave({
      id: initial.id,
      title,
      slug,
      description,
      published,
    })
  }

  return (
    <div className="space-y-4 rounded-2xl border border-token bg-surface p-5">
      <input
        className="input-base"
        placeholder="Course title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="input-base"
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      <textarea
        className="input-base min-h-[120px]"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-main">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>

        <div className="flex-1" />

        <button onClick={onCancel} className="rounded-xl border px-4 py-2 text-sm">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
      </div>
    </div>
  )
}