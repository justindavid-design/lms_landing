# 🚀 Quick Reference - New Dashboard Components

## Import Statements

```jsx
// Modals
import Modal from '@/components/common/Modal'
import AnnouncementModal from '@/components/modals/AnnouncementModal'
import ModuleModal from '@/components/modals/ModuleModal'
import AssignmentModal from '@/components/modals/AssignmentModal'

// Forms
import { FormInput, FormTextarea, FormSelect, FormGroup } from '@/components/common/FormComponents'

// Upload
import FileUpload from '@/components/common/FileUpload'

// Loading & Empty
import { SkeletonLoader, CardSkeleton } from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'

// Hooks
import { useModal } from '@/hooks/useModal'

// Validation
import { announcementSchema, validateFormData } from '@/schemas/formSchemas'
```

## Common Patterns

### 1. Using a Modal

```jsx
import Modal from '@/components/common/Modal'
import { useModal } from '@/hooks/useModal'

export default function MyComponent() {
  const modal = useModal()

  return (
    <>
      <button onClick={modal.openModal}>Open Modal</button>
      
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        title="Create Item"
        onSubmit={handleSubmit}
        submitText="Save"
        size="lg"
      >
        {/* Content */}
      </Modal>
    </>
  )
}
```

### 2. Form with Validation

```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { announcementSchema } from '@/schemas/formSchemas'
import { FormInput, FormGroup } from '@/components/common/FormComponents'

export default function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(announcementSchema)
  })

  const onSubmit = (data) => {
    // Handle form submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup>
        <FormInput
          label="Title"
          {...register('title')}
          error={errors.title?.message}
        />
      </FormGroup>
      <button type="submit">Submit</button>
    </form>
  )
}
```

### 3. File Upload

```jsx
import FileUpload from '@/components/common/FileUpload'
import { useState } from 'react'

export default function UploadForm() {
  const [files, setFiles] = useState([])

  const handleFileChange = (uploadedFiles, errors) => {
    if (errors.length > 0) {
      console.error('Upload errors:', errors)
    } else {
      setFiles(uploadedFiles)
    }
  }

  return (
    <FileUpload
      onChange={handleFileChange}
      maxSize={10 * 1024 * 1024}
      multiple={true}
      files={files}
    />
  )
}
```

### 4. Loading State

```jsx
import { CardSkeleton } from '@/components/common/LoadingSkeleton'

export default function MyComponent({ isLoading, data }) {
  if (isLoading) return <CardSkeleton />
  return <div>{data}</div>
}
```

### 5. Empty State

```jsx
import EmptyState from '@/components/common/EmptyState'
import { Plus } from 'lucide-react'

export default function ItemList({ items, onCreate }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Plus}
        title="No items yet"
        description="Create your first item"
        action={onCreate}
        actionLabel="Create Item"
      />
    )
  }

  return <div>{/* items */}</div>
}
```

## Key Components

| Component | File | Usage |
|-----------|------|-------|
| Modal | `common/Modal.jsx` | Base modal dialog |
| FileUpload | `common/FileUpload.jsx` | File selection & upload |
| FormInput | `common/FormComponents.jsx` | Text input field |
| FormTextarea | `common/FormComponents.jsx` | Multi-line text |
| FormSelect | `common/FormComponents.jsx` | Dropdown select |
| AnnouncementModal | `modals/AnnouncementModal.jsx` | Create announcements |
| ModuleModal | `modals/ModuleModal.jsx` | Create modules |
| AssignmentModal | `modals/AssignmentModal.jsx` | Create assignments |
| QuizBuilderPage | `quiz/QuizBuilderPage.jsx` | Build quizzes |

## Hooks

| Hook | File | Returns |
|------|------|---------|
| useModal | `hooks/useModal.js` | `{ isOpen, openModal, closeModal, toggleModal, setIsOpen }` |

## Validation Schemas

| Schema | File | Fields |
|--------|------|--------|
| announcementSchema | `schemas/formSchemas.js` | title, body |
| moduleSchema | `schemas/formSchemas.js` | title, description |
| assignmentSchema | `schemas/formSchemas.js` | title, instructions, due_at, module_id, status, points |
| quizSchema | `schemas/formSchemas.js` | title, description, time_limit, due_at, attempts_allowed, passing_score, status |

## Common Errors & Fixes

### Modal doesn't open
```jsx
// ❌ Wrong
<Modal isOpen={true} ...>  // Static, always open

// ✅ Correct
const modal = useModal()
<Modal isOpen={modal.isOpen} onClose={modal.closeModal} ...>
```

### Form doesn't validate
```jsx
// ❌ Wrong
<input value={formData.title} onChange={...} />

// ✅ Correct
<FormInput {...register('title')} error={errors.title?.message} />
```

### File won't upload
```jsx
// ❌ Wrong
acceptedTypes={['image/*']}  // Too broad

// ✅ Correct
acceptedTypes={['image/jpeg', 'image/png']}  // Specific types
```

## API Integration Pattern

```jsx
const handleSubmit = async (data) => {
  try {
    const res = await apiFetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    const json = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(json))
    
    // Success
    modal.closeModal()
  } catch (err) {
    // Error
    setMessage(err.message)
  }
}
```

## Styling Classes

### Common Tailwind Classes
```
Spacing: px-4 py-2 (padding), gap-3 (grid gap)
Colors: bg-blue-600, text-slate-700, border-slate-300
Sizing: w-full, h-auto, max-w-md
Shadows: shadow-sm, shadow-md
Rounded: rounded-lg, rounded-xl
Responsive: md:, lg:, sm:
State: hover:, focus:, disabled:
```

## Frequently Used Patterns

### Show/Hide Loading
```jsx
<button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### Conditional Rendering
```jsx
{items.length === 0 ? <EmptyState /> : <ItemList items={items} />}
```

### Error Message
```jsx
{message && (
  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
    {message}
  </div>
)}
```

## Tips & Tricks

1. **Always close modal on success**
   ```jsx
   await handleSubmit(data)
   modal.closeModal()  // Important!
   ```

2. **Reload data after changes**
   ```jsx
   modal.closeModal()
   loadCourseWorkspace()  // Refresh data
   ```

3. **Show feedback messages**
   ```jsx
   showMessage('Item created successfully!', 'success')
   ```

4. **Handle errors gracefully**
   ```jsx
   try { /* ... */ } catch (err) {
     showMessage(err.message, 'error')
   }
   ```

5. **Test on mobile**
   ```bash
   npm run dev -- --host
   # Then visit: http://your-ip:5173
   ```

---

## Resources

📖 Full Documentation: `DASHBOARD_REDESIGN_GUIDE.md`  
✅ Deployment Checklist: `DEPLOYMENT_CHECKLIST.md`  
🎯 Project Summary: `COMPLETION_SUMMARY.md`

**Last Updated:** May 14, 2026
