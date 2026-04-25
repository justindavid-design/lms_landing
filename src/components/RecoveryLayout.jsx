import React from 'react'
import AccountLayout from './AccountLayout'

export default function RecoveryLayout({
  title,
  description,
  backTo = '/login',
  backLabel = 'Back',
  cardTitle,
  cardDescription,
  children,
}) {
  return (
    <AccountLayout
      title={title}
      description={description}
      backTo={backTo}
      backLabel={backLabel}
      cardTitle={cardTitle}
      cardDescription={cardDescription}
    >
      {children}
    </AccountLayout>
  )
}
