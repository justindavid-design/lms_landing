export function getApiErrorMessage(data, fallback) {
  if (data?.code === 'MIGRATION_MISSING') {
    return `Setup required: ${data?.hint || 'Apply the latest database migrations and try again.'}`
  }
  return data?.error || fallback
}

export function generateCourseCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export function getCourseImage(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(String(seed || 'course'))}/700/500`
}