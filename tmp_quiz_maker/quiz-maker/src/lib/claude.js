const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

/**
 * Calls the Anthropic Claude API.
 * In production, proxy this through your backend to keep your API key server-side.
 * Replace VITE_ANTHROPIC_API_KEY with a server-side env var in your Node/Express API.
 */
async function callClaude(messages, maxTokens = 300) {
  const res = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content?.map((b) => (b.type === 'text' ? b.text : '')).join('') ?? '';
}

/**
 * Per-question adaptive feedback.
 * @param {object} q         - { text, options[], correct }
 * @param {number} chosen    - index the student chose
 * @param {boolean} isCorrect
 * @param {string} subject
 */
export async function getQuestionFeedback(q, chosen, isCorrect, subject = '') {
  const prompt = `You are a warm, supportive LMS tutor for ${subject || 'a course'}.
A student just answered a quiz question.

Question: "${q.text}"
Student's answer: "${q.options[chosen]}"
Correct answer: "${q.options[q.correct]}"
Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Write 2–3 sentences of adaptive feedback.
- If correct: celebrate briefly and add one interesting insight about the topic.
- If incorrect: gently explain why the correct answer is right; do not make the student feel bad.
Keep the tone encouraging and age-appropriate.`;

  return callClaude([{ role: 'user', content: prompt }]);
}

/**
 * End-of-quiz overall adaptive feedback.
 * @param {object[]} answers  - [{ q, chosen, isCorrect }]
 * @param {number}   score
 * @param {number}   total
 * @param {string}   subject
 */
export async function getOverallFeedback(answers, score, total, subject = '') {
  const pct = Math.round((score / total) * 100);
  const missed = answers
    .filter((a) => !a.isCorrect)
    .map(
      (a) =>
        `• "${a.q.text}" — student chose "${a.q.options[a.chosen]}", correct is "${a.q.options[a.q.correct]}"`
    )
    .join('\n');

  const prompt = `You are a supportive LMS tutor for ${subject || 'a course'}.
The student just finished a quiz and scored ${score}/${total} (${pct}%).

${missed ? `Missed questions:\n${missed}` : 'The student answered every question correctly!'}

Write 3–4 sentences of personalized end-of-quiz feedback.
- Acknowledge the score warmly.
- If there were mistakes, mention the specific topics to revisit.
- End with an encouraging note about their progress.`;

  return callClaude([{ role: 'user', content: prompt }], 400);
}
