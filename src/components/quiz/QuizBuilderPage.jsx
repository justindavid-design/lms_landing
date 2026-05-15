import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../lib/AuthProvider'
import { apiFetch } from '../../lib/apiClient'
import { safeJson, getApiErrorMessage } from '../courses/utils'
import { QuizBuilderHeader, QuizSidebar } from './QuizBuilderSidebar'
import {
  MultipleChoiceCard,
  CheckboxCard,
  TrueFalseCard,
  ShortAnswerCard,
} from './QuestionCards'

/**
 * QuizBuilderPage - Modern Quizizz-inspired quiz builder
 * Routes:
 *   - Create: /dashboard/course/:courseId/quiz/create?type=multiple-choice
 *   - Edit: /dashboard/course/:courseId/quiz/:quizId/edit
 * 
 * Features:
 * - Full-screen immersive interface
 * - Multiple question types with dedicated cards
 * - Drag-and-drop question reordering
 * - Sticky header with autosave
 * - Right sidebar with navigator and stats
 * - Smooth animations with Framer Motion
 * - Responsive layout
 * - Auto-save functionality
 */
export default function QuizBuilderPage() {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') || 'multiple-choice'

  // Quiz Info State
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    time_limit: '',
    due_at: '',
    attempts_allowed: 1,
    passing_score: 70,
    status: 'draft',
  })

  // Questions State
  const [questions, setQuestions] = useState([])
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [draggedQuestion, setDraggedQuestion] = useState(null)

  // UI State
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [isEditMode, setIsEditMode] = useState(!!quizId)
  const [pageLoading, setPageLoading] = useState(isEditMode)

  // Create empty question template
  const createEmptyQuestion = (type = initialType) => ({
    id: Date.now() + Math.random(),
    type: type,
    text: '',
    points: 1,
    choices:
      type === 'short-answer'
        ? [{ id: 1, text: '', is_correct: true }]
        : type === 'true-false'
          ? [
              { id: 1, text: 'True', is_correct: false },
              { id: 2, text: 'False', is_correct: false },
            ]
          : [
              { id: 1, text: '', is_correct: false },
              { id: 2, text: '', is_correct: false },
            ],
  })

  // Load quiz if editing
  useEffect(() => {
    if (isEditMode && quizId && courseId) {
      loadQuiz()
    } else if (!isEditMode) {
      // Add first question for new quiz
      setQuestions([createEmptyQuestion()])
    }
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (questions.length > 0 && quizInfo.title.trim()) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave()
      }, 5000)
      return () => clearTimeout(autoSaveTimer)
    }
  }, [questions, quizInfo])

  const loadQuiz = async () => {
    setPageLoading(true)
    try {
      const res = await apiFetch(`/api/quizzes/${quizId}`)
      const data = await safeJson(res)

      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to load quiz'))

      setQuizInfo({
        title: data.title || '',
        description: data.description || '',
        time_limit: data.time_limit ? String(data.time_limit) : '',
        due_at: data.due_at ? new Date(data.due_at).toISOString().slice(0, 16) : '',
        attempts_allowed: data.attempts_allowed || 1,
        passing_score: data.passing_score || 70,
        status: data.status || 'draft',
      })

      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(
          data.questions.map(q => ({
            id: q.id || Date.now(),
            type: q.type || 'multiple-choice',
            text: q.text || '',
            points: q.points || 1,
            caseSensitive: q.caseSensitive || false,
            choices: q.choices || [
              { id: 1, text: '', is_correct: false },
              { id: 2, text: '', is_correct: false },
            ],
          }))
        )
      }
    } catch (err) {
      console.error(err)
      showMessage(err.message, 'error')
    } finally {
      setPageLoading(false)
    }
  }

  const showMessage = (text, type = 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 4000)
  }

  const handleAddQuestion = (type = initialType) => {
    const newQuestion = createEmptyQuestion(type)
    setQuestions([...questions, newQuestion])
    setExpandedQuestion(questions.length)
  }

  const handleUpdateQuestion = (index, updates) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updates }
    setQuestions(newQuestions)
  }

  const handleDeleteQuestion = (index) => {
    if (questions.length === 1) {
      showMessage('You must have at least one question', 'error')
      return
    }
    setQuestions(questions.filter((_, i) => i !== index))
    if (expandedQuestion === index) {
      setExpandedQuestion(null)
    }
  }

  const handleDragStart = (e, index) => {
    setDraggedQuestion(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    if (draggedQuestion === null || draggedQuestion === index) return

    const newQuestions = [...questions]
    const [draggedItem] = newQuestions.splice(draggedQuestion, 1)
    newQuestions.splice(index, 0, draggedItem)
    setQuestions(newQuestions)
    setDraggedQuestion(null)
  }

  const handleAutoSave = async () => {
    if (!quizInfo.title.trim() || questions.length === 0) return

    try {
      setAutoSaveStatus('saving')
      const quizData = {
        title: quizInfo.title,
        description: quizInfo.description,
        time_limit: quizInfo.time_limit ? parseInt(quizInfo.time_limit) : null,
        due_at: quizInfo.due_at ? new Date(quizInfo.due_at).toISOString() : null,
        attempts_allowed: parseInt(quizInfo.attempts_allowed),
        passing_score: parseInt(quizInfo.passing_score),
        status: 'draft',
        questions: questions.map((q, idx) => ({
          text: q.text,
          type: q.type,
          points: parseInt(q.points),
          order: idx,
          caseSensitive: q.caseSensitive || false,
          choices: q.choices.map(c => ({
            text: c.text,
            is_correct: c.is_correct,
          })),
        })),
      }

      const method = isEditMode ? 'PUT' : 'POST'
      const url = isEditMode
        ? `/api/quizzes/${quizId}`
        : `/api/courses/${courseId}/quizzes`

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      })

      if (!res.ok) throw new Error('Auto-save failed')
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus(''), 2000)
    } catch (err) {
      console.error(err)
      setAutoSaveStatus('')
    }
  }

  const handleSaveDraft = async () => {
    if (!quizInfo.title.trim()) {
      showMessage('Quiz title is required', 'error')
      return
    }

    if (questions.length === 0) {
      showMessage('Add at least one question', 'error')
      return
    }

    setIsSavingDraft(true)
    try {
      await handleAutoSave()
      showMessage('Quiz saved as draft', 'success')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handlePublish = async () => {
    if (!quizInfo.title.trim()) {
      showMessage('Quiz title is required', 'error')
      return
    }

    if (questions.length === 0) {
      showMessage('Add at least one question before publishing', 'error')
      return
    }

    // Validate all questions
    const invalidQuestions = questions.filter(q => {
      if (!q.text.trim()) return true
      if (q.type === 'short-answer') return false
      if (q.type === 'true-false') {
        return !q.choices.some(c => c.is_correct)
      }
      return q.choices.filter(c => c.is_correct).length === 0
    })

    if (invalidQuestions.length > 0) {
      showMessage(
        `${invalidQuestions.length} question(s) incomplete. All need text and correct answer(s).`,
        'error'
      )
      return
    }

    setIsLoading(true)
    try {
      const quizData = {
        title: quizInfo.title,
        description: quizInfo.description,
        time_limit: quizInfo.time_limit ? parseInt(quizInfo.time_limit) : null,
        due_at: quizInfo.due_at ? new Date(quizInfo.due_at).toISOString() : null,
        attempts_allowed: parseInt(quizInfo.attempts_allowed),
        passing_score: parseInt(quizInfo.passing_score),
        status: 'published',
        questions: questions.map((q, idx) => ({
          text: q.text,
          type: q.type,
          points: parseInt(q.points),
          order: idx,
          caseSensitive: q.caseSensitive || false,
          choices: q.choices.map(c => ({
            text: c.text,
            is_correct: c.is_correct,
          })),
        })),
      }

      const method = isEditMode ? 'PUT' : 'POST'
      const url = isEditMode
        ? `/api/quizzes/${quizId}`
        : `/api/courses/${courseId}/quizzes`

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      })

      const data = await safeJson(res)
      if (!res.ok) throw new Error(getApiErrorMessage(data, 'Failed to publish quiz'))

      showMessage('Quiz published successfully!', 'success')
      setTimeout(() => navigate(`/courses/${courseId}?tab=stream`), 1500)
    } catch (err) {
      console.error(err)
      showMessage(err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const totalPoints = questions.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0)
  const publishDisabled = questions.length === 0 || !quizInfo.title.trim()

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
          <p className="text-slate-600 font-medium">Loading quiz...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Sticky Header */}
      <QuizBuilderHeader
        quizTitle={quizInfo.title}
        onTitleChange={(title) => setQuizInfo({ ...quizInfo, title })}
        autoSaveStatus={autoSaveStatus}
        isSaving={isLoading || isSavingDraft}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onBack={() => navigate(-1)}
        publishDisabled={publishDisabled}
      />

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-24 right-6 max-w-md rounded-xl shadow-lg p-4 text-sm font-medium z-50 flex items-center gap-3 border ${
              messageType === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : messageType === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {messageType === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
            {messageType === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Question Builder */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Quiz Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-6">Quiz Settings</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quizInfo.description}
                    onChange={(e) =>
                      setQuizInfo({ ...quizInfo, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Add a description for your quiz..."
                  />
                </div>

                {/* Time Limit */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={quizInfo.time_limit}
                    onChange={(e) =>
                      setQuizInfo({ ...quizInfo, time_limit: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave empty for no limit"
                    min="1"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={quizInfo.due_at}
                    onChange={(e) =>
                      setQuizInfo({ ...quizInfo, due_at: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Attempts */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Attempts Allowed
                  </label>
                  <input
                    type="number"
                    value={quizInfo.attempts_allowed}
                    onChange={(e) =>
                      setQuizInfo({
                        ...quizInfo,
                        attempts_allowed: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                {/* Passing Score */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={quizInfo.passing_score}
                    onChange={(e) =>
                      setQuizInfo({
                        ...quizInfo,
                        passing_score: Math.max(
                          0,
                          Math.min(100, parseInt(e.target.value) || 70)
                        ),
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </motion.div>

            {/* Questions Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Questions</h2>
              <span className="text-sm text-slate-500">
                {questions.length} question{questions.length !== 1 ? 's' : ''} • {totalPoints} point
                {totalPoints !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Empty State */}
            {questions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No questions yet</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Start building your quiz by adding your first question
                </p>
              </motion.div>
            )}

            {/* Questions List */}
            <motion.div
              className="space-y-4"
              layout
            >
              <AnimatePresence mode="popLayout">
                {questions.map((question, index) => {
                  const isExpanded = expandedQuestion === index
                  const isDragging = draggedQuestion === index

                  // Select appropriate card based on type
                  const CardComponent = {
                    'multiple-choice': MultipleChoiceCard,
                    'checkbox': CheckboxCard,
                    'true-false': TrueFalseCard,
                    'short-answer': ShortAnswerCard,
                  }[question.type] || MultipleChoiceCard

                  return (
                    <div
                      key={question.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <CardComponent
                        question={question}
                        index={index}
                        onUpdate={handleUpdateQuestion}
                        onDelete={handleDeleteQuestion}
                        onDragStart={() => handleDragStart(null, index)}
                        isDragging={isDragging}
                        isExpanded={isExpanded}
                        onToggleExpand={() =>
                          setExpandedQuestion(isExpanded ? null : index)
                        }
                      />
                    </div>
                  )
                })}
              </AnimatePresence>
            </motion.div>

            {/* Add Question Button */}
            {questions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <motion.button
                  onClick={() => handleAddQuestion()}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </motion.button>
              </motion.div>
            )}

            {/* Bottom Spacing */}
            <div className="h-20" />
          </div>
        </div>

        {/* Right Sidebar */}
        <QuizSidebar
          questions={questions}
          onQuestionSelect={(idx) => setExpandedQuestion(idx)}
          expandedIndex={expandedQuestion}
        />
      </div>
    </div>
  )
}
