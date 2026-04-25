import React from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

function createEmptyQuestion() {
  return {
    text: '',
    options: ['', '', '', ''],
    correct: 0,
  }
}

export function createEmptyQuizDraft() {
  return {
    title: '',
    description: '',
    due_at: '',
    status: 'published',
    questions: [createEmptyQuestion()],
  }
}

export default function QuizComposer({ value, onChange }) {
  const update = (next) => onChange(next)

  const updateField = (field, fieldValue) => {
    update({ ...value, [field]: fieldValue })
  }

  const updateQuestion = (index, nextQuestion) => {
    update({
      ...value,
      questions: value.questions.map((question, questionIndex) => (questionIndex === index ? nextQuestion : question)),
    })
  }

  const addQuestion = () => {
    update({
      ...value,
      questions: [...value.questions, createEmptyQuestion()],
    })
  }

  const removeQuestion = (index) => {
    update({
      ...value,
      questions: value.questions.filter((_, questionIndex) => questionIndex !== index),
    })
  }

  return (
    <div className="grid gap-3">
      <input className="input-base" placeholder="Quiz title" value={value.title} onChange={(e) => updateField('title', e.target.value)} />
      <textarea className="input-base min-h-[90px]" placeholder="Quiz description" value={value.description} onChange={(e) => updateField('description', e.target.value)} />

      <div className="grid gap-3 md:grid-cols-2">
        <input className="input-base" type="datetime-local" value={value.due_at} onChange={(e) => updateField('due_at', e.target.value)} />
        <select className="input-base" value={value.status} onChange={(e) => updateField('status', e.target.value)}>
          <option value="published">Publish now</option>
          <option value="draft">Save as draft</option>
        </select>
      </div>

      <div className="space-y-4">
        {value.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="rounded-[24px] border border-token bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-subtle">Question {questionIndex + 1}</p>
              {value.questions.length > 1 ? (
                <button type="button" onClick={() => removeQuestion(questionIndex)} className="text-xs font-semibold text-red-600">
                  Remove
                </button>
              ) : null}
            </div>

            <textarea
              className="input-base min-h-[88px]"
              placeholder="Type your question here"
              value={question.text}
              onChange={(e) => updateQuestion(questionIndex, { ...question, text: e.target.value })}
            />

            <div className="mt-4 space-y-3">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuestion(questionIndex, { ...question, correct: optionIndex })}
                    className="text-[#1a3a28]"
                    aria-label={`Mark option ${optionIndex + 1} as correct`}
                  >
                    {question.correct === optionIndex ? (
                      <CheckCircleIcon style={{ fontSize: 22 }} />
                    ) : (
                      <RadioButtonUncheckedIcon style={{ fontSize: 22, color: '#9ca3af' }} />
                    )}
                  </button>
                  <input
                    className="input-base"
                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                    value={option}
                    onChange={(e) =>
                      updateQuestion(questionIndex, {
                        ...question,
                        options: question.options.map((item, index) => (index === optionIndex ? e.target.value : item)),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addQuestion} className="rounded-2xl border-2 border-dashed border-token bg-app px-4 py-3 text-sm font-semibold text-main">
        Add question
      </button>
    </div>
  )
}
