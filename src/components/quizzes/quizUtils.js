export function normalizeQuizQuestions(value) {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => ({
        id: item.id || `question-${index + 1}`,
        text: String(item.text || '').trim(),
        options: Array.isArray(item.options) ? item.options.map((opt) => String(opt || '').trim()) : [],
        correct: Number.isInteger(item.correct) ? item.correct : 0,
      }))
      .filter((item) => item.text && item.options.length > 1)
  }

  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `question-${index + 1}`,
      text: line,
      options: [],
      correct: 0,
    }))
}

export function buildQuestionFeedback(question, chosenIndex) {
  if (!question || chosenIndex == null) return ''
  const correct = chosenIndex === question.correct
  const chosenText = question.options?.[chosenIndex] || 'your answer'
  const correctText = question.options?.[question.correct] || 'the correct answer'

  if (correct) {
    return `Correct. ${correctText} is the best answer for this item, so you are on the right track.`
  }

  return `Not quite yet. You chose "${chosenText}", but the correct answer is "${correctText}". Review the wording of the question and try to notice the clue that points to the best choice.`
}

export function buildOverallFeedback(score, total) {
  if (!total) return 'No quiz results yet.'
  const pct = Math.round((score / total) * 100)

  if (pct >= 90) return 'Excellent work. You showed strong understanding across this quiz and can move forward with confidence.'
  if (pct >= 75) return 'Good work. You have a solid grasp of the material, with just a few details worth reviewing.'
  if (pct >= 50) return 'You are making progress. Revisit the missed items and focus on the concepts that felt uncertain.'
  return 'This is a good checkpoint for review. Slow down, revisit the lesson material, and try again once the core ideas feel clearer.'
}

export function parseSubmissionContent(content) {
  if (!content) return null
  if (typeof content === 'object') return content
  try {
    return JSON.parse(content)
  } catch (_error) {
    return null
  }
}
