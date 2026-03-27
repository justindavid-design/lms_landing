import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AuthContext from '../src/lib/AuthProvider'
import Tasks from '../src/components/dashboard/Tasks'

describe('Tasks dashboard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders learner and teacher tasks from the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: 'a1',
          title: 'Essay draft',
          course_title: 'English',
          status: 'assigned',
          is_teacher_view: false,
          due_at: '2026-04-01T10:00:00.000Z',
        },
        {
          id: 'a2',
          title: 'Quiz 1',
          course_title: 'Science',
          status: 'review',
          is_teacher_view: true,
          pending_review_count: 3,
          due_at: '2026-04-02T10:00:00.000Z',
        },
      ]),
    }))

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: { id: 'u1' }, loading: false }}>
          <Tasks />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Essay draft')).toBeTruthy()
      expect(screen.getByText('Quiz 1')).toBeTruthy()
      expect(screen.getByText(/3 submissions waiting for review/i)).toBeTruthy()
    })
  })
})
