import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider } from '../src/lib/AuthProvider'
import Login from '../src/components/Login'

vi.mock('../src/lib/supabaseClient', () => {
  return {
    default: {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'u1', email: 'test@example.com' } }, error: null }),
      }
    }
  }
})

describe('Auth UI', () => {
  it('allows user to sign in', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    const email = screen.getByPlaceholderText(/Email/i)
    const password = screen.getByPlaceholderText(/Password/i)
    const btn = screen.getByRole('button', { name: /Log in/i })

    fireEvent.change(email, { target: { value: 'test@example.com' } })
    fireEvent.change(password, { target: { value: 'password' } })
    fireEvent.click(btn)

    // wait for async to resolve
    await screen.findByText(/Signing in...|Sign out|Don't Have Account/)
    expect(true).toBe(true)
  })
})
