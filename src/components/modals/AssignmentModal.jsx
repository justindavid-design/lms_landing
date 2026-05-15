import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../common/Modal'
import {
  FormInput,
  FormTextarea,
  FormGroup,
  FormSection,
  FormSelect,
} from '../common/FormComponents'
import FileUpload from '../common/FileUpload'
import { assignmentSchema } from '../../schemas/formSchemas'

export default function AssignmentModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
  title = 'Create Assignment',
  modules = [],
  onFileUpload = null,
}) {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [fileError, setFileError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      instructions: '',
      due_at: '',
      module_id: '',
      status: 'published',
      points: 10,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (initialData && isOpen) {
      setValue('title', initialData.title || '')
      setValue('instructions', initialData.instructions || '')
      setValue('due_at', initialData.due_at || '')
      setValue('module_id', initialData.module_id || '')
      setValue('status', initialData.status || 'published')
      setValue('points', initialData.points || 10)
      setUploadedFiles([])
      setFileError(null)
    } else if (!initialData && isOpen) {
      reset()
      setUploadedFiles([])
      setFileError(null)
    }
  }, [isOpen, initialData, setValue, reset])

  const handleFormSubmit = async (data) => {
    // Prepare form data with files
    const formData = new FormData()

    // Add form fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key])
      }
    })

    // Add files
    uploadedFiles.forEach((file) => {
      formData.append('files', file)
    })

    // Add ID if editing
    if (initialData?.id) {
      formData.append('id', initialData.id)
    }

    await onSubmit(formData)
    reset()
    setUploadedFiles([])
  }

  const handleFileChange = (files, errors) => {
    if (errors && errors.length > 0) {
      setFileError(errors[0])
    } else {
      setFileError(null)
      setUploadedFiles(files)
    }
  }

  const moduleOptions = modules.map((m) => ({
    value: m.id,
    label: m.title,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="2xl"
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={initialData ? 'Update Assignment' : 'Create Assignment'}
      submitLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <FormSection title="Assignment Details">
          <FormGroup>
            <FormInput
              id="assignment-title"
              label="Assignment Title"
              required
              placeholder="e.g., Build a To-Do App"
              {...register('title')}
              error={errors.title?.message}
            />

            <FormSelect
              id="assignment-module"
              label="Module (Optional)"
              options={moduleOptions}
              {...register('module_id')}
              error={errors.module_id?.message}
            />
          </FormGroup>
        </FormSection>

        {/* Instructions */}
        <FormSection title="Instructions">
          <FormTextarea
            id="assignment-instructions"
            label="Instructions"
            required
            placeholder="Write clear instructions for the assignment..."
            rows={6}
            {...register('instructions')}
            error={errors.instructions?.message}
          />
        </FormSection>

        {/* Settings */}
        <FormSection title="Settings">
          <FormGroup>
            <FormInput
              id="assignment-due-date"
              type="datetime-local"
              label="Due Date"
              {...register('due_at')}
              error={errors.due_at?.message}
            />

            <FormInput
              id="assignment-points"
              type="number"
              label="Points"
              min="0"
              max="1000"
              {...register('points', { valueAsNumber: true })}
              error={errors.points?.message}
            />

            <FormSelect
              id="assignment-status"
              label="Status"
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
              {...register('status')}
              error={errors.status?.message}
            />
          </FormGroup>
        </FormSection>

        {/* File Upload */}
        <FormSection title="Resources (Optional)">
          <p className="text-sm text-gray-600 mb-3">
            Upload any files students might need (instructions, starter code, rubric, etc.)
          </p>
          <FileUpload
            onChange={handleFileChange}
            error={fileError}
            files={uploadedFiles}
            multiple={true}
          />
        </FormSection>
      </div>
    </Modal>
  )
}
