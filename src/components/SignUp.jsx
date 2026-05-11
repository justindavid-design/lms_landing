import React from 'react'
import AccountLayout from './AccountLayout'
import { SignUpForm } from './EnhancedForms'

export default function SignUp() {
  return (
    <AccountLayout
      title="Create account."
      description="Save your progress and keep your learning settings in one place."
      backTo="/"
      backLabel="Back to home"
      cardTitle="Create account"
      cardDescription="Start with your email and a secure password."
    >
      <SignUpForm />
    </AccountLayout>
  )
}
