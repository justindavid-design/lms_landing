# Course Dashboard Redesign - Developer Guide

## Overview

This guide documents the modern LMS-style course dashboard redesign with modal-based forms, improved file uploads, and a dedicated quiz builder.

## Architecture

### Core Components

#### 1. **Modal Component** (`src/components/common/Modal.jsx`)
Reusable modal dialog with Framer Motion animations, accessibility features, and focus management.

**Features:**
- Smooth open/close animations
- Click-outside-to-close
- ESC key support
- Focus trap for accessibility
- Keyboard navigation support
- Customizable sizes (sm, md, lg, xl, 2xl, 4xl)

**Usage:**
```jsx
import Modal from '@/components/common/Modal'

<Modal
  isOpen={isOpen}
  onClose={closeModal}
  title="Create Item"
  onSubmit={handleSubmit}
  submitText="Save"
  size="lg"
>
  {/* Form content */}
</Modal>
```

#### 2. **FileUpload Component** (`src/components/common/FileUpload.jsx`)
Advanced file upload with drag-and-drop, validation, and preview.

**Features:**
- Drag and drop upload area
- Click to browse
- Multiple file support
- File type validation
- File size validation
- Upload progress tracking
- File preview with icons

**Usage:**
```jsx
import FileUpload from '@/components/common/FileUpload'

<FileUpload
  onChange={(files, errors) => { /* handle files */ }}
  maxSize={10 * 1024 * 1024}
  multiple={true}
  files={uploadedFiles}
/>
```

#### 3. **Form Components** (`src/components/common/FormComponents.jsx`)
Reusable form field components with error handling.

**Available Components:**
- `FormInput` - Text, email, password, number, date inputs
- `FormTextarea` - Multi-line text input
- `FormSelect` - Dropdown selection
- `FormCheckbox` - Checkbox input
- `FormLabel` - Accessible label wrapper
- `FormGroup` - Grouped form fields
- `FormSection` - Form section with title

**Usage:**
```jsx
import { FormInput, FormTextarea, FormGroup } from '@/components/common/FormComponents'

<FormGroup>
  <FormInput
    id="title"
    label="Title"
    required
    error={errors.title?.message}
    {...register('title')}
  />
  <FormTextarea
    id="description"
    label="Description"
    {...register('description')}
  />
</FormGroup>
```

#### 4. **Modal Components**

##### AnnouncementModal
Create/edit announcements with title and body fields.
- Location: `src/components/modals/AnnouncementModal.jsx`
- Includes: Form validation, error handling, submit handlers

##### ModuleModal
Create/edit course modules with title and description.
- Location: `src/components/modals/ModuleModal.jsx`
- Includes: Form validation, error handling

##### AssignmentModal
Create/edit assignments with file uploads.
- Location: `src/components/modals/AssignmentModal.jsx`
- Includes: File upload integration, module selection, due date, status, points

**Usage:**
```jsx
import AnnouncementModal from '@/components/modals/AnnouncementModal'

<AnnouncementModal
  isOpen={isOpen}
  onClose={closeModal}
  onSubmit={handleSubmit}
  isLoading={isLoading}
/>
```

#### 5. **QuizBuilderPage** (`src/components/quiz/QuizBuilderPage.jsx`)
Dedicated full-page quiz builder for creating advanced quizzes.

**Route:** `/course/:courseId/quiz/create`

**Features:**
- Quiz information form (title, description, settings)
- Dynamic question builder
- Drag-and-drop question reordering
- Multiple question types
- Sticky action bar
- Autosave as draft
- Publish functionality

### Utilities & Hooks

#### `useModal` Hook (`src/hooks/useModal.js`)
Custom hook for managing modal state.

**Usage:**
```jsx
import { useModal } from '@/hooks/useModal'

const modal = useModal(false) // false = initially closed

<button onClick={modal.openModal}>Open Modal</button>
<Modal isOpen={modal.isOpen} onClose={modal.closeModal} />
```

#### Form Validation (`src/schemas/formSchemas.js`)
Zod-based validation schemas for all forms.

**Available Schemas:**
- `announcementSchema` - Announcement validation
- `moduleSchema` - Module validation
- `assignmentSchema` - Assignment validation (includes file validation)
- `quizSchema` - Quiz validation
- `quizQuestionSchema` - Individual question validation

**Utility Functions:**
- `validateFormData(schema, data)` - Validate form data
- `getFieldError(errors, fieldName)` - Get error for specific field
- `hasFieldError(errors, fieldName)` - Check if field has error

**Usage:**
```jsx
import { announcementSchema, validateFormData } from '@/schemas/formSchemas'

const result = validateFormData(announcementSchema, {
  title: 'My Announcement',
  body: 'Announcement body'
})

if (result.valid) {
  // Save to API
} else {
  // Display errors
  console.log(result.errors)
}
```

### Loading & Empty States

#### LoadingSkeleton Component
Provides skeleton screens during loading.

**Components:**
- `SkeletonLoader` - Base skeleton element
- `CardSkeleton` - Card skeleton
- `TextSkeleton` - Text skeleton with configurable lines
- `FormSkeleton` - Form skeleton
- `GridSkeleton` - Grid of skeletons

**Usage:**
```jsx
import { CardSkeleton, FormSkeleton } from '@/components/common/LoadingSkeleton'

{isLoading ? <CardSkeleton /> : <Card data={data} />}
```

