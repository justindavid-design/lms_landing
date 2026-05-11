import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../lib/AccountContext'
import supabase from '../lib/supabaseClient'

export default function AccountSettings() {
  const navigate = useNavigate()
  const { user, logout } = useAccount()
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState('profile') // 'profile' or 'password'

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      })

      if (updateError) throw updateError

      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain an uppercase letter (A-Z)')
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain a lowercase letter (a-z)')
      return
    }

    if (!/\d/.test(newPassword)) {
      setError('Password must contain a number (0-9)')
      return
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setError('Password must contain a special character (!@#$%^&* etc)')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-app py-8 px-4 md:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-main">Account Settings</h1>
          <p className="text-muted mt-2">Manage your account and security preferences</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Card */}
        <div className="rounded-lg border border-token bg-surface shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-token">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-[#2f6b3f] text-main bg-surface-alt'
                  : 'text-muted hover:text-main'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
                activeTab === 'password'
                  ? 'border-b-2 border-[#2f6b3f] text-main bg-surface-alt'
                  : 'text-muted hover:text-main'
              }`}
            >
              Password
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-main mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-token bg-app text-muted opacity-60"
                  />
                  <p className="text-xs text-muted mt-1">Email cannot be changed</p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-semibold text-main mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-lg border border-token bg-app text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#2f6b3f]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-[#2f6b3f] text-white rounded-lg font-semibold hover:bg-[#285636] disabled:opacity-60 transition-all"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  Note: Supabase doesn't support verifying current password. You can change your password directly.
                </div>

                <div>
                  <label className="block text-sm font-semibold text-main mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-lg border border-token bg-app text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#2f6b3f]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-main mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 rounded-lg border border-token bg-app text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-[#2f6b3f]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-[#2f6b3f] text-white rounded-lg font-semibold hover:bg-[#285636] disabled:opacity-60 transition-all"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
