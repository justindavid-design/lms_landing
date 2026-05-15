// Professional color palette for random course colors
const profesionalColors = [
  { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-50', accent: 'bg-blue-500' },
  { bg: 'from-indigo-600 to-purple-600', text: 'text-indigo-50', accent: 'bg-indigo-500' },
  { bg: 'from-emerald-600 to-teal-600', text: 'text-emerald-50', accent: 'bg-emerald-500' },
  { bg: 'from-amber-600 to-orange-600', text: 'text-amber-50', accent: 'bg-amber-500' },
  { bg: 'from-rose-600 to-pink-600', text: 'text-rose-50', accent: 'bg-rose-500' },
  { bg: 'from-violet-600 to-fuchsia-600', text: 'text-violet-50', accent: 'bg-violet-500' },
  { bg: 'from-cyan-600 to-blue-600', text: 'text-cyan-50', accent: 'bg-cyan-500' },
  { bg: 'from-green-600 to-emerald-600', text: 'text-green-50', accent: 'bg-green-500' },
]

export function getRandomColor(seed = '') {
  if (seed) {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i)
      hash = hash & hash
    }
    return profesionalColors[Math.abs(hash) % profesionalColors.length]
  }
  return profesionalColors[Math.floor(Math.random() * profesionalColors.length)]
}

export function copyToClipboard(text, onSuccess = null) {
  navigator.clipboard.writeText(text).then(() => {
    if (onSuccess) onSuccess()
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}
