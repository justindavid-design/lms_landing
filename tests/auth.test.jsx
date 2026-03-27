import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider } from '../src/lib/AuthProvider'
import Login from '../src/components/Login'

vi.mock('../src/lib/supabaseClient', () => {
  return {
    default: {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'test@example.com', user_metadata: {} } },
          error: null,
        }),
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
      from: vi.fn(() => ({
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null, status: 200 }),
          })),
        })),
      })),
    }
  }
})

import supabase from '../src/lib/supabaseClient'

describe('Auth UI', () => {
  it('allows user to sign in', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    )

    const email = screen.getByPlaceholderText(/Email/i)
    const password = screen.getByPlaceholderText(/Password/i)
    const btn = screen.getByRole('button', { name: /^Log in$/i })

    fireEvent.change(email, { target: { value: 'test@example.com' } })
    fireEvent.change(password, { target: { value: 'password' } })
    fireEvent.click(btn)

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
    })
  })
})
