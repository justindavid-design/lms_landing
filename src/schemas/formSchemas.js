import { z } from 'zod'

// Announcement schema
export const announcementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  body: z
    .string()
    .min(1, 'Announcement body is required')
    .min(10, 'Please provide more detail (at least 10 characters)'),
})

// Module schema
export const moduleSchema = z.object({
  title: z
    .string()
    .min(1, 'Module title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
})

// Assignment schema
export const assignmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Assignment title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  instructions: z
    .string()
    .min(1, 'Instructions are required')
    .min(10, 'Please provide more detail (at least 10 characters)'),
  due_at: z
    .string()
    .refine(
      (val) => {
        if (!val) return true // Due date is optional
        const date = new Date(val)
        return !Number.isNaN(date.getTime())
      },
      'Due date must be a valid date'
    )
    .optional()
    .or(z.literal('')),
  module_id: z
    .string()
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['draft', 'published', 'archived'])
    .default('published'),
  points: z
    .number()
    .min(0, 'Points must be 0 or greater')
    .max(1000, 'Points must not exceed 1000')
    .optional(),
})

// Quiz schema
export const quizSchema = z.object({
  title: z
    .string()
    .min(1, 'Quiz title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  due_at: z
    .string()
    .refine(
      (val) => {
        if (!val) return true
        const date = new Date(val)
        return !Number.isNaN(date.getTime())
      },
      'Due date must be a valid date'
    )
    .optional()
    .or(z.literal('')),
  time_limit: z
    .number()
    .min(0, 'Time limit must be 0 or greater')
    .optional(),
  attempts_allowed: z
    .number()
    .min(1, 'Must allow at least 1 attempt')
    .max(100, 'Maximum 100 attempts allowed')
    .default(1),
  passing_score: z
    .number()
    .min(0, 'Passing score must be 0 or greater')
    .max(100, 'Passing score must not exceed 100')
    .default(70),
  status: z
    .enum(['draft', 'published', 'archived'])
    .default('draft'),
})

// Quiz Question schema
export const quizQuestionSchema = z.object({
  type: z.enum(['multiple-choice', 'checkbox', 'true-false', 'short-answer']),
  question_text: z
    .string()
    .min(1, 'Question is required')
    .min(5, 'Question must be at least 5 characters'),
  points: z
    .number()
    .min(0)
    .max(1000)
    .default(1),
  order: z.number().default(0),
  choices: z
    .array(
      z.object({
        text: z.string().min(1, 'Choice text is required'),
        is_correct: z.boolean().default(false),
      })
    )
    .optional(),
  correct_answer: z
    .string()
    .optional(),
})

// Form validation helper
export function validateFormData(schema, data) {
  try {
    const validated = schema.parse(data)
    return { valid: true, data: validated, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { valid: false, data: null, errors }
    }
    return { valid: false, data: null, errors: { form: 'Validation error' } }
  }
}

// Get field error
export function getFieldError(errors, fieldName) {
  return errors[fieldName] || null
}

// Check if field has error
export function hasFieldError(errors, fieldName) {
  return Boolean(errors[fieldName])
}
