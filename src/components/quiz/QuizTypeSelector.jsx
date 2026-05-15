import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

/**
 * QuizTypeSelector - Full-screen quiz type selection with animated cards
 * Displays available quiz types for creation
 * Routes:
 *   - /dashboard/course/:courseId/quiz/types
 */
export default function QuizTypeSelector() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [selectedType, setSelectedType] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const quizTypes = [
    {
      id: 'multiple-choice',
      icon: '●',
      title: 'Multiple Choice',
      description: 'One correct answer',
      longDescription: 'Students select one correct answer from multiple options. Best for straightforward knowledge checks and single-concept questions.',
      color: 'from-blue-500 to-blue-600',
      accentColor: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'checkbox',
      icon: '☑',
      title: 'Checkbox',
      description: 'Multiple correct answers',
      longDescription: 'Students can select multiple correct answers. Ideal for questions where multiple concepts apply or advanced comprehension.',
      color: 'from-purple-500 to-purple-600',
      accentColor: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'true-false',
      icon: '✓',
      title: 'True or False',
      description: 'Binary selection',
      longDescription: 'Simple yes/no or true/false questions. Perfect for quick assessments and straightforward factual questions.',
      color: 'from-emerald-500 to-emerald-600',
      accentColor: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'short-answer',
      icon: '✏',
      title: 'Short Answer',
      description: 'Text-based response',
      longDescription: 'Students provide typed responses. Great for open-ended questions, vocabulary, and critical thinking.',
      color: 'from-amber-500 to-amber-600',
      accentColor: 'bg-amber-100 text-amber-600',
    },
  ]

  const handleSelectType = (typeId) => {
    setSelectedType(typeId)
    setIsTransitioning(true)
    setTimeout(() => {
      navigate(`/dashboard/course/${courseId}/quiz/create?type=${typeId}`)
    }, 300)
  }

  const handleBack = () => {
    navigate(-1)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    hover: {
      scale: 1.05,
      y: -8,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
    },
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Back</span>
          </motion.button>
          <h1 className="text-2xl font-bold text-white">Select Quiz Type</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Title Section */}
            <div className="mb-12 text-center">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-white mb-3"
              >
                Choose Your Question Format
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-slate-400"
              >
                Select the question type that best fits your assessment needs. You can mix types in the same quiz.
              </motion.p>
            </div>

            {/* Quiz Type Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {quizTypes.map((type) => (
                <motion.div
                  key={type.id}
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleSelectType(type.id)}
                  className={`group relative cursor-pointer ${
                    isTransitioning && selectedType === type.id ? 'pointer-events-none' : ''
                  }`}
                >
                  {/* Card Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

                  {/* Card Border Glow */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${type.color} rounded-2xl opacity-0 blur-lg`}
                    animate={{
                      opacity: selectedType === type.id ? 0.3 : 0,
                    }}
                  />

                  {/* Card Content */}
                  <div className="relative h-full bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700/50 group-hover:border-slate-600/80 rounded-2xl p-6 transition-all duration-300">
                    <AnimatePresence mode="wait">
                      {selectedType === type.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute top-3 right-3"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Icon */}
                    <motion.div
                      className={`text-5xl font-bold mb-4 inline-flex items-center justify-center w-16 h-16 rounded-xl ${type.accentColor}`}
                      animate={{
                        scale: selectedType === type.id ? 1.2 : 1,
                      }}
                    >
                      {type.icon}
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                      {type.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-400 mb-4">{type.description}</p>

                    {/* Long Description - Hidden on hover reveal */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: selectedType === type.id ? 1 : 0,
                        height: selectedType === type.id ? 'auto' : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="text-xs text-slate-300 leading-relaxed overflow-hidden"
                    >
                      {type.longDescription}
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                      }}
                      transition={{ delay: 0.2 }}
                      className="text-xs text-slate-500 group-hover:text-slate-400 mt-4 flex items-center gap-1 transition-colors"
                    >
                      <span>Click to select</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6 text-center max-w-2xl mx-auto"
            >
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Pro tip:</span> You can add multiple question types to the same quiz. Start with your first type and add different types as you build.
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
