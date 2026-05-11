import React, { useEffect, useMemo, useState } from 'react'
import {
  AnalyticsOutlined,
  AutoAwesome,
  ContentCopy,
  DeleteOutline,
  FactCheckOutlined,
  FileUploadOutlined,
  PsychologyAltOutlined,
  SecurityOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'

const questionTypes = [
  'Multiple Choice',
  'Identification',
  'True or False',
  'Matching Type',
  'Essay',
  'Coding Questions',
]

const bloomLevels = ['Recall', 'Application', 'Analysis']

const acceptedFormats = ['PDF', 'DOCX', 'PPTX', 'TXT', 'Images (OCR)']

function emptyQuestion(type = 'Multiple Choice') {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    type,
    bloom: 'Recall',
    difficulty: 'Medium',
    prompt: '',
    alt_text: '',
    options: [
      { text: '', correct: true, feedback: 'Correct. This matches the key concept.' },
      { text: '', correct: false, feedback: 'This choice reflects a common misconception. Review the related lesson section.' },
      { text: '', correct: false, feedback: 'This is close, but it misses an important condition in the question.' },
      { text: '', correct: false, feedback: 'This option does not follow from the concept being assessed.' },
    ],
    answer: '',
    explanation: '',
    hint: '',
    rubric: '',
    codeLanguage: 'javascript',
    testCases: '',
    matches: [
      { left: '', right: '' },
      { left: '', right: '' },
    ],
  }
}

const defaultDraft = {
  title: 'Adaptive Assessment Draft',
  description: '',
  topic: '',
  count: 5,
  timer: 30,
  attempts: 2,
  randomizeQuestions: true,
  randomizeOptions: true,
  questionBank: 'General',
  adaptiveFeedback: true,
  hintsOnly: true,
  followUps: true,
  studyRecommendations: true,
  confidenceScoring: true,
  browserLockdown: false,
  tabSwitchDetection: true,
  plagiarismDetection: true,
  speechSupport: true,
  largeTypography: true,
  colorblindSafe: true,
  questions: [emptyQuestion()],
}

function Panel({ children, className = '' }) {
  return <section className={`rounded-[24px] border-2 border-black bg-white p-5 shadow-[6px_6px_0_#006400] ${className}`}>{children}</section>
}

