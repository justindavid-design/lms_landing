import { useState, useCallback } from 'react'

/**
 * Custom hook for managing modal state
 * Provides: isOpen, openModal, closeModal, toggleModal
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen,
  }
}

/**
 * Custom hook for managing multiple modals
 */
export function useModals() {
  const [modals, setModals] = useState({})

  const openModal = useCallback((modalId) => {
    setModals((prev) => ({ ...prev, [modalId]: true }))
  }, [])

  const closeModal = useCallback((modalId) => {
    setModals((prev) => ({ ...prev, [modalId]: false }))
  }, [])

  const toggleModal = useCallback((modalId) => {
    setModals((prev) => ({ ...prev, [modalId]: !prev[modalId] }))
  }, [])

  const isOpen = (modalId) => {
    return modals[modalId] || false
  }

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    isOpen,
  }
}
