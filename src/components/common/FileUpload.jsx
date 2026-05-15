import React, { useCallback, useState } from 'react'
import { Upload, File, X, AlertCircle } from 'lucide-react'

/**
 * FileUpload Component with Drag and Drop support
 * Features:
 * - Drag and drop upload area
 * - Click to browse files
 * - Multiple file support
 * - File preview/list with icons
 * - Upload progress bar
 * - File validation (type and size)
 * - Remove file button
 */
export default function FileUpload({
  onChange,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'],
  multiple = true,
  uploadProgress = 0,
  isUploading = false,
  error = null,
  files = [],
}) {
  const [isDragActive, setIsDragActive] = useState(false)

  const fileTypeIcons = {
    pdf: '📄',
    doc: '📘',
    docx: '📘',
    ppt: '🎯',
    pptx: '🎯',
    zip: '📦',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    mp4: '🎬',
    webm: '🎬',
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    return fileTypeIcons[ext] || '📎'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFiles = (filesToValidate) => {
    const validFiles = []
    const errors = []

    filesToValidate.forEach((file) => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`${file.name} has an unsupported file type`)
        return
      }

      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`)
        return
      }

      validFiles.push(file)
    })

    return { validFiles, errors }
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (!multiple && droppedFiles.length > 1) {
      droppedFiles.splice(1)
    }

    const { validFiles, errors } = validateFiles(droppedFiles)
    onChange(validFiles, errors)
  }, [onChange, multiple, validateFiles])

  const handleBrowseClick = useCallback((input) => {
    input?.click()
  }, [])

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!multiple && selectedFiles.length > 1) {
      selectedFiles.splice(1)
    }

    const { validFiles, errors } = validateFiles(selectedFiles)
    onChange(validFiles, errors)
  }

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    onChange(newFiles, [])
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400'
        } p-6`}
      >
        <input
          type="file"
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          id="file-input"
          disabled={isUploading}
          accept={acceptedTypes.join(',')}
        />

        <div className="flex flex-col items-center justify-center">
          <Upload
            size={32}
            className={`mb-2 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <p className="text-sm font-medium text-gray-900">
            Drop files here or{' '}
            <label
              htmlFor="file-input"
              className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
            >
              browse
            </label>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Max size: {formatFileSize(maxSize)}. Supported: PDF, DOC, PPT, ZIP, Images, Videos
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Uploading...</p>
            <p className="text-sm text-gray-600">{uploadProgress}%</p>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 border border-red-200">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl flex-shrink-0">
                    {getFileIcon(file.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 ml-2"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && !isUploading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-center text-sm text-gray-500">No files selected</p>
        </div>
      )}
    </div>
  )
}