function Pill({ children, tone = 'green' }) {
  const styles = {
    green: 'border-[#006400] bg-[#E6FFE6] text-[#006400]',
    dark: 'border-black bg-black text-white',
    light: 'border-[#F0F0F0] bg-white text-black',
  }
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${styles[tone]}`}>{children}</span>
}

function scanText(text) {
  const normalized = text.toLowerCase()
  const words = normalized.match(/[a-z][a-z-]{3,}/g) || []
  const counts = words.reduce((acc, word) => {
    if (['that', 'this', 'with', 'from', 'have', 'will', 'your', 'about', 'into', 'their', 'there'].includes(word)) return acc
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {})
  const concepts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word)

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const duplicateLines = lines.length - new Set(lines).size
  const unsupportedFlags = ['answer key only', 'unsupported content', 'inappropriate'].filter((term) => normalized.includes(term))

  return {
    wordCount: words.length,
    concepts,
    definitions: lines.filter((line) => /\bis\b|\bare\b|means|defined as/i.test(line)).slice(0, 4),
    formulas: lines.filter((line) => /[=+\-*/^]|formula|equation/i.test(line)).slice(0, 4),
    duplicateLines,
    unsupportedFlags,
  }
}

function generatedQuestionsFromTopic(topic, count, scanSummary) {
  const sourceConcepts = scanSummary?.concepts?.length ? scanSummary.concepts : topic.split(/\s+/).filter(Boolean)
  const concepts = sourceConcepts.length ? sourceConcepts : ['core concept', 'definition', 'process']

  return Array.from({ length: Number(count) || 5 }).map((_, index) => {
    const concept = concepts[index % concepts.length]
    const bloom = bloomLevels[index % bloomLevels.length]
    const q = emptyQuestion(index % 5 === 1 ? 'Identification' : index % 5 === 2 ? 'True or False' : index % 5 === 3 ? 'Essay' : 'Multiple Choice')
    q.bloom = bloom
    q.difficulty = index % 3 === 0 ? 'Easy' : index % 3 === 1 ? 'Medium' : 'Hard'
    q.prompt =
      bloom === 'Recall'
        ? `Which statement best defines ${concept}?`
        : bloom === 'Application'
          ? `A student needs to use ${concept} in a new learning task. What should they do first?`
          : `Which explanation best shows how ${concept} affects the overall topic?`
    q.alt_text = `Question about ${concept} at the ${bloom} level.`
    q.answer = `A clear answer about ${concept}.`
    q.explanation = `The correct response should connect ${concept} to the main idea and avoid surface-level guessing.`
    q.hint = `Review the material section where ${concept} is introduced, then identify the rule or condition being used.`
    q.options = [
      { text: `${concept} is the central idea used to solve the task.`, correct: true, feedback: `Correct. This connects ${concept} to the learning goal.` },
      { text: `${concept} is only a minor detail and can be ignored.`, correct: false, feedback: `This is a misconception. ${concept} is being assessed because it affects the answer. Revisit the key concept summary.` },
      { text: `${concept} always works the same way in every situation.`, correct: false, feedback: `This overgeneralizes the idea. Check when the rule applies and when it changes.` },
      { text: `${concept} is unrelated to the topic.`, correct: false, feedback: `This misses the relationship between the concept and the topic. Review the source material connections.` },
    ]
    return q
  })
}

export default function QuizMaker() {
  const [draft, setDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('academee_quiz_maker_draft') || 'null') || defaultDraft
    } catch (_e) {
      return defaultDraft
    }
  })
  const [activeTab, setActiveTab] = useState('builder')
  const [scanSummary, setScanSummary] = useState(null)
  const [scanStatus, setScanStatus] = useState('No files scanned yet.')

  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem('academee_quiz_maker_draft', JSON.stringify(draft))
    }, 350)
    return () => clearTimeout(id)
  }, [draft])

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }))

  const updateQuestion = (id, patch) => {
    update({
      questions: draft.questions.map((question) => (question.id === id ? { ...question, ...patch } : question)),
    })
  }

  const addQuestion = (type = 'Multiple Choice') => {
    update({ questions: [...draft.questions, emptyQuestion(type)] })
  }

  const removeQuestion = (id) => {
    update({ questions: draft.questions.length > 1 ? draft.questions.filter((question) => question.id !== id) : draft.questions })
  }

  const handleFiles = async (files) => {
    const list = Array.from(files || [])
    if (!list.length) return

    const textParts = []
    for (const file of list) {
      if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        textParts.push(await file.text())
      } else {
        textParts.push(`${file.name}\nFormat detected. Full extraction requires the backend OCR/document parser.`)
      }
    }

    const summary = scanText(textParts.join('\n'))
    setScanSummary({ ...summary, files: list.map((file) => file.name) })
    setScanStatus(`${list.length} file(s) scanned. ${summary.concepts.length} key concepts detected.`)
  }

  const generateQuiz = () => {
    const questions = generatedQuestionsFromTopic(draft.topic || draft.title, draft.count, scanSummary)
    update({
      questions,
      description: draft.description || 'AI-generated adaptive quiz draft. Review before publishing.',
    })
    setActiveTab('preview')
  }

  const analytics = useMemo(() => {
    const counts = draft.questions.reduce((acc, question) => {
      acc[question.type] = (acc[question.type] || 0) + 1
      return acc
    }, {})
    return {
      total: draft.questions.length,
      adaptiveItems: draft.questions.filter((question) => question.options?.some((option) => option.feedback)).length,
      highDifficulty: draft.questions.filter((question) => question.difficulty === 'Hard').length,
      typeSummary: Object.entries(counts).map(([type, count]) => `${type}: ${count}`).join(', '),
    }
  }, [draft.questions])

  const exportJson = {
    title: draft.title,
    description: draft.description,
    settings: {
      timer_minutes: Number(draft.timer),
      attempts_limit: Number(draft.attempts),
      randomize_questions: draft.randomizeQuestions,
      randomize_options: draft.randomizeOptions,
      question_bank: draft.questionBank,
      accessibility: {
        speech_to_text: draft.speechSupport,
        text_to_speech: draft.speechSupport,
        large_typography: draft.largeTypography,
        colorblind_friendly: draft.colorblindSafe,
      },
      security: {
        browser_lockdown: draft.browserLockdown,
        tab_switch_detection: draft.tabSwitchDetection,
        plagiarism_detection: draft.plagiarismDetection,
      },
    },
    questions: draft.questions,
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel className="bg-[#E6FFE6]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Pill tone="dark">AI Quiz Maker</Pill>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-black">Build adaptive assessments faster</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-black/65">
                Create quizzes manually, scan learning files, generate AI-assisted items, preview the student experience, and export structured adaptive quiz JSON.
              </p>
            </div>
            <button type="button" onClick={generateQuiz} className="rounded-2xl border-2 border-black bg-[#006400] px-5 py-3 text-sm font-black text-white shadow-[4px_4px_0_#000]">
              Generate with AI
            </button>
          </div>
        </Panel>

        <Panel>
          <div className="grid grid-cols-2 gap-3">
            <Metric icon={<FactCheckOutlined />} label="Questions" value={analytics.total} />
            <Metric icon={<PsychologyAltOutlined />} label="Adaptive" value={analytics.adaptiveItems} />
            <Metric icon={<AnalyticsOutlined />} label="Hard Items" value={analytics.highDifficulty} />
            <Metric icon={<SecurityOutlined />} label="Attempts" value={draft.attempts} />
          </div>
        </Panel>
      </div>

      <div className="flex flex-wrap gap-2">
        {['builder', 'files', 'preview', 'analytics', 'export'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border-2 border-black px-4 py-2 text-sm font-black capitalize ${activeTab === tab ? 'bg-[#006400] text-white' : 'bg-white text-black'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'builder' ? (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Panel>
            <h2 className="text-xl font-black text-black">Quiz setup</h2>
            <div className="mt-4 grid gap-3">
              <Field label="Title"><input className="input-base" value={draft.title} onChange={(e) => update({ title: e.target.value })} /></Field>
              <Field label="Topic or prompt"><textarea className="input-base min-h-[90px]" value={draft.topic} onChange={(e) => update({ topic: e.target.value })} placeholder="Example: JavaScript loops, photosynthesis, Philippine history" /></Field>
              <Field label="Description"><textarea className="input-base min-h-[80px]" value={draft.description} onChange={(e) => update({ description: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Timer"><input className="input-base" type="number" min="1" value={draft.timer} onChange={(e) => update({ timer: e.target.value })} /></Field>
                <Field label="Attempts"><input className="input-base" type="number" min="1" value={draft.attempts} onChange={(e) => update({ attempts: e.target.value })} /></Field>
              </div>
              <Field label="Question count"><input className="input-base" type="number" min="1" value={draft.count} onChange={(e) => update({ count: e.target.value })} /></Field>
              <Field label="Question bank"><input className="input-base" value={draft.questionBank} onChange={(e) => update({ questionBank: e.target.value })} /></Field>
            </div>
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-black">Questions</h2>
              <select className="input-base max-w-xs" onChange={(e) => addQuestion(e.target.value)} value="">
                <option value="" disabled>Add question type</option>
                {questionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="mt-5 space-y-4">
              {draft.questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  index={index}
                  question={question}
                  onChange={(patch) => updateQuestion(question.id, patch)}
                  onRemove={() => removeQuestion(question.id)}
                />
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {activeTab === 'files' ? (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Panel>
            <h2 className="text-xl font-black text-black">File scanning</h2>
            <p className="mt-2 text-sm font-semibold leading-7 text-black/60">
              Upload materials for concept extraction. Browser-side TXT extraction is active; PDF, DOCX, PPTX, image OCR, and URL parsing are ready for backend AI/OCR integration.
            </p>
            <label className="mt-5 grid cursor-pointer place-items-center rounded-[22px] border-2 border-dashed border-black bg-[#E6FFE6] p-8 text-center">
              <FileUploadOutlined sx={{ fontSize: 42, color: '#006400' }} />
              <span className="mt-3 text-sm font-black text-black">Drop or choose files</span>
              <input type="file" multiple className="sr-only" accept=".pdf,.docx,.pptx,.txt,image/*" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {acceptedFormats.map((format) => <Pill key={format}>{format}</Pill>)}
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-black text-black">Scan results</h2>
            <p className="mt-2 rounded-2xl bg-[#E6FFE6] p-3 text-sm font-bold text-[#006400]">{scanStatus}</p>
            {scanSummary ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ResultBlock title="Key concepts" items={scanSummary.concepts} />
                <ResultBlock title="Definitions found" items={scanSummary.definitions} />
                <ResultBlock title="Formulas or logic" items={scanSummary.formulas} />
                <ResultBlock title="Integrity scan" items={[`${scanSummary.duplicateLines} duplicate lines`, scanSummary.unsupportedFlags.length ? scanSummary.unsupportedFlags.join(', ') : 'No unsupported content flags']} />
              </div>
            ) : null}
          </Panel>
        </div>
      ) : null}

      {activeTab === 'preview' ? (
        <Panel>
          <div className="mb-5 flex items-center gap-3">
            <VisibilityOutlined />
            <h2 className="text-xl font-black text-black">Real-time student preview</h2>
          </div>
          <div className="space-y-4">
            {draft.questions.map((question, index) => (
              <div key={question.id} className="rounded-[22px] border-2 border-[#F0F0F0] bg-[#FAFFFA] p-4">
                <div className="flex flex-wrap gap-2">
                  <Pill>{question.type}</Pill>
                  <Pill tone="light">{question.bloom}</Pill>
                  <Pill tone="light">{question.difficulty}</Pill>
                </div>
                <h3 className="mt-4 text-lg font-black text-black">{index + 1}. {question.prompt || 'Untitled question'}</h3>
                {question.alt_text ? <p className="mt-2 text-xs font-semibold text-black/50">Alt text: {question.alt_text}</p> : null}
                {question.type === 'Multiple Choice' || question.type === 'True or False' ? (
                  <div className="mt-4 grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="rounded-2xl border border-[#F0F0F0] bg-white p-3">
                        <p className="text-sm font-bold text-black">{String.fromCharCode(65 + optionIndex)}. {option.text || 'Option text'}</p>
                        {!option.correct ? <p className="mt-1 text-xs font-semibold text-[#006400]">Adaptive feedback: {option.feedback}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea className="input-base mt-4 min-h-[100px]" placeholder="Student answer area" readOnly />
                )}
                <p className="mt-3 text-sm font-semibold text-black/60">Hint: {question.hint || 'A targeted hint will appear here.'}</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {activeTab === 'analytics' ? (
        <Panel>
          <h2 className="text-xl font-black text-black">Smart analytics dashboard</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <Metric icon={<AnalyticsOutlined />} label="Total questions" value={analytics.total} />
            <Metric icon={<PsychologyAltOutlined />} label="Adaptive items" value={analytics.adaptiveItems} />
            <Metric icon={<FactCheckOutlined />} label="Question mix" value={draft.questions.length ? `${new Set(draft.questions.map((q) => q.type)).size} types` : '0'} />
            <Metric icon={<SecurityOutlined />} label="Integrity" value={draft.tabSwitchDetection ? 'On' : 'Off'} />
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <SettingsGroup title="Adaptive feedback" draft={draft} update={update} keys={['adaptiveFeedback', 'hintsOnly', 'followUps', 'studyRecommendations', 'confidenceScoring']} />
            <SettingsGroup title="Security and integrity" draft={draft} update={update} keys={['browserLockdown', 'tabSwitchDetection', 'plagiarismDetection']} />
            <SettingsGroup title="Accessibility" draft={draft} update={update} keys={['speechSupport', 'largeTypography', 'colorblindSafe']} />
          </div>
          <p className="mt-5 rounded-2xl bg-[#E6FFE6] p-4 text-sm font-semibold text-black/70">
            AI insight: Review items tagged as Hard and Analysis. These are most useful for detecting weak areas and generating follow-up remediation questions.
          </p>
        </Panel>
      ) : null}

      {activeTab === 'export' ? (
        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-black">Structured adaptive quiz JSON</h2>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(JSON.stringify(exportJson, null, 2))}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-[#006400] px-4 py-2 text-sm font-black text-white"
            >
              <ContentCopy sx={{ fontSize: 18 }} /> Copy JSON
            </button>
          </div>
          <pre className="max-h-[520px] overflow-auto rounded-[20px] bg-black p-4 text-xs leading-6 text-[#E6FFE6]">
            {JSON.stringify(exportJson, null, 2)}
          </pre>
        </Panel>
      ) : null}
    </div>
  )
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-[18px] border-2 border-[#F0F0F0] bg-[#FAFFFA] p-4">
      <span className="text-[#006400]">{icon}</span>
      <p className="mt-3 text-2xl font-black text-black">{value}</p>
      <p className="text-xs font-bold text-black/50">{label}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-black/55">{label}</span>
      {children}
    </label>
  )
}

function QuestionEditor({ question, index, onChange, onRemove }) {
  const setOption = (optionIndex, patch) => {
    onChange({
      options: question.options.map((option, index) => (index === optionIndex ? { ...option, ...patch } : option)),
    })
  }

  return (
    <div className="rounded-[22px] border-2 border-[#F0F0F0] bg-[#FAFFFA] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-black">Question {index + 1}</h3>
        <button type="button" onClick={onRemove} className="rounded-full bg-white p-2 text-red-600">
          <DeleteOutline />
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Field label="Type"><select className="input-base" value={question.type} onChange={(e) => onChange({ type: e.target.value })}>{questionTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
        <Field label="Bloom level"><select className="input-base" value={question.bloom} onChange={(e) => onChange({ bloom: e.target.value })}>{bloomLevels.map((level) => <option key={level}>{level}</option>)}</select></Field>
        <Field label="Difficulty"><select className="input-base" value={question.difficulty} onChange={(e) => onChange({ difficulty: e.target.value })}>{['Easy', 'Medium', 'Hard'].map((level) => <option key={level}>{level}</option>)}</select></Field>
      </div>
      <div className="mt-3 grid gap-3">
        <Field label="Prompt"><textarea className="input-base min-h-[90px]" value={question.prompt} onChange={(e) => onChange({ prompt: e.target.value })} /></Field>
        <Field label="Alt text for screen readers"><input className="input-base" value={question.alt_text} onChange={(e) => onChange({ alt_text: e.target.value })} /></Field>
      </div>

      {question.type === 'Multiple Choice' || question.type === 'True or False' ? (
        <div className="mt-4 grid gap-3">
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="grid gap-2 rounded-2xl bg-white p-3">
              <div className="flex items-center gap-3">
                <input type="radio" checked={option.correct} onChange={() => onChange({ options: question.options.map((item, index) => ({ ...item, correct: index === optionIndex })) })} />
                <input className="input-base" value={option.text} onChange={(e) => setOption(optionIndex, { text: e.target.value })} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} />
              </div>
              {!option.correct ? <textarea className="input-base min-h-[70px]" value={option.feedback} onChange={(e) => setOption(optionIndex, { feedback: e.target.value })} placeholder="Specific adaptive feedback for this wrong answer" /> : null}
            </div>
          ))}
        </div>
      ) : null}

      {question.type === 'Matching Type' ? (
        <div className="mt-4 grid gap-3">
          {question.matches.map((pair, pairIndex) => (
            <div key={pairIndex} className="grid gap-3 md:grid-cols-2">
              <input className="input-base" value={pair.left} onChange={(e) => onChange({ matches: question.matches.map((item, index) => index === pairIndex ? { ...item, left: e.target.value } : item) })} placeholder="Term" />
              <input className="input-base" value={pair.right} onChange={(e) => onChange({ matches: question.matches.map((item, index) => index === pairIndex ? { ...item, right: e.target.value } : item) })} placeholder="Match" />
            </div>
          ))}
          <button type="button" onClick={() => onChange({ matches: [...question.matches, { left: '', right: '' }] })} className="rounded-2xl border-2 border-dashed border-black bg-white px-4 py-2 text-sm font-black">Add pair</button>
        </div>
      ) : null}

      {question.type === 'Coding Questions' ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Language"><input className="input-base" value={question.codeLanguage} onChange={(e) => onChange({ codeLanguage: e.target.value })} /></Field>
          <Field label="Test cases"><textarea className="input-base min-h-[90px]" value={question.testCases} onChange={(e) => onChange({ testCases: e.target.value })} /></Field>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Field label="Answer key"><textarea className="input-base min-h-[80px]" value={question.answer} onChange={(e) => onChange({ answer: e.target.value })} /></Field>
        <Field label="Hint"><textarea className="input-base min-h-[80px]" value={question.hint} onChange={(e) => onChange({ hint: e.target.value })} /></Field>
        <Field label="Explanation or rubric"><textarea className="input-base min-h-[80px]" value={question.explanation || question.rubric} onChange={(e) => onChange({ explanation: e.target.value, rubric: e.target.value })} /></Field>
      </div>
    </div>
  )
}

function ResultBlock({ title, items }) {
  return (
    <div className="rounded-[20px] border-2 border-[#F0F0F0] bg-[#FAFFFA] p-4">
      <h3 className="font-black text-black">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm font-semibold text-black/65">
        {(items || []).length ? items.map((item, index) => <li key={index}>{item}</li>) : <li>No items detected yet.</li>}
      </ul>
    </div>
  )
}

function SettingsGroup({ title, draft, update, keys }) {
  const labels = {
    adaptiveFeedback: 'Adaptive feedback',
    hintsOnly: 'Hints before answers',
    followUps: 'Follow-up questions',
    studyRecommendations: 'Study recommendations',
    confidenceScoring: 'AI confidence scoring',
    browserLockdown: 'Browser lockdown',
    tabSwitchDetection: 'Tab-switch detection',
    plagiarismDetection: 'Plagiarism detection',
    speechSupport: 'Speech support',
    largeTypography: 'Large typography',
    colorblindSafe: 'Colorblind-friendly UI',
  }

  return (
    <div className="rounded-[20px] border-2 border-[#F0F0F0] bg-[#FAFFFA] p-4">
      <h3 className="font-black text-black">{title}</h3>
      <div className="mt-3 space-y-2">
        {keys.map((key) => (
          <label key={key} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-black/70">
            {labels[key]}
            <input type="checkbox" checked={Boolean(draft[key])} onChange={(e) => update({ [key]: e.target.checked })} />
          </label>
        ))}
      </div>
    </div>
  )
}
