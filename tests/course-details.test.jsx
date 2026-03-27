import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AuthContext from '../src/lib/AuthProvider'
import CourseDetails from '../src/components/dashboard/CourseDetails'

describe('CourseDetails', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows submission actions for student assignments and quizzes', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (String(url).includes('/api/courses/1?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: '1',
            title: 'Biology',
            author: 'teacher-1',
            author_name: 'Teacher',
            viewer_role: 'student',
            assignment_count: 1,
            quiz_count: 1,
            student_count: 12,
            next_due_at: '2026-04-01T09:00:00.000Z',
            published: true,
          }),
        })
      }

      if (String(url).includes('/modules?')) {
        return Promise.resolve({ ok: true, json: async () => [] })
      }

      if (String(url).includes('/assignments?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([{
            id: 'assignment-1',
            title: 'Lab report',
            instructions: 'Write the report',
            due_at: '2026-04-01T09:00:00.000Z',
            status: 'published',
            status_for_user: 'assigned',
            submission: null,
          }]),
        })
      }

      if (String(url).includes('/quizzes?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([{
            id: 'quiz-1',
            assignment_id: 'assignment-2',
            title: 'Chapter quiz',
            question_count: 4,
            due_at: '2026-04-02T09:00:00.000Z',
            status: 'published',
            status_for_user: 'assigned',
            submission: null,
          }]),
        })
      }

      if (String(url).includes('/api/notifications?')) {
        return Promise.resolve({ ok: true, json: async () => [] })
      }

      return Promise.resolve({ ok: true, json: async () => ({}) })
    }))

    render(
      <MemoryRouter initialEntries={['/courses/1']}>
        <AuthContext.Provider value={{ user: { id: 'student-1' }, loading: false }}>
          <Routes>
            <Route path="/courses/:id" element={<CourseDetails />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Lab report')).toBeTruthy()
      expect(screen.getByRole('button', { name: /submit work/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /submit quiz/i })).toBeTruthy()
    })
  })
})
