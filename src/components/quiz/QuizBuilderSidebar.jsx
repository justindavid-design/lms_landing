import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, FileText, Clock, Target } from 'lucide-react'

/**
 * Quiz Builder Right Sidebar - Shows navigator, stats, and summary
 */
export function QuizSidebar({ questions, onQuestionSelect, expandedIndex }) {
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)
  const questionCount = questions.length

  const questionTypeColors = {
    'multiple-choice': 'bg-blue-100 text-blue-700 border-blue-200',
    'checkbox': 'bg-purple-100 text-purple-700 border-purple-200',
    'true-false': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'short-answer': 'bg-amber-100 text-amber-700 border-amber-200',
  }

  const questionTypeIcons = {
    'multiple-choice': '●',
    'checkbox': '☑',
    'true-false': '✓',
    'short-answer': '✏',
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-bold text-slate-900">Quiz Summary</h3>
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-3 border-b border-slate-200">
        <motion.div
          className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
          whileHover={{ scale: 1.02 }}
        >
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-600 font-medium">Questions</p>
            <p className="text-lg font-bold text-slate-900">{questionCount}</p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
          whileHover={{ scale: 1.02 }}
        >
          <Target className="w-5 h-5 text-purple-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-600 font-medium">Total Points</p>
            <p className="text-lg font-bold text-slate-900">{totalPoints}</p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
          whileHover={{ scale: 1.02 }}
        >
          <BarChart3 className="w-5 h-5 text-slate-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-600 font-medium">Avg Points</p>
            <p className="text-lg font-bold text-slate-900">
              {questionCount > 0 ? (totalPoints / questionCount).toFixed(1) : 0}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Questions Navigator */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Questions
          </h4>
          <div className="space-y-2">
            {questions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No questions yet. Add one to get started!
              </p>
            ) : (
              questions.map((question, idx) => {
                const isActive = expandedIndex === idx

                return (
                  <motion.button
                    key={question.id}
                    onClick={() => onQuestionSelect(idx)}
                    className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-1 text-lg font-bold flex-shrink-0 ${
                          questionTypeColors[question.type] || ''
                        }`}
                      >
                        {questionTypeIcons[question.type] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-600">
                          Q{idx + 1}
                        </p>
                        <p className="text-sm text-slate-900 truncate font-medium mt-1">
                          {question.text || '(Untitled)'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded border ${
                              questionTypeColors[question.type] || ''
                            }`}
                          >
                            {question.points}pt
                          </span>
                          {question.type === 'multiple-choice' &&
                            question.choices?.filter(c => c.is_correct).length === 1 && (
                              <span className="text-xs text-green-600 font-semibold">✓ Set</span>
                            )}
                          {question.type === 'checkbox' &&
                            question.choices?.filter(c => c.is_correct).length > 0 && (
                              <span className="text-xs text-green-600 font-semibold">✓ Set</span>
                            )}
                          {question.type === 'true-false' &&
                            question.choices?.some(c => c.is_correct) && (
                              <span className="text-xs text-green-600 font-semibold">✓ Set</span>
                            )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-600 space-y-2">
          <p>
            <span className="font-semibold">Pro tip:</span> Expand questions below to add details.
          </p>
          <p>
            <span className="font-semibold">Remember:</span> Save your quiz before leaving.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Sticky Header Component for Quiz Builder
 */
export function QuizBuilderHeader({
  quizTitle,
  onTitleChange,
  autoSaveStatus,
  isSaving,
  onSaveDraft,
  onPublish,
  onBack,
  publishDisabled,
}) {
  return (
    <motion.header
      className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Back Button & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <motion.button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-700 hover:text-slate-900 flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Quiz title..."
              className="text-2xl font-bold text-slate-900 placeholder-slate-400 bg-transparent outline-none w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              {autoSaveStatus === 'saving' && 'Saving...'}
              {autoSaveStatus === 'saved' && 'Saved'}
              {!autoSaveStatus && 'Not saved'}
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Autosave Indicator */}
          <motion.div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100"
            animate={{
              opacity: autoSaveStatus ? 1 : 0.5,
            }}
          >
            {autoSaveStatus === 'saving' && (
              <>
                <motion.div
                  className="w-2 h-2 bg-amber-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                />
                <span className="text-xs text-amber-700 font-medium">Saving...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-700 font-medium">Saved</span>
              </>
            )}
            {!autoSaveStatus && (
              <>
                <div className="w-2 h-2 bg-slate-400 rounded-full" />
                <span className="text-xs text-slate-600 font-medium">Auto-save</span>
              </>
            )}
          </motion.div>

          {/* Save Draft Button */}
          <motion.button
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4m-1 4l5-5m0 0l-5-5m5 5v12"
              />
            </svg>
            Draft
          </motion.button>

          {/* Publish Button */}
          <motion.button
            onClick={onPublish}
            disabled={isSaving || publishDisabled}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-4m6 4l6-4"
              />
            </svg>
            Publish
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
