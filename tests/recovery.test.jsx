import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RecoverEmail from '../src/components/RecoverEmail'
import RecoverVerify from '../src/components/RecoverVerify'
import RecoverReset from '../src/components/RecoverReset'

describe('Recovery flow UI', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts recovery by sending an OTP and storing the email', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({ ok: true }),
      })
    )

    render(
      <MemoryRouter>
        <RecoverEmail />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/you@domain.com/i), {
      target: { value: 'Test@Example.com ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send code/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/send-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      )
    })

    expect(sessionStorage.getItem('recoverEmail')).toBe('test@example.com')
  })

  it('verifies an OTP and stores the reset token', async () => {
    sessionStorage.setItem('recoverEmail', 'student@example.com')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ resetToken: 'token-123' }),
      })
    )

    render(
      <MemoryRouter>
        <RecoverVerify />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/123456/i), {
      target: { value: '12ab34cd56' },
    })
    fireEvent.click(screen.getByRole('button', { name: /verify code/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/verify-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'student@example.com', otp: '123456' }),
        })
      )
    })

    expect(sessionStorage.getItem('recoverResetToken')).toBe('token-123')
  })

  it('blocks password reset when the recovery session is missing', async () => {
    render(
      <MemoryRouter>
        <RecoverReset />
      </MemoryRouter>
    )

    expect(await screen.findByText(/recovery session is missing or expired/i)).toBeTruthy()
  })

  it('submits a new password through the OTP reset endpoint', async () => {
    sessionStorage.setItem('recoverEmail', 'student@example.com')
    sessionStorage.setItem('recoverResetToken', 'token-123')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      })
    )

    render(
      <MemoryRouter>
        <RecoverReset />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/enter new password/i), {
      target: { value: 'password1' },
    })
    fireEvent.change(screen.getByPlaceholderText(/confirm new password/i), {
      target: { value: 'password1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^reset password$/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/reset-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'student@example.com',
            resetToken: 'token-123',
            password: 'password1',
          }),
        })
      )
    })
  })
})
