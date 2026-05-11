import React from 'react'
import AccountLayout from './AccountLayout'
import { LoginForm } from './EnhancedForms'

export default function Login() {
  return (
    <AccountLayout
      title="Welcome back."
      description="Continue to your courses, progress, and learning settings."
      backTo="/"
      backLabel="Back to home"
      cardTitle="Log in"
      cardDescription="Use your Academee account to continue."
    >
      <LoginForm />
    </AccountLayout>
  )
}
