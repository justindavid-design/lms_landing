import React, { useEffect, useState } from 'react'

export default function CourseForm({ initial = {}, onSave, onCancel, saving = false }) {
  const [title, setTitle] = useState(initial.title || '')
  const [section, setSection] = useState(initial.section || '')
  const [level, setLevel] = useState(initial.level || '')
  const [subject, setSubject] = useState(initial.subject || '')
  const [published, setPublished] = useState(!!initial.published)

  useEffect(() => {
    setTitle(initial.title || '')
    setSection(initial.section || '')
    setLevel(initial.level || '')
    setSubject(initial.subject || '')
    setPublished(!!initial.published)
  }, [initial])

  const handleSave = async () => {
    const slug = String(title)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
    
    console.log('Course payload:', { title, slug, section, level, subject, published })
    
    await onSave({
      id: initial.id,
      title: title.trim(),
      slug,
      section: section.trim(),
      level: level.trim(),
      subject: subject.trim(),
      published,
    })
  }

  return (
    <div className="space-y-4 rounded-lg border border-token bg-surface p-5">
      <input
        className="input-base"
        placeholder="Course title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="input-base"
        placeholder="Section, e.g. STEM 11-A"
        value={section}
        onChange={(e) => setSection(e.target.value)}
      />

      <input
        className="input-base"
        placeholder="Level, e.g. Grade 11"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      />

      <input
        className="input-base"
        placeholder="Subject, e.g. General Biology"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-main">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Show this course to students
        </label>

        <div className="flex-1" />

        <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-60">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
