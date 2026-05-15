import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../common/Modal'
import { FormInput, FormTextarea, FormGroup } from '../common/FormComponents'
import { announcementSchema } from '../../schemas/formSchemas'

export default function AnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
  title = 'Create Announcement',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      body: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (initialData && isOpen) {
      setValue('title', initialData.title || '')
      setValue('body', initialData.body || '')
    } else if (!initialData && isOpen) {
      reset()
    }
  }, [isOpen, initialData, setValue, reset])

  const handleFormSubmit = async (data) => {
    await onSubmit({
      ...data,
      id: initialData?.id, // Include ID if editing
    })
    reset()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={initialData ? 'Update Announcement' : 'Post Announcement'}
      submitLoading={isLoading}
    >
      <FormGroup>
        <FormInput
          id="announcement-title"
          label="Title"
          required
          placeholder="What's new?"
          {...register('title')}
          error={errors.title?.message}
        />

        <FormTextarea
          id="announcement-body"
          label="Announcement"
          required
          placeholder="Write your announcement here..."
          rows={6}
          {...register('body')}
          error={errors.body?.message}
        />
      </FormGroup>
    </Modal>
  )
}