#### EmptyState Component
Consistent empty state display.

**Usage:**
```jsx
import EmptyState from '@/components/common/EmptyState'
import { Plus } from 'lucide-react'

<EmptyState
  icon={Plus}
  title="No items yet"
  description="Create your first item to get started"
  action={handleCreate}
  actionLabel="Create Item"
  size="md"
/>
```

## Integration with CourseDetails

The main course dashboard (`CourseDetails.jsx`) has been updated to use the new modal components:

1. **Create buttons** now open modals instead of inline forms
2. **Modal handlers** manage form submissions
3. **File uploads** are handled through the AssignmentModal
4. **Quiz creation** still uses the inline Composer (quiz builder is a separate page)

### Updated State Management
```jsx
// Modal state using useModal hook
const announcementModal = useModal(false)
const moduleModal = useModal(false)
const assignmentModal = useModal(false)

// Handler functions
const handleCreateAnnouncement = async (formData) => { /* ... */ }
const handleCreateModule = async (formData) => { /* ... */ }
const handleCreateAssignment = async (formData) => { /* ... */ }
```

## Form Validation Flow

1. **User enters form data**
2. **react-hook-form captures data** with onChange handlers
3. **Zod schema validates** data in real-time
4. **Errors display** below form fields
5. **Submit button disabled** if form is invalid
6. **API call** on form submit
7. **Success/error message** displayed to user

## API Integration

All form submissions follow this pattern:

```jsx
const handleSubmit = async (formData) => {
  try {
    const res = await apiFetch(`/api/endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data))
    
    // Success: reload data or close modal
    modal.closeModal()
    loadCourseWorkspace()
  } catch (err) {
    // Error: show message
    setMessage(err.message)
  }
}
```

## Accessibility Features

### Modal Accessibility
- ARIA labels and roles
- Focus trap inside modal
- Keyboard navigation (Tab, Shift+Tab, ESC)
- Screen reader support
- Semantic HTML

### Form Accessibility
- Label associations (htmlFor)
- Error messages linked to inputs
- Keyboard navigation support
- High contrast error indicators
- Proper input types (email, date, etc.)

## Styling Guidelines

All components use:
- **TailwindCSS** for styling
- **Neutral color palette** (slate, blue)
- **Rounded corners** (rounded-lg, rounded-xl)
- **Soft shadows** (shadow-sm, shadow-md)
- **Consistent spacing** (via Tailwind utilities)
- **Responsive design** (mobile-first approach)

### Color Scheme
- Primary: Blue-600 (#2563eb)
- Success: Green-600
- Error: Red-600
- Warning: Amber-600
- Neutral: Slate-100 to Slate-900

## Best Practices

1. **Always validate** form data with Zod schemas
2. **Use react-hook-form** for form state management
3. **Show loading states** during API calls
4. **Display error messages** clearly to users
5. **Use modals** for all create/edit operations (except quiz)
6. **Implement optimistic updates** when possible
7. **Clean up** state when modals close
8. **Test accessibility** with keyboard and screen readers

## File Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Modal.jsx
│   │   ├── FileUpload.jsx
│   │   ├── FormComponents.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   └── EmptyState.jsx
│   ├── modals/
│   │   ├── AnnouncementModal.jsx
│   │   ├── ModuleModal.jsx
│   │   └── AssignmentModal.jsx
│   ├── quiz/
│   │   └── QuizBuilderPage.jsx
│   └── dashboard/
│       └── CourseDetails.jsx
├── hooks/
│   └── useModal.js
├── schemas/
│   └── formSchemas.js
└── lib/
    └── (existing API clients, auth, etc.)
```

## Migration Guide

For existing code using inline forms:

**Before:**
```jsx
{activeComposer === 'announcement' && (
  <Composer>
    <input onChange={...} />
    <textarea onChange={...} />
  </Composer>
)}
```

**After:**
```jsx
const announcementModal = useModal(false)

<AnnouncementModal
  isOpen={announcementModal.isOpen}
  onClose={announcementModal.closeModal}
  onSubmit={handleCreateAnnouncement}
/>

<button onClick={announcementModal.openModal}>Create</button>
```

## Troubleshooting

### Modal not opening?
- Check that `isOpen` is `true`
- Verify `onClose` handler is set
- Check z-index conflicts

### Form validation not working?
- Ensure schema is imported correctly
- Verify field names match schema
- Check react-hook-form register calls

### File upload not working?
- Check file type is in `acceptedTypes`
- Verify file size doesn't exceed `maxSize`
- Check FormData is properly serialized

### Accessibility issues?
- Test with keyboard navigation
- Use browser DevTools accessibility inspector
- Test with screen reader (NVDA, JAWS, VoiceOver)

## Performance Optimization

1. **Code splitting** - Quiz builder loaded on demand
2. **Lazy loading** - Modals only render when needed
3. **Memoization** - useCallback for event handlers
4. **Debouncing** - Search and filter operations
5. **Image optimization** - Use lucide-react icons

## Future Enhancements

- [ ] Batch operations on multiple items
- [ ] Export quiz as PDF
- [ ] Quiz analytics dashboard
- [ ] Rich text editor for announcements
- [ ] Custom file storage integration
- [ ] Bulk upload assistant
- [ ] Advanced question scheduling
