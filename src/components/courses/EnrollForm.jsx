import React from 'react'

export default function EnrollForm({
  enrollCode,
  setEnrollCode,
  enrollMsg,
  onJoin,
  onCancel,
}) {
  return (
    <div className="max-w-md space-y-4 rounded-2xl border border-token bg-surface p-5">
      <p className="text-sm text-muted">
        Ask your teacher for the class code, then enter it here.
      </p>

      <input
        className="w-full rounded-xl border-2 border-token bg-surface p-4 text-lg uppercase tracking-widest outline-none focus:border-green-600"
        placeholder="Class code"
        value={enrollCode}
        onChange={(e) => setEnrollCode(e.target.value)}
      />

      <div className="flex gap-3">
        <button
          onClick={onJoin}
          className="rounded-xl bg-green-700 px-5 py-2 font-medium text-white hover:bg-green-800"
        >
          Join
        </button>

        <button onClick={onCancel} className="rounded-xl px-5 py-2 text-muted hover-surface">
          Cancel
        </button>
      </div>

      {enrollMsg && <p className="text-sm font-medium text-red-500">{enrollMsg}</p>}
    </div>
  )
}