import React from 'react'

export default function EnrollForm({
  enrollCode,
  setEnrollCode,
  enrollMsg,
  onJoin,
  onCancel,
  loading = false,
}) {
  return (
    <div className="max-w-xl space-y-4 rounded-lg border border-token bg-app p-5">
      <p className="text-sm leading-7 text-muted">
        Ask your teacher for the class code, then enter it here.
      </p>

      <input
        className="w-full rounded-lg border border-token bg-surface p-4 text-lg uppercase tracking-[0.2em] outline-none focus:border-gray-700"
        placeholder="Class code"
        value={enrollCode}
        onChange={(e) => setEnrollCode(e.target.value)}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onJoin}
          disabled={loading}
          className="rounded-lg bg-[#111827] px-5 py-3 font-medium text-white hover:bg-[#374151] disabled:opacity-60"
        >
          {loading ? 'Joining...' : 'Join'}
        </button>

        <button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-token bg-surface px-5 py-3 text-main hover-surface disabled:opacity-60">
          Cancel
        </button>
      </div>

      {enrollMsg && <p className="text-sm font-medium text-red-500">{enrollMsg}</p>}
    </div>
  )
}
