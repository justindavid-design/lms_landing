import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, GripVertical, Copy } from 'lucide-react'

/**
 * Multiple Choice Question Card Component
 */
export function MultipleChoiceCard({
  question,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  isDragging,
  isExpanded,
  onToggleExpand,
}) {
  const handleAddChoice = () => {
    const newChoiceId = Math.max(...question.choices.map(c => c.id), 0) + 1
    onUpdate(index, {
      choices: [
        ...question.choices,
        {
          id: newChoiceId,
          text: '',
          is_correct: false,
        },
      ],
    })
  }

  const handleUpdateChoice = (choiceIndex, updates) => {
    const newChoices = [...question.choices]
    newChoices[choiceIndex] = { ...newChoices[choiceIndex], ...updates }
    onUpdate(index, { choices: newChoices })
  }

  const handleRemoveChoice = (choiceIndex) => {
    if (question.choices.length > 2) {
      const newChoices = question.choices.filter((_, i) => i !== choiceIndex)
      onUpdate(index, { choices: newChoices })
    }
  }

  const handleSetCorrect = (choiceIndex) => {
    const newChoices = question.choices.map((choice, i) => ({
      ...choice,
      is_correct: i === choiceIndex,
    }))
    onUpdate(index, { choices: newChoices })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-2xl border-2 transition-all duration-300 ${
        isDragging
          ? 'border-blue-500/50 bg-blue-50/10'
          : isExpanded
            ? 'border-blue-400 bg-gradient-to-br from-blue-50/30 to-transparent'
            : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={onToggleExpand}
        draggable
        onDragStart={onDragStart}
      >
        <GripVertical className="w-5 h-5 text-slate-400 hover:text-slate-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">
            Question {index + 1} • Multiple Choice
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {question.text || 'Click to edit question...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            {question.choices.filter(c => c.is_correct).length} correct
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(index)
            }}
            className="p-2 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 p-4 space-y-4"
          >
            {/* Question Text */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Question
              </label>
              <textarea
                value={question.text}
                onChange={(e) => onUpdate(index, { text: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="Enter your question..."
              />
            </div>

            {/* Points */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Points
              </label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => onUpdate(index, { points: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Choices */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Answer Choices
              </label>
              <div className="space-y-2">
                {question.choices.map((choice, choiceIdx) => (
                  <motion.div
                    key={choice.id}
                    layout
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={choice.is_correct}
                      onChange={() => handleSetCorrect(choiceIdx)}
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => handleUpdateChoice(choiceIdx, { text: e.target.value })}
                      className="flex-1 bg-white px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`Choice ${choiceIdx + 1}`}
                    />
                    {question.choices.length > 2 && (
                      <button
                        onClick={() => handleRemoveChoice(choiceIdx)}
                        className="p-2 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
              <button
                onClick={handleAddChoice}
                className="mt-3 w-full px-4 py-2 border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Choice
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Checkbox Question Card Component
 */
export function CheckboxCard({
  question,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  isDragging,
  isExpanded,
  onToggleExpand,
}) {
  const handleAddChoice = () => {
    const newChoiceId = Math.max(...question.choices.map(c => c.id), 0) + 1
    onUpdate(index, {
      choices: [
        ...question.choices,
        {
          id: newChoiceId,
          text: '',
          is_correct: false,
        },
      ],
    })
  }

  const handleUpdateChoice = (choiceIndex, updates) => {
    const newChoices = [...question.choices]
    newChoices[choiceIndex] = { ...newChoices[choiceIndex], ...updates }
    onUpdate(index, { choices: newChoices })
  }

  const handleRemoveChoice = (choiceIndex) => {
    if (question.choices.length > 2) {
      const newChoices = question.choices.filter((_, i) => i !== choiceIndex)
      onUpdate(index, { choices: newChoices })
    }
  }

  const handleToggleCorrect = (choiceIndex) => {
    const newChoices = [...question.choices]
    newChoices[choiceIndex].is_correct = !newChoices[choiceIndex].is_correct
    onUpdate(index, { choices: newChoices })
  }

  const correctCount = question.choices.filter(c => c.is_correct).length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-2xl border-2 transition-all duration-300 ${
        isDragging
          ? 'border-purple-500/50 bg-purple-50/10'
          : isExpanded
            ? 'border-purple-400 bg-gradient-to-br from-purple-50/30 to-transparent'
            : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={onToggleExpand}
        draggable
        onDragStart={onDragStart}
      >
        <GripVertical className="w-5 h-5 text-slate-400 hover:text-slate-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">
            Question {index + 1} • Checkbox
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {question.text || 'Click to edit question...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            {correctCount} correct
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(index)
            }}
            className="p-2 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 p-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Question
              </label>
              <textarea
                value={question.text}
                onChange={(e) => onUpdate(index, { text: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="3"
                placeholder="Enter your question..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Points
              </label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => onUpdate(index, { points: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Answer Choices (Select all that apply)
              </label>
              <div className="space-y-2">
                {question.choices.map((choice, choiceIdx) => (
                  <motion.div
                    key={choice.id}
                    layout
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={choice.is_correct}
                      onChange={() => handleToggleCorrect(choiceIdx)}
                      className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => handleUpdateChoice(choiceIdx, { text: e.target.value })}
                      className="flex-1 bg-white px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder={`Choice ${choiceIdx + 1}`}
                    />
                    {question.choices.length > 2 && (
                      <button
                        onClick={() => handleRemoveChoice(choiceIdx)}
                        className="p-2 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
              <button
                onClick={handleAddChoice}
                className="mt-3 w-full px-4 py-2 border-2 border-dashed border-slate-300 hover:border-purple-400 text-slate-600 hover:text-purple-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Choice
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * True/False Question Card Component
 */
export function TrueFalseCard({
  question,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  isDragging,
  isExpanded,
  onToggleExpand,
}) {
  const answers = [
    { id: 'true', text: 'True', value: true },
    { id: 'false', text: 'False', value: false },
  ]

  const handleSetCorrect = (value) => {
    onUpdate(index, {
      choices: answers.map(a => ({
        ...a,
        is_correct: a.value === value,
      })),
    })
  }

  const correctChoice = question.choices?.find(c => c.is_correct)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-2xl border-2 transition-all duration-300 ${
        isDragging
          ? 'border-emerald-500/50 bg-emerald-50/10'
          : isExpanded
            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50/30 to-transparent'
            : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={onToggleExpand}
        draggable
        onDragStart={onDragStart}
      >
        <GripVertical className="w-5 h-5 text-slate-400 hover:text-slate-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">
            Question {index + 1} • True/False
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {question.text || 'Click to edit question...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
            {correctChoice?.text || 'Not set'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(index)
            }}
            className="p-2 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 p-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Question
              </label>
              <textarea
                value={question.text}
                onChange={(e) => onUpdate(index, { text: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows="3"
                placeholder="Enter your true/false question..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Points
              </label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => onUpdate(index, { points: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Correct Answer
              </label>
              <div className="grid grid-cols-2 gap-3">
                {answers.map(answer => (
                  <motion.button
                    key={answer.id}
                    onClick={() => handleSetCorrect(answer.value)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all border-2 ${
                      correctChoice?.value === answer.value
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {answer.text}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Short Answer Question Card Component
 */
export function ShortAnswerCard({
  question,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  isDragging,
  isExpanded,
  onToggleExpand,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-2xl border-2 transition-all duration-300 ${
        isDragging
          ? 'border-amber-500/50 bg-amber-50/10'
          : isExpanded
            ? 'border-amber-400 bg-gradient-to-br from-amber-50/30 to-transparent'
            : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={onToggleExpand}
        draggable
        onDragStart={onDragStart}
      >
        <GripVertical className="w-5 h-5 text-slate-400 hover:text-slate-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">
            Question {index + 1} • Short Answer
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {question.text || 'Click to edit question...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
            Open-ended
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(index)
            }}
            className="p-2 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 p-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Question
              </label>
              <textarea
                value={question.text}
                onChange={(e) => onUpdate(index, { text: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows="3"
                placeholder="Enter your question..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Points
              </label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => onUpdate(index, { points: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Expected Answer
              </label>
              <textarea
                value={question.choices?.[0]?.text || ''}
                onChange={(e) => {
                  const newChoices = [
                    {
                      id: 1,
                      text: e.target.value,
                      is_correct: true,
                    },
                  ]
                  onUpdate(index, { choices: newChoices })
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows="2"
                placeholder="Enter expected answer (for reference during grading)..."
              />
              <p className="text-xs text-slate-500 mt-2">
                Note: Short answer questions require manual grading by instructors.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={question.caseSensitive || false}
                  onChange={(e) => onUpdate(index, { caseSensitive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="text-sm font-medium text-slate-700">
                  Case-sensitive matching (if auto-grading)
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
