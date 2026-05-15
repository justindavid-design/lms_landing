import React from 'react'
import { AlertCircle } from 'lucide-react'

export function FormLabel({ label, required, htmlFor, children }) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
    </div>
  )
}

export function FormInput({
  label,
  error,
  required = false,
  type = 'text',
  ...props
}) {
  return (
    <FormLabel label={label} required={required} htmlFor={props.id}>
      <input
        type={type}
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition ${
          error
            ? 'border-red-300 bg-red-50 text-red-900'
            : 'border-gray-300 bg-white text-gray-900'
        }`}
        {...props}
      />
      {error && (
        <div className="mt-1 flex items-start gap-1 text-red-600 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </FormLabel>
  )
}

export function FormTextarea({
  label,
  error,
  required = false,
  rows = 4,
  ...props
}) {
  return (
    <FormLabel label={label} required={required} htmlFor={props.id}>
      <textarea
        rows={rows}
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition ${
          error
            ? 'border-red-300 bg-red-50 text-red-900'
            : 'border-gray-300 bg-white text-gray-900'
        }`}
        {...props}
      />
      {error && (
        <div className="mt-1 flex items-start gap-1 text-red-600 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </FormLabel>
  )
}

export function FormSelect({
  label,
  error,
  required = false,
  options = [],
  ...props
}) {
  return (
    <FormLabel label={label} required={required} htmlFor={props.id}>
      <select
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition ${
          error
            ? 'border-red-300 bg-red-50 text-red-900'
            : 'border-gray-300 bg-white text-gray-900'
        }`}
        {...props}
      >
        <option value="">Select an option...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="mt-1 flex items-start gap-1 text-red-600 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </FormLabel>
  )
}

export function FormCheckbox({ label, error, required = false, ...props }) {
  return (
    <div className="flex items-start">
      <input
        type="checkbox"
        className={`rounded border-gray-300 text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-500 h-4 w-4 mt-1 cursor-pointer`}
        {...props}
      />
      <label className="ml-2 text-sm text-gray-700 cursor-pointer">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {error && (
        <div className="mt-1 flex items-start gap-1 text-red-600 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export function FormGroup({ children, className = '' }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>
}

export function FormSection({ title, children, className = '' }) {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}
