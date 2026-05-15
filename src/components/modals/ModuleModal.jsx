import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../common/Modal'
import { FormInput, FormTextarea, FormGroup } from '../common/FormComponents'
import { moduleSchema } from '../../schemas/formSchemas'

export default function ModuleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
  title = 'Create Module',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (initialData && isOpen) {
      setValue('title', initialData.title || '')
      setValue('description', initialData.description || '')
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
      submitText={initialData ? 'Update Module' : 'Create Module'}
      submitLoading={isLoading}
    >
      <FormGroup>
        <FormInput
          id="module-title"
          label="Module Title"
          required
          placeholder="e.g., Introduction to React"
          {...register('title')}
          error={errors.title?.message}
        />

        <FormTextarea
          id="module-description"
          label="Description"
          placeholder="Briefly describe what students will learn in this module..."
          rows={4}
          {...register('description')}
          error={errors.description?.message}
        />
      </FormGroup>
    </Modal>
  )
}
